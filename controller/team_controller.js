const db = require('../models/db.js');
const User = require('../models/user_model.js');
const Team = require('../models/team_model.js');
const Match = require('../models/match_model.js');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');
var validator = require('validator');
var sanitize = require('mongo-sanitize');

/* Regex for checking */
const nameFormat = /^[a-zA-Z][a-zA-Z\s]*$/;
const userFormat = /[a-zA-Z0-9\-\_\.]+$/;

/* For emailing any user */
const transpo = nodemailer.createTransport({
  host: "smtp-mail.outlook.com",
  secureConnection: false,
  port: 587,
  tls: {
     ciphers:'SSLv3'
  },
  auth: {
    user: 'tabcore@outlook.com',
    pass: 't@bc0rEcc_pd3V!'
  }
});

const team_controller = {
  /* Load the teams dashboard */
  teamPage: async function(req, res){
    reset(req);
    if(req.session.curr_user){
      var render = 'app/teams/teamPage';
      var pagedetails = {
        pagename: "Teams",
        curr_user: req.session.curr_user
      };
      renderPage(req, res, render, pagedetails);
    }else{
      goHome(req, res);
    }
  },

  /* Load the create a team page */
  createTeam: async function(req, res){
    if(req.session.curr_user){
      if(!req.session.create_fields){
        req.session.create_fields = {team:0,lead:0,dep:0,whip:0};
      }
      var name = sanitize(req.query.teamname);
      var render = 'app/teams/createTeam';
      var pagedetails = {
        pagename: "New Team",
        curr_user: req.session.curr_user,
        teamname: name,
        team: req.session.create_fields.team,
        lead: req.session.create_fields.lead,
        dep: req.session.create_fields.dep,
        whip: req.session.create_fields.whip
      };
      renderPage(req, res, render, pagedetails);
    }else{
      goHome(req, res);
    }
  },

  /* Check the information entered in create a team */
  checkInfo: async function(req, res){
    reset(req);
    if(req.session.curr_user){
      var errors = validationResult(req);
      if (!errors.isEmpty()){
        errors = errors.errors;
        var validOne = 0, validTwo = 0, validThree = 0, validName = 0;
        for(i = 0; i < errors.length; i++){
          if(errors[i].msg == 'empty'){
            validName = 5;
            validOne = 1;
            validTwo = 1;
            validThree = 1;
            break;
          }else{
            if(errors[i].msg == 'create_first'){
              validOne = 1;
            }else if(errors[i].msg == 'create_second'){
              validTwo = 1;
            }else if(errors[i].msg == 'create_third'){
              validThree = 1;
            }
          }
        }
        req.session.create_fields = {team:validName,lead:validOne,dep:validTwo,whip:validThree};
        res.redirect('/createTeam');
        res.end();
      }else{
        var userfirst = sanitize(req.body.create_first);
        var usersecond = sanitize(req.body.create_second);
        var userthird = sanitize(req.body.create_third);
        var teamname = sanitize(req.body.create_teamname);
        var current = req.session.curr_user.username;
        /* Build the queries */
        var firstQuery, secondQuery, thirdQuery, findOne, findTwo, findThree;
        var validOne = 0, validTwo = 0, validThree = 0, validName = 0;
        if(validator.isEmail(userfirst)){
          firstQuery = {$or:[{"first.email":userfirst}, {"second.email":userfirst}, {"third.email":userfirst}]};
          findOne = {email:userfirst};
          validOne = 0;
        }else{
          if (!validator.matches(userfirst, userFormat)){
            validOne = 1;
          }else{
            firstQuery = {$or:[{"first.username": userfirst}, {"second.username": userfirst}, {"third.username": userfirst}]};
            findOne = {username:userfirst};
            validOne = 0;
          }
        }
        if(validator.isEmail(usersecond)){
          secondQuery = {$or:[{"first.email":usersecond}, {"second.email":usersecond}, {"third.email":usersecond}]};
          findTwo = {email:usersecond};
          validOne = 0;
        }else{
          if (!validator.matches(usersecond, userFormat)){
            validTwo = 1;
          }else{
            secondQuery = {$or: [{"first.username": usersecond}, {"second.username": usersecond}, {"third.username": usersecond}]};
            findTwo = {username:usersecond};
            validTwo = 0;
          }
        }
        if(validator.isEmail(userthird)){
          thirdQuery = {$or:[{"first.email":userthird}, {"second.email":userthird}, {"third.email":userthird}]};
          findThree = {email:userthird};
          validThree = 0;
        }else{
          if (!validator.matches(userthird, userFormat)){
            validThree = 1;
          }else{
            thirdQuery = {$or: [{"first.username": userthird}, {"second.username": userthird}, {"third.username": userthird}]};
            findThree = {username:userthird};
            validThree = 0;
          }
        }
        var query = {$and: [firstQuery, secondQuery, thirdQuery]};
        /* Check if the team name entered contains only letters and spaces */
        if (!nameFormat.test(teamname)){
          validName = 1;
        }else{
          validName = 0;
        }
        /* if all entered information are invalid, redirect back to the create a team page */
        if(validOne == 1 || validTwo == 1 || validThree == 1 || validName == 1){
          req.session.create_fields = {team:validName,lead:validOne,dep:validTwo,whip:validThree};
          res.redirect('/createTeam');
          res.end();
        }else{
          /* if no two users are the same and the current user is one of the members, proceed */
          if((userfirst === current || usersecond === current || userthird === current) && (userfirst !== usersecond && userfirst !== userthird && usersecond !== userthird)){
            /* Find a team with the entered users */
            await db.findOne(Team, query, async function(exist_res){
              if(exist_res){  /* if the team already exists/all three members already have a group together, redirect back to the create a team page */
                req.session.create_fields = {team:2,lead:0,dep:0,whip:0};
                res.redirect('/createTeam');
                res.end();
              }else{
                /* Check the validity of all information entered */
                await db.findOne(Team, {"teamname": teamname}, async function(team_res){
                  var team = team_res;
                  await db.findOne(User, findOne, async function(first_res){
                    var first = first_res;
                    await db.findOne(User, findTwo, async function(second_res){
                      var second = second_res;
                      await db.findOne(User, findThree, async function(third_res){
                        var third = third_res;
                        /* If all users are registered and found and there is no team with the same name, proceed */
                        if((first && !validator.isEmail(userfirst)) && (second && !validator.isEmail(usersecond)) && (third && !validator.isEmail(userthird)) && (!team)){
                          /* Create the team */
                          var name = teamname;
                          var newTeam = {
                            teamname: name,
                            first:first,
                            second:second,
                            third:third,
                            wins: 0,
                            loses: 0,
                            draws: 0,
                            rawWins: 0,
                            rawLose: 0,
                            rawDraw: 0,
                            wlratio: 0,
                            numdebates: 0,
                            status: 'Active'
                          };
                          await db.insertOneCallback(Team, newTeam, async function(new_team){
                            if(new_team){
                              var full = req.session.curr_user.full_name;
                              var user = req.session.curr_user.username;
                              var createUpdate = {
                                teamID: new_team._id,
                                teamname: new_team.teamname,
                                update: new_team.teamname + ' was created by ' + full + ' (' + user + ').'
                              };
                              /* Update the users of the newly created team */
                              await updateUpdates(first, second, third, createUpdate);
                              req.session.header = 'Create Team';
                              req.session.message = name + ' Successfully Created!';
                              req.session.link = '/teamPage';
                              req.session.back = 'Teams Dashboard';
                              goMessage(req, res);
                            }else{
                              req.session.header = 'Create Team';
                              req.session.message = 'Error in Creating a Team! Please Try Again Later.';
                              req.session.link = '/teamPage';
                              req.session.back = 'Teams Dashboard';
                              goMessage(req, res);
                            }
                          });
                        }else{
                          var name = 0, lead = 0, dep = 0, whip = 0;
                          var maillist = [];
                          /* Check if the team name is already taken*/
                          if(team){
                            name = 1;
                          }
                          /* Check if the first entered user is an email or a username */
                          if(!first && validator.isEmail(userfirst)){ /* If unregistered and an email, add the email to the mail list array */
                            lead = 0;
                            maillist.push(userfirst);
                            first = {email:userfirst,username:userfirst,full_name:userfirst};
                          }else if(!first){
                            lead = 1;
                          }else{
                            lead = 0;
                          }
                          /* Check if the second entered user is an email or a username */
                          if(!second && validator.isEmail(usersecond)){ /* If unregistered and an email, add the email to the mail list array */
                            dep =  0;
                            maillist.push(usersecond);
                            second = {email:usersecond,username:usersecond,full_name:usersecond};
                          }else if(!second){
                            dep = 1;
                          }else{
                            dep = 0;
                          }
                          /* Check if the third entered user is an email or a username */
                          if(!third && validator.isEmail(userthird)){ /* If unregistered and an email, add the email to the mail list array */
                            whip = 0;
                            maillist.push(userthird);
                            third = {email:userthird,username:userthird,full_name:userthird};
                          }else if(!third){
                            whip = 1;
                          }else{
                            whip = 0;
                          }
                          /* If any entered information are invalid, redirect back to the create a team page */
                          if(name == 1 || lead == 1 || dep == 1 || whip == 1){
                            req.session.create_fields = {team:name,lead:lead,dep:dep,whip:whip};
                            res.redirect('/createTeam');
                            res.end();
                          }else if(lead == 0 || dep == 0 || whip == 0 || maillist.length <= 2){ /* If there are, at most 2, emails entered or no errors in the entered information, proceed */
                            await db.findOne(Team, {"first.username":{$in:[first.username, second.username, third.username]},"second.username":{$in:[first.username, second.username, third.username]},"third.username":{$in:[first.username, second.username, third.username]}}, async function(existing){
                              if(existing){ /* if the team already exists/all three members already have a group together, redirect back to the create a team page */
                                req.session.create_fields = {team:2,lead:0,dep:0,whip:0};
                                res.redirect('/createTeam');
                                res.end();
                              }else{
                                /* Set the email content */
                                const mailDetails = {
                                  from: 'tabcore@outlook.com',
                                  to: maillist,
                                  subject: 'Invite to the team \'' + teamname + '\'',
                                  text: "Hey!\n\nYou were invited to join " + teamname + " team as a guest by " + req.session.curr_user.full_name + ".",
                                  html: '<h2>Hey!</h2><br><h3>You were invited to join \'' + teamname + '\' team as a guest by ' + req.session.curr_user.full_name + '. Head on over to Tabcore and login as a guest with this email address.</h3><br /><img src="cid:tabcore_attach.png" alt="Tabcore" style="display:block; margin-left:auto; margin-right:auto; width: 100%">',
                                  attachments: [{
                                    filename: 'TABCORE_FOOTER.png',
                                    path: __dirname + '/../views/assets/img/email/TABCORE_FOOTER.png',
                                    cid: 'tabcore_attach.png'
                                  }]
                                };
                                /* Send the email/s */
                                transpo.sendMail(mailDetails, async function(err, result){
                                  if(err){
                                    req.session.create_fields = {team:name,lead:1,dep:1,whip:1};
                                    res.redirect('/createTeam');
                                    res.end();
                                  }else{
                                    /* Create the team */
                                    var newTeam = {
                                      teamname: teamname,
                                      first:first,
                                      second:second,
                                      third:third,
                                      wins: 0,
                                      loses: 0,
                                      draws: 0,
                                      rawWins: 0,
                                      rawLose: 0,
                                      rawDraw: 0,
                                      wlratio: 0,
                                      numdebates: 0,
                                      status: 'Active'
                                    };
                                    await db.insertOneCallback(Team, newTeam, async function(new_team){
                                      if(new_team){
                                        var full = req.session.curr_user.full_name;
                                        var user = req.session.curr_user.username;
                                        var createUpdate = {
                                          teamID: new_team._id,
                                          teamname: new_team.teamname,
                                          update: new_team.teamname + ' was created by ' + full + ' (' + user + ').'
                                        };
                                        /* Update the users of the newly created team */
                                        await updateUpdates(first, second, third, createUpdate);
                                        req.session.header = 'Create Team';
                                        req.session.message = new_team.teamname + ' Successfully Created!';
                                        req.session.link = '/teamPage';
                                        req.session.back = 'Teams Dashboard';
                                        goMessage(req, res);
                                      }else{
                                        req.session.header = 'Create Team';
                                        req.session.message = 'Error in Creating a Team! Please Try Again Later.';
                                        req.session.link = '/teamPage';
                                        req.session.back = 'Teams Dashboard';
                                        goMessage(req, res);
                                      }
                                    });
                                  }
                                });
                              }
                            });
                          }else{
                            req.session.create_fields = {team:name,lead:1,dep:1,whip:1};
                            res.redirect('/createTeam');
                            res.end();
                          }
                        }
                      });
                    });
                  });
                });
              }
            });
          }else{
            if(userfirst != current && usersecond != current && userthird != current)
              req.session.create_fields = {team:3,lead:1,dep:1,whip:1};
            else if(userfirst == usersecond || userfirst == userthird || usersecond == userthird)
              req.session.create_fields = {team:4,lead:1,dep:1,whip:1};
            res.redirect('/createTeam');
            res.end();
          }
        }
      }
    }else{
      goHome(req, res);
    }
  },

  /* Load the information of a team */
  teamInfo: async function(req, res){
    reset(req);
    if(req.session.curr_user){
      var errors = validationResult(req);
      if (!errors.isEmpty()){
        req.session.header = 'Team Information';
        req.session.message = "Error in loading Team Information! No team name entered.";
        req.session.link = '/teamPage';
        req.session.back = 'Team Dashboard';
        goMessage(req, res);
      }else{
        var teamID = sanitize(req.query.team);
        /* Find the account of the user */
        await db.findOne(User, {_id:req.session.curr_user._id}, async function(result){
          if(result){ /* If found, proceed */
            /* Find the team */
            await db.findOne(Team, {_id:teamID}, function(foundTeam){
              if(foundTeam){ /* If found, proceed */
                if(req.session.curr_user._id == foundTeam.first._id || req.session.curr_user._id == foundTeam.second._id || req.session.curr_user._id == foundTeam.third._id){
                  part = 1;
                }else{
                  part = 0;
                }
                /* Get all the team updates the user has for this team */
                var finalUpdates = [];
                var counter = 0;
                for(i = 0; i < result.updates.length; i++){
                  if (result.updates[i].teamname == foundTeam.teamname){
                    var temp = {
                      teamname: result.updates[i].teamname,
                      update: result.updates[i].update,
                      index: counter
                    };
                    finalUpdates.push(temp);
                    counter = counter + 1;
                  }
                }
                var final_info = foundTeam;
                var temp_first, temp_second, temp_third;
                var leave;
                /* If any members are non-existent, replace temporarily with "No User" */
                if(!foundTeam.first)
                  temp_first = {full_name:"No User"};
                else
                  temp_first = foundTeam.first;
                if((!foundTeam.second || foundTeam.second.username == 'No User' || validator.isEmail(foundTeam.second.username)) && (!foundTeam.third || foundTeam.third.username == 'No User' || validator.isEmail(foundTeam.third.username)))
                  leave = 0;
                else
                  leave = 1;

                if(!foundTeam.second)
                  temp_second = {full_name:"No User"};
                else
                  temp_second = foundTeam.second;
                if((!foundTeam.first || foundTeam.first.username == 'No User' || validator.isEmail(foundTeam.first.username)) && (!foundTeam.third || foundTeam.third.username == 'No User' || validator.isEmail(foundTeam.third.username)))
                  leave = 0;
                else
                  leave = 1;

                if(!foundTeam.third)
                  temp_third = {full_name:"No User"};
                else
                  temp_third = foundTeam.third;
                if((!foundTeam.first || foundTeam.first.username == 'No User' || validator.isEmail(foundTeam.first.username)) && (!foundTeam.second || foundTeam.second.username == 'No User' || validator.isEmail(foundTeam.second.username)))
                  leave = 0;
                else
                  leave = 1;

                final_info.first = temp_first;
                final_info.second = temp_second;
                final_info.third = temp_third;

                var render = 'app/teams/teamInfo';
                var pagedetails = {
                  pagename: "Team Information",
                  curr_user: req.session.curr_user,
                  team: final_info,
                  teamUpdates: finalUpdates,
                  part: part,
                  leave: leave
                };
                renderPage(req, res, render, pagedetails);
              }else{
                req.session.header = 'Team Information';
                req.session.message = "Error in loading Team Information! Cannot find the team.";
                req.session.link = '/teamPage';
                req.session.back = 'Team Dashboard';
                goMessage(req, res);
              }
            });
          }else{
            req.session.header = 'Team Information';
            req.session.message = "Error in loading Team Information! Please Try again later.";
            req.session.link = '/teamPage';
            req.session.back = 'Team Dashboard';
            goMessage(req, res);
          }
        });
      }
    }else{
      goHome(req, res);
    }
  },

  /* Choose a team to edit */
  chooseTeam: async function(req, res){
    if(req.session.curr_user){
      if(!req.session.choosing){
        req.session.choosing = 0;
      }
      /* Build the query to find all the teams of the user */
      first_query = {"first._id":req.session.curr_user._id};
      second_query = {"second._id":req.session.curr_user._id};
      third_query = {"third._id":req.session.curr_user._id};
      team_query = {"teamname": {$ne: null}};
      whole_query = {$and: [team_query, {$or: [first_query, second_query, third_query]}]};
      /* Find the teams of the user */
      await db.findMany(Team, whole_query, function(result){
        var render = 'app/teams/chooseTeam';
        var pagedetails = {
          pagename: "Choose a Team",
          curr_user: req.session.curr_user,
          teams: result,
          choosing: req.session.choosing
        };
        renderPage(req, res, render, pagedetails);
      });
    }else{
      goHome(req, res);
    }
  },

  /* Load the edit a team page */
  editTeams: async function(req, res){
    if(req.session.curr_user){
      var errors = validationResult(req);
      if (!errors.isEmpty() && (!req.session.edit_team || !validator.isAlphanumeric(req.session.edit_team))){
        req.session.choosing = 1;
        res.redirect('/chooseTeam');
        res.end();
      }else{
        var teamID;
        /* Store the team name in variable teamname */
        if(req.body.edit_choose && req.body.edit_choose != 'choose'){
          teamID = sanitize(req.body.edit_choose);
          req.session.edit_team = teamID;
        }else if(req.query.team){
          teamID = sanitize(req.query.team);
          req.session.edit_team = teamID;
        }else if(req.session.edit_team && req.session.edit_team != 'choose'){
          teamID = req.session.edit_team;
        }
        /* If no team name was entered/chosen/etc., redirect to the choose a team page */
        if(!teamID){
          req.session.choosing = 1;
          res.redirect('/chooseTeam');
          res.end();
        }else{
          /* Find the team */
          await db.findOne(Team, {_id:teamID}, async function(result){
            if(result){
              var current_user = req.session.curr_user._id;
              if(result.first._id == current_user || result.second._id == current_user || result.third._id == current_user){
                var final_info = result;
                var temp_first, temp_second, temp_third;
                if(!result.first){
                  temp_first = {full_name:"No User", username:"No User"};
                  await db.updateOne(Team, {teamname:result.teamname}, {$set:{first:{full_name:"No User", username:"No User"}}});
                }else{
                  temp_first = result.first;
                }
                if(!result.second){
                  temp_second = {full_name:"No User", username:"No User"};
                  await db.updateOne(Team, {teamname:result.teamname}, {$set:{second:{full_name:"No User", username:"No User"}}});
                }else{
                  temp_second = result.second;
                }
                if(!result.third){
                  temp_third = {full_name:"No User", username:"No User"};
                  await db.updateOne(Team, {teamname:result.teamname}, {$set:{third:{full_name:"No User", username:"No User"}}});
                }else{
                  temp_third = result.third;
                }
                final_info.first = temp_first;
                final_info.second = temp_second;
                final_info.third = temp_third;

                if(!req.session.edit_fields){
                  req.session.edit_fields = {all:0, new_team:0, new_users:0 ,new_current:0};
                }
                var render = 'app/teams/editTeams';
                var pagedetails = {
                  pagename: "Edit Teams",
                  curr_user: req.session.curr_user,
                  team: final_info,
                  all: req.session.edit_fields.all,
                  new_team: req.session.edit_fields.new_team,
                  new_users: req.session.edit_fields.new_users,
                  new_current: req.session.edit_fields.new_current
                };
                renderPage(req, res, render, pagedetails);
              }else{
                req.session.header = 'Edit a Team';
                req.session.message = 'Cannot edit ' + result.teamname + '! You are not in ' + result.teamname + '.';
                req.session.link = '/teamPage';
                req.session.back = 'Teams Dashboard';
                goMessage(req, res);
              }
            }else{
              req.session.header = 'Edit a Team';
              req.session.message = 'Error in Edit a Team! Team not found.';
              req.session.link = '/teamPage';
              req.session.back = 'Teams Dashboard';
              goMessage(req, res);
            }
          });
        }
      }
    }else{
      goHome(req, res);
    }
  },

  /* Process the information entered in the edit a team page */
  editChosenTeam: async function(req, res){
    if(req.session.curr_user){
      var errors = validationResult(req);
      var teamID = sanitize(req.query.team);
      var teamname = sanitize(req.body.current_team);
      var current_team = sanitize(req.body.edit_current);
      var new_teamname = sanitize(req.body.edit_teamname);
      var userfirst = sanitize(req.body.edit_first);
      var usersecond = sanitize(req.body.edit_second);
      var userthird = sanitize(req.body.edit_third);

      /* Check if there are any errors */
      if (!errors.isEmpty()){
        errors = errors.errors;
        var validOne = 0, validTwo = 0, validThree = 0, validName = 0, validCurrent = 0, validID = 0;
        var paramOne = 0, paramTwo = 0, paramThree = 0, paramName = 0, paramCurrent = 0, paramID = 0;
        var emptyCount = 0;
        /* Check the errors detected */
        for(i = 0; i < errors.length; i++){
          /* Check the number of empty fields */
          if(errors[i].msg == 'empty'){
            emptyCount = emptyCount + 1;
            if(errors[i].param == 'edit_first'){
              paramOne = 1;
            }else if(errors[i].param == 'edit_second'){
              paramTwo = 1;
            }else if(errors[i].param == 'edit_third'){
              paramThree = 1;
            }else if(errors[i].param == 'edit_teamname'){
              paramName = 1;
            }else if(errors[i].param == 'edit_current'){
              validCurrent = 1;
              paramCurrent = 1;
            }else if(errors[i].param == 'team'){
              validID = 1;
              paramID = 1;
            }
          }else{
            /* Check for other types of errors */
            if(errors[i].msg == 'edit_first'){
              validOne = 1;
            }else if(errors[i].msg == 'edit_second'){
              validTwo = 1;
            }else if(errors[i].msg == 'edit_third'){
              validThree = 1;
            }else if(errors[i].msg == 'edit_teamname'){
              validName = 1;
            }else if(errors[i].msg == 'edit_current'){
              validCurrent = 1;
              paramCurrent = 1;
            }else if(errors[i].param == 'team'){
              validID = 1;
              paramID = 1;
            }
          }
        }
        if(validID == 1 || paramID == 1){
          req.session.header = 'Edit a Team';
          req.session.message = 'Error in Edit a Team! Please Try Again Later.';
          req.session.link = '/teamPage';
          req.session.back = 'Teams Dashboard';
          goMessage(req, res);
        }else if(validCurrent == 1 || paramCurrent == 1){
          /* If the current teamname was not entered, redirect back to the edit a team page */
          if(paramName || validName && ((paramOne || validOne) || (paramTwo || validTwo) || (paramThree || validThree)))
            req.session.edit_fields.all = 1;
          req.session.edit_fields.new_current = 0;
          res.redirect('/editTeams');
          res.end();
        }else if(emptyCount >= 4){
          /* If all fields were empty, redirect back to the edit a team page */
          req.session.edit_fields = {all:1, new_team:0, new_users:0 ,new_current:0};
          res.redirect('/editTeams');
          res.end();
        }else if((validOne == 1 && paramOne == 0) || (validTwo == 1 && paramTwo == 0) || (validThree == 1 && paramThree == 0) || (validName == 1 && paramName == 0)){
          /* If any of the fields had an error other than an empty field error, redirect back to the edit a team page */
          if (validOne == 1)
            req.session.edit_fields = {all:0, new_team:validName, new_users:validOne, new_current:0};
          else if(validTwo == 1)
            req.session.edit_fields = {all:0, new_team:validName, new_users:validTwo, new_current:0};
          else if(validThree == 1)
            req.session.edit_fields = {all:0, new_team:validName, new_users:validThree, new_current:0};
          else
            req.session.edit_fields = {all:0, new_team:validName, new_users:0, new_current:0};
          res.redirect('/editTeams');
          res.end();
        }else{
          /* Find the team to edit */
          await db.findOne(Team, {_id:teamID}, async function(current){
            if(current){
              if(validator.equals(current.teamname, current_team)){
                /* If the current teamname entered is the same as the teamname of the team being edited, proceed */
                if(validator.equals(teamname, current_team)){
                  /* If a new teamname was entered, proceed */
                  if(!validator.isEmpty(new_teamname)){
                    /* If the new teamname entered is the same as the old teamname, redirect back */
                    if(!validator.equals(new_teamname, current_team)){
                      /* See if the new teamname is already taken */
                      await db.findOne(Team, {teamname:new_teamname}, async function(existingTeam){
                        if(existingTeam){
                          /* If the new teamname is taken, redirect back */
                          req.session.edit_fields = {all:0, new_team:1, new_users:0 ,new_current:0};
                          res.redirect('/editTeams');
                          res.end();
                        }else{
                          /* If the members will be edited, proceed */
                          if(paramOne == 0 || paramTwo == 0 || paramThree == 0){
                            reset(req);
                            updateMembers(req, res, current, new_teamname);
                          }else{
                            await db.findOneAndUpdate(Team, {_id:teamID}, {$set: {teamname:new_teamname}}, async function(new_team){
                              if(new_team){
                                /* If the new team name is not taken, proceed with updating */
                                var editUpdate = {
                                  teamID: new_team._id,
                                  teamname: new_team.teamname,
                                  update: current.teamname + " was edited by " + req.session.curr_user.full_name + " (" + req.session.curr_user.username + "). [Change Team Name]"
                                };
                                /* Send an update to the users */
                                await updateUpdates(new_team.first, new_team.second, new_team.third, editUpdate);
                                reset(req);
                                /* Update the team name of updates connected */
                                await updateTeamname(new_team._id, new_teamname, new_team.first.username);
                                await updateTeamname(new_team._id, new_teamname, new_team.second.username);
                                await updateTeamname(new_team._id, new_teamname, new_team.third.username);
                                req.session.header = 'Edit a Team';
                                req.session.message = 'Successfully changed team name of ' + current.teamname + ' to ' + new_teamname + '!';
                                req.session.link = '/teamPage';
                                req.session.back = 'Teams Dashboard';
                                goMessage(req, res);
                              }else{
                                req.session.header = 'Edit a Team';
                                req.session.message = 'Error in Editing Team '+current.teamname+'! Please Try Again Later.';
                                req.session.link = '/teamPage';
                                req.session.back = 'Teams Dashboard';
                                goMessage(req, res);
                              }
                            });
                          }
                        }
                      });
                    }else{
                      req.session.edit_fields = {all:0, new_team:1, new_users:0 ,new_current:0};
                      res.redirect('/editTeams');
                      res.end();
                    }
                  }else{
                    reset(req);
                    updateMembers(req, res, current, null);
                  }
                }else{
                  req.session.edit_fields = {all:0, new_team:0, new_users:0 ,new_current:1};
                  res.redirect('/editTeams');
                  res.end();
                }
              }else{
                req.session.edit_fields = {all:0, new_team:0, new_users:0 ,new_current:1};
                res.redirect('/editTeams');
                res.end();
              }
            }else{
              req.session.edit_fields = {all:0, new_team:0, new_users:0 ,new_current:1};
              res.redirect('/editTeams');
              res.end();
            }
          });
        }
      }else{
        /* Find the team to edit */
        await db.findOne(Team, {_id:teamID}, async function(current){
          if(current){
            if(validator.equals(current.teamname, current_team)){
              if(validator.equals(teamname, current_team)){
                /* If a new teamname was entered, proceed */
                if(!validator.isEmpty(new_teamname)){
                  /* If the new teamname entered is the same as the old teamname, redirect back */
                  if(!validator.equals(new_teamname, current_team)){
                    /* See if the new teamname is already taken */
                    await db.findOne(Team, {teamname:new_teamname}, async function(existingTeam){
                      if(existingTeam){
                        /* If the new teamname is taken, redirect back */
                        req.session.edit_fields = {all:0, new_team:1, new_users:0 ,new_current:0};
                        res.redirect('/editTeams');
                        res.end();
                      }else{
                        /* If the members will be edited, proceed */
                        if(!validator.isEmpty(userfirst) || !validator.isEmpty(usersecond) || !validator.isEmpty(userthird)){
                          reset(req);
                          updateMembers(req, res, current, new_teamname);
                        }else{
                          await db.findOneAndUpdate(Team, {_id:teamID}, {$set: {teamname:new_teamname}}, async function(new_team){
                            if(new_team){
                              /* If the new team name is not taken, proceed with updating */
                              var editUpdate = {
                                teamID: new_team._id,
                                teamname: new_team.teamname,
                                update: current.teamname + " was edited by " + req.session.curr_user.full_name + " (" + req.session.curr_user.username + "). [Change Team Name]"
                              };
                              /* Send an update to the users */
                              await updateUpdates(new_team.first, new_team.second, new_team.third, editUpdate);
                              reset(req);
                              /* Update the team name of updates connected */
                              await updateTeamname(new_team._id, new_team.teamname, new_team.first.username);
                              await updateTeamname(new_team._id, new_team.teamname, new_team.second.username);
                              await updateTeamname(new_team._id, new_team.teamname, new_team.third.username);
                              req.session.header = 'Edit a Team';
                              req.session.message = 'Successfully changed team name of ' + current.teamname + ' to ' + new_teamname + '!';
                              req.session.link = '/teamPage';
                              req.session.back = 'Teams Dashboard';
                              goMessage(req, res);
                            }else{
                              req.session.header = 'Edit a Team';
                              req.session.message = 'Error in Editing Team '+current.teamname+'! Please Try Again Later.';
                              req.session.link = '/teamPage';
                              req.session.back = 'Teams Dashboard';
                              goMessage(req, res);
                            }
                          });
                        }
                      }
                    });
                  }else{
                    req.session.edit_fields = {all:0, new_team:1, new_users:0 ,new_current:0};
                    res.redirect('/editTeams');
                    res.end();
                  }
                }else{
                  reset(req);
                  updateMembers(req, res, current, null);
                }
              }else{
                req.session.edit_fields = {all:0, new_team:0, new_users:0 ,new_current:1};
                res.redirect('/editTeams');
                res.end();
              }
            }else{
              req.session.edit_fields = {all:0, new_team:0, new_users:0 ,new_current:1};
              res.redirect('/editTeams');
              res.end();
            }
          }else{
            req.session.edit_fields = {all:0, new_team:0, new_users:0 ,new_current:1};
            res.redirect('/editTeams');
            res.end();
          }
        });
      }
    }else{
      goHome(req, res);
    }
  },

  /* Load the confirmation page for leaving a team */
  confirmLeave: async function(req, res){
    if(req.session.curr_user){
      var errors = validationResult(req);
      if (!errors.isEmpty()){
        req.session.header = 'Team Information';
        req.session.message = "Error in Leaving Team! No valid team name entered.";
        req.session.link = '/teamPage';
        req.session.back = 'Team Dashboard';
        goMessage(req, res);
      }else{
        var teamID = sanitize(req.query.team);
        if(validator.isAlphanumeric(teamID)){
          /* Find the team */
          await db.findOne(Team, {_id:teamID}, async function(result){
            if(result){ /* If team is found, proceed */
              var name = result.teamname
              if(result.first._id == req.session.curr_user._id || result.second._id == req.session.curr_user._id || result.third._id == req.session.curr_user._id){
                var validLeave;
                /* If More than one is a guest or a non-existent member, leaving the team would not be permitted */
                if(!result.first || result.first.username == 'No User' || validator.isEmail(result.first.username)){
                  if((!result.second || result.second.username == 'No User' || validator.isEmail(result.second.username)) || (!result.third || result.third.username == 'No User' || validator.isEmail(result.third.username)))
                    validLeave = 1;
                  else
                    validLeave = 0;
                }else if(!result.second || result.second.username == 'No User' || validator.isEmail(result.second.username)){
                  if((!result.first || result.first.username == 'No User' || validator.isEmail(result.first.username)) || (!result.third || result.third.username == 'No User' || validator.isEmail(result.third.username)))
                    validLeave = 1;
                  else
                    validLeave = 0;
                }else if(!result.third || result.third.username == 'No User' || validator.isEmail(result.third.username)){
                  temp_third = {full_name:"No User"};
                  if((!result.first || result.first.username == 'No User' || validator.isEmail(result.first.username)) || (!result.second || result.second.username == 'No User' || validator.isEmail(result.second.username)))
                    validLeave = 1;
                  else
                    validLeave = 0;
                }
                if(validLeave == 1){
                  req.session.header = 'Team Information';
                  req.session.message = "Cannot leave " + name + "! Teams need at least one registered user remaining.";
                  req.session.link = '/teamPage';
                  req.session.back = 'Team Dashboard';
                  goMessage(req, res);
                }else{
                  var render = 'app/teams/confirmLeave';
                  var pagedetails = {
                    pagename: 'Confirm Leave',
                    curr_user:req.session.curr_user,
                    team: result
                  };
                  renderPage(req, res, render, pagedetails);
                }
              }else{
                req.session.header = 'Team Information';
                req.session.message = "Cannot leave " + name + " since you're not in the team!";
                req.session.link = '/teamPage';
                req.session.back = 'Team Dashboard';
                goMessage(req, res);
              }
            }else{
              req.session.header = 'Team Information';
              req.session.message = "Error in leaving team! Team not found.";
              req.session.link = '/teamPage';
              req.session.back = 'Team Dashboard';
              goMessage(req, res);
            }
          });
        }else{
          req.session.header = 'Team Information';
          req.session.message = "Error in leaving team! Invalid Team Name entered.";
          req.session.link = '/teamPage';
          req.session.back = 'Team Dashboard';
          goMessage(req, res);
        }
      }
    }else{
      goHome(req, res);
    }
  },

  /* Leave a team */
  leaveTeam: async function(req, res){
    if(req.session.curr_user){
      var errors = validationResult(req);
      if (!errors.isEmpty()){
        req.session.header = 'Team Information';
        req.session.message = "Error in Leaving Team! No valid team name entered.";
        req.session.link = '/teamPage';
        req.session.back = 'Team Dashboard';
        goMessage(req, res);
      }else{
        var teamID = sanitize(req.query.team);
        /* Find the team */
        await db.findOne(Team, {_id:teamID}, async function(result){
          if(result){ /* If team is found, proceed */
            var name = result.teamname;
            if(result.first._id == req.session.curr_user._id || result.second._id == req.session.curr_user._id || result.third._id == req.session.curr_user._id){
              var validLeave;
              /* If More than one is a guest or a non-existent member, leaving the team would not be permitted */
              if(!result.first || result.first.username == 'No User' || validator.isEmail(result.first.username)){
                if((!result.second || result.second.username == 'No User' || validator.isEmail(result.second.username)) || (!result.third || result.third.username == 'No User' || validator.isEmail(result.third.username)))
                  validLeave = 1;
                else
                  validLeave = 0;
              }else if(!result.second || result.second.username == 'No User' || validator.isEmail(result.second.username)){
                if((!result.first || result.first.username == 'No User' || validator.isEmail(result.first.username)) || (!result.third || result.third.username == 'No User' || validator.isEmail(result.third.username)))
                  validLeave = 1;
                else
                  validLeave = 0;
              }else if(!result.third || result.third.username == 'No User' || validator.isEmail(result.third.username)){
                temp_third = {full_name:"No User"};
                if((!result.first || result.first.username == 'No User' || validator.isEmail(result.first.username)) || (!result.second || result.second.username == 'No User' || validator.isEmail(result.second.username)))
                  validLeave = 1;
                else
                  validLeave = 0;
              }
              if(validLeave == 1){
                req.session.header = 'Team Information';
                req.session.message = "Cannot leave " + name + "! Teams need at least one registered user remaining.";
                req.session.link = '/teamPage';
                req.session.back = 'Team Dashboard';
                goMessage(req, res);
              }else{
                var current_id = req.session.curr_user._id;
                var current_name = req.session.curr_user.username;
                /* Determine which user is the current user then create an update, send to the other users, and update the team count of the current user */
                if(result.first._id == current_id){
                  var leaveUpdate = {
                    teamID: result[i]._id,
                    teamname: name,
                    update: req.session.curr_user.full_name + " ("+ current_name +") has left " + name + ". [Leader Left]"
                  };
                  await updateUpdates(result.first, result.second, result.third, leaveUpdate);
                  await db.updateOne(Team, {_id:teamID}, {$set:{"first":{username:'No User', full_name:'No User'}}});
                }else if(result.second._id == current_id){
                  var leaveUpdate = {
                    teamID: result[i]._id,
                    teamname: name,
                    update: req.session.curr_user.full_name + " ("+ current_name +") has left " + name + ". [Deputy Leader Left]"
                  };
                  await updateUpdates(result.first, result.second, result.third, leaveUpdate);
                  await db.updateOne(Team, {_id:teamID}, {$set:{"second":{username:'No User', full_name:'No User'}}});
                }else if(result.third._id == current_id){
                  var leaveUpdate = {
                    teamID: result[i]._id,
                    teamname: name,
                    update: req.session.curr_user.full_name + " ("+ current_name +") has left " + name + ". [Whip Left]"
                  };
                  await updateUpdates(result.first, result.second, result.third, leaveUpdate);
                  await db.updateOne(Team, {_id:teamID}, {$set:{"third":{username:'No User', full_name:'No User'}}});
                }
                await db.findOne(User, {_id:req.session.curr_user._id}, async function(result){
                  req.session.curr_user = result;
                  req.session.header = 'Leave Team';
                  req.session.message = 'Successfully Left ' + name + '!';
                  req.session.link = '/teamPage';
                  req.session.back = 'Teams Dashboard';
                  goMessage(req, res);
                });
              }
            }else{
              req.session.header = 'Team Information';
              req.session.message = "Cannot leave " + name + " since you're not in the team!";
              req.session.link = '/teamPage';
              req.session.back = 'Team Dashboard';
              goMessage(req, res);
            }
          }else{
            req.session.header = 'Team Information';
            req.session.message = "Error in leaving team! Team not found.";
            req.session.link = '/teamPage';
            req.session.back = 'Team Dashboard';
            goMessage(req, res);
          }
        });
      }
    }else{
      goHome(req, res);
    }
  },

  /* Load the confirmation page for deleting a team */
  confirmDeleteTeam: async function(req, res){
    if(req.session.curr_user){
      var errors = validationResult(req);
      if (!errors.isEmpty()){
        req.session.header = 'Team Information';
        req.session.message = "Error in Deleting Team! No valid team name entered.";
        req.session.link = '/teamPage';
        req.session.back = 'Team Dashboard';
        goMessage(req, res);
      }else{
        var teamID = sanitize(req.query.team);
        await db.findOne(Team, {_id:teamID}, async function(result){
          if(result){ /* If the team is found, proceed */
            var name = result.teamname;
            if(result.first._id == req.session.curr_user._id || result.second._id == req.session.curr_user._id || result.third._id == req.session.curr_user._id){
              var render = 'app/teams/confirmDeleteTeam';
              var pagedetails = {
                pagename: 'Confirm Delete',
                curr_user:req.session.curr_user,
                team: result
              };
              renderPage(req, res, render, pagedetails);
            }else{
              req.session.header = 'Team Information';
              req.session.message = "Cannot delete " + name + " since you're not in the team!";
              req.session.link = '/teamPage';
              req.session.back = 'Team Dashboard';
              goMessage(req, res);
            }
          }else{
            req.session.header = 'Team Information';
            req.session.message = "Error in deleting team! Team not found.";
            req.session.link = '/teamPage';
            req.session.back = 'Team Dashboard';
            goMessage(req, res);
          }
        });
      }
    }else{
      goHome(req, res);
    }
  },

  /* Delete a team */
  deleteTeam: async function(req, res){
    if(req.session.curr_user){
      var errors = validationResult(req);
      if (!errors.isEmpty()){
        req.session.header = 'Team Information';
        req.session.message = "Error in Deleting Team! No valid team name entered.";
        req.session.link = '/teamPage';
        req.session.back = 'Team Dashboard';
        goMessage(req, res);
      }else{
        var teamID = sanitize(req.query.team);
        /* Find the team */
        await db.findOne(Team, {_id:teamID}, async function(result){
          if(result){ /* If the team is found, proceed */
            var name = result.teamname;
            if(result.first._id == req.session.curr_user._id || result.second._id == req.session.curr_user._id || result.third._id == req.session.curr_user._id){
              var deleteUpdate = {
                teamID: result._id,
                teamname: name,
                update: name+" has been deleted by " + req.session.curr_user.full_name + " ("+ req.session.curr_user.username +"). [Deleted team]"
              };
              /* Update the users in the team */
              await updateUpdates(result.first, result.second, result.third, deleteUpdate);
              /* Delete the team */
              await db.deleteOne(Team, {teamname:name});
              await db.findOne(User, {_id:req.session.curr_user._id}, async function(result){
                req.session.curr_user = result;
                req.session.header = 'Delete Team';
                req.session.message = 'Team Successfully Deleted!';
                req.session.link = '/teamPage';
                req.session.back = 'Teams Dashboard';
                goMessage(req, res);
              });
            }else{
              req.session.header = 'Team Information';
              req.session.message = "Cannot delete " + name + " since you're not in the team!";
              req.session.link = '/teamPage';
              req.session.back = 'Team Dashboard';
              goMessage(req, res);
            }
          }else{
            req.session.header = 'Delete Team';
            req.session.message = 'Error in Delete a Team! Team not found.';
            req.session.link = '/teamPage';
            req.session.back = 'Teams Dashboard';
            goMessage(req, res);
          }
        });
      }
    }else{
      goHome(req, res);
    }
  },

  /* Load the list of teams of a user */
  teamList: async function(req, res){
    reset(req);
    if(req.session.curr_user){
      /* Build the query to find all the teams of the user */
      first_query = {"first._id":req.session.curr_user._id};
      second_query = {"second._id":req.session.curr_user._id};
      third_query = {"third._id":req.session.curr_user._id};
      team_query = {"teamname": {$ne: null}};
      whole_query = {$and: [team_query, {$or: [first_query, second_query, third_query]}]};
      /* Find all of the teams of the user */
      await db.findMany(Team, whole_query, function(result){
        var final_list = [];
        /* If any of the members are non-existent, replace temporarily with "No User" */
        for(i = 0; i < result.length; i++){
          var temp_first, temp_second, temp_third;
          final_list.push(result[i]);
          if(!result[i].first){
            temp_first = {full_name:"No User"};
          }else{
            temp_first = result[i].first;
          }
          if(!result[i].second){
            temp_second = {full_name:"No User"};
          }else{
            temp_second = result[i].second;
          }
          if(!result[i].third){
            temp_third = {full_name:"No User"};
          }else{
            temp_third = result[i].third;
          }
          final_list[i].first = temp_first;
          final_list[i].second = temp_second;
          final_list[i].third = temp_third;
        }
        var render = 'app/teams/teamList';
        var pagedetails = {
          pagename: "List of Teams",
          curr_user: req.session.curr_user,
          teams: result
        };
        renderPage(req, res, render, pagedetails);
      });
    }else if(req.session.guest_user){
      /* Build the query to find all the teams of the user */
      first_query = {"first.email":req.session.guest_user.email};
      second_query = {"second.email":req.session.guest_user.email};
      third_query = {"third.email":req.session.guest_user.email};
      team_query = {"teamname": {$ne: null}};
      whole_query = {$and: [team_query, {$or: [first_query, second_query, third_query]}]};
      /* Find all of the teams of the user */
      await db.findMany(Team, whole_query, function(result){
        var final_list = [];
        /* If any of the members are non-existent, replace temporarily with "No User" */
        for(i = 0; i < result.length; i++){
          var temp_first, temp_second, temp_third;
          final_list.push(result[i]);
          if(!result[i].first){
            temp_first = {full_name:"No User"};
          }else{
            temp_first = result[i].first;
          }
          if(!result[i].second){
            temp_second = {full_name:"No User"};
          }else{
            temp_second = result[i].second;
          }
          if(!result[i].third){
            temp_third = {full_name:"No User"};
          }else{
            temp_third = result[i].third;
          }
          final_list[i].first = temp_first;
          final_list[i].second = temp_second;
          final_list[i].third = temp_third;
        }
        var render = 'app/guest/guestTeams';
        var pagedetails = {
          pagename: "List of Teams",
          curr_user: req.session.guest_user,
          teams: final_list
        };
        res.render(render, {pagedetails:pagedetails});
        res.end();
      });
    }else{
      goHome(req, res);
    }
  },

  /* Load all team updates of a user */
  teamUpdates: async function(req, res){
    reset(req);
    if(req.session.curr_user){
      await db.findOne(User, {username:req.session.curr_user.username}, async function(result){
        if(result){
          var finalUpdates = [];
          if(result.updates){
            for(i = 0; i < result.updates.length; i++){
              var temp = {
                teamID: result.updates[i].teamID,
                teamname: result.updates[i].teamname,
                update: result.updates[i].update,
                link: '/teamInfo',
                index: i
              };
              finalUpdates.push(temp);
            }
          }
          var render = 'app/teams/teamUpdates';
          var pagedetails = {
            pagename: "Team Updates",
            curr_user: req.session.curr_user,
            updates: finalUpdates
          };
          renderPage(req, res, render, pagedetails);
        }else{
          req.session.header = 'Team Updates';
          req.session.message = 'Error in Team Updates! Please Try Again Later.';
          req.session.link = '/teamPage';
          req.session.back = 'Teams Dashboard';
          goMessage(req, res);
        }
      });
    }else{
      goHome(req, res);
    }
  },

  /* Delet one team update */
  deleteUpdate: async function(req, res){
    if(req.session.curr_user){
      var errors = validationResult(req);
      if (!errors.isEmpty()){
        req.session.header = 'Delete Team Update';
        req.session.message = "Error in Deleting Team Update! No valid team update chosen.";
        req.session.link = '/teamPage';
        req.session.back = 'Team Dashboard';
        goMessage(req, res);
      }else{
        var index = sanitize(req.query.index);
        await db.findOne(User, {_id: req.session.curr_user._id}, async function(result){
          if(result){ /* If user is found, proceed */
            var updated = result.updates;
            /* Delete the update */
            updated.splice(index, 1);
            /* Update the account of the user */
            await db.findOneAndUpdate(User, {_id: req.session.curr_user._id}, {$set:{"updates":updated}}, async function(updated_user){
              if(updated_user){
                req.session.header = 'Team Update';
                req.session.message = 'Team Update Successfully Deleted!';
                req.session.link = '/teamPage';
                req.session.back = 'Team Dashboard';
                goMessage(req, res);
              }else{
                req.session.header = 'Team Update';
                req.session.message = "Error in deleting Team Update! Please Try again later.";
                req.session.link = '/teamPage';
                req.session.back = 'Team Dashboard';
                goMessage(req, res);
              }
            });
          }else{
            req.session.header = 'Team Update';
            req.session.message = "Error in deleting Team Update! Please Try again later.";
            req.session.link = '/teamPage';
            req.session.back = 'Team Dashboard';
            goMessage(req, res);
          }
        });
      }
    }else{
      goHome(req, res);
    }
  },

  /* Load the confirmation page to delete all team updates of a team of a user */
  deleteAllTeamUpdates: async function(req, res){
    if(req.session.curr_user){
      var errors = validationResult(req);
      if (!errors.isEmpty()){
        req.session.header = 'Delete All Team Updates';
        req.session.message = "Error in Deleting Team Updates! No valid team name entered.";
        req.session.link = '/teamPage';
        req.session.back = 'Team Dashboard';
        goMessage(req, res);
      }else{
        var teamID = sanitize(req.query.team);
        /* Find the user */
        await db.findOne(User, {_id: req.session.curr_user._id}, async function(result){
          if(result){ /* If found, find the team within the updates array */
            await db.findOne(Team, {_id:teamID}, async function(foundTeam){
              if(foundTeam){
                var updates = result.updates;
                if(updates){
                  var valid = 0;
                  for(i = 0; i < updates.length; i++){
                    if(updates[i].teamname == foundTeam.teamname){
                      valid = 1;
                      break;
                    }
                  }
                  if(valid == 1){
                    var pagedetails = {
                      pagename: 'Delete All Team Updates',
                      curr_user:req.session.curr_user,
                      title: 'Delete All Team Updates',
                      teamname: foundTeam.teamname,
                      message_one: 'You are deleting all your team updates for',
                      message_two: 'All Team Updates will be unrecoverable after.',
                      message_three: 'Kindly click Confirm to proceed deleting.',
                      proceed: 'Confirm',
                      proceed_link: '/confirmDeleteAll?teamname='+foundTeam.teamname,
                      cancel: 'Cancel',
                      cancel_link: '/teamInfo?teamname='+foundTeam.teamname
                    };
                    var render = 'app/layout/base_teams';
                    renderPage(req, res, render, pagedetails);
                  }else{
                    req.session.header = 'Delete All Team Updates';
                    req.session.message = "No updates to delete!";
                    req.session.link = '/teamPage';
                    req.session.back = 'Teams Dashboard';
                    goMessage(req, res);
                  }
                }else{
                  req.session.header = 'Delete All Team Updates';
                  req.session.message = "No updates to delete!";
                  req.session.link = '/teamPage';
                  req.session.back = 'Teams Dashboard';
                  goMessage(req, res);
                }
              }else{
                req.session.header = 'Delete All Team Updates';
                req.session.message = "Error in deleting updates! Cannot find team, please try again later.";
                req.session.link = '/teamPage';
                req.session.back = 'Teams Dashboard';
                goMessage(req, res);
              }
            });
          }else{
            req.session.header = 'Delete All Team Updates';
            req.session.message = "Error in deleting updates! Please Try again later.";
            req.session.link = '/teamPage';
            req.session.back = 'Teams Dashboard';
            goMessage(req, res);
          }
        });
      }
    }else{
      goHome(req, res);
    }
  },

  /* Delete all team updates of a team of a user */
  confirmDeleteAllTeam: async function(req, res){
    if(req.session.curr_user){
      var errors = validationResult(req);
      if (!errors.isEmpty()){
        req.session.header = 'Delete All Team Updates';
        req.session.message = "Error in Deleting Team Updates! No valid team name entered.";
        req.session.link = '/teamPage';
        req.session.back = 'Team Dashboard';
        goMessage(req, res);
      }else{
        var teamID = sanitize(req.query.team);
        /* Find the team */
        await db.findOne(Team, {_id:teamID}, async function(result){
          if(result){ /* If team is found, proceed */
            var name = result.teamname;
            /* Find the user */
            await db.findOne(User, {_id:req.session.curr_user._id}, async function(foundUser){
              if(foundUser){ /* If user is found, proceed */
                var newUpdates = [];
                if(foundUser.updates){
                  /* Delete all team updates connected to the team */
                  for(i = 0; i < foundUser.updates.length; i++){
                    if(foundUser.updates[i].teamname != name){
                      var temp = {
                        teamname: foundUser.updates[i].teamname,
                        update: foundUser.updates[i].update
                      };
                      newUpdates.push(temp);
                    }
                  }
                  /* Update the user */
                  await db.findOneAndUpdate(User, {_id:req.session.curr_user._id}, {$set:{"updates":newUpdates}}, async function(updated){
                    req.session.curr_user = updated;
                    req.session.header = 'Delete All Team Updates';
                    req.session.message = "All Team Updates for " + name + " were successfully deleted!";
                    req.session.link = '/teamInfo?team='+result._id;
                    req.session.back = 'Team Info';
                    goMessage(req, res);
                  });
                }else{
                  req.session.header = 'Delete All Team Updates';
                  req.session.message = "All Team Updates for " + name + " were successfully deleted!";
                  req.session.link = '/teamInfo?team='+result._id;
                  req.session.back = 'Team Info';
                  goMessage(req, res);
                }
              }else{
                req.session.header = 'Delete All Team Updates';
                req.session.message = "Error in deleting updates of  " + name + "! Please Try again later.";
                req.session.link = '/teamPage';
                req.session.back = 'Teams Dashboard';
                goMessage(req, res);
              }
            });
          }else{
            req.session.header = 'Delete All Team Updates';
            req.session.message = "Error in deleting team updates! Please Try again later.";
            req.session.link = '/teamPage';
            req.session.back = 'Teams Dashboard';
            goMessage(req, res);
          }
        });
      }
    }else{
      goHome(req, res);
    }
  },

  /* Load the confirmation page to delete all team updates of a user */
  deleteAllUpdates: async function(req, res){
    if(req.session.curr_user){
      var pagedetails = {
        pagename: 'Delete All Team Updates',
        curr_user:req.session.curr_user,
        title: 'Delete All Team Updates',
        teamname: 'All of your Teams',
        message_one: 'You are deleting all of your team updates for',
        message_two: 'All Team Updates will be unrecoverable after.',
        message_three: 'Kindly click Confirm to proceed deleting.',
        proceed: 'Confirm',
        proceed_link: '/confirmDeleteAll',
        cancel: 'Cancel',
        cancel_link: '/teamUpdates'
      };
      var render = 'app/layout/base_teams';
      renderPage(req, res, render, pagedetails);
    }else{
      goHome(req, res);
    }
  },

  /* Delete all team updates of a user */
  confirmDeleteAll: async function(req, res){
    if(req.session.curr_user){
      /* Delete all team updates of the user */
      await db.findOneAndUpdate(User, {username:req.session.curr_user.username}, {$set:{"updates":[]}}, async function(result){
        if(result){
          req.session.header = 'Delete All Team Updates';
          req.session.message = "All Team Updates for " + req.session.curr_user.full_name + " were successfully deleted!";
          req.session.link = '/teamPage';
          req.session.back = 'Team Dashboard';
          goMessage(req, res);
        }else{
          req.session.header = 'Delete All Updates of a Team';
          req.session.message = "Error in deleting updates of  " + req.session.curr_user.full_name + "! Please Try again later.";
          req.session.link = '/teamPage';
          req.session.back = 'Teams Dashboard';
          goMessage(req, res);
        }
      });
    }else{
      goHome(req, res);
    }
  },

  /* Check if all usernames are registered */
  checkUsers: async function(req, res){
    var first, second, third;
    if(req.query.first)
      first = sanitize(req.query.first);
    if(req.query.second)
      second = sanitize(req.query.second);
    if(req.query.third)
      first = sanitize(req.query.third);
    if(first && second && third){
      await db.findMany(User, {username:{$in:[first,second,third]}}, function(result){
        res.send(result);
      });
    }else if(first && second){
      await db.findMany(User, {username:{$in:[first,second]}}, function(result){
        res.send(result);
      });
    }else if(first && third){
      await db.findMany(User, {username:{$in:[first,third]}}, function(result){
        res.send(result);
      });
    }else if(second && third){
      await db.findMany(User, {username:{$in:[second,third]}}, function(result){
        res.send(result);
      });
    }else if(first){
      await db.findMany(User, {username:first}, function(result){
        res.send(result);
      });
    }else if(second){
      await db.findMany(User, {username:second}, function(result){
        res.send(result);
      });
    }else if(third){
      await db.findMany(User, {username:third}, function(result){
        res.send(result);
      });
    }else{
      res.send(false);
    }
  },

  /* Check if team name is already taken */
  checkName: async function(req, res){
    if(req.session.curr_user){
      if(req.query.teamname){
        var teamname = sanitize(req.query.teamname);
        await db.findOne(Team, {teamname:teamname}, function(result){
          if(result)
            res.send(result);
          else
            res.send(false);
        });
      }
    }else{
      res.send(false);
    }
  },

  /* Check if users are already in a team */
  checkUsers: async function(req, res){
    if(req.session.curr_user){
      var first, second, third;
      if(req.query.first)
        first = sanitize(req.query.first);
      if(req.query.second)
        second = sanitize(req.query.second);
      if(req.query.third)
        third = sanitize(req.query.third);
      if(first && second && third){
        await db.findMany(User, {username:{$in:[first,second,third]}}, function(result){
          res.send(result);
        });
      }else if(first && second){
        await db.findMany(User, {username:{$in:[first,second]}}, function(result){
          res.send(result);
        });
      }else if(first && third){
        await db.findMany(User, {username:{$in:[first,third]}}, function(result){
          res.send(result);
        });
      }else if(second && third){
        await db.findMany(User, {username:{$in:[second,third]}}, function(result){
          res.send(result);
        });
      }else if(first){
        await db.findMany(User, {username:first}, function(result){
          res.send(result);
        });
      }else if(second){
        await db.findMany(User, {username:second}, function(result){
          res.send(result);
        });
      }else if(third){
        await db.findMany(User, {username:third}, function(result){
          res.send(result);
        });
      }else{
        res.send(false);
      }
    }else{
      res.send(false);
    }
  },

  /* Check if users are registered */
  checkUserEmail: async function(req, res){
    if(req.session.curr_user){
      var first, second;
      if(req.query.first)
        first = sanitize(req.query.first);
      if(req.query.second)
        second = sanitize(req.query.second);
      if(first && second){
        await db.findMany(User, {email:{$in:[first,second]}}, function(result){
          res.send(result);
        });
      }else if(first){
        await db.findMany(User, {email:first}, function(result){
          res.send(result);
        });
      }else if(second){
        await db.findMany(User, {email:second}, function(result){
          res.send(result);
        });
      }else{
        res.send(false);
      }
    }else{
      res.send(false);
    }
  },

  /* Check if users are already in a team */
  checkTeam: async function(req, res){
    if(req.session.curr_user){
      var first, second, third;
      var firstQuery, secondQuery, thirdQuery;
      if(req.query.first){
        first = sanitize(req.query.first);
        if(validator.isEmail(first))
          firstQuery = {$or:[{"first.email":first}, {"second.email":first}, {"third.email":first}]};
        else
          firstQuery = {$or:[{"first.username":first}, {"second.username":first}, {"third.username":first}]};
      }
      if(req.query.second){
        second = sanitize(req.query.second);
        if(validator.isEmail(second))
          secondQuery = {$or:[{"first.email":second}, {"second.email":second}, {"third.email":second}]};
        else
          secondQuery = {$or:[{"first.username":second}, {"second.username":second}, {"third.username":second}]};
      }
      if(req.query.third){
        third = sanitize(req.query.third);
        if(validator.isEmail(third))
          thirdQuery = {$or:[{"first.email":third}, {"second.email":third}, {"third.email":third}]};
        else
          thirdQuery = {$or:[{"first.username":third}, {"second.username":third}, {"third.username":third}]};
      }
      if(first && second && third){
        var query = {$and: [firstQuery, secondQuery, thirdQuery]};
        await db.findOne(Team, query, function(result){
          if(result){
            res.send(result);
          }else{
            res.send(false);
          }
        });
      }else{
        res.send(false);
      }
    }else{
      res.send(false);
    }
  }
}

