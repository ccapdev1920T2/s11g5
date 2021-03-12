const crypto = require('crypto');
const db = require('../models/db.js');
const User = require('../models/user_model.js');
const Team = require('../models/team_model.js');
const Match = require('../models/match_model.js');
const { validationResult } = require('express-validator');
var validator = require('validator');
var sanitize = require('mongo-sanitize');

/* Regex for checking */
const nameFormat = /^[a-zA-Z][a-zA-Z\s]*$/;
const userFormat = /[a-zA-Z0-9\-\_\.]+$/;

const new_controller = {
  /* Load the create a round page */
  createRound: function(req, res){
    reset(req);
    if (req.session.curr_user){
      var render = 'app/create_round/createRound';
      var pagedetails = {
        pagename: 'Create a Round',
        curr_user:req.session.curr_user
      };
      renderPage(req, res, render, pagedetails);
    }else{
      goHome(req, res);
    }
  },

  /* Load the rounds created page */
  roundsCreated: async function(req, res){
    reset(req);
    if(req.session.curr_user){
      /* Build the query to find all rounds */
      var wholeQuery = {$and: [{'status':{$in:['Creating', 'Editing']}}, {'creator.username':req.session.curr_user.username}]};
      /* Find all rounds */
      await db.findMany(Match, wholeQuery, function(result){
        var render = 'app/create_round/roundsCreated';
        var pagedetails = {
          pagename: "Rounds Created",
          curr_user: req.session.curr_user,
          matches: result
        };
        renderPage(req, res, render, pagedetails);
      });
    }else{
      goHome(req, res);
    }
  },

  /* Load the start a new round page */
  startNew: async function(req, res){
    if(req.session.curr_user){
      /* If redirected or anything similar */
      if(req.session.roundID && req.session.fields && req.session.status){
        /* If the round status is creating, proceed */
        if(req.session.status == 'Creating'){
          var match = {
            roundID: req.session.roundID,
            motion: 'Enter Motion...',
            creatorRole: 'Choose Your Role',
            status: 'Creating',
            gov: {teamname: 'Enter Goverment Team Name...'},
            opp: {teamname: 'Enter Opposition Team Name...'}
          }
          var render = 'app/create_round/startRound';
          var pagedetails = {
            pagename: 'Start a New Round',
            curr_user: req.session.curr_user,
            match: match,
            fields: req.session.fields
          };
          renderPage(req, res, render, pagedetails);
        }else{
          /* If the round status is editing, find the round using the round ID */
          await db.findOne(Match, {roundID:req.session.roundID}, async function(round){
            if(round){ /* If round is found, proceed */
              if(round.creator.username == req.session.curr_user.username){
                var render = 'app/create_round/startRound';
                var pagedetails = {
                  pagename: 'Start a New Round',
                  curr_user: req.session.curr_user,
                  match: round,
                  fields: req.session.fields
                };
                renderPage(req, res, render, pagedetails);
              }else{
                goMessage(req, res, 'Error in Creating a Round! You are not the recorded creator of this round.');
              }
            }else{
              goMessage(req, res, 'Error in Creating a Round! RoundID: ' + req.session.roundID + ' not found.');
            }
          });
        }
      }else{
        reset(req);
        req.session.roundID = crypto.randomBytes(Math.ceil(16/2)).toString('hex').slice(0,8);
        req.session.fields = {all: 0, role: 0, motion: 0, gov: 0, opp: 0, ad:0};
        var match = {
          roundID: req.session.roundID,
          motion: 'Enter Motion...',
          creatorRole: 'Choose Your Role',
          status: 'Creating',
          gov: {teamname: 'Enter Goverment Team Name...'},
          opp: {teamname: 'Enter Opposition Team Name...'}
        }
        var render = 'app/create_round/startRound';
        var pagedetails = {
          pagename: 'Start a New Round',
          curr_user: req.session.curr_user,
          match: match,
          fields: req.session.fields
        };
        renderPage(req, res, render, pagedetails);
      }
    }else{
      goHome(req, res);
    }
  },

  /* Process the information of the round entered in the start a new round page */
  matchInfo: async function(req, res){
    if(req.session.curr_user){
      var errors = validationResult(req);
      var validRoundID = 0, validStatus = 0, validRole = 0, validMotion = 0, validGov = 0, validOpp = 0;
      var paramRoundID = 0, paramStatus = 0, paramRole = 0, paramMotion = 0, paramGov = 0, paramOpp = 0;

      if (!errors.isEmpty()){
        errors = errors.errors;
        for(i = 0; i < errors.length; i++){
          if(errors[i].msg == 'empty'){
            if(errors[i].param == 'roundID' || errors[i].param == 'status'){
              validRoundID = 1;
              validStatus = 1;
              paramRoundID = 1;
              paramStatus = 1;
              break;
            }else{
              if(errors[i].param == 'user_role'){
                paramRole = 1;
              }else if(errors[i].param == 'motion'){
                paramMotion = 1;
              }else if(errors[i].param == 'gov'){
                paramGov = 1;
              }else if(errors[i].param == 'opp'){
                paramOpp = 1;
              }
            }
          }else{
            if(errors[i].param == 'roundID' || errors[i].param == 'status'){
              validRoundID = 1;
              validStatus = 1;
              paramRoundID = 1;
              paramStatus = 1;
              break;
            }else if(errors[i].param == 'user_role'){
              validRole = 1;
            }else if(errors[i].param == 'motion'){
              validMotion = 1;
            }else if(errors[i].param == 'gov'){
              validGov = 1;
            }else if(errors[i].param == 'opp'){
              validOpp = 1;
            }
          }
        }
      }
      if(validRoundID == 0 && paramRoundID == 0 && validStatus == 0 && paramStatus == 0){
        var roundID = sanitize(req.query.roundID);
        var status = sanitize(req.query.status);
        /* Find the round */
        await db.findOne(Match, {roundID:roundID}, async function(foundMatch){
          /* If the current status is creating, proceed */
          if(status == 'Creating'){
            if(foundMatch && foundMatch.status != 'Creating'){ /* If there is already an existing match with the indicated round ID, proceed */
              goMessage(req, res, 'Error in Creating a Round! Please try again later.');
            }else{
              /* If all fields are filled up, proceed */
              if(paramRole == 0 && paramMotion == 0 && paramGov == 0 && paramOpp == 0){
                var role = sanitize(req.body.user_role);
                var motion = sanitize(req.body.motion);
                var gov = sanitize(req.body.gov);
                var opp = sanitize(req.body.opp);
                if(validRole == 1 || validMotion == 1 || validGov == 1 || validOpp == 1){
                  req.session.roundID = roundID;
                  req.session.status = 'Creating';
                  req.session.fields = {all: 0, role: validRole, motion: validMotion, gov: validGov, opp: validOpp, ad:0};
                  res.redirect('/startNew');
                  res.end();
                }else{
                  var match_info = {
                    roundID: roundID,
                    user_role: role,
                    motion: motion,
                    gov: gov,
                    opp: opp
                  };
                  /* Process the information entered */
                  checkInfo(req, res, match_info, 'Creating');
                }
              }else{ /* If any fields are missed, redirect back to the start a new round page */
                req.session.roundID = roundID;
                req.session.status = 'Creating';
                req.session.fields = {all: 1, role: 0, motion: 0, gov: 0, opp: 0, ad:0};
                res.redirect('/startNew');
                res.end();
              }
            }
          }else if(status == 'Editing'){ /* If the current status is editing, proceed */
            if(foundMatch && foundMatch.status == 'Editing'){ /* If round is found, proceed */
              var role, motion, gov, opp;
              var validRole = 0, validMotion = 0, validGov = 0, validOpp = 0;
              /* If a new role is entered, process */
              if(validRole == 0 && paramRole == 0){
                role = sanitize(req.body.user_role);
              }else{
                role = foundMatch.creatorRole
              }
              /* If a new motion is entered, process */
              if(validMotion == 0 && paramMotion == 0){
                motion = sanitize(req.body.motion);
              }else{
                motion = foundMatch.motion
              }
              /* If a new role is government team, process */
              if(validGov == 0 && paramGov == 0){
                gov = sanitize(req.body.gov);
              }else{
                gov = foundMatch.gov.teamname
              }
              /* If a new role is opposition team, process */
              if(validOpp == 0 && paramOpp == 0){
                opp = sanitize(req.body.opp);
              }else{
                opp = foundMatch.opp.teamname
              }
              if((validRole == 1 && paramRole == 0) || (validMotion == 1  && paramMotion == 0) || (validGov == 1 && paramGov == 0) || (validOpp == 1 && paramOpp == 0)){
                req.session.roundID = roundID;
                req.session.status = 'Creating';
                req.session.fields = {all: 0, role: validRole, motion: validMotion, gov: validGov, opp: validOpp, ad:0};
                res.redirect('/startNew');
                res.end();
              }else{
                var match_info = {
                  roundID: foundMatch.roundID,
                  user_role: role,
                  motion: motion,
                  gov: gov,
                  opp: opp
                };
                /* Process the information entered */
                checkInfo(req, res, match_info, 'Editing');
              }
            }else{
              goMessage(req, res, 'Error in editing ' + roundID + '! Please try again later.');
            }
          }else{
            goMessage(req, res, 'Error in Creating a Round! Please try again later.');
          }
        });
      }else{
        goMessage(req, res, 'Error in Creating a Round! Please try again later.');
      }
    }else{
      goHome(req, res);
    }
  },

  /* Load the current information of the round */
  currentInfo: async function(req, res){
  if(req.session.curr_user){
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
      var roundID;
      if(req.query.roundID){
        roundID = sanitize(req.query.roundID);
      }else if(req.session.roundID){
        roundID = req.session.roundID;
      }
      if(roundID){
        await db.findOne(Match, {roundID:roundID}, async function(match){
          if(match){
            if(match.creator.username == req.session.curr_user.username){
              var proceed;
              if(match.gov && match.opp && match.adjudicator && match.motion){
                if(checkUsers(match.gov.first.username, match.opp) && checkUsers(match.gov.second.username, match.opp) && checkUsers(match.gov.third.username, match.opp) && checkUsers(match.opp.first.username, match.gov) && checkUsers(match.opp.second.username, match.gov) && checkUsers(match.opp.third.username, match.gov)){
                  if(checkUsers(match.adjudicator.username, match.gov) && checkUsers(match.adjudicator.username, match.opp)){
                    if(match.adjudicator.username != 'No User'){
                      proceed = 1;
                      req.session.fields = {all: 0, role: 0, motion: 0, gov: 0, opp: 0, ad:0};
                    }else{
                      proceed = 0;
                      req.session.roundID = roundID;
                      req.session.status = 'Editing';
                      req.session.fields = {all: 0, role: 0, motion: 0, gov: 0, opp: 0, ad:1};
                    }
                  }else{
                    proceed = 0;
                    req.session.roundID = roundID;
                    req.session.status = 'Editing';
                    req.session.fields = {all: 0, role: 0, motion: 0, gov: 0, opp: 0, ad:1};
                  }
                }else{
                  proceed = 0;
                  req.session.roundID = roundID;
                  req.session.status = 'Editing';
                  req.session.fields = {all: 0, role: 0, motion: 0, gov: 1, opp: 1, ad:0};
                }
              }else{
                proceed = 0;
              }
              var render = 'app/create_round/currentInfo';
              var pagedetails = {
                pagename: 'Current Information',
                curr_user:req.session.curr_user,
                match: match,
                proceed: proceed
              };
              renderPage(req, res, render, pagedetails);
            }else{
              goMessage(req, res, 'Error in Creating a Round! You are not the recorded creator of this round.');
            }
          }else{
            goMessage(req, res, 'Error in Creating a Round! RoundID: ' + roundID + ' not found.');
          }
        });
      }else{
        goMessage(req, res, 'Error in Creating a Round! No Valid Round ID entered.');
      }
    }else{
      goMessage(req, res, 'Error in Creating a Round! No Valid Round ID entered.');
    }
  }else{
    goHome(req, res);
  }
},

  /* Load the adjudicator page */
  adjudicatorInfo: async function(req, res){
    if(req.session.curr_user){
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
          await db.findOne(Match, {roundID:roundID}, async function(match){
            if(match){ /* If round is found, proceed */
              if(match.creator.username == req.session.curr_user.username){ /* If the user is the creator, proceed */
                if(!req.session.fields){
                  req.session.fields = {all: 0, role: 0, motion: 0, gov: 0, opp: 0, ad:0};
                }
                var render = 'app/create_round/roundAdjudicator';
                var pagedetails = {
                  pagename: 'Start a New Round',
                  curr_user: req.session.curr_user,
                  match: match,
                  ad: req.session.fields.ad
                };
                renderPage(req, res, render, pagedetails);
              }else{
                goMessage(req, res, 'Error in Creating a Round! You are not the recorded creator of this round.');
              }
            }else{
              goMessage(req, res, 'Error in Creating a Round! RoundID: ' + roundID + ' not found.');
            }
          });
        }else{
          goMessage(req, res, 'Error in Creating a Round! No Valid Round ID entered.');
        }
      }else{
        goMessage(req, res, 'Error in Creating a Round! No Valid Round ID entered.');
      }
    }else{
      goHome(req, res);
    }
  },

  /* Procees the information about the adjudicator entered in the adjudicator page */
  matchAdjudicator: async function(req, res){
    if(req.session.curr_user){
      var errors = validationResult(req);
      var validRoundID = 0, validStatus = 0, validAd = 0;
      var paramRoundID = 0, paramStatus = 0, paramAd = 0;
      if (!errors.isEmpty()){
        errors = errors.errors;
        for(i = 0; i < errors.length; i++){
          if(errors[i].msg == 'empty'){
            if(errors[i].param == 'roundID'){
              paramRoundID = 1;
            }else if(errors[i].param == 'status'){
              paramStatus = 1;
            }else if(errors[i].param == 'ad'){
              paramAd = 1;
            }
          }else{
            if(errors[i].param == 'roundID'){
              validRoundID = 1;
            }else if(errors[i].param == 'status'){
              validStatus = 1;
            }else if(errors[i].param == 'ad'){
              validAd = 1;
            }
          }
        }
      }
      if(((paramRoundID == 0 && validRoundID == 0) || (paramRoundID == 1 && req.session.roundID)) && paramStatus == 0 && validStatus == 0){
        /* Get round ID */
        var roundID;
        if(paramRoundID == 0 && validRoundID){
          roundID = sanitize(req.query.roundID);
        }else if(paramRoundID == 1 && req.session.roundID){
          roundID = req.session.roundID;
        }
        if(roundID){
          if(paramAd == 0 && validAd == 0){ /* If there was a user entered, proceed */
            var validAd = 0;
            var adj = sanitize(req.body.ad);
            /* Find the user */
            await db.findOne(User, {username:adj}, async function(newAd){
              if(newAd){ /* If user is found, proceed */
                await db.findOne(Match, {roundID:roundID}, async function(foundMatch){
                  if(foundMatch){ /* If round is found, proceed */
                    /* Check if user is already in the government or opposition side */
                    if(checkUsers(newAd.username, foundMatch.gov) && checkUsers(newAd.username,foundMatch.opp)){
                      /* Update the match information */
                      await db.findOneAndUpdate(Match, {roundID:roundID}, {$set:{adjudicator:newAd}}, async function(updated){
                        if(updated){ /* If successfully updated, proceed */
                          req.session.roundID = roundID;
                          res.redirect('/currentInfo');
                          res.end();
                        }else{
                          req.session.roundID = roundID;
                          req.session.fields = {all: 0, role: 0, motion: 0, gov: 0, opp: 0, ad:1};
                          res.redirect('/adjudicatorInfo');
                          res.end();
                        }
                      });
                    }else{
                      req.session.roundID = roundID;
                      req.session.fields = {all: 0, role: 0, motion: 0, gov: 0, opp: 0, ad:1};
                      res.redirect('/adjudicatorInfo');
                      res.end();
                    }
                  }else{
                    goMessage(req, res, 'Error in Creating a Round! RoundID: ' + roundID + ' not found.');
                  }
                });
              }else{
                req.session.roundID = roundID;
                req.session.fields = {all: 0, role: 0, motion: 0, gov: 0, opp: 0, ad:1};
                res.redirect('/adjudicatorInfo');
                res.end();
              }
            });
          }else{
            req.session.roundID = roundID;
            req.session.fields = {all: 0, role: 0, motion: 0, gov: 0, opp: 0, ad:1};
            res.redirect('/adjudicatorInfo');
            res.end();
          }
        }else{
          res.redirect('/createRound');
          res.end();
        }
      }
    }else{
      goHome(req, res);
    }
  },

  /* Edit a round by loading the start a new round with the current information */
  editRound: async function(req, res){
    if(req.session.curr_user){
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
        if(paramRoundID == 0 && validRoundID == 0){
          roundID = sanitize(req.query.roundID);
        }else if(req.session.roundID){
          roundID = req.session.roundID;
        }
        if(roundID){
          /* Find the round and set the status to 'Editing' */
          await db.findOneAndUpdate(Match, {roundID:roundID}, {$set: {status:'Editing'}}, function(result){
            if(result){ /* If round was found and status was successfully updated to 'Editing', proceed */
              if(result.creator.username == req.session.curr_user.username){ /* If the user is the creator of the round, proceed */
                if(!req.session.fields){
                  req.session.fields = {all: 0, role: 0, motion: 0, gov: 0, opp: 0, ad:0};
                }
                var render = 'app/create_round/startRound';
                var pagedetails = {
                  pagename: 'Start a New Round',
                  curr_user: req.session.curr_user,
                  match: result,
                  fields: req.session.fields
                };
                renderPage(req, res, render, pagedetails);
              }else{
                goMessage(req, res, 'Error in Creating a Round! You are not the recorded creator of this round.');
              }
            }else{
              goMessage(req, res, 'Error in Creating a Round! RoundID: ' + roundID + ' not found.');
            }
          });
        }else{
          res.redirect('/createRound');
          res.end();
        }
      }else{
        goMessage(req, res, 'Error in Creating a Round! No Valid Round ID entered.');
      }
    }else{
      goHome(req, res);
    }
  },

  /* Load the confirmation page for deleting a creating/editing round of the user */
  cancelRound: async function(req, res){
    if(req.session.curr_user){
      var errors = validationResult(req);
      if (!errors.isEmpty()){
        goMessage(req, res, 'Error in Cancel a Round! No Valid Round ID entered.');
      }else{
        var roundID = sanitize(req.query.roundID);
        /* Find the round */
        await db.findOne(Match, {roundID:roundID}, async function(foundMatch){
          if(foundMatch){ /* If round is found, proceed */
            if(foundMatch.creator.username == req.session.curr_user.username){ /* If user is the creator, proceed */
              var render = 'app/create_round/cancelRound';
              var pagedetails = {
                pagename: 'Cancel Round',
                curr_user: req.session.curr_user,
                roundID: roundID,
                cancel_details: 'You are Cancelling RoundID: ' + roundID + '.' ,
                cancel_link: '/deleteRound?roundID=' + roundID
              };
              renderPage(req, res, render, pagedetails);
            }else{
              goMessage(req, res, 'Error in Cancel a Round! You are not the recorded creator of this round.');
            }
          }else{
            goMessage(req, res, 'Error in Cancel a Round! RoundID: ' + roundID + ' not found.');
          }
        });
      }
    }else{
      goHome(req, res);
    }
  },

  /* Delete a creating/editing round of the user */
  deleteRound: async function(req, res){
    if(req.session.curr_user){
      var errors = validationResult(req);
      if (!errors.isEmpty()){
        goMessage(req, res, 'Error in Cancel a Round! No Valid Round ID entered.');
      }else{
        var roundID = sanitize(req.query.roundID);
        /* Find the round */
        await db.findOne(Match, {roundID:roundID}, async function(result){
          if(result){ /* If round is found, proceed */
            if(result.creator.username == req.session.curr_user.username){ /* If user is the creator, proceed */
              await db.deleteOne(Match, {roundID:roundID});
              goMessage(req, res, "Successfully cancelled the round!");
            }else{
              goMessage(req, res, 'Error in Cancel a Round! You are not the recorded creator of this round.');
            }
          }else{
            goMessage(req, res, 'Error in Cancel a Round! RoundID: ' + roundID + ' not found.');
          }
        });
      }
    }else{
      goHome(req, res);
    }
  },

  /* Load the confirmation page for deleting all creating/editing rounds of the user */
  deleteAllPending: async function(req, res){
    if(req.session.curr_user){
      var render = 'app/create_round/cancelRound';
      var pagedetails = {
        pagename: 'Cancel Round',
        curr_user: req.session.curr_user,
        cancel_details: 'You are Cancelling all of your pending rounds.',
        cancel_link: '/confirmDeleteAllPending'
      };
      renderPage(req, res, render, pagedetails);
    }else{
      goHome(req, res);
    }
  },

  /* Delete all creating/editing rounds of the user */
  confirmDeleteAllPending: async function(req, res){
    if(req.session.curr_user){
      var wholeQuery = {$and: [{'status':{$in:['Creating', 'Editing']}}, {'creator.username':req.session.curr_user.username}]};
      await db.deleteMany(Match, wholeQuery);
      goMessage(req, res, "Successfully cancelled all pending rounds!");
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

/* Redirect to message page */
function goMessage(req, res, message){
  reset(req);
  req.session.pagename = 'Create a Round';
  req.session.header = 'Create a Round';
  req.session.message = message;
  req.session.link = '/createRound';
  req.session.back = 'Create a Round';
  res.redirect('/message');
  res.end();
}

/* Check if the user is not in the team */
function checkUsers(user, team){
  return (user != team.first.username && user != team.second.username && user != team.third.username)
}

/* Check the match info entered */
async function checkInfo(req, res, match_info, status){
  /* Find the government team entered */
  await db.findOne(Team, {teamname:match_info.gov}, async function(gov){
    /* Find the opposition team entered */
    await db.findOne(Team, {teamname:match_info.opp}, async function(opp){
      if(gov && opp){ /* if both are existing teams, proceed */
        var role = match_info.user_role;
        /* Check if all users are unique (not one user is in both teams) */
        if(checkUsers(gov.first.username, opp) && checkUsers(gov.second.username, opp) && checkUsers(gov.third.username, opp) && checkUsers(opp.first.username, gov) && checkUsers(opp.second.username, gov) && checkUsers(opp.third.username, gov)){
          var creatorRole, adjudicator;
          /* If user is an adjudicator, check if they are in any of the teams */
          if((role == 'ad' || role == 'Adjudicator') && checkUsers(req.session.curr_user.username, gov) && checkUsers(req.session.curr_user.username, opp)){
            creatorRole = 'Adjudicator';
            adjudicator = req.session.curr_user;
          }else if((role == 'gov' || role == 'Government Speaker') && !checkUsers(req.session.curr_user.username, gov)){ /* If user is a government speaker, check if they are in the government team */
            creatorRole = 'Government Speaker';
            adjudicator = {full_name:"No User", username:"No User"};
          }else if((role == 'opp' || role == 'Opposition Speaker') && !checkUsers(req.session.curr_user.username, opp)){ /* If user is a opposition speaker, check if they are in the opposition team */
            creatorRole = 'Opposition Speaker';
            adjudicator = {full_name:"No User", username:"No User"};
          }else if((role != 'ad' && role != 'Adjudicator') && (role != 'gov' && role != 'Government Speaker') && (role != 'opp' && role != 'Opposition Speaker')){  /* If the role is none of the choices, indicate invalid */
            creatorRole = 'Invalid Role';
          }
          if(creatorRole == 'Invalid Role'){ /* If the user's role is invalid, redirect to the start a new round page */
            req.session.roundID = match_info.roundID;
            req.session.status = status;
            req.session.fields = {all: 0, role: 1, motion: 0, gov: 0, opp: 0, ad:0};
            res.redirect('/startNew');
            res.end();
          }else if(!creatorRole){ /* If the user does not have a role in the round, redirect */
            req.session.roundID = match_info.roundID;
            req.session.status = status;
            req.session.fields = {all: 0, role: 0, motion: 0, gov: 1, opp: 1, ad:0};
            res.redirect('/startNew');
            res.end();
          }else{
            if(status == 'Creating'){ /* If status is creating, create the round */
              await db.insertOneCallback(Match, {
                status: 'Editing',
                roundID: match_info.roundID,
                motion: match_info.motion,
                gov: gov,
                opp: opp,
                adjudicator: adjudicator,
                creator: req.session.curr_user,
                creatorRole: creatorRole
              }, async function(found){
                if(role == 'ad'){ /* If the user is the adjudicator, proceed to showing the current information */
                  req.session.roundID = match_info.roundID;
                  res.redirect('/currentInfo');
                  res.end();
                }else{ /* If the user is not the adjudicator, ask for the adjudicator details by proceeding to the adjudicator page */
                  req.session.roundID = match_info.roundID;
                  res.redirect('/adjudicatorInfo');
                  res.end();
                }
              });
            }else{ /* If the status is editing, find the match and update */
              await db.findOne(Match, {roundID:match_info.roundID}, async function(outdated){
                if(outdated){
                  /* If the adjudicator indicated is in any of the new teams, flag an error */
                  if(!checkUsers(outdated.adjudicator.username, gov) || !checkUsers(outdated.adjudicator.username, opp)){
                    req.session.fields = {all: 0, role: 0, motion: 0, gov: 0, opp: 0, ad:1};
                  }
                  /* Update the round information */
                  await db.findOneAndUpdate(Match, {roundID:match_info.roundID}, {
                    $set: {
                      status:'Editing',
                      roundID: match_info.roundID,
                      motion: match_info.motion,
                      gov: gov,
                      opp: opp,
                      creator: req.session.curr_user,
                      creatorRole: creatorRole
                    }
                  }, async function(found){
                    if(role == 'ad' || role == 'Adjudicator'){ /* If the user is the adjudicator, proceed to showing the current information */
                      req.session.roundID = match_info.roundID;
                      res.redirect('/currentInfo');
                      res.end();
                    }else if(role == 'gov' || role == 'Government Speaker' || role == 'opp' || role == 'Opposition Speaker'){
                      /* If the user is not the adjudicator, ask for the adjudicator details by proceeding to the adjudicator page */
                      req.session.roundID = match_info.roundID;
                      res.redirect('/adjudicatorInfo');
                      res.end();
                    }else{
                      goMessage(req, res, 'Error in Creating a Round! Please try again later.');
                    }
                  });
                }else{
                  goMessage(req, res, 'Error in Creating a Round! RoundID: ' + match_info.roundID + ' not found.');
                }
              });
            }
          }
        }else{
          req.session.roundID = match_info.roundID;
          req.session.status = status;
          req.session.fields = {all: 0, role: 0,motion: 0,gov: 1,opp: 1,ad:0};
          res.redirect('/startNew');
          res.end();
        }
      }else{
        req.session.roundID = match_info.roundID;
        req.session.status = status;
        req.session.fields = {all: 0, role: 0,motion: 0,gov: 1,opp: 1,ad:0};
        res.redirect('/startNew');
        res.end();
      }
    });
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
  await db.findOne(User, {username:req.session.curr_user.username}, async function(result){
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
      var wholeQuery = {$and: [{"gov.teamname": {$ne: null}}, {"opp.teamname": {$ne: null}}, {status:'Ongoing'}, {$or: [{"gov.first.username":req.session.curr_user.username}, {"gov.second.username":req.session.curr_user.username}, {"gov.third.username":req.session.curr_user.username}, {"opp.first.username":req.session.curr_user.username}, {"opp.second.username":req.session.curr_user.username}, {"opp.third.username":req.session.curr_user.username}, {"adjudicator.username":req.session.curr_user.username}]}]};
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
        }
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

module.exports = new_controller;
