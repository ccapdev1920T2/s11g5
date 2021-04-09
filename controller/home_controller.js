const bcrypt = require('bcrypt');
const saltRounds = 10;
const db = require('../models/db.js');
const User = require('../models/user_model.js');
const Team = require('../models/team_model.js');
const Match = require('../models/match_model.js');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');
var sanitize = require('mongo-sanitize');

/* For emailing any user */
const transpo = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tabcore.ccapdev@gmail.com',
    pass: 't2bc0re_CC4PD3V!'
  }
});

const home_controller = {
  /* HTTP Get request for /favicon.ico */
  getFavicon: function (req, res) {
      res.status(204);
  },

  /* For the home page / index page */
  getIndex: function(req, res) {
    reset(req);
    /* If a registered user or guest is logged in, redirect to their dashboard */
    if (req.session.curr_user){
      res.redirect('/dashboard');
      res.end();
    }else if(req.session.guest_user){
      res.redirect('/guestDashboard');
      res.end();
    }else{
      res.render('app/basics/index', {pagename: 'Home'});
      res.end();
    }
  },

  /* Load the Login Page */
  getLogin: function(req, res) {
    /* If a registered user or guest is logged in, redirect to their dashboard */
    if (req.session.curr_user || req.session.guest_user) {
      res.redirect('/dashboard');
      res.end();
    }else{
      if(!req.session.login_fields){
        req.session.login_fields = {login:0};
      }
      res.render('app/basics/login', {pagename: 'Login', invalid:req.session.login_fields.login});
      res.end();
    }
  },

  /* Process the username and password entered during login */
  postLogin: async function(req, res) {
    reset(req);
    /* If a registered user or guest is logged in, redirect to their dashboard */
    if (req.session.curr_user || req.session.guest_user) {
      res.redirect('/dashboard');
      res.end();
    }else{
      var errors = validationResult(req);
      if (!errors.isEmpty()){
        req.session.login_fields = {login:1};
        res.redirect('/login');
        res.end();
      }else{
        var username = sanitize(req.body.username);
        var oldPass = sanitize(req.body.password);
        /* Find the account of a registered user */
        await db.findOne(User, {username:username}, function(result){
          /* If not found, load the login page with an invalid username/password error */
          if(!result){
            req.session.login_fields = {login:1};
            res.redirect('/login');
            res.end();
          }else{
            bcrypt.compare(oldPass, result.password, function(err, equal){
              /* If the password entered is incorrect, load the login page with an invalid username/password error */
              if(equal){
                req.session.curr_user = result;
                res.redirect('/dashboard');
                res.end();
              }else{
                req.session.login_fields = {login:1};
                res.redirect('/login');
                res.end();
              }
            });
          }
        });
      }
    }
  },

  /* Load the Guest Login page */
  getGuest: function(req, res) {
    /* If a registered user or guest is logged in, redirect to their dashboard */
    if (req.session.curr_user || req.session.guest_user) {
      res.redirect('/dashboard');
      res.end();
    }else{
      if(!req.session.guest_fields){
        req.session.guest_fields = {email:0, name:0, insti:0};
      }
      res.render('app/guest/guestLogin', {
        pagename: 'Guest Login',
        invalid:req.session.guest_fields.email
      });
      res.end();
    }
  },

  /* Process the email entered by the user */
  postGuest: async function(req, res) {
    reset(req);
    /* If a registered user or guest is logged in, redirect to their dashboard */
    if (req.session.curr_user || req.session.guest_user) {
      res.redirect('/dashboard');
      res.end();
    }else{
      var errors = validationResult(req);
      if (!errors.isEmpty()){
        req.session.guest_fields = {email:1, name:0, insti:0};
        res.redirect('/guestLogin');
        res.end();
      }else{
        var email = sanitize(req.body.email);
        /* Try to find the email entered in the registered user database. If found, signal an error */
        await db.findOne(User, {email:email}, async function(foundUser){
          if(foundUser){
            req.session.guest_fields = {email:1, name:0, insti:0};
            res.redirect('/guestLogin');
            res.end();
          }else{
            var guest_user = {
              email: email,
              username: email,
              first_name: email,
              last_name: email,
              full_name: email,
              institution: 'None'
            };
            req.session.guest_user = guest_user;
            res.redirect('/guestName');
            res.end();
          }
        });
      }
    }
  },

  /* Load the enter a name page */
  guestName: async function(req, res){
    /* If a registered user is logged in, redirect to their dashboard */
    if(req.session.curr_user){
      res.redirect('/dashboard');
    }else if(req.session.guest_user){
      /* Have the user enter a name */
      if(!req.session.guest_fields){
        req.session.guest_fields = {email:0, name:0, insti:0};
      }
      res.render('app/guest/guestName', {
        pagename: 'Guest Name',
        guest_user:req.session.guest_user,
        name:req.session.guest_fields.name,
        insti:req.session.guest_fields.insti
      });
      res.end();
    }else{
      goHome(req, res);
    }
  },

  /* Process the name entered by the user */
  addName: async function(req, res){
    /* If a registered user is logged in, redirect to their dashboard */
    if(req.session.curr_user){
      res.redirect('/dashboard');
      res.end();
    }else if(req.session.guest_user){
      var errors = validationResult(req);
      if (!errors.isEmpty()){
        var validName = 0, validInsti = 0;
        errors = errors.errors;
        for(i = 0; i < errors.length; i++){
          if(errors[i].msg == 'empty'){
            validName = 1;
            validInsti = 1;
            break;
          }else{
            if(errors[i].param == 'firstname' || errors[i].param == 'lastname'){
              validName = 1;
            }else if(errors[i].param == 'institution'){
              validInsti = 1;
            }
          }
        }
        req.session.guest_fields = {email:0, name:validName, insti:validInsti};
        res.redirect('/guestName');
        res.end();
      }else{
        var first = sanitize(req.body.firstname);
        var last = sanitize(req.body.lastname);
        var institution = sanitize(req.body.institution);
        var username = req.session.guest_user.email;
        var full_name = first + " " + last;
        var guest_user = {
          email: req.session.guest_user.email,
          username: username,
          first_name: first,
          last_name: last,
          full_name: full_name,
          institution: institution
        };
        req.session.guest_user = guest_user;
        /* Update the teams and rounds that they are part of */
        await db.updateMany(Team, {"first.email":req.session.guest_user.email}, {$set:{"first":guest_user}});
        await db.updateMany(Team, {"second.email":req.session.guest_user.email}, {$set:{"second":guest_user}});
        await db.updateMany(Team, {"third.email":req.session.guest_user.email}, {$set:{"third":guest_user}});
        await db.updateMany(Match, {"gov.first.email":req.session.guest_user.email}, {$set:{"gov.first":guest_user}});
        await db.updateMany(Match, {"gov.second.email":req.session.guest_user.email}, {$set:{"gov.second":guest_user}});
        await db.updateMany(Match, {"gov.third.email":req.session.guest_user.email}, {$set:{"gov.third":guest_user}});
        await db.updateMany(Match, {"opp.first.email":req.session.guest_user.email}, {$set:{"opp.first":guest_user}});
        await db.updateMany(Match, {"opp.second.email":req.session.guest_user.email}, {$set:{"opp.second":guest_user}});
        await db.updateMany(Match, {"opp.third.email":req.session.guest_user.email}, {$set:{"opp.third":guest_user}});
        req.session.guest_user = guest_user;
        res.redirect('/guestDashboard');
        res.end();
      }
    }else{
      goHome(req, res);
    }
  },

  /* Load the guest dashboard */
  guestDashboard: async function(req, res){
    /* If a registered user is logged in, redirect to their dashboard */
    if(req.session.curr_user){
      res.redirect('/dashboard');
      res.end();
    }else if(req.session.guest_user){
      var pagedetails = {
        pagename:'Guest Dashboard',
        curr_user:req.session.guest_user
      };
      res.render('app/guest/guestDashboard', {pagedetails:pagedetails});
      res.end();
    }else{
      goHome(req, res);
    }
  },

  /* Load the register page */
  getRegister: function(req, res) {
    if(req.session.curr_user || req.session.guest_user){
      /* If a registered user or guest user is logged in, redirect to their dashboard */
      res.redirect('/dashboard');
      res.end();
    }else{
      if(!req.session.reg_fields){
        req.session.reg_fields = {
          all: 0,
          first: 0,
          last: 0,
          user: 0,
          insti: 0,
          email: 0,
          pass: 0
        };
      }
      res.render('app/basics/register', {
        pagename: 'Register',
        all: req.session.reg_fields.all,
        first: req.session.reg_fields.first,
        last: req.session.reg_fields.last,
        user: req.session.reg_fields.user,
        insti: req.session.reg_fields.insti,
        email: req.session.reg_fields.email,
        pass: req.session.reg_fields.pass
      });
      res.end();
    }
  },

  /* Process the information entered by the user registering */
  postRegister: async function(req, res) {
    reset(req);
    if(req.session.curr_user || req.session.guest_user){
      res.redirect('/welcome');
      res.end();
    }else{
      var errors = validationResult(req);
      if (!errors.isEmpty()){
        var all = 0, validFirst = 0, validLast = 0, validInsti = 0, validUser = 0, validEmail = 0, validPass = 0;
        errors = errors.errors;
        for(i = 0; i < errors.length; i++){
          if(errors[i].msg == 'empty'){
            all = 1;
            break;
          }else{
            if(errors[i].param == 'firstname'){
              validFirst = 1;
            }else if(errors[i].param == 'lastname'){
              validLast = 1;
            }else if(errors[i].param == 'institution'){
              validInsti = 1;
            }else if(errors[i].param == 'username'){
              validUser = 1;
            }else if(errors[i].param == 'email'){
              validEmail = 1;
            }else if(errors[i].param == 'password'){
              validPass = 1;
            }else if(errors[i].param == 'confirm'){
              validPass = 1;
            }
          }
        }
        req.session.reg_fields = {
          all: all,
          first: validFirst,
          last: validLast,
          user: validUser,
          insti: validInsti,
          email: validEmail,
          pass: validPass
        };
        res.redirect('/register');
        res.end();
      }else{
        var username = sanitize(req.body.username);
        var first = sanitize(req.body.first_name);
        var last = sanitize(req.body.last_name);
        var email = sanitize(req.body.email);
        var institution = sanitize(req.body.institution);
        var firstPass = sanitize(req.body.password);
        var secondPass = sanitize(req.body.confirm_pass);
        bcrypt.hash(firstPass, saltRounds, async function(err, hash){
          const full = String(first) + " " + String(last);
          var person = {
            username : username,
            password : hash,
            first_name : first,
            last_name : last,
            full_name: full,
            email: email,
            institution :institution,
            dateoflast: 'None',
            numdebates: 0,
            wins: 0,
            loses: 0,
            draws: 0,
            rawWins: 0,
            rawLose: 0,
            rawDraw: 0,
            updates: []
          }
          /* Find the username and email entered. If found, reload with the errors */
          await db.findOne(User, {$or: [{email:email}, {username:username}]}, function(result){
            if(!result){
              /* Set the details of the email */
              const mailDetails = {
                from: 'tabcore.ccapdev@gmail.com',
                to: email,
                subject: 'Welcome to Tabcore',
                text: "Hey, " + full + "!\n\nWelcome to Tabcore!",
                html: '<h2>Hey, ' + full + '!</h2><br><br /><img src="cid:tabcore_attach.gif" alt="Welcome" style="display:block; margin-left:auto; margin-right:auto; width: 50%">',
                attachments: [{
                  filename: 'WELCOME.gif',
                  path: __dirname + '/../views/assets/img/welcome/WELCOME.gif',
                  cid: 'tabcore_attach.gif'
                }]
              };
              /* Send an email to the user welcoming them to Tabcore */
              transpo.sendMail(mailDetails, function(err, result){
                if(err){
                  console.log(err || result);
                  res.render('app/basics/register', {
                    pagename: 'Register',
                    all: 0,
                    first: 0,
                    last: 0,
                    user: 0,
                    insti: 0,
                    email: 1,
                    pass: 0
                  });
                  res.end();
                }else{
                  db.insertOne(User, person);
                  req.session.curr_user = person;
                  req.session.current_page = 'welcome';
                  res.redirect('/welcome');
                  res.end();
                }
              });
            }else{
              var validEmail, validUser;
              if(result.email == email){
                validEmail = 1;
              }
              if(result.username == username){
                validUser = 1;
              }
              req.session.reg_fields = {
                all: 0,
                first: 0,
                last: 0,
                user: validUser,
                insti: 0,
                email: validEmail,
                pass: 0
              };
              res.redirect('/register');
              res.end();
            }
          });
        });
      }
    }
  },

  /* Check if username is already registered */
  checkUsername: async function(req, res){
    if(req.query.username){
      var username = sanitize(req.query.username);
      await db.findOne(User, {username:username}, function(result){
        res.send(result);
      });
    }
  },

  /* Check if email is already registered */
  checkEmail: async function(req, res){
    if(req.query.email){
      var email = sanitize(req.query.email);
      await db.findOne(User, {email:email}, function(result){
        res.send(result);
      });
    }
  },

  /* Load the tutorial page */
  welcome: function(req, res){
    reset(req);
    if(req.session.curr_user){
      res.render('app/welcome_tutorial/welcome_tutorial', {
        pagename: 'Welcome',
        curr_user:req.session.curr_user
      });
      res.end();
    }else{
      goHome(req, res);
    }
  },

  /* Load the dashboard of the registered user */
  dashboard: async function(req, res){
    reset(req);
    if(req.session.curr_user){
      /* Find the registered user's previous matches wherein they were a debater */
      await db.findMany(Match, {$and: [{"gov.teamname": {$ne: null}}, {"opp.teamname": {$ne: null}}, {status: 'Done'}, {$or: [{"gov.first._id":req.session.curr_user._id}, {"gov.second._id":req.session.curr_user._id}, {"gov.third._id":req.session.curr_user._id}, {"opp.first._id":req.session.curr_user._id}, {"opp.second._id":req.session.curr_user._id}, {"opp.third._id":req.session.curr_user._id}]}]}, async function(result){
        var latest = 'None';
        if(result){
          if(result.length > 0){
            var sorted = result.sort((a,b) => b.date_match - a.date_match);
            latest = sorted[sorted.length - 1].date_match;
          }
          /* Update the user's account with the date of their latest debate then go to their dashboard */
          await db.findOneAndUpdate(User, {_id:req.session.curr_user._id}, {$set: {dateoflast:latest}}, async function(foundUser){
            if(foundUser){
              req.session.curr_user = foundUser;
            }
            var render = 'app/basics/dashboard';
            var pagedetails = {
              pagename: 'Dashboard',
              curr_user:req.session.curr_user
            };
            renderPage(req, res, render, pagedetails);
          });
        }else{
          var render = 'app/basics/dashboard';
          var pagedetails = {
            pagename: 'Dashboard',
            curr_user:req.session.curr_user
          };
          renderPage(req, res, render, pagedetails);
        }
      });
    }else if(req.session.guest_user){
      res.redirect('/guestDashboard');
      res.end();
    }else{
      goHome(req, res);
    }
  },

  /* Display the message */
  displayMessage: function(req, res){
    if(req.session.pagename && req.session.header && req.session.message && req.session.link && req.session.back && (req.session.curr_user || req.session.guest_user)){
      var pagedetails = {
        pagename: req.session.pagename,
        header: req.session.header,
        message: req.session.message,
        link: req.session.link,
        back: req.session.back
      };
      res.render('app/layout/message', {
        pagedetails: pagedetails,
        curr_user:req.session.curr_user
      });
      res.end();
    }else{
      goHome(req, res);
    }
  },

  /* Log the user out of Tabcore */
  getLogout: async function(req, res) {
    if(req.session.guest_user){
      /* If the logged in user is a guest, update the teams and matches and delete the temporary account */
      var guestUser = {
        email:req.session.guest_user.email,
        username:req.session.guest_user.email,
        full_name:req.session.guest_user.email,
        institution: 'No Institution Entered.'
      };
      await db.updateMany(Team, {"first.email":req.session.guest_user.email}, {$set:{"first":guestUser}});
      await db.updateMany(Team, {"second.email":req.session.guest_user.email}, {$set:{"second":guestUser}});
      await db.updateMany(Team, {"third.email":req.session.guest_user.email}, {$set:{"third":guestUser}});
      await db.updateMany(Match, {"gov.first.email":req.session.guest_user.email}, {$set:{"gov.first":guestUser}});
      await db.updateMany(Match, {"gov.second.email":req.session.guest_user.email}, {$set:{"gov.second":guestUser}});
      await db.updateMany(Match, {"gov.third.email":req.session.guest_user.email}, {$set:{"gov.third":guestUser}});
      await db.updateMany(Match, {"opp.first.email":req.session.guest_user.email}, {$set:{"opp.first":guestUser}});
      await db.updateMany(Match, {"opp.second.email":req.session.guest_user.email}, {$set:{"opp.second":guestUser}});
      await db.updateMany(Match, {"opp.third.email":req.session.guest_user.email}, {$set:{"opp.third":guestUser}});
    }
    req.session.destroy((err)=>{
      if(err) throw err;
    });
    req.logout();
    res.redirect('/');
    res.end();
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

module.exports = home_controller;