/* Make sure all indicated variables are set to 0, null, or their default value */
function reset(req){
  req.session.reg_fields = null;
  req.session.login_fields = null;
  req.session.guest_fields = null;
  req.session.roundID = null;
  req.session.gradeID = null;
  req.session.settings_fields = null;
  req.session.create_fields = null;
  req.session.choosing = 0;
  req.session.edit_fields = null;
  req.session.edit_team = null;
  req.session.roundID = null;
  req.session.status = null;
  req.session.fields = null;
  req.session.gradeFields = null;
  req.session.pagename = null;
  req.session.header = null;
  req.session.message = null;
  req.session.link = null;
  req.session.back = null;
  req.session.match = null;
}

/* Redirect to the home page */
function goHome(req, res){
  res.redirect('/');
  res.end();
}

/* Redirect to message page */
function goMessage(req, res){
  req.session.pagename = "Teams";
  res.redirect('/message');
  res.end();
}

/* Update the updates array of users */
async function updateUpdates(first, second, third, updateAdd){
  await db.updateOne(User, {username:first.username}, {$push:{"updates":updateAdd}});
  await db.updateOne(User, {username:second.username}, {$push:{"updates":updateAdd}});
  await db.updateOne(User, {username:third.username}, {$push:{"updates":updateAdd}});
}

