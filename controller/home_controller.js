const crypto = require('crypto');
const db = require('../models/db.js');
const user_collection = 'user';
const match_collection = 'match';
const teams_collection = 'teams';
const nodemailer = require('nodemailer');
var sanitize = require('mongo-sanitize');

/* Regex for checking */
const emailFormat = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const nameFormat = /^[a-zA-Z][a-zA-Z\s]*$/;
const userFormat = /[a-zA-Z0-9\-\_\.]+$/;

/* For emailing any user */
const transpo = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tabcore.ccapdev@gmail.com',
    pass: 'tabcoreCCAPDEV!'
  }
});

const home_controller = {
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
      if(req.body.username && req.body.password){
        var validUser = 0, validPass = 0;
        /* Check if the username entered contains only letters, numbers, and select characters. If so, proceed. */
        if (!userFormat.test(req.body.username)){
          req.session.login_fields = {login:1};
          res.redirect('/login');
          res.end();
        }else{
          var username = sanitize(req.body.username);
          /* Find the account of a registered user */
          await db.findOne(user_collection, {username:username}, function(result){
            /* If not found, load the login page with an invalid username/password error */
            if(!result){
              req.session.login_fields = {login:1};
              res.redirect('/login');
              res.end();
            }else{
              var given_salt = result.password.salt;
              var pass = result.password.newPassword;
              var oldPass = sanitize(req.body.password);
              /* If the password entered is incorrect, load the login page with an invalid username/password error */
              if(checkHash(pass, oldPass, given_salt)){
                req.session.curr_user = result;
                res.redirect('/dashboard');
                res.end();
              }else{
                req.session.login_fields = {login:1};
                res.redirect('/login');
                res.end();
              }
            }
          });
        }
      }else{
        req.session.login_fields = {login:1};
        res.redirect('/login');
        res.end();
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
      res.render('app/guest/guestLogin', {pagename: 'Guest Login', invalid:req.session.guest_fields.email});
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
      /* If an email was entered, proceed in checking. If not, signal an error */
      if(req.body.email){
        if(!emailFormat.test(req.body.email)){
          req.session.guest_fields = {email:1, name:0, insti:0};
          res.redirect('/guestLogin');
          res.end();
        }else{
          var email = sanitize(req.body.email);
          /* Try to find the email entered in the registered user database. If found, signal an error */
          await db.findOne(user_collection, {email:email}, async function(foundUser){
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
      }else{
        req.session.guest_fields = {email:1, name:0, insti:0};
        res.redirect('/guestLogin');
        res.end();
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
      res.render('app/guest/guestName', {pagename: 'Guest Name', guest_user:req.session.guest_user, name:req.session.guest_fields.name, insti:req.session.guest_fields.insti});
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
      /* If a first name, last name, and institution are entered, proceed to checking. If not, signal an error */
      if(req.body.firstname && req.body.lastname && req.body.institution){
        var first = sanitize(req.body.firstname);
        var last = sanitize(req.body.lastname);
        var institution = sanitize(req.body.institution);
        var validFirst = 0, validLast = 0, validInsti = 0;
        /* Check if the first name entered contains only letters and spaces */
        if(!nameFormat.test(first)){
          validFirst = 1;
        }
        /* Check if the last name entered contains only letters and spaces */
        if(!nameFormat.test(last)){
          validLast = 1;
        }
        /* Check if the institution entered contains only letters and spaces */
        if(!nameFormat.test(institution)){
          validInsti = 1;
        }
        if(validFirst == 1 || validLast == 1 || validInsti == 1){
          if(validFirst == 1 || validLast == 1)
            req.session.guest_fields = {email:0, name:1, insti:validInsti};
          else
            req.session.guest_fields = {email:0, name:0, insti:validInsti};
          res.redirect('/guestName');
          res.end();
        }else{
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
          await db.updateMany(teams_collection, {"first.email":req.session.guest_user.email}, {$set:{"first":guest_user}});
          await db.updateMany(teams_collection, {"second.email":req.session.guest_user.email}, {$set:{"second":guest_user}});
          await db.updateMany(teams_collection, {"third.email":req.session.guest_user.email}, {$set:{"third":guest_user}});
          await db.updateMany(match_collection, {"gov.first.email":req.session.guest_user.email}, {$set:{"gov.first":guest_user}});
          await db.updateMany(match_collection, {"gov.second.email":req.session.guest_user.email}, {$set:{"gov.second":guest_user}});
          await db.updateMany(match_collection, {"gov.third.email":req.session.guest_user.email}, {$set:{"gov.third":guest_user}});
          await db.updateMany(match_collection, {"opp.first.email":req.session.guest_user.email}, {$set:{"opp.first":guest_user}});
          await db.updateMany(match_collection, {"opp.second.email":req.session.guest_user.email}, {$set:{"opp.second":guest_user}});
          await db.updateMany(match_collection, {"opp.third.email":req.session.guest_user.email}, {$set:{"opp.third":guest_user}});
          req.session.guest_user = guest_user;
          res.redirect('/guestDashboard');
          res.end();
        }
      }else{
        req.session.guest_fields = {email:0, name:1, insti:1};
        res.redirect('/guestName');
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
      /* If all fields are filled, proceed to checking. If not, signal an error. */
      if(req.body.username && req.body.first_name && req.body.last_name && req.body.email && req.body.institution && req.body.password && req.body.confirm_pass){
        var all = 0, validFirst = 0, validLast = 0, validUser = 0, validInsti = 0, validEmail = 0, validPass = 0;
        var username = sanitize(req.body.username);
        var first = sanitize(req.body.first_name);
        var last = sanitize(req.body.last_name);
        var email = sanitize(req.body.email);
        var institution = sanitize(req.body.institution);
        var firstPass = sanitize(req.body.password);
        var secondPass = sanitize(req.body.confirm_pass);
        /* Check if the first name entered contains only letters and spaces */
        if(!nameFormat.test(first)){
          validFirst = 1;
        }
        /* Check if the last name entered contains only letters and spaces */
        if (!nameFormat.test(last)){
          validLast = 1;
        }
        /* Check if the username entered contains only letters, numbers, and select characters */
        if (!userFormat.test(username)){
          validUser = 1;
        }
        /* Check if the institution entered contains only letters and spaces */
        if (!nameFormat.test(institution)){
          validInsti = 1;
        }
        /* Check if the email entered is of valid format */
        if(!emailFormat.test(email)){
          validEmail = 1;
        }
        /* Check if the password and confirm password entered are equal */
        if (firstPass !== secondPass){
          validPass = 1;
        }
        else{ /* Check if the password and confirm password entered are 8 characters or more and do not contain whitespaces or any invalid characters */
          if (firstPass.length < 8 || secondPass.length < 8){
            validPass = 2;
          }
        }
        /* If any are invalid, load the register page with the errors */
        if(validFirst == 1 || validLast == 1 || validUser == 1 || validInsti == 1 || validEmail == 1 || validPass >= 1){
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
        }else{ /* If all are valid, proceed */
          const full = String(first) + " " + String(last);
          var person = {
            username : username,
            password : createHash(firstPass),
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
          await db.findOne(user_collection, {$or: [{email:email}, {username:username}]}, function(result){
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
                  db.insertOne(user_collection, person);
                  req.session.curr_user = person;
                  req.session.current_page = 'welcome';
                  res.redirect('/welcome');
                  res.end();
                }
              });
            }else{
              if(result.email == req.body.email){
                validEmail = 1;
              }
              if(result.username == req.body.username){
                validUser = 1;
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
            }
          });
        }
      }else{
        req.session.reg_fields = {
          all: 1,
          first: 0,
          last: 0,
          user: 0,
          insti: 0,
          email: 0,
          pass: 0
        };
        res.redirect('/register');
        res.end();
      }
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
      await db.findMany(match_collection, {$and: [{"gov.teamname": {$ne: null}}, {"opp.teamname": {$ne: null}}, {status: 'Done'}, {$or: [{"gov.first.username":req.session.curr_user.username}, {"gov.second.username":req.session.curr_user.username}, {"gov.third.username":req.session.curr_user.username}, {"opp.first.username":req.session.curr_user.username}, {"opp.second.username":req.session.curr_user.username}, {"opp.third.username":req.session.curr_user.username}]}]}, async function(result){
        var latest = 'None';
        if(result){
          if(result.length > 0){
            var sorted = result.sort((a,b) => b.date_match - a.date_match);
            latest = sorted[sorted.length - 1].date_match;
          }
        }
        /* Update the user's account with the date of their latest debate then go to their dashboard */
        await db.findOneAndUpdate(user_collection, {username:req.session.curr_user.username}, {$set: {dateoflast:latest}}, async function(result){
          req.session.curr_user = result;
          var render = 'app/basics/dashboard';
          var pagedetails = {
            pagename: 'Dashboard',
            curr_user:req.session.curr_user
          };
          renderPage(req, res, render, pagedetails);
        });
      });
    }else if(req.session.guest_user){
      res.redirect('/guestDashboard');
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
      await db.updateMany(teams_collection, {"first.email":req.session.guest_user.email}, {$set:{"first":guestUser}});
      await db.updateMany(teams_collection, {"second.email":req.session.guest_user.email}, {$set:{"second":guestUser}});
      await db.updateMany(teams_collection, {"third.email":req.session.guest_user.email}, {$set:{"third":guestUser}});
      await db.updateMany(match_collection, {"gov.first.email":req.session.guest_user.email}, {$set:{"gov.first":guestUser}});
      await db.updateMany(match_collection, {"gov.second.email":req.session.guest_user.email}, {$set:{"gov.second":guestUser}});
      await db.updateMany(match_collection, {"gov.third.email":req.session.guest_user.email}, {$set:{"gov.third":guestUser}});
      await db.updateMany(match_collection, {"opp.first.email":req.session.guest_user.email}, {$set:{"opp.first":guestUser}});
      await db.updateMany(match_collection, {"opp.second.email":req.session.guest_user.email}, {$set:{"opp.second":guestUser}});
      await db.updateMany(match_collection, {"opp.third.email":req.session.guest_user.email}, {$set:{"opp.third":guestUser}});
    }
    req.session.destroy((err)=>{
      if(err) throw err;
    });
    req.logout();
    res.redirect('/');
    res.end();
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
  }
}

/* Get the user's password and turn it into a hashed password to store */
function createHash(password){
  var salt = crypto.randomBytes(Math.ceil(16/2)).toString('hex').slice(0,16);

  //Create the hashed password by adding the salt to the password
  var hashPassword = function(password, salt){
    var hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    var value = hash.digest('hex');
    return{salt: salt, newPassword: value}
  };

  return hashPassword(password, salt);
}

/* Check if the password entered during login matches their stored password */
function checkHash(password, log_pass, given_salt){
  var salt = given_salt;
  var hashPassword = function(password, log_pass, salt){
    var hash = crypto.createHmac('sha512', salt);
    hash.update(log_pass);
    var value = hash.digest('hex');
    return(password == value);
  };

  return hashPassword(password, log_pass, given_salt);
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
  req.session.current_edit = null;
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
  await db.findOne(user_collection, {username:req.session.curr_user.username}, async function(result){
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
      await db.findMany(match_collection, wholeQuery, function(result){
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
