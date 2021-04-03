const crypto = require('crypto');
const db = require('../models/db.js');
const User = require('../models/user_model.js');
const Team = require('../models/team_model.js');
const Match = require('../models/match_model.js');
const { validationResult } = require('express-validator');
var validator = require('validator');
var sanitize = require('mongo-sanitize');

/* Regex for checking *///
const idFormat = /[a-zA-Z0-9]+$/;

const stats_controller = {
  /* Load the Find a Round page */
  getStats: function(req, res){
    reset(req);
    if (req.session.curr_user){
      var render = "app/statistics/roundStats";
      var pagedetails = {
        pagename: 'Find a Round',
        curr_user:req.session.curr_user
      };
      renderPage(req, res, render, pagedetails);
    }else{
      goHome(req, res);
    }
  },

  /* Find all previous and done debates and display them */
  matchHistory: async function(req, res){
    reset(req);
    if (req.session.curr_user){
      var current = req.session.curr_user.username;
      var wholeQuery = {$and:
        [{'status':'Done'}, {$or: [
        {"adjudicator.username": current},
        {"gov.first.username": current},
        {"gov.second.username": current},
        {"gov.third.username": current},
        {"opp.first.username": current},
        {"opp.second.username": current},
        {"opp.third.username": current}]}]
      };
      await db.findMany(Match, wholeQuery, function(result){
        var render = "app/statistics/matchHistory";
        var pagedetails = {
          pagename: 'Match History',
          matches:result,
          curr_user:req.session.curr_user
        };
        renderPage(req, res, render, pagedetails);
      });
    }else if(req.session.guest_user){
      var current = req.session.guest_user.email;
      var wholeQuery = {$and:
        [{'status':'Done'}, {$or: [
        {"gov.first.email": current},
        {"gov.second.email": current},
        {"gov.third.email": current},
        {"opp.first.email": current},
        {"opp.second.email": current},
        {"opp.third.email": current}]}]
      };
      await db.findMany(Match, wholeQuery, function(result){
        var render = "app/guest/guestMatchHistory";
        var pagedetails = {
          pagename: 'Match History',
          matches:result,
          curr_user:req.session.guest_user
        };
        res.render(render, {pagedetails:pagedetails});
        res.end()
      });
    }else{
      goHome(req, res);
    }
  },

  /* Get the round statistics of a debate round and display them */
  roundStats: async function(req, res){
    if (req.session.curr_user || req.session.guest_user){
      var roundID;
      /* Ensure that there is a round ID to find */
      if(req.body.roundID){
        roundID = sanitize(req.body.roundID);
      }else if(req.query.roundID){
        roundID = sanitize(req.query.roundID);
      }else if(req.session.roundID){
        roundID = req.session.roundID;
      }
      var errors = validationResult(req);
      if (!errors.isEmpty() && !req.session.roundID){
        errors = errors.errors;
        var empty = 0;
        for(i = 0; i < errors.length; i++){
          if(errors[i].msg == 'empty'){
            empty = 1;
          }
        }
        if(empty == 1){
          req.session.message = "Error in loading Round Statistics! No Round ID entered.";
        }else{
          req.session.message = "Error in loading Round Statistics! Invalid Round ID entered.";
        }
        req.session.pagename = "Round Statistics";
        req.session.header = "Round Statistics";
        req.session.link = '/roundStats'
        req.session.back = "Round Statistics";
        res.redirect('/message');
        res.end();
      }else if(roundID){
        if(validator.isAlphanumeric(roundID)){
          /* Find the round ID */
          await db.findOne(Match, {roundID:roundID}, async function(result){
            if(result){
              /* If the debate is done, proceed */
              if(result.status == 'Done'){
                var username;
                if(req.session.curr_user)
                  username = req.session.curr_user.username;
                else
                  username = req.session.guest_user.username;
                var role;
                /* Check if the user has a role in the debate */
                if(result.gov.first.username == username || result.gov.second.username == username || result.gov.third.username == username){
                  role = 'gov';
                }else if(result.opp.first.username == username || result.opp.second.username == username || result.opp.third.username == username){
                  role = 'opp';
                }else if(result.adjudicator.username == username){
                  role = 'add';
                }
                if(role){
                  req.session.roundID = roundID;
                  if(req.session.curr_user){
                    var render = "app/statistics/roundroomStatistics";
                    var pagedetails = {
                      pagename: 'Round Statistics',
                      match: result,
                      curr_user: req.session.curr_user,
                      role: role
                    };
                    renderPage(req, res, render, pagedetails);
                  }else{
                    var pagedetails = {
                      pagename: 'Round Statistics',
                      match: result,
                      curr_user: req.session.guest_user,
                      role: role
                    };
                    res.render("app/guest/guestRoundroomStatistics", {pagedetails:pagedetails});
                    res.end();
                  }
                }else{
                  req.session.pagename = "Round Statistics";
                  req.session.header = "Round Statistics";
                  req.session.message = "Error in loading Round Statistics! You might not be part of the teams involved and was not the adjudicator during the match.";
                  req.session.link = '/roundStats'
                  req.session.back = "Round Statistics";
                  res.redirect('/message');
                  res.end();
                }
              }else{
                req.session.pagename = 'Grade a Round';
                req.session.header = 'Grade a Round';
                req.session.link = '/dashboard';
                req.session.back = 'Dashboard';
                if(result.status == 'Grading'){
                  req.session.message = 'Adjudicator is grading Round ID: ' + roundID + '.';
                }else if(result.status == 'Ongoing'){
                  req.session.message = 'Round ID: ' + roundID + ' is still onoing.';
                }else{
                  req.session.message = 'Round ID: ' + roundID + ' has not yet started.';
                }
                res.redirect('/message');
                res.end();
              }
            }else{
              req.session.pagename = "Round Statistics";
              req.session.header = "Round Statistics";
              req.session.message = "No Matches Found!";
              req.session.link = '/roundStats'
              req.session.back = "Round Statistics";
              res.redirect('/message');
              res.end();
            }
          });
        }else{
          req.session.pagename = "Round Statistics";
          req.session.header = "Round Statistics";
          req.session.message = "Invalid Round ID!";
          req.session.link = '/roundStats'
          req.session.back = "Round Statistics";
          res.redirect('/message');
          res.end();
        }
      }else{
        req.session.pagename = "Round Statistics";
        req.session.header = "Round Statistics";
        req.session.message = "Error in loading Round Statistics! No Round ID entered.";
        req.session.link = '/roundStats'
        req.session.back = "Round Statistics";
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

/* Redirect to the find round statistics page */
function goStats(req, res){
  res.redirect('/roundStats');
  res.end();
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

module.exports = stats_controller;