/* Update the team name of updates connected */
async function updateTeamname(old_team, new_team, user){
  await db.findOne(User, {username:user}, async function(foundUser){
    if(foundUser){
      if(foundUser.updates){
        var updated = [];
        for(i = 0; i < foundUser.updates.length; i++){
          var temp;
          if(foundUser.updates[i].teamID.toString() == old_team){
            temp = {
              teamID: foundUser.updates[i].teamID,
              teamname: new_team,
              update: foundUser.updates[i].update
            }
          }else{
            temp = {
              teamID: foundUser.updates[i].teamID,
              teamname: foundUser.updates[i].teamname,
              update: foundUser.updates[i].update
            }
          }
          updated.push(temp)
        }
        await db.updateOne(User, {username:user}, {$set:{"updates":updated}});
      }
    }
  });
}

/* Update the users and team */
async function updateTeam(req, res, current, teamname, team){
  var first = team.first, second = team.second, third = team.third;
  var update_teamname, editUpdate;
  var maillist = [];
  /* If the team name and members were changed, create an update regarding so */
  if(teamname){
    await db.updateOne(Team, {teamname:current.teamname}, {$set: {teamname:teamname, first:first, second:second, third:third}});
    update_teamname = teamname;
    editUpdate = {
      teamID: current._id,
      teamname: update_teamname,
      update: update_teamname + " was edited by " + req.session.curr_user.full_name + " (" + req.session.curr_user.username + "). [Edited Members and Team Name]"
    };
    await updateTeamname(current._id, teamname, first.username);
    await updateTeamname(current._id, teamname, second.username);
    await updateTeamname(current._id, teamname, third.username);
  }else{ /* If only the members were changed, create an update regarding so */
    await db.updateOne(Team, {teamname:current.teamname}, {$set: {first:first, second:second, third:third}});
    update_teamname = current.teamname;
    editUpdate = {
      teamID: current._id,
      teamname: update_teamname,
      update: update_teamname + " was edited by " + req.session.curr_user.full_name + " (" + req.session.curr_user.username + "). [Edited Members]"
    };
  }
  /* Update the users with the created update */
  await updateUpdates(first, second, third, editUpdate);
  /* If the previous leader is no longer in the team, create an update and send */
  if(current.first.username != first.username && current.first.username != second.username && current.first.username != third.username){
    await db.updateOne(User, {username:current.first.username}, {$push:{"updates":editUpdate}});
    var removeUpdate = {
      teamID: current._id,
      teamname: update_teamname,
      update: current.first.full_name + " (" + current.first.username + ")" +" was removed by " + req.session.curr_user.full_name + " (" + req.session.curr_user.username + "). [Removed Member]"
    };
    await db.updateOne(User, {username:current.first.username}, {$push:{"updates":removeUpdate}});
    await updateUpdates(first, second, third, removeUpdate);
    if(validator.isEmail(current.first.username))
      maillist.push(current.first.username);
  }
  /* If the previous deputy leader is no longer in the team, create an update and send */
  if(current.second.username != first.username && current.second.username != second.username && current.second.username != third.username){
    await db.updateOne(User, {username:current.second.username}, {$push:{"updates":editUpdate}});
    var removeUpdate = {
      teamID: current._id,
      teamname: update_teamname,
      update: current.second.full_name + " (" + current.second.username + ")" +" was removed by " + req.session.curr_user.full_name + " (" + req.session.curr_user.username + "). [Removed Member]"
    };
    await db.updateOne(User, {username:current.second.username}, {$push:{"updates":removeUpdate}});
    await updateUpdates(first, second, third, removeUpdate);
    if(validator.isEmail(current.second.username))
      maillist.push(current.second.username);
  }
  /* If the previous whip is no longer in the team, create an update and send */
  if(current.third.username != first.username && current.third.username != second.username && current.third.username != third.username){
    await db.updateOne(User, {username:current.third.username}, {$push:{"updates":editUpdate}});
    var removeUpdate = {
      teamID: current._id,
      teamname: update_teamname,
      update: current.third.full_name + " (" + current.third.username + ")" +" was removed by " + req.session.curr_user.full_name + " (" + req.session.curr_user.username + "). [Removed Member]"
    };
    await db.updateOne(User, {username:current.third.username}, {$push:{"updates":removeUpdate}});
    await updateUpdates(first, second, third, removeUpdate);
    if(validator.isEmail(current.third.username))
      maillist.push(current.third.username);
  }
  /* If any of the removed members are guest accounts, send them an email */
  if(maillist.length > 0){
    const mailDetails = {
      from: 'tabcore@outlook.com',
      to: maillist,
      subject: 'Removal from the team \'' + update_teamname + '\'',
      text: "Hey!\n\nYou were removed from " + update_teamname + " team as a guest by " + req.session.curr_user.full_name + ".",
      html: '<h2>Hey!</h2><br><h3>You were removed from \'' + update_teamname + '\' team as a guest by ' + req.session.curr_user.full_name + '.</h3><br /><img src="cid:tabcore_attach.png" alt="Tabcore" style="display:block; margin-left:auto; margin-right:auto; width: 100%">',
      attachments: [{
        filename: 'TABCORE_FOOTER.png',
        path: __dirname + '/../views/assets/img/email/TABCORE_FOOTER.png',
        cid: 'tabcore_attach.png'
      }]
    };
    transpo.sendMail(mailDetails, async function(err, result){
      if(err){
        req.session.edit_fields = {all:0, new_team:0, new_users:1 ,new_current:0};
        res.redirect('/editTeams');
        res.end();
      }else{
        req.session.header = 'Edit a Team';
        req.session.message = 'Successfully Edited ' + current.teamname + '!';
        req.session.link = '/teamPage';
        req.session.back = 'Teams Dashboard';
        goMessage(req, res);
      }
    });
  }else{
    req.session.header = 'Edit a Team';
    req.session.message = 'Successfully Edited ' + current.teamname + '!';
    req.session.link = '/teamPage';
    req.session.back = 'Teams Dashboard';
    goMessage(req, res);
  }
}

