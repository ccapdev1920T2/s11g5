var express = require('express')
var router = express.Router();
var passport = require('passport')
var User = require('../models/user.model')

  router.get('/', function(req, res) {
      if (req.isAuthenticated()) { res.redirect('dashboard') }
      else res.render('index'); // or probably login.pug (im not sure sa views)
  });

// LOGIN
// show the login form
  router.get('/login', function(req, res) {
    if (req.isAuthenticated()) { res.redirect('dashboard') }
      res.render('login');
  });


// SIGNUP
  router.get('/register', function(req, res) {
    if (req.isAuthenticated()) { res.redirect('dashboard') }
      res.render('register');
  });


// LOGOUT
  router.get('/logout', function(req, res) {
      req.logout();
      res.redirect('/');
  });


// process the login form
router.post('/login', passport.authenticate('local'), function(req, res) {
 res.redirect('/dashboard');
});

// process the signup form
  router.post('/register', function(req, res) {
    User.register(new User({ username : req.body.username, first_name : req.body.first_name, last_name : req.body.last_name, email: req.body.email, institution :req.body.institution }),
      req.body.password, function(err, user) {
          if (err) {
                return res.render('register', { user : user });
            }

            passport.authenticate('local')(req, res, function () {
                  res.redirect('/login');
              });
          });

  });

router.post('/settings/changepassword', isLoggedIn, (req, res) => {
  // do something here with
  //req.body.password
  context = {
    message: "Successfully Changed Password!",
    user: req.user,
  }

  res.render('app/settings', context)
})

router.post('/settings/changepersonal', isLoggedIn, (req, res) => {
  // do something here with
  //req.body.password
  context = {
    message: "Successfully Changed Personal Info!",
    user: req.user,
  }

  res.render('app/settings', context)
})

router.post('/settings/changeuser', isLoggedIn, (req,res) => {
  // do something here with
  //req.body.password
  context = {
    message: "Successfully Changed User Settings!",
    user: req.user,
  }

  res.render('app/settings', context)
})

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
}


module.exports = router;
