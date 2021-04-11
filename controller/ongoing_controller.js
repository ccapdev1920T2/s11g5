const db = require('../models/db.js');
const User = require('../models/user_model.js');
const Team = require('../models/team_model.js');
const Match = require('../models/match_model.js');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');
var validator = require('validator');
var sanitize = require('mongo-sanitize');

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

const ongoing_controller = {
  /* Confirm the round information and change the status to ongoing */
  confirmRoundInfo: async function(req, res){
    if (req.session.curr_user){
      var errors = validationResult(req);
      var validRoundID = 0,  paramRoundID = 0;
      if (!errors.isEmpty()){
        errors = errors.errors;
        for(i = 0; i < errors.length; i++){
          if(errors[i].msg == 'empty'){
            paramRoundID = 1;
          }else{
            validRoundID = 1;
          }
        }
      }
      if((paramRoundID == 0 && validRoundID == 0) || (paramRoundID == 1 && req.session.roundID)){
        /* Get the round ID */
        var roundID;
        if(paramRoundID == 0 && validRoundID == 0){
          roundID = sanitize(req.query.roundID);
        }else if(req.session.roundID){
          if(validator.isAlphanumeric(req.session.roundID))
            roundID = req.session.roundID;
        }
        if(roundID){
          /* Find the round */
          await db.findOne(Match, {roundID:roundID}, async function(foundRound){
            if(foundRound){
              if(foundRound.creator._id == req.session.curr_user._id){ /* If round is found and the user is the creator, proceed */
                var firstSpeaker, num_speaker;
                if(foundRound.gov.first && foundRound.gov.first.full_name != 'No User'){
                  firstSpeaker = foundRound.gov.first.full_name;
                  num_speaker = 1;
                }
                else if(foundRound.opp.first && foundRound.opp.first.full_name != 'No User'){
                  firstSpeaker = foundRound.opp.first.full_name;
                  num_speaker = 2;
                }
                else if(foundRound.gov.second && foundRound.gov.second.full_name != 'No User'){
                  firstSpeaker = foundRound.gov.second.full_name;
                  num_speaker = 3;
                }
                else if(foundRound.opp.second && foundRound.opp.second.full_name != 'No User'){
                  firstSpeaker = foundRound.opp.second.full_name;
                  num_speaker = 4;
                }
                else if(foundRound.gov.third && foundRound.gov.third.full_name != 'No User'){
                  firstSpeaker = foundRound.gov.third.full_name;
                  num_speaker = 5;
                }
                else if(foundRound.opp.third && foundRound.opp.third.full_name != 'No User'){
                  firstSpeaker = foundRound.opp.third.full_name;
                  num_speaker = 6;
                }
                if(firstSpeaker && num_speaker){
                  var speaker = {
                    name_speaker:firstSpeaker,
                    num_speaker:num_speaker
                  };
                  /* Find the round and update the status to waiting and the current speaker details */
                  await db.findOneAndUpdate(Match, {roundID:roundID}, {$set:{status:'Ongoing', speaker:speaker}}, async function(foundRound){
                    if(foundRound){
                      var maillist = [];
                      if(foundRound.gov.first.username != foundRound.creator.username){
                        maillist.push(foundRound.gov.first.email);
                      }
                      if(foundRound.gov.second.username != foundRound.creator.username){
                        maillist.push(foundRound.gov.second.email);
                      }
                      if(foundRound.gov.third.username != foundRound.creator.username){
                        maillist.push(foundRound.gov.third.email);
                      }
                      if(foundRound.opp.first.username != foundRound.creator.username){
                        maillist.push(foundRound.opp.first.email);
                      }
                      if(foundRound.opp.second.username != foundRound.creator.username){
                        maillist.push(foundRound.opp.second.email);
                      }
                      if(foundRound.opp.third.username != foundRound.creator.username){
                        maillist.push(foundRound.opp.third.email);
                      }
                      if(foundRound.adjudicator.username != foundRound.creator.username){
                        maillist.push(foundRound.adjudicator.email);
                      }
                      if(maillist.length > 0){
                        const mailDetails = {
                          from: 'tabcore@outlook.com',
                          to: maillist,
                          subject: 'Invite to Join Round: ' + roundID,
                          text: "Your team has been invited to a Debate Round!",
                          html: '<h3>' + foundRound.creator.full_name + ' has created a new Debate Round. Here are the details:</br><ul><li>Round ID: ' + roundID + ' </li><li>Adjudicator: ' + foundRound.adjudicator.full_name + '</li><li>Motion: ' + foundRound.motion + '</li><li>Government: ' + foundRound.gov.teamname + '</li><li>Opposition: ' + foundRound.opp.teamname + '</ul><br>Head on over to <a href="https://tabcore.herokuapp.com/">Tabcore</a> to start the round!<br /></h3><img src="cid:tabcore_attach.png" alt="Tabcore" style="display:block; margin-left:auto; margin-right:auto; width: 100%">',
                          attachments: [{
                            filename: 'TABCORE_FOOTER.png',
                            path: __dirname + '/../views/assets/img/email/TABCORE_FOOTER.png',
                            cid: 'tabcore_attach.png'
                          }]
                        };
                        /* Send a farewell message through email */
                        transpo.sendMail(mailDetails, async function(err, result){
                          if(err){
                            req.session.pagename = 'Join a Round';
                            req.session.header = 'Join a Round';
                            req.session.message = 'Error in Join a Round! Please Try Again Later.';
                            req.session.link = '/findRound';
                            req.session.back = 'Join a Round';
                            res.redirect('/message');
                            res.end();
                          }else{
                            req.session.roundID = roundID;
                            var render = 'app/ongoing_round/ongoing_confirm';
                            var pagedetails = {
                              pagename: 'On Going Rounds',
                              curr_user: req.session.curr_user,
                              header: 'Start Debate Round',
                              roundID: roundID
                            };
                            renderPage(req, res, render, pagedetails);
                          }
                        });
                      }else{
                        req.session.roundID = roundID;
                        var render = 'app/ongoing_round/ongoing_confirm';
                        var pagedetails = {
                          pagename: 'On Going Rounds',
                          curr_user: req.session.curr_user,
                          header: 'Start Debate Round',
                          roundID: roundID
                        };
                        renderPage(req, res, render, pagedetails);
                      }
                    }else{
                      req.session.pagename = 'Join a Round';
                      req.session.header = 'Join a Round';
                      req.session.message = 'Error in Join a Round! RoundID: ' + roundID + ' not found.';
                      req.session.link = '/findRound';
                      req.session.back = 'Join a Round';
                      res.redirect('/message');
                      res.end();
                    }
                  });
                }else{
                  await db.updateOne(Match, {roundID:roundID}, {$set:{status:'Editing'}});
                  req.session.pagename = 'Join a Round';
                  req.session.header = 'Join a Round';
                  req.session.message = 'Error in Join a Round! Round information needs to be edited.';
                  req.session.link = '/dashboard';
                  req.session.back = 'Dashboard';
                  res.redirect('/message');
                  res.end();
                }
              }else{
                req.session.pagename = 'Join a Round';
                req.session.header = 'Join a Round';
                req.session.message = 'Error in Join a Round! Confirming of round information can only be done by the creator of the round.';
                req.session.link = '/dashboard';
                req.session.back = 'Dashboard';
                res.redirect('/message');
                res.end();
              }
            }else{
              req.session.pagename = 'Join a Round';
              req.session.header = 'Join a Round';
              req.session.message = 'Error in Join a Round! RoundID: ' + roundID + ' not found.';
              req.session.link = '/findRound';
              req.session.back = 'Join a Round';
              res.redirect('/message');
              res.end();
            }
          });
        }else{
          req.session.pagename = 'Join a Round';
          req.session.header = 'Join a Round';
          req.session.message = 'Error in Join a Round! No Valid Round ID entered.';
          req.session.link = '/dashboard';
          req.session.back = 'Dashboard';
          res.redirect('/message');
          res.end();
        }
      }else{
        req.session.pagename = 'Join a Round';
        req.session.header = 'Join a Round';
        req.session.message = 'Error in Join a Round! No Valid Round ID entered.';
        req.session.link = '/dashboard';
        req.session.back = 'Dashboard';
        res.redirect('/message');
        res.end();
      }
    }else{
      goHome(req, res);
    }
  },

  /* Find a round which is waiting or ongoing */
  findRound: async function(req, res){
    reset(req);
    if (req.session.curr_user){
      /* Build the query to find the rounds the user is in which are waiting or ongoing */
      var wholeQuery = {$and: [{"gov.teamname": {$ne: null}}, {"opp.teamname": {$ne: null}}, {status:'Ongoing'}, {$or: [{"gov.first._id":req.session.curr_user._id}, {"gov.second._id":req.session.curr_user._id}, {"gov.third._id":req.session.curr_user._id}, {"opp.first._id":req.session.curr_user._id}, {"opp.second._id":req.session.curr_user._id}, {"opp.third._id":req.session.curr_user._id}, {"adjudicator._id":req.session.curr_user._id}]}]};
      /* Find the rounds */
      await db.findMany(Match, wholeQuery, function(result){
        if(result){ /* If rounds are found, proceed */
          var render = 'app/ongoing_round/findRound';
          var pagedetails = {
            pagename: 'On Going Rounds',
            curr_user: req.session.curr_user,
            matches: result
          };
          renderPage(req, res, render, pagedetails);
        }else{
          req.session.pagename = 'Join a Round';
          req.session.header = 'Join a Round';
          req.session.message = 'No waiting or ongoing rounds found!';
          req.session.link = '/dashboard';
          req.session.back = 'Dashboard';
          res.redirect('/message');
          res.end();
        }
      });
    }else if(req.session.guest_user){
      /* Build the query to find the rounds the user is in which are waiting or ongoing */
      var wholeQuery = {$and: [{"gov.teamname": {$ne: null}}, {"opp.teamname": {$ne: null}}, {status:'Ongoing'}, {$or: [{"gov.first.email":req.session.guest_user.email}, {"gov.second.email":req.session.guest_user.email}, {"gov.third.email":req.session.guest_user.email}, {"opp.first.email":req.session.guest_user.email}, {"opp.second.email":req.session.guest_user.email}, {"opp.third.email":req.session.guest_user.email}]}]};
      /* Find the rounds */
      await db.findMany(Match, wholeQuery, function(result){
        if(result){ /* If rounds are found, proceed */
          var render = 'app/guest/guestFindRound';
          var pagedetails = {
            pagename: 'On Going Rounds',
            curr_user: req.session.guest_user,
            matches: result
          };
          res.render(render, {pagedetails:pagedetails});
          res.end();
        }else{
          req.session.pagename = 'Join a Round';
          req.session.header = 'Join a Round';
          req.session.message = 'No waiting or ongoing rounds found!';
          req.session.link = '/guestDashboard';
          req.session.back = 'Dashboard';
          res.redirect('/message');
          res.end();
        }
      });
    }else{
      goHome(req, res);
    }
  },

  /* Load the ongoing round page with the round information */
  ongoingRound: async function(req, res){
    if (req.session.curr_user || req.session.guest_user){
      var errors = validationResult(req);
      var validRoundID = 0,  paramRoundID = 0;
      if (!errors.isEmpty()){
        errors = errors.errors;
        for(i = 0; i < errors.length; i++){
          if(errors[i].msg == 'empty'){
            paramRoundID = 1;
          }else{
            validRoundID = 1;
          }
        }
      }
      if((paramRoundID == 0 && validRoundID == 0) || (paramRoundID == 1 && req.session.roundID)){
        /* Get the round ID */
        var roundID;
        if(paramRoundID == 0 && validRoundID == 0){
          roundID = sanitize(req.query.roundID);
        }else if(req.session.roundID){
          if(validator.isAlphanumeric(req.session.roundID))
            roundID = req.session.roundID;
        }
        if(roundID){
          /* Find the round */
          await db.findOne(Match, {roundID:roundID}, async function(result){
            if(result){
              /* If the round is found and the status is waiting or ongoing, proceed */
              if(result.status == 'Ongoing'){
                /* If round information is already complete, proceed */
                if(result.motion && result.gov && result.opp && result.adjudicator.full_name != "No User"){
                  if(result.adjudicator.status == 'Active' || result.adjudicator.status == roundID){
                    await db.findMany(Team, {teamname:{$in:[result.gov.teamname,result.opp.teamname]}}, async function(matchTeams){
                      if(matchTeams){
                        var govTeam, oppTeam;
                        for(i = 0; i < matchTeams.length; i++){
                          if(matchTeams[i].teamname == result.gov.teamname)
                            govTeam = matchTeams[i];
                          else if(matchTeams[i].teamname == result.opp.teamname)
                            oppTeam = matchTeams[i];
                        }
                        if((govTeam.status == 'Active' || govTeam.status == roundID) && (govTeam.first.status == 'Active' || govTeam.first.status == roundID) && (govTeam.second.status == 'Active' || govTeam.second.status == roundID) && (govTeam.third.status == 'Active' || govTeam.third.status == roundID)){
                          if((oppTeam.status == 'Active' || oppTeam.status == roundID) && (oppTeam.first.status == 'Active' || oppTeam.first.status == roundID) && (oppTeam.second.status == 'Active' || oppTeam.second.status == roundID) && (oppTeam.third.status == 'Active' || oppTeam.third.status == roundID)){
                            await db.updateOne(User, {username:result.adjudicator.username}, {$set:{'status':roundID}});
                            await db.updateMany(Team, {teamname:{$in:[result.gov.teamname,result.opp.teamname]}}, {$set:{'status':roundID}});
                            await db.updateMany(Team, {teamname:{$in:[result.gov.teamname,result.opp.teamname]}}, {$set:{'first.status':roundID, 'second.status':roundID, 'third.status':roundID}});
                            await db.updateMany(User, {username:{$in:[govTeam.first.username, govTeam.second.username, govTeam.third.username, oppTeam.first.username, oppTeam.second.username, oppTeam.third.username]}}, {$set:{'status':roundID}});
                            await db.updateMany(Match, {roundID:roundID}, {$set:{'adjudicator.status':roundID}});
                            var username;
                            if(req.session.curr_user)
                              username = req.session.curr_user.username;
                            else
                              username = req.session.guest_user.username;
                            /* If user is in the round, proceed */
                            if(!checkUsers(username, result.gov) || !checkUsers(username, result.opp) || username == result.adjudicator.username){
                              var render = 'app/ongoing_round/ongoingRound';
                              if(req.session.curr_user){
                                var pagedetails = {
                                  pagename: 'On Going Round',
                                  match: result,
                                  curr_user:req.session.curr_user
                                };
                                renderPage(req, res, render, pagedetails);
                              }else{
                                var pagedetails = {
                                  pagename: 'On Going Round',
                                  match: result,
                                  curr_user:req.session.guest_user
                                };
                                res.render(render, {pagedetails:pagedetails});
                                res.end();
                              }
                            }else{
                              req.session.pagename = 'Join a Round';
                              req.session.header = 'Join a Round';
                              req.session.message = 'Error in Join a Round! You are not invited to join Round ID: ' + result.roundID + '.';
                              req.session.link = '/dashboard';
                              req.session.back = 'Dashboard';
                              res.redirect('/message');
                              res.end();
                            }
                          }else{
                            req.session.pagename = 'Join a Round';
                            req.session.header = 'Join a Round';
                            req.session.message = 'Cannot start round! ' + oppTeam.teamname + ' is currently participating in a different round.';
                            req.session.link = '/dashboard';
                            req.session.back = 'Dashboard';
                            res.redirect('/message');
                            res.end();
                          }
                        }else{
                          req.session.pagename = 'Join a Round';
                          req.session.header = 'Join a Round';
                          req.session.message = 'Cannot start round! ' + govTeam.teamname + ' is currently participating in a different round.';
                          req.session.link = '/dashboard';
                          req.session.back = 'Dashboard';
                          res.redirect('/message');
                          res.end();
                        }
                      }else{
                        req.session.pagename = 'Join a Round';
                        req.session.header = 'Join a Round';
                        req.session.message = 'Error in Join a Round! Round information needs to be edited.';
                        req.session.link = '/dashboard';
                        req.session.back = 'Dashboard';
                        res.redirect('/message');
                        res.end();
                      }
                    });
                  }else{
                    req.session.pagename = 'Join a Round';
                    req.session.header = 'Join a Round';
                    req.session.message = 'Cannot start round! The Adjudicator, ' + result.adjudicator.full_name + ', is currently participating in a different round.';
                    req.session.link = '/dashboard';
                    req.session.back = 'Dashboard';
                    res.redirect('/message');
                    res.end();
                  }
                }else{
                  req.session.pagename = 'Join a Round';
                  req.session.header = 'Join a Round';
                  req.session.message = 'Error in Join a Round! Round information is not yet finalized.';
                  req.session.link = '/dashboard';
                  req.session.back = 'Dashboard';
                  res.redirect('/message');
                  res.end();
                }
              }else{
                /* If the status is grading, redirect to the grade round page */
                if(result.status == 'Grading'){
                  var username;
                  if(req.session.curr_user)
                    username = req.session.curr_user.username;
                  else
                    username = req.session.guest_user.username;
                  if(result.adjudicator.username == username){
                    req.session.gradeID = roundID;
                    res.redirect('/gradeRound');
                    res.end();
                  }else{
                    req.session.pagename = 'Grade a Round';
                    req.session.header = 'Grade a Round';
                    req.session.message = 'Adjudicator is grading Round ID: ' + roundID + '.';
                    req.session.link = '/dashboard';
                    req.session.back = 'Dashboard';
                    res.redirect('/message');
                    res.end();
                  }
                }else{
                  req.session.pagename = 'Join a Round';
                  req.session.header = 'Join a Round';
                  req.session.message = 'Error in Join a Round! Please try again later.';
                  req.session.link = '/dashboard';
                  req.session.back = 'Dashboard';
                  res.redirect('/message');
                  res.end();
                }
              }
            }else{
              req.session.pagename = 'Join a Round';
              req.session.header = 'Join a Round';
              req.session.message = 'Error in Join a Round! RoundID: ' + roundID + ' may have been cancelled or was not found.';
              req.session.link = '/findRound';
              req.session.back = 'Join a Round';
              res.redirect('/message');
              res.end();
            }
          });
        }else{
          req.session.pagename = 'Join a Round';
          req.session.header = 'Join a Round';
          req.session.message = 'Error in Join a Round! No Valid Round ID entered.';
          req.session.link = '/dashboard';
          req.session.back = 'Dashboard';
          res.redirect('/message');
          res.end();
        }
      }else{
        req.session.pagename = 'Join a Round';
        req.session.header = 'Join a Round';
        req.session.message = 'Error in Join a Round! No Valid Round ID entered.';
        req.session.link = '/dashboard';
        req.session.back = 'Dashboard';
        res.redirect('/message');
        res.end();
      }
    }else{
      goHome(req, res);
    }
  },

  /* Update the status of the round */
  updateStatus: async function(req, res){
    var set_update;
    var roundID = sanitize(req.params.id);
    var status = sanitize(req.body.status);
    let ts = Date.now();
    let date_ob = new Date(ts);
    var date_match = date_ob.toLocaleString('default', {month: 'long'})+" "+date_ob.getDate()+" "+date_ob.getFullYear();
    /* Find the round and update the status */
    await db.findOneAndUpdate(Match, {roundID:roundID}, {$set:{status:status,date_match:date_match}}, function(updated){
      if(updated){
        res.send('updated status');
      }
    });
  },

  /* Update the speaker details of the round */
  updateSpeaker: async function(req, res){
    if(req.params.id && req.body.name_speaker && req.body.num_speaker){
      var roundID = sanitize(req.params.id);
      var name_speaker = sanitize(req.body.name_speaker);
      var num_speaker = sanitize(req.body.num_speaker);
      /* Find the round and update the speaker details */
      await db.findOneAndUpdate(Match, {roundID:roundID}, {$set:{speaker:{name_speaker:name_speaker,num_speaker:num_speaker}}}, function(updated){
        if(updated){
          res.send('updated status');
        }
      });
    }
  },

  /* End the ongoing round */
  endRound: async function(req, res){
    if (req.session.curr_user || req.session.guest_user){
      var errors = validationResult(req);
      var validRoundID = 0,  paramRoundID = 0;
      if (!errors.isEmpty()){
        errors = errors.errors;
        for(i = 0; i < errors.length; i++){
          if(errors[i].msg == 'empty'){
            if(errors[i].param == 'roundID'){
              paramRoundID = 1;
            }
          }else{
            if(errors[i].param == 'roundID'){
              validRoundID = 1;
            }
          }
        }
      }
      if((paramRoundID == 0 && validRoundID == 0) || (paramRoundID == 1 && req.session.roundID && validator.isAlphanumeric(req.session.roundID))){
        /* Get the round ID */
        var roundID;
        if(req.query.roundID){
          roundID = sanitize(req.query.roundID);
        }else if(req.session.roundID){
          roundID = req.session.roundID;
        }
        if(roundID){
          /* Find the round */
          await db.findOne(Match, {roundID:roundID}, async function(result){
            if(result){ /* If found and the status is Grading, proceed */
              if(result.status == 'Grading'){
                var curr_user;
                if(req.session.curr_user)
                  curr_user = req.session.curr_user._id;
                await db.updateOne(User, {username:result.adjudicator.username}, {$set:{'status':'Active'}});
                await db.updateOne(Match, {roundID:roundID}, {$set:{'adjudicator.status':'Active'}});
                await db.updateMany(User, {username:{$in:[govTeam.first.username, govTeam.second.username, govTeam.third.username, oppTeam.first.username, oppTeam.second.username, oppTeam.third.username]}}, {$set:{'status':'Active'}});
                await db.updateOne(Team, {teamname:{$in:[result.gov.teamname,result.opp.teamname]}}, {$set:{'status':'Active'}});
                /* If the user is the adjudicator, proceed to the grade a round page */
                if(result.adjudicator._id == curr_user){
                  req.session.gradeID = roundID;
                  res.redirect('/gradeRound');
                  res.end();
                }else{
                  req.session.pagename = 'Grade a Round';
                  req.session.header = 'Grade a Round';
                  req.session.message = 'Adjudicator is grading Round ID: ' + roundID + '.';
                  req.session.link = '/dashboard';
                  req.session.back = 'Dashboard';
                  res.redirect('/message');
                  res.end();
                }
              }else{
                req.session.pagename = 'Grade a Round';
                req.session.header = 'Grade a Round';
                req.session.message = 'Error in Grade a Round! Round is still Ongoing.';
                req.session.link = '/dashboard';
                req.session.back = 'Dashboard';
                res.redirect('/message');
                res.end();
              }
            }else{
              req.session.pagename = 'End Round';
              req.session.header = 'End Round';
              req.session.message = 'Error in End Round! Round ID: ' + roundID + ' cannot be found.';
              req.session.link = '/dashboard';
              req.session.back = 'Dashboard';
              res.redirect('/message');
              res.end();
            }
          });
        }else{
          req.session.pagename = 'End Round';
          req.session.header = 'End Round';
          req.session.message = 'Error in End Round! No Valid Round ID entered.';
          req.session.link = '/dashboard';
          req.session.back = 'Dashboard';
          res.redirect('/message');
          res.end();
        }
      }else{
        req.session.pagename = 'End Round';
        req.session.header = 'End Round';
        req.session.message = 'Error in End Round! No Valid Round ID entered.';
        req.session.link = '/dashboard';
        req.session.back = 'Dashboard';
        res.redirect('/message');
        res.end();
      }
    }else{
      goHome(req, res);
    }
  },

  /* Find a round to grade */
  findGrade: async function(req, res){
    reset(req);
    if (req.session.curr_user){
      var current = req.session.curr_user._id;
      /* Find the rounds wherein the status is Grading and the user is the adjudicator */
      await db.findMany(Match, {"adjudicator._id": current, status:"Grading"}, function(result){
        var render = 'app/ongoing_round/findGrade';
        var pagedetails = {
          pagename: 'Grade Rounds',
          matches:result,
          curr_user:req.session.curr_user
        };
        renderPage(req, res, render, pagedetails);
      });
    }else{
      goHome(req, res);
    }
  },

  /* Grade a round */
  gradeRound: async function(req, res){
    if (req.session.curr_user){
      var errors = validationResult(req);
      var validRoundID = 0,  paramRoundID = 0;
      if (!errors.isEmpty()){
        errors = errors.errors;
        for(i = 0; i < errors.length; i++){
          if(errors[i].msg == 'empty'){
            paramRoundID = 1;
          }else{
            validRoundID = 1;
          }
        }
      }
      if((paramRoundID == 0 && validRoundID == 0) || (paramRoundID == 1 && req.session.gradeID)){
        /* Get the round ID */
        var roundID;
        if(paramRoundID == 0 && validRoundID == 0){
          roundID = sanitize(req.query.roundID);
        }else if(req.session.gradeID){
          if(validator.isAlphanumeric(req.session.gradeID))
            roundID = req.session.gradeID;
        }
        if(roundID){
          /* Find the round to grade */
          await db.findOne(Match, {roundID:roundID}, async function(result){
            if(result){ /* If found and the user is the adjudicator, proceed */
              if(result.adjudicator._id == req.session.curr_user._id){
                if(!req.session.gradeFields){
                  req.session.gradeFields = {all:0, govFirst:0, govSecond:0, govThird:0, oppFirst:0, oppSecond:0, oppThird:0, comments:0};
                }
                var render = 'app/ongoing_round/gradeRound';
                var pagedetails = {
                  pagename: 'Team Grades',
                  curr_user:req.session.curr_user,
                  match: result,
                  gradeFields:req.session.gradeFields
                };
                renderPage(req, res, render, pagedetails);
              }else{
                req.session.pagename = 'Grade a Round';
                req.session.header = 'Grade a Round';
                req.session.message = 'Adjudicator is grading Round ID: ' + roundID + '.';
                req.session.link = '/dashboard';
                req.session.back = 'Dashboard';
                res.redirect('/message');
                res.end();
              }
            }else{
              req.session.pagename = 'Grade a Round';
              req.session.header = 'Grade a Round';
              req.session.message = 'Error in Grade a Round! Round ID: ' + roundID + ' cannot be found.';
              req.session.link = '/dashboard';
              req.session.back = 'Dashboard';
              res.redirect('/message');
              res.end();
            }
          });
        }else{
          req.session.pagename = 'Grade a Round';
          req.session.header = 'Grade a Round';
          req.session.message = 'Error in Grade a Round! No Valid Round ID entered.';
          req.session.link = '/dashboard';
          req.session.back = 'Dashboard';
          res.redirect('/message');
          res.end();
        }
      }else{
        req.session.pagename = 'Grade a Round';
        req.session.header = 'Grade a Round';
        req.session.message = 'Error in Grade a Round! No Valid Round ID entered.';
        req.session.link = '/dashboard';
        req.session.back = 'Dashboard';
        res.redirect('/message');
        res.end();
      }
    }else{
      goHome(req, res);
    }
  },

  /* Process the scores and comments of the adjudicator */
  teamScores: async function(req, res){
    reset(req);
    if(req.session.curr_user){
      var errors = validationResult(req);
      var paramRoundID = 0, paramfirstGov = 0, paramsecondGov = 0, paramthirdGov = 0, paramComment = 0;
      var validRoundID = 0, paramfirstOpp = 0, paramsecondOpp = 0, paramthirdOpp = 0, validComment = 0;
      var validfirstGov = 0, validsecondGov = 0, validthirdGov = 0;
      var validfirstOpp = 0, validsecondOpp = 0, validthirdOpp = 0;
      if (!errors.isEmpty()){
        errors = errors.errors;
        for(i = 0; i < errors.length; i++){
          if(errors[i].msg == 'empty'){
            if(errors[i].param == 'roundID'){
              paramRoundID = 1;
            }else if(errors[i].param == 'firstgov'){
              paramfirstGov = 1;
            }else if(errors[i].param == 'secondgov'){
              paramsecondGov = 1;
            }else if(errors[i].param == 'thirdgov'){
              paramthirdGov = 1;
            }else if(errors[i].param == 'firstopp'){
              paramfirstOpp = 1;
            }else if(errors[i].param == 'secondopp'){
              paramsecondOpp = 1;
            }else if(errors[i].param == 'thirdopp'){
              paramthirdOpp = 1;
            }else if(errors[i].param == 'comment'){
              paramComment = 1;
            }
          }else if(errors[i].msg != 'float'){
            if(errors[i].param == 'roundID'){
              validRoundID = 1;
            }else if(errors[i].param == 'firstgov'){
              validfirstGov = 1;
            }else if(errors[i].param == 'secondgov'){
              validsecondGov = 1;
            }else if(errors[i].param == 'thirdgov'){
              validthirdGov = 1;
            }else if(errors[i].param == 'firstopp'){
              validfirstOpp = 1;
            }else if(errors[i].param == 'secondopp'){
              validsecondOpp = 1;
            }else if(errors[i].param == 'thirdopp'){
              validthirdOpp = 1;
            }else if(errors[i].param == 'comment'){
              validComment = 1;
            }
          }
        }
      }else{
        validfirstGov = 1;
        validsecondGov = 1;
        validthirdGov = 1;
        validfirstOpp = 1;
        validsecondOpp = 1;
        validthirdOpp = 1;
      }
      if((paramRoundID == 0 && validRoundID == 0) || (paramRoundID == 1 && req.session.gradeID)){
        /* Get the round ID */
        var roundID;
        if(req.query.roundID){
          roundID = sanitize(req.query.roundID);
        }else if(req.session.gradeID){
          roundID = req.session.gradeID;
        }
        if(roundID){
          /* If all fields are filled up, proceed */
          await db.findOne(Match, {roundID:roundID}, async function(gradeMatch){
            if(gradeMatch){
              var govOne = 0, govTwo = 0, govThree = 0, oppOne = 0, oppTwo = 0, oppThree = 0;
              var firstgov, secondgov, thirdgov, firstopp, secondopp, thirdopp;
              var govCount = 0, oppCount = 0;
              if(gradeMatch.gov.first.full_name != 'No User' && paramfirstGov == 0 && validfirstGov == 0){
                govOne = 0;
                firstgov = sanitize(req.body.firstgov);
                govCount = govCount + 1;
              }else if(gradeMatch.gov.first.full_name == 'No User'){
                govOne = 0;
                firstgov = null;
              }else{
                govOne = 1;
              }
              if(gradeMatch.gov.second.full_name != 'No User' && paramsecondGov == 0 && validsecondGov == 0){
                govTwo = 0;
                secondgov = sanitize(req.body.secondgov);
                govCount = govCount + 1;
              }else if(gradeMatch.gov.second.full_name == 'No User'){
                govTwo = 0;
                secondgov = null;
              }else{
                govTwo = 1;
              }
              if(gradeMatch.gov.third.full_name != 'No User' && paramthirdGov == 0 && validthirdGov == 0){
                govThree = 0;
                thirdgov = sanitize(req.body.thirdgov);
                govCount = govCount + 1;
              }else if(gradeMatch.gov.third.full_name == 'No User'){
                govThree = 0;
                thirdgov = null;
              }else{
                govThree = 1;
              }
              if(gradeMatch.opp.first.full_name != 'No User' && paramfirstOpp == 0 && validfirstOpp == 0){
                oppOne = 0;
                firstopp = sanitize(req.body.firstopp);
                oppCount = oppCount + 1;
              }else if(gradeMatch.opp.first.full_name == 'No User'){
                oppOne = 0;
                firstopp = null;
              }else{
                oppOne = 1;
              }
              if(gradeMatch.opp.second.full_name != 'No User' && paramsecondOpp == 0 && validsecondOpp == 0){
                oppTwo = 0;
                secondopp = sanitize(req.body.secondopp);
                oppCount = oppCount + 1;
              }else if(gradeMatch.opp.second.full_name == 'No User'){
                oppTwo = 0;
                secondopp = null;
              }else{
                oppTwo = 1;
              }
              if(gradeMatch.opp.third.full_name != 'No User' && paramthirdOpp == 0 && validthirdOpp == 0){
                oppThree = 0;
                thirdopp = sanitize(req.body.thirdopp);
                oppCount = oppCount + 1;
              }else if(gradeMatch.opp.third.full_name == 'No User'){
                oppThree = 0;
                thirdopp = null;
              }else{
                oppThree = 1;
              }
              if(govOne == 0 && govTwo == 0 && govThree == 0 && oppOne == 0 && oppTwo == 0 && oppThree == 0 && paramComment == 0 && validComment == 0){
                /* Set the scores of all debaters and the total of each team */
                var govFirst, govSecond, govThird, oppFirst, oppSecond, oppTotal;
                if(firstgov)
                  govFirst = Number(firstgov);
                else
                  govFirst = 0;
                if(secondgov)
                  govSecond = Number(secondgov);
                else
                  govSecond = 0;
                if(thirdgov)
                  govThird = Number(thirdgov);
                else
                  govThird = 0;
                var govTotal = (govFirst + govSecond + govThird).toFixed(2);

                if(firstopp)
                  oppFirst = Number(firstopp);
                else
                  oppFirst = 0;
                if(secondopp)
                  oppSecond = Number(secondopp);
                else
                  oppSecond = 0;
                if(thirdopp)
                  oppThird = Number(thirdopp);
                else
                  oppThird = 0;
                var oppTotal = (oppFirst + oppSecond + oppThird).toFixed(2);

                var comments = sanitize(req.body.comment);
                var winner = '';
                var winner_side = '';

                /* Find the round */
                await db.findOne(Match, {roundID:roundID}, async function(result){
                  if(result){
                    /* Set the winner and winner side */
                    if(govCount != oppCount){
                      govTotal = (govTotal / govCount).toFixed(2);
                      oppTotal = (oppTotal / oppCount).toFixed(2);
                      if(govTotal > oppTotal){
                        winner = result.gov.teamname;
                        winner_side = 'Gov';
                      }else if(govTotal < oppTotal){
                        winner = result.opp.teamname;
                        winner_side = 'Opp'
                      }else{
                        winner = 'Draw';
                        winner_side = 'Draw';
                      }
                    }else{
                      if(govTotal > oppTotal){
                        winner = result.gov.teamname;
                        winner_side = 'Gov';
                      }else if(govTotal < oppTotal){
                        winner = result.opp.teamname;
                        winner_side = 'Opp'
                      }else{
                        winner = 'Draw';
                        winner_side = 'Draw';
                      }
                    }
                    /* Update all the users in the round with the scores */
                    await updateUsers(roundID, result.gov, result.opp, winner_side, result.date_match);
                    /* Update the match information */
                    await db.findOneAndUpdate(Match, {roundID:roundID}, {$set:{
                      winner: winner,
                      winner_side: winner_side,
                      govFirstScore: govFirst,
                      govSecondScore: govSecond,
                      govThirdScore: govThird,
                      govTotal: govTotal,
                      oppFirstScore: oppFirst,
                      oppSecondScore: oppSecond,
                      oppThirdScore: oppThird,
                      oppTotal: oppTotal,
                      comments: comments,
                      status:'Done'
                    }}, async function(match){
                      reset(req);
                      req.session.roundID = match.roundID;
                      res.redirect('/roundroomStatistics');
                      res.end();
                    });
                  }else{
                    req.session.pagename = 'Grade a Round';
                    req.session.header = 'Grade a Round';
                    req.session.message = 'Error in Grade a Round! Round ID: ' + roundID + ' cannot be found.';
                    req.session.link = '/dashboard';
                    req.session.back = 'Dashboard';
                    res.redirect('/message');
                    res.end();
                  }
                });
              }else{
                req.session.gradeID = roundID;
                if(govOne == 1 && govTwo == 1 && govThree == 1 && oppOne == 1 && oppTwo == 1 && oppThree == 1 && (paramComment == 1 || validComment == 1)){
                  req.session.gradeFields = {all:1, govFirst:0, govSecond:0, govThird:0, oppFirst:0, oppSecond:0, oppThird:0, comments:0};
                }else{
                  if(paramComment == 1)
                    req.session.gradeFields = {all:0, govFirst:govOne, govSecond:govTwo, govThird:govThree, oppFirst:oppOne, oppSecond:oppTwo, oppThird:oppThree, comments:paramComment};
                  else
                    req.session.gradeFields = {all:0, govFirst:govOne, govSecond:govTwo, govThird:govThree, oppFirst:oppOne, oppSecond:oppTwo, oppThird:oppThree, comments:validComment};
                }
                res.redirect('/gradeRound');
                res.end();
              }
            }else{
              req.session.pagename = 'Grade a Round';
              req.session.header = 'Grade a Round';
              req.session.message = 'Error in Grade a Round! Please try again later.';
              req.session.link = '/dashboard';
              req.session.back = 'Dashboard';
              res.redirect('/message');
              res.end();
            }
          });
        }else{
          req.session.pagename = 'Grade a Round';
          req.session.header = 'Grade a Round';
          req.session.message = 'Error in Grade a Round! No valid Round ID entered.';
          req.session.link = '/dashboard';
          req.session.back = 'Dashboard';
          res.redirect('/message');
          res.end();
        }
      }else{
        req.session.pagename = 'Grade a Round';
        req.session.header = 'Grade a Round';
        req.session.message = 'Error in Grade a Round! No valid Round ID entered.';
        req.session.link = '/dashboard';
        req.session.back = 'Dashboard';
        res.redirect('/message');
        res.end();
      }
    }else{
      goHome(req, res);
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

/* Check if the user is not in the team */
function checkUsers(user, team){
  return (user != team.first.username && user != team.second.username && user != team.third.username)
}

/* Update the debate statistics of the users within the round */
async function updateIndiv(username, winner, side, date){
  /* Find the user */
  await db.findOne(User, {username:username}, async function(result){
    if(result){
      var newNum, newWins, newLose, newDraw, newW, newL, newD, newRatio;
      /* Update the number of debates */
      newNum = result.numdebates + 1;
      /* Update the winner, loses, and draws of the user */
      if(winner === 'Gov'){
        if(side === 'Gov'){
          newWins = result.rawWins + 1;
          newLose = result.rawLose;
          newDraw = result.rawDraw;
        }else if(side === 'Opp'){
          newWins = result.rawWins;
          newLose = result.rawLose + 1;
          newDraw = result.rawDraw;
        }
      }else if(winner === 'Opp'){
        if(side === 'Opp'){
          newWins = result.rawWins + 1;
          newLose = result.rawLose;
          newDraw = result.rawDraw;
        }else if(side === 'Gov'){
          newWins = result.rawWins;
          newLose = result.rawLose + 1;
          newDraw = result.rawDraw;
        }
      }else{
        newWins = result.rawWins;
        newLose = result.rawLose;
        newDraw = result.rawDraw + 1;
      }
      newW = (newWins/newNum)*100;
      newL = (newLose/newNum)*100;
      newD = (newDraw/newNum)*100;
      newRatio = (newWins/newNum)*100;
      /* Update the team's debate statistics */
      await db.updateOne(User, {username:username}, {$set: {
        dateoflast: date,
        numdebates: newNum,
        wlratio: newRatio,
        rawWins: newWins,
        rawLose: newLose,
        rawDraw: newDraw,
        wins: newW,
        loses: newL,
        draws: newD
      }});
    }
  });
}

/* Update the team statistics */
async function updateTeam(teamname, winner, side){
  /* Find the team */
  await db.findOne(Team, {teamname:teamname}, async function(result){
    if(result){
      var newNum, newWins, newLose, newDraw, newW, newL, newD, newRatio;
      /* Update the number of debates */
      newNum = result.numdebates + 1;
      /* Update the winner, loses, and draws of the team */
      if(winner === 'Gov'){
        if(side === 'Gov'){
          newWins = result.rawWins + 1;
          newLose = result.rawLose;
          newDraw = result.rawDraw;
        }else if(side === 'Opp'){
          newWins = result.rawWins;
          newLose = result.rawLose + 1;
          newDraw = result.rawDraw;
        }
      }else if(winner === 'Opp'){
        if(side === 'Opp'){
          newWins = result.rawWins + 1;
          newLose = result.rawLose;
          newDraw = result.rawDraw;
        }else if(side === 'Gov'){
          newWins = result.rawWins;
          newLose = result.rawLose + 1;
          newDraw = result.rawDraw;
        }
      }else{
        newWins = result.rawWins;
        newLose = result.rawLose;
        newDraw = result.rawDraw + 1;
      }
      newW = (newWins/newNum)*100;
      newL = (newLose/newNum)*100;
      newD = (newDraw/newNum)*100;
      newRatio = (newWins/newNum)*100;
      /* Update the team's debate statistics */
      await db.updateOne(Team, {teamname:teamname}, {$set: {
        numdebates: newNum,
        wlratio: newRatio,
        rawWins: newWins,
        rawLose: newLose,
        rawDraw: newDraw,
        wins: newW,
        loses: newL,
        draws: newD
      }});
    }
  });
}

/* Update the information of all of the users in the round */
async function updateUsers(roundID, gov, opp, winner, date){
  /* Find the round */
  await db.findOne(Match, {roundID:roundID}, async function(result){
    if(result){ /* If round is found, proceed */
      /* Update the statistics of each of the users */
      await updateIndiv(gov.first.username, winner, 'Gov', date);
      await updateIndiv(gov.second.username, winner, 'Gov', date);
      await updateIndiv(gov.third.username, winner, 'Gov', date);
      await updateIndiv(opp.first.username, winner, 'Opp', date);
      await updateIndiv(opp.second.username, winner, 'Opp', date);
      await updateIndiv(opp.third.username, winner, 'Opp', date);
      /* Update the statistics of each of the teams */
      updateTeam(gov.teamname, winner, 'Gov');
      updateTeam(opp.teamname, winner, 'Opp');
    }
  });
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

module.exports = ongoing_controller;