/* Update the members within the chosen team */
async function updateMembers(req, res, current, teamname){
  if(req.session.curr_user){
    req.session.edit_team = current._id;
    var userfirst = sanitize(req.body.edit_first);
    var usersecond = sanitize(req.body.edit_second);
    var userthird = sanitize(req.body.edit_third);
    var current_user = req.session.curr_user.username;
    /* Build the queries */
    var firstQuery, secondQuery, thirdQuery, findOne, findTwo, findThree;
    var validOne = 0, validTwo = 0, validThree = 0;
    if(userfirst){
      if(validator.isEmail(userfirst)){
        firstQuery = {$or:[{"first.email":userfirst}, {"second.email":userfirst}, {"third.email":userfirst}]};
        findOne = {email:userfirst};
        validOne = 0;
      }else{
        if (!validator.matches(userfirst, userFormat)){
          validOne = 1;
        }else{
          firstQuery = {$or:[{"first.username": userfirst}, {"second.username": userfirst}, {"third.username": userfirst}]};
          findOne = {username:userfirst};
          validOne = 0;
        }
      }
    }else{
      userfirst = current.first.username;
      firstQuery = {$or:[{"first.username": userfirst}, {"second.username": userfirst}, {"third.username": userfirst}]};
      findOne = {username:userfirst};
      validOne = 0;
    }
    if(usersecond){
      if(validator.isEmail(usersecond)){
        secondQuery = {$or:[{"first.email":usersecond}, {"second.email":usersecond}, {"third.email":usersecond}]};
        findTwo = {email:usersecond};
        validOne = 0;
      }else{
        if (!validator.matches(usersecond, userFormat)){
          validTwo = 1;
        }else{
          secondQuery = {$or: [{"first.username": usersecond}, {"second.username": usersecond}, {"third.username": usersecond}]};
          findTwo = {username:usersecond};
          validOne = 0;
        }
      }
    }else{
      usersecond = current.second.username;
      secondQuery = {$or: [{"first.username": usersecond}, {"second.username": usersecond}, {"third.username": usersecond}]};
      findTwo = {username:usersecond};
      validTwo = 0;
    }
    if(userthird){
      if(validator.isEmail(userthird)){
        thirdQuery = {$or:[{"first.email":userthird}, {"second.email":userthird}, {"third.email":userthird}]};
        findThree = {email:userthird};
        validOne = 0;
      }else{
        if (!validator.matches(userthird, userFormat)){
          validThree = 1;
        }else{
          thirdQuery = {$or: [{"first.username": userthird}, {"second.username": userthird}, {"third.username": userthird}]};
          findThree = {username:userthird};
          validOne = 0;
        }
      }
    }else{
      userthird = current.third.username;
      thirdQuery = {$or: [{"first.username": userthird}, {"second.username": userthird}, {"third.username": userthird}]};
      findThree = {username:userthird};
      validThree = 0;
    }
    var query = {$and: [firstQuery, secondQuery, thirdQuery, {teamname:{$ne:current.teamname}}]};
    /* if all entered information are invalid, redirect back to the edit a team page */
    if(validOne == 1 || validTwo == 1 || validThree == 1){
      req.session.edit_fields = {all:0, new_team:0, new_users:1 ,new_current:0};
      res.redirect('/editTeams');
      res.end();
    }else{
      /* if no two users are the same and the current user is one of the members, proceed */
      if((userfirst === current_user || usersecond === current_user || userthird === current_user) && (userfirst !== usersecond && userfirst !== userthird && usersecond !== userthird)){
        await db.findOne(Team, query, async function(exist_res){
          if(exist_res){ /* if the team already exists/all three members already have a group together, redirect back to the create a team page */
            req.session.edit_fields = {all:0, new_team:0, new_users:2 ,new_current:0};
            res.redirect('/editTeams');
            res.end();
          }else{
            /* Check the validity of all information entered */
            await db.findOne(User, findOne, async function(first_res){
              var first = first_res;
              await db.findOne(User, findTwo, async function(second_res){
                var second = second_res;
                await db.findOne(User, findThree, async function(third_res){
                  var third = third_res;
                  /* If all users are registered and found and there is no team with the same name, proceed */
                  if((first && !validator.isEmail(userfirst)) && (second && !validator.isEmail(usersecond)) && (third && !validator.isEmail(userthird))){
                    var team = {first:first,second:second,third:third};
                    updateTeam(req, res, current, teamname, team);
                  }else{
                    var lead = 0, dep = 0, whip = 0;
                    var maillist = [];
                    /* Check if the first entered user is an email or a username */
                    if(!first && validator.isEmail(userfirst) && (userfirst != current.first.username && userfirst != current.second.username && userfirst != current.third.username)){
                      /* If unregistered, a new user to the team, and an email, add the email to the mail list array */
                      lead = 0;
                      maillist.push(userfirst);
                      first = {email:userfirst,username:userfirst,full_name:userfirst};
                    }else if((userfirst == current.first.username || userfirst == current.second.username || userfirst == current.third.username) && validator.isEmail(userfirst)){
                      lead = 0;
                      if(current.first.username == userfirst)
                        first = current.first;
                      else if(current.second.username == userfirst)
                        first = current.second;
                      else if(current.third.username == userfirst)
                        first = current.third;
                    }else if(!first){
                      lead = 1;
                    }else if(first && validator.isEmail(userfirst)){
                      lead = 1;
                    }else{
                      lead = 0;
                    }
                    /* Check if the second entered user is an email or a username */
                    if(!second && validator.isEmail(usersecond) && (usersecond != current.first.username && usersecond != current.second.username && usersecond != current.third.username)){
                      /* If unregistered, a new user to the team, and an email, add the email to the mail list array */
                      dep =  0;
                      maillist.push(usersecond);
                      second = {email:usersecond,username:usersecond,full_name:usersecond};
                    }else if((usersecond == current.first.username || usersecond == current.second.username || usersecond == current.third.username) && validator.isEmail(usersecond)){
                      dep = 0;
                      if(current.first.username == usersecond)
                        second = current.first;
                      else if(current.second.username == usersecond)
                        second = current.second;
                      else if(current.third.username == usersecond)
                        second = current.third;
                    }else if(!second){
                      dep = 1;
                    }else if(second && validator.isEmail(usersecond)){
                      dep = 1;
                    }else{
                      dep = 0;
                    }
                    /* Check if the third entered user is an email or a username */
                    if(!third && validator.isEmail(userthird) && (userthird != current.first.username && userthird != current.second.username && userthird != current.third.username)){
                      /* If unregistered, a new user to the team, and an email, add the email to the mail list array */
                      whip = 0;
                      maillist.push(userthird);
                      third = {email:userthird,username:userthird,full_name:userthird};
                    }else if((userthird == current.first.username || userthird == current.second.username || userthird == current.third.username) && validator.isEmail(userthird)){
                      whip = 0;
                      if(current.first.username == userthird)
                        third = current.first;
                      else if(current.second.username == userthird)
                        third = current.second;
                      else if(current.third.username == userthird)
                        third = current.third;
                    }else if(!third){
                      whip = 1;
                    }else if(third && validator.isEmail(userthird)){
                      whip = 1;
                    }else{
                      whip = 0;
                    }
                    /* If any entered information are invalid, redirect back to the edit a team page */
                    if(lead == 1 || dep == 1 || whip == 1){
                      req.session.edit_fields = {all:0, new_team:0, new_users:1 ,new_current:0};
                      res.redirect('/editTeams');
                      res.end();
                    }else if(lead == 0 && dep == 0 && whip == 0 && maillist.length > 0){ /* If no errors and there are unregistered new users within the entered information, proceed */
                      await db.findOne(Team, {$and:[{teamname:{$ne:current.teamname}},{"first.username":{$in:[first.username, second.username, third.username]}},{"second.username":{$in:[first.username, second.username, third.username]}},{"third.username":{$in:[first.username, second.username, third.username]}}]}, async function(existing){
                        if(existing){ /* if the team already exists/all three members already have a group together, redirect back to the edit a team page */
                          req.session.edit_fields = {all:0, new_team:0, new_users:2 ,new_current:0};
                          res.redirect('/editTeams');
                          res.end();
                        }else{
                          if(teamname)
                            update_teamname = teamname;
                          else
                            update_teamname = current.teamname;
                          /* Set the email content */
                          const mailDetails = {
                            from: 'tabcore@outlook.com',
                            to: maillist,
                            subject: 'Invite to the team \'' + update_teamname + '\'',
                            text: "Hey!\n\nYou were invited to join " + update_teamname + " team as a guest by " + req.session.curr_user.full_name + ".",
                            html: '<h2>Hey!</h2><br><h3>You were invited to join \'' + update_teamname + '\' team as a guest by ' + req.session.curr_user.full_name + '. Head on over to Tabcore and login as a guest with this email address.</h3><br /><img src="cid:tabcore_attach.png" alt="Tabcore" style="display:block; margin-left:auto; margin-right:auto; width: 100%">',
                            attachments: [{
                              filename: 'TABCORE_FOOTER.png',
                              path: __dirname + '/../views/assets/img/email/TABCORE_FOOTER.png',
                              cid: 'tabcore_attach.png'
                            }]
                          };
                          /* Send the email/s */
                          transpo.sendMail(mailDetails, async function(err, result){
                            if(err){
                              req.session.edit_fields = {all:0, new_team:0, new_users:1 ,new_current:0};
                              res.redirect('/editTeams');
                              res.end();
                            }else{
                              var team = {first:first,second:second,third:third};
                              updateTeam(req, res, current, teamname, team);
                            }
                          });
                        }
                      });
                    }else if(lead == 0 && dep == 0 && whip == 0){
                      var team = {first:first,second:second,third:third};
                      updateTeam(req, res, current, teamname, team);
                    }else{
                      req.session.edit_fields = {all:0, new_team:0, new_users:1 ,new_current:0};
                      res.redirect('/editTeams');
                      res.end();
                    }
                  }
                });
              });
            });
          }
        });
      }else{
        req.session.edit_team = current._id;
        req.session.edit_fields = {all:0, new_team:0, new_users:1 ,new_current:0};
        res.redirect('/editTeams');
        res.end();
      }
    }
  }else{
    goHome(req, res);
  }
}

/* Get all the invites and updates for the user and render the page */
async function renderPage(req, res, render, pagedetails){
  var username = req.session.curr_user.username;
  var first = {"first.username":username};
  var second = {"second.username":username};
  var third = {"third.username":username};
  var wholeQuery = {$or: [first, second, third]};
  var finalUpdates = [];
  var finalRounds = [];
  var updateCount = 0, roundCount = 0;
  var updateRem = 0, roundRem = 0;
  /* Find the user's account */
  await db.findOne(User, {_id:req.session.curr_user._id}, async function(result){
    if(result){
      /* If they have team updates, store at most 5 updates in an array */
      if(result.updates){
        for(i = 0; i < result.updates.length; i++){
          if(updateCount < 5){
            var link;
            if(result.updates[i].link)
              link = result.updates[i].link
            else
              link = '/teamInfo'
            var temp = {
              teamID: result.updates[i].teamID,
              teamname: result.updates[i].teamname,
              teamupdate: result.updates[i].update,
              link: link,
              index: i
            };
            finalUpdates.push(temp);
            updateCount = updateCount + 1;
          }else{
            updateCount = result.updates.length;
            updateRem = updateCount - 5;
            break;
          }
        }
      }
      var wholeQuery = {$and: [{"gov.teamname": {$ne: null}}, {"opp.teamname": {$ne: null}}, {status:'Ongoing'}, {$or: [{"gov.first._id":req.session.curr_user._id}, {"gov.second._id":req.session.curr_user._id}, {"gov.third._id":req.session.curr_user._id}, {"opp.first._id":req.session.curr_user._id}, {"opp.second._id":req.session.curr_user._id}, {"opp.third._id":req.session.curr_user._id}, {"adjudicator._id":req.session.curr_user._id}]}]};
      /* If they have debate invites, store them in an array */
      await db.findMany(Match, wholeQuery, function(result){
        if(result){
          for(i = 0; i < result.length; i++){
            if(roundCount < 5){
              var messageRound;
              if(result[i].creator.username != req.session.curr_user.username){
                messageRound = result[i].creator.full_name + " invited you to a round.";
              }else{
                messageRound = "Start your debate round!";
              }
              var temp = {
                teamnames: result[i].gov.teamname + " and " + result[i].opp.teamname,
                message: messageRound,
                roundID: result[i].roundID
              };
              finalRounds.push(temp);
              roundCount = roundCount + 1;
            }else{
              roundCount = result.length;
              roundRem = roundCount - 5;
              break;
            }
          }
        }
        res.render(render, {
          pagedetails: pagedetails,
          rounds: finalRounds,
          numRounds: roundCount,
          roundRem: roundRem,
          updates: finalUpdates,
          numUpdates: updateCount,
          updateRem: updateRem
        });
        res.end();
      });
    }else{
      req.session.pagename = 'Error';
      req.session.header = 'Error';
      req.session.message = "Error in loading the page! Please Try again later.";
      req.session.link = '/dashboard';
      req.session.back = 'Dashboard';
      res.redirect('/message');
      res.end();
    }
  });
}

module.exports = team_controller;
