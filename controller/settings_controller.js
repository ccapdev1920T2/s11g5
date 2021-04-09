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

const settings_controller = {
  /* Load the profile settings page */
  getSettings: function(req, res) {
    if(req.session.curr_user){
      if(!req.session.settings_fields){
        req.session.settings_fields = {new_user:0, new_mail:0, new_first:0, new_last:0, new_insti:0, pass:0};
      }
      renderPage(req, res, 'app/settings/profileSettings', {
        pagename: 'Settings',
        curr_user: req.session.curr_user,
        user: req.session.settings_fields.new_user,
        mail: req.session.settings_fields.new_mail,
        first: req.session.settings_fields.new_first,
        last: req.session.settings_fields.new_last,
        insti: req.session.settings_fields.new_insti,
        pass: req.session.settings_fields.pass
      });
    }else{
      goHome(req, res);
    }
  },

  /* Update the user's email and/or username */
  update_user: async function(req, res) {
    reset(req);
    if (req.session.curr_user){
      var uname = sanitize(req.body.username);
      var mail = sanitize(req.body.email);
      var errors = validationResult(req);
      if (!errors.isEmpty()){
        var validUser = 0, validMail = 0, emptyCount = 0, paramUser = 0, paramMail = 0;
        errors = errors.errors;
        for(i = 0; i < errors.length; i++){
          if(errors[i].msg == 'empty'){
            emptyCount = emptyCount + 1;
            if(errors[i].param == 'username'){
              paramUser = 1;
            }else if(errors[i].param == 'email'){
              paramMail = 1;
            }
          }else{
            if(errors[i].param == 'username'){
              validUser = 1;
            }else if(errors[i].param == 'email'){
              validMail = 1;
            }
          }
        }
        if(emptyCount == 2 || (paramUser == 1 && paramMail == 1)){
          reset(req);
          req.session.settings_fields = {new_user:0, new_mail:0, new_first:0, new_last:0, new_insti:0, pass:0};
          res.redirect('/settings');
          res.end();
        }else if((validUser == 1 && paramUser == 0) || (validMail == 1 && paramMail == 0)){
          reset(req);
          req.session.settings_fields = {new_user:validUser, new_mail:validMail, new_first:0, new_last:0, new_insti:0, pass:0};
          res.redirect('/settings');
          res.end();
        }else{
          if(paramUser == 1){
            /* Find the user's account */
            await db.findOne(User, {_id:req.session.curr_user._id}, async function(result){
              if(result){
                await db.findOne(User, {email:mail}, async function(found){
                  /* if no user is registered with the indicated email, proceed with the process */
                  if(found){
                    req.session.settings_fields = {new_user:0, new_mail:1, new_first:0, new_last:0, new_insti:0, pass:0};
                    res.redirect('/settings');
                    res.end();
                  }else{ /* Update the account of the user and get the result */
                    await db.findOneAndUpdate(User, {_id:req.session.curr_user._id}, {$set: {email:mail}}, async function(updated){
                      req.session.curr_user = updated;
                      updatesTeamsMatches(updated);
                      /* Set the email details */
                      var email_content = {
                        text_content: "Hey, " + req.session.curr_user.full_name + "!\n\nYour email was changed to " + mail + ".",
                        html_content: '<h2>Hey, ' + req.session.curr_user.full_name + '!</h2><br><h3>Your email was recently changed to ' + mail + '. Didn\'t change your email? No worries! Reply to this email and we can try to resolve this problem.</h3><br /><img src="cid:tabcore_attach.png" alt="Tabcore" style="display:block; margin-left:auto; margin-right:auto; width: 100%">',
                        error_mess: "Error in updating Email! Please Try again later.",
                        success_mess: "Successfully updated Email to " + mail + "!"
                      };
                      /* Send the email */
                      sendEmail(req, res, email_content, req.session.curr_user.email, updated);
                    });
                  }
                });
              }else{ /* If the user's account cannot be found, bring up an error message */
                req.session.message = "Error in updating Email! Please Try again later.";
                goMessage(req, res);
              }
            });
          }else if(paramMail == 1){
            /* Find the user's account */
            await db.findOne(User, {_id:req.session.curr_user._id}, async function(result){
              if(result){
                await db.findOne(User, {username:uname}, async function(found){
                  if(found){ /* if no user is registered with the indicated username, proceed with the process */
                    req.session.settings_fields = {new_user:1, new_mail:0, new_first:0, new_last:0, new_insti:0, pass:0};
                    res.redirect('/settings');
                    res.end();
                  }else{ /* Update the account of the user and get the result */
                    await db.findOneAndUpdate(User, {_id:req.session.curr_user._id}, {$set: {username:uname}}, async function(result){
                      req.session.curr_user = result;
                      updatesTeamsMatches(result);
                      /* Set the email content */
                      var email_content = {
                        text_content: "Hey, " + req.session.curr_user.full_name + "!\n\nYour username was changed to " + uname + ".",
                        html_content: '<h2>Hey, ' + req.session.curr_user.full_name + '!</h2><br><h3>Your username was recently changed to ' + uname + '. Didn\'t change your username? No worries! Reply to this email and we can try to resolve this problem.</h3><br /><img src="cid:tabcore_attach.png" alt="Tabcore" style="display:block; margin-left:auto; margin-right:auto; width: 100%">',
                        error_mess: "Error in updating username! Please Try again later.",
                        success_mess: "Successfully updated username to " + uname + "!"
                      };
                      /* Send the email */
                      sendEmail(req, res, email_content, result.email, result);
                    });
                  }
                });
              }else{ /* If the user's account cannot be found, bring up an error message */
                req.session.message = "Error in updating username! Please Try again later.";
                goMessage(req, res);
              }
            });
          }else{
            updateUserMail(req, res, uname, mail)
          }
        }
      }else{
        updateUserMail(req, res, uname, mail)
      }
    }else{
      goHome(req, res);
    }
  },

  /* Update the Name and Institution of the User */
  update_personal: async function(req, res) {
    reset(req);
    if(req.session.curr_user){
      /* Check if there was anything entered */
      var first_name = sanitize(req.body.first_name);
      var last_name = sanitize(req.body.last_name);
      var institution = sanitize(req.body.institution);
      var errors = validationResult(req);
      if (!errors.isEmpty()){
        var validFirst = 0, validLast = 0, validInsti = 0, emptyCount = 0, paramFirst = 0, paramLast = 0, paramInsti = 0;
        errors = errors.errors;
        for(i = 0; i < errors.length; i++){
          if(errors[i].msg == 'empty'){
            emptyCount = emptyCount + 1;
            if(errors[i].param == 'first_name'){
              paramFirst = 1;
            }else if(errors[i].param == 'last_name'){
              paramLast = 1;
            }else if(errors[i].param == 'institution'){
              paramInsti = 1;
            }
          }else{
            if(errors[i].param == 'first_name'){
              validFirst = 1;
            }else if(errors[i].param == 'last_name'){
              validLast = 1;
            }else if(errors[i].param == 'institution'){
              validInsti = 1;
            }
          }
        }
        if(emptyCount == 3 || (paramFirst == 1 && paramLast == 1 && paramInsti == 1)){
          reset(req);
          req.session.settings_fields = {new_user:0, new_mail:0, new_first:1, new_last:1, new_insti:1, pass:0};
          res.redirect('/settings');
          res.end();
        }else if((validFirst == 1 && paramFirst == 0) || (validLast == 1 && paramLast == 0) || (validInsti == 1 && paramInsti == 0)){
          reset(req);
          req.session.settings_fields = {new_user:0, new_mail:0, new_first:validFirst, new_last:validLast, new_insti:validInsti, pass:0};
          res.redirect('/settings');
          res.end();
        }else{
          if(paramFirst == 1){
            if(paramLast == 1){
              /* Update the user's account */
              await db.findOneAndUpdate(User, {username:req.session.curr_user.username}, {$set: {institution:institution}}, async function(result){
                req.session.curr_user = result;
                updatesTeamsMatches(result);
                /* Set the email content */
                var email_content = {
                  html_content:  '<h2>Hey, ' + req.session.curr_user.full_name + '!</h2><br><h3>Your institution was recently changed to ' + institution + '. Didn\'t make these changes? No worries! Reply to this email and we can try to resolve this problem.</h3><br /><img src="cid:tabcore_attach.png" alt="Tabcore" style="display:block; margin-left:auto; margin-right:auto; width: 100%">',
                  error_mess: "Error in updating Institution! Please Try again later.",
                  success_mess: "Successfully updated Institution to " + institution + "!"
                };
                /* Send the email */
                sendEmail(req, res, email_content, req.session.curr_user.email, result);
              });
            }else if(paramInsti == 1){
              var full_name = req.session.curr_user.first_name + " " + last_name;
              /* Update the user's account */
              await db.findOneAndUpdate(User, {username:req.session.curr_user.username}, {$set: {last_name:last_name}}, async function(result){
                req.session.curr_user = result;
                updatesTeamsMatches(result);
                /* Set the email content */
                var email_content = {
                  html_content:  '<h2>Hey, ' + req.session.curr_user.full_name + '!</h2><br><h3>Your name was recently changed to ' + full_name + '. Didn\'t make these changes? No worries! Reply to this email and we can try to resolve this problem.</h3><br /><img src="cid:tabcore_attach.png" alt="Tabcore" style="display:block; margin-left:auto; margin-right:auto; width: 100%">',
                  error_mess: "Error in updating Name! Please Try again later.",
                  success_mess: "Successfully updated Last Name to " + last_name + "!"
                };
                /* Send the email */
                sendEmail(req, res, email_content, req.session.curr_user.email, result);
              });
            }else{
              var full_name = req.session.curr_user.first_name + " " + last_name;
              /* Update the user's account */
              await db.findOneAndUpdate(User, {username:req.session.curr_user.username}, {$set: {last_name:last_name, institution:institution, full_name:full_name}}, async function(result){
                req.session.curr_user = result;
                updatesTeamsMatches(result);
                /* Set the email content */
                var email_content = {
                  html_content:  '<h2>Hey, ' + req.session.curr_user.full_name + '!</h2><br><h3>Your name and institution were recently changed to ' + full_name + ' and ' + institution + '. Didn\'t make these changes? No worries! Reply to this email and we can try to resolve this problem.</h3><br /><img src="cid:tabcore_attach.png" alt="Tabcore" style="display:block; margin-left:auto; margin-right:auto; width: 100%">',
                  error_mess: "Error in updating Name and Institution! Please Try again later.",
                  success_mess: "Successfully updated Last Name and Institution to " + last_name + " and " + institution + "!"
                };
                /* Send the email */
                sendEmail(req, res, email_content, req.session.curr_user.email, result);
              });
            }
          }else if(paramLast == 1){
            if(paramInsti == 1){
              var full_name = first_name + " " + req.session.curr_user.last_name;
              /* Update the user's account */
              await db.findOneAndUpdate(User, {username:req.session.curr_user.username}, {$set: {first_name:first_name, full_name:full_name}}, async function(result){
                req.session.curr_user = result;
                updatesTeamsMatches(result);
                /* Set the email content */
                var email_content = {
                  html_content:  '<h2>Hey, ' + req.session.curr_user.full_name + '!</h2><br><h3>Your name was recently changed to ' + full_name + '. Didn\'t make these changes? No worries! Reply to this email and we can try to resolve this problem.</h3><br /><img src="cid:tabcore_attach.png" alt="Tabcore" style="display:block; margin-left:auto; margin-right:auto; width: 100%">',
                  error_mess: "Error in updating Name! Please Try again later.",
                  success_mess: "Successfully updated First Name to " + first_name + "!"
                };
                /* Send the email */
                sendEmail(req, res, email_content, req.session.curr_user.email, result);
              });
            }else{
              var full_name = first_name + " " + req.session.curr_user.last_name;
              /* Update the user's account */
              await db.findOneAndUpdate(User, {username:req.session.curr_user.username}, {$set: {first_name:first_name, full_name:full_name, institution:institution}}, async function(result){
                req.session.curr_user = result;
                updatesTeamsMatches(result);
                /* Set the email content */
                var email_content = {
                  html_content:  '<h2>Hey, ' + req.session.curr_user.full_name + '!</h2><br><h3>Your name was recently changed to ' + full_name + ' and your institution was changed to ' + institution + '. Didn\'t make these changes? No worries! Reply to this email and we can try to resolve this problem.</h3><br /><img src="cid:tabcore_attach.png" alt="Tabcore" style="display:block; margin-left:auto; margin-right:auto; width: 100%">',
                  error_mess: "Error in updating Name! Please Try again later.",
                  success_mess: "Successfully updated First Name and Institution to " + first_name + " and " + institution + "!"
                };
                /* Send the email */
                sendEmail(req, res, email_content, req.session.curr_user.email, result);
              });
            }
          }else if(paramInsti == 1){
            var full_name = first_name + " " + last_name;
            /* Update the user's account */
            await db.findOneAndUpdate(User, {username:req.session.curr_user.username}, {$set: {first_name:first_name, last_name:last_name, full_name:full_name}}, async function(result){
              req.session.curr_user = result;
              updatesTeamsMatches(result);
              /* Set the email content */
              var email_content = {
                html_content:  '<h2>Hey, ' + req.session.curr_user.full_name + '!</h2><br><h3>Your name was recently changed to ' + full_name + '. Didn\'t make these changes? No worries! Reply to this email and we can try to resolve this problem.</h3><br /><img src="cid:tabcore_attach.png" alt="Tabcore" style="display:block; margin-left:auto; margin-right:auto; width: 100%">',
                error_mess: "Error in updating Name! Please Try again later.",
                success_mess: "Successfully updated First Name and Last Name to " + first_name + " and " + last_name + "!"
              };
              /* Send the email */
              sendEmail(req, res, email_content, req.session.curr_user.email, result);
            });
          }else{
            var full_name = first_name + " " + last_name;
            /* Update the user's account */
            await db.findOneAndUpdate(User, {username:req.session.curr_user.username}, {$set: {first_name:first_name, last_name:last_name, full_name:full_name, institution:institution}}, async function(result){
              req.session.curr_user = result;
              updatesTeamsMatches(result);
              /* Set the email content */
              var email_content = {
                html_content:  '<h2>Hey, ' + req.session.curr_user.full_name + '!</h2><br><h3>Your name and institution were recently changed to ' + full_name + ' and ' + institution + '. Didn\'t make these changes? No worries! Reply to this email and we can try to resolve this problem.</h3><br /><img src="cid:tabcore_attach.png" alt="Tabcore" style="display:block; margin-left:auto; margin-right:auto; width: 100%">',
                error_mess: "Error in updating Name and Institution! Please Try again later.",
                success_mess: "Successfully updated First Name, Last Name, and Institution to " + first_name + ", " + last_name + ", and " + institution + "!"
              };
              /* Send the email */
              sendEmail(req, res, email_content, req.session.curr_user.email, result);
            });
          }
        }
      }else{
        var full_name = first_name + " " + last_name;
        /* Update the user's account */
        await db.findOneAndUpdate(User, {_id:req.session.curr_user._id}, {$set: {first_name:first_name, last_name:last_name, full_name:full_name, institution:institution}}, async function(result){
          req.session.curr_user = result;
          updatesTeamsMatches(result);
          /* Set the email content */
          var email_content = {
            html_content:  '<h2>Hey, ' + req.session.curr_user.full_name + '!</h2><br><h3>Your name and institution were recently changed to ' + full_name + ' and ' + institution + '. Didn\'t make these changes? No worries! Reply to this email and we can try to resolve this problem.</h3><br /><img src="cid:tabcore_attach.png" alt="Tabcore" style="display:block; margin-left:auto; margin-right:auto; width: 100%">',
            error_mess: "Error in updating Name and Institution! Please Try again later.",
            success_mess: "Successfully updated First Name, Last Name, and Institution to " + first_name + ", " + last_name + ", and " + institution + "!"
          };
          /* Send the email */
          sendEmail(req, res, email_content, req.session.curr_user.email, result);
        });
      }
    }else{
      goHome(req, res);
    }
  },

  /* Update the password of the user */
  update_password: async function(req, res) {
    reset(req);
    if (req.session.curr_user){
      var curr = sanitize(req.body.current_pass);
      var passOne = sanitize(req.body.password);
      var passTwo = sanitize(req.body.confirm_pass);
      var errors = validationResult(req);
      if (!errors.isEmpty()){
        req.session.settings_fields = {new_user:0, new_mail:0, new_first:0, new_last:0, new_insti:0, pass:1};
        res.redirect('/settings');
        res.end();
      }else{
        if(passOne === passTwo){ /* If new password and confirm password are equal, proceed */
          /* Find the user's account */
          await db.findOne(User, {_id:req.session.curr_user._id}, async function(result){
            if(result){ /* If the user's account is found, proceed */
              /* Check if the entered current password is valid */
              bcrypt.compare(curr, result.password, function(err, equal){
                if(equal){
                  bcrypt.hash(passOne, saltRounds, async function(err, hash){
                    /* Update the account of the user and get the result */
                    await db.findOneAndUpdate(User, {username:req.session.curr_user.username}, {$set: {password:hash}}, async function(result){
                      req.session.curr_user = result;
                      updatesTeamsMatches(result);
                      /* Set the email content */
                      var email_content = {
                        html_content:  '<h2>Hey, ' + req.session.curr_user.full_name + '!</h2><br><h3>Your password was recently changed. Didn\'t change your password? No worries! Reply to this email and we can try to resolve this problem.</h3><br /><img src="cid:tabcore_attach.png" alt="Tabcore" style="display:block; margin-left:auto; margin-right:auto; width: 100%">',
                        error_mess: "Error in updating Password! Please Try again later.",
                        success_mess: "Successfully updated Password!"
                      };
                      /* Send the email */
                      sendEmail(req, res, email_content, req.session.curr_user.email, result);
                    });
                  });
                }else{
                  req.session.settings_fields = {new_user:0, new_mail:0, new_first:0, new_last:0, new_insti:0, pass:1};
                  res.redirect('/settings');
                  res.end();
                }
              });
            }else{
              req.session.message = "Error in updating Password! Please Try again later.";
              goMessage(req, res);
            }
          });
        }else{
          req.session.settings_fields = {new_user:0, new_mail:0, new_first:0, new_last:0, new_insti:0, pass:1};
          res.redirect('/settings');
          res.end();
        }
      }
    }else{
      goHome(req, res);
    }
  },

  /* Load the confirmation page for account deletion */
  deleteAccount: async function(req, res){
    if(req.session.curr_user){
      renderPage(req, res, 'app/settings/deleteAccount', {
        pagename: 'Delete Account',
        curr_user:req.session.curr_user
      });
    }else{
      goHome(req, res);
    }
  },

  /* Delete the user's account */
  confirmDelete: async function(req, res){
    if(req.session.curr_user){
      var userID = req.session.curr_user._id;
      var username = req.session.curr_user.username;
      var full_name = req.session.curr_user.full_name;
      var email = req.session.curr_user.email;

      var fillerUser = {
        username: 'No User',
        first_name: 'No User',
        last_name: 'No User',
        full_name: 'No User',
        email: 'No User',
        institution: 'No User'
      };
      /* Update all of the teams of the user */
      await db.findMany(Team, {"first._id":userID}, async function(result){
        if(result){
          for(i = 0; i < result.length; i++){
            var count = 1;
            var deleteUpdate = {
              teamID: result[i]._id,
              teamname: result[i].teamname,
              update: req.session.curr_user.full_name + " ("+ req.session.curr_user.username +") has deleted their account. [Leader deleted]"
            };
            if(result.second){
              if(result.second.username != 'No User' && !validator.isEmail(result.second.username))
                await db.updateOne(User, {username:result.second.username}, {$push:{"updates":deleteUpdate}});
              else
                count = count + 1;
            }else{
              count = count + 1;
            }
            if(result.third){
              if(result.third.username != 'No User' && !validator.isEmail(result.third.username))
                await db.updateOne(User, {username:result.third.username}, {$push:{"updates":deleteUpdate}});
              else
                count = count + 1;
            }else{
              count = count + 1;
            }
            if(count >= 3){
              await db.deleteOne(Team, {teamname:result[i].teamname});
            }else{
              await db.updateOne(Team, {teamname:result[i].teamname}, {$set:{"first":fillerUser}});
            }
          }
        }
      });
      await db.findMany(Team, {"second._id":userID}, async function(result){
        if(result){
          for(i = 0; i < result.length; i++){
            var count = 1;
            var deleteUpdate = {
              teamID: result[i]._id,
              teamname: result[i].teamname,
              update: req.session.curr_user.full_name + " ("+ req.session.curr_user.username +") has deleted their account. [Deputy Leader deleted]"
            };
            if(result.first){
              if(result.second.username != 'No User' && !validator.isEmail(result.first.username))
                await db.updateOne(User, {username:result.first.username}, {$push:{"updates":deleteUpdate}});
              else
                count = count + 1;
            }else{
              count = count + 1;
            }
            if(result.third){
              if(result.third.username != 'No User' && !validator.isEmail(result.third.username))
                await db.updateOne(User, {username:result.third.username}, {$push:{"updates":deleteUpdate}});
              else
                count = count + 1;
            }else{
              count = count + 1;
            }
            if(count >= 3){
              await db.deleteOne(Team, {teamname:result[i].teamname});
            }else{
              await db.updateOne(Team, {teamname:result[i].teamname}, {$set:{"second":fillerUser}});
            }
          }
        }
      });
      await db.findMany(Team, {"third._id":userID}, async function(result){
        if(result){
          for(i = 0; i < result.length; i++){
            var count = 1;
            var deleteUpdate = {
              teamID: result[i]._id,
              teamname: result[i].teamname,
              update: req.session.curr_user.full_name + " ("+ req.session.curr_user.username +") has deleted their account. [Whip deleted]"
            };
            if(result.first){
              if(result.second.username != 'No User' && !validator.isEmail(result.first.username))
                await db.updateOne(User, {username:result.first.username}, {$push:{"updates":deleteUpdate}});
              else
                count = count + 1;
            }else{
              count = count + 1;
            }
            if(result.second){
              if(result.second.username != 'No User' && !validator.isEmail(result.second.username))
                await db.updateOne(User, {username:result.second.username}, {$push:{"updates":deleteUpdate}});
              else
                count = count + 1;
            }else{
              count = count + 1;
            }
            if(count >= 3){
              await db.deleteOne(Team, {teamname:result[i].teamname});
            }else{
              await db.updateOne(Team, {teamname:result[i].teamname}, {$set:{"third":fillerUser}});
            }
          }
        }
      });
      /* Set the email content */
      const mailDetails = {
        from: 'tabcore.ccapdev@gmail.com',
        to: email,
        subject: 'Farewell from Tabcore',
        text: "Hey, " + full_name + "!\n\nFarewell from Tabcore!",
        html: '<h2>Hey, ' + full_name + '!</h2><br><br /><img src="cid:tabcore_attach.gif" alt="Welcome" style="display:block; margin-left:auto; margin-right:auto; width: 50%">',
        attachments: [{
          filename: 'TABCORE_DELETED.gif',
          path: __dirname + '/../views/assets/img/delete/TABCORE_DELETED.gif',
          cid: 'tabcore_attach.gif'
        }]
      };
      /* Send a farewell message through email */
      transpo.sendMail(mailDetails, async function(err, result){
        if(err){
          req.session.message = "Error in Deleting Account! Please Try again later.";
          goMessage(req, res);
        }else{
          await db.deleteOne(User, {username:username});
          req.session.destroy((err)=>{
            if(err) throw err;
          });
          req.logout();
          res.render('app/settings/confirmDelete', {
            pagedetails:{pagename: 'Account Deleted'},
          });
          res.end();
        }
      });
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

/* Redirect to message page */
function goMessage(req, res){
  req.session.pagename = "Profile Settings";
  req.session.header = "Profile Settings";
  req.session.link = '/settings'
  req.session.back = "Profile Settings";
  res.redirect('/message');
  res.end();
}

/* Redirect to the index/home page */
function goHome(req, res){
  res.redirect('/');
  res.end();
}

/* Update both email and user */
async function updateUserMail(req, res, uname, mail){
  /* Find the user's account */
  await db.findOne(User, {_id:req.session.curr_user._id}, async function(result){
    if(result){
      /* See if there are any users registered with the username and/or email entered */
      await db.findOne(User, {username:uname}, async function(found_user){
        await db.findOne(User, {email:mail}, async function(found_email){
          if(found_user || found_email){ /* if no user is registered with the indicated username and email, proceed with the process */
            if(found_user){
              req.session.settings_fields.new_user = 1;
            }
            if(found_email){
              req.session.settings_fields.new_mail = 1;
            }
            res.redirect('/settings');
            res.end();
          }else{ /* Update the account of the user and get the result */
            await db.findOneAndUpdate(User, {username:req.session.curr_user.username}, {$set: {username:uname, email: mail}}, async function(result){
              req.session.curr_user = result;
              updatesTeamsMatches(result);
              /* Set the email content */
              var email_content = {
                text_content: "Hey, " + req.session.curr_user.full_name + "!\n\nYour email and username were recently changed to " + mail + " and " + uname + ".",
                html_content: '<h2>Hey, ' + req.session.curr_user.full_name + '!</h2><br><h3>Your email and username were recently changed to ' + mail + ' and ' + uname + '. Didn\'t make these changes? No worries! Reply to this email and we can try to resolve this problem.</h3><br /><img src="cid:tabcore_attach.png" alt="Tabcore" style="display:block; margin-left:auto; margin-right:auto; width: 100%">',
                error_mess: "Error in updating Email and username! Please Try again later.",
                success_mess: "Successfully updated Email and username to " + mail + " and " + uname + "!"
              };
              /* Send the email */
              sendEmail(req, res, email_content, req.session.curr_user.email, result);
            });
          }
        });
      });
    }else{ /* If the user's account cannot be found, bring up an error message */
      req.session.message = "Error in updating Email and username! Please Try again later.";
      goMessage(req, res);
    }
  });
}

/* Update the teams and matches */
async function updatesTeamsMatches(updated){
  await db.updateMany(Team, {"first._id":req.session.curr_user._id}, {$set:{"first":updated}});
  await db.updateMany(Team, {"second._id":req.session.curr_user._id}, {$set:{"second":updated}});
  await db.updateMany(Team, {"third._id":req.session.curr_user._id}, {$set:{"third":updated}});
  await db.updateMany(Match, {"gov.first._id":req.session.curr_user._id}, {$set:{"gov.first":updated}});
  await db.updateMany(Match, {"gov.second._id":req.session.curr_user._id}, {$set:{"gov.second":updated}});
  await db.updateMany(Match, {"gov.third._id":req.session.curr_user._id}, {$set:{"gov.third":updated}});
  await db.updateMany(Match, {"opp.first._id":req.session.curr_user._id}, {$set:{"opp.first":updated}});
  await db.updateMany(Match, {"opp.second._id":req.session.curr_user._id}, {$set:{"opp.second":updated}});
  await db.updateMany(Match, {"opp.third._id":req.session.curr_user._id}, {$set:{"opp.third":updated}});
}

/* Send email notification about changes */
async function sendEmail(req, res, email_content, mail, updated){
  /* Set the email content */
  const mailDetails = {
    to: mail,
    subject: 'Changes in Profile',
    text: email_content.text_content,
    html: email_content.html_content,
    attachments: [{
      filename: 'TABCORE_FOOTER.png',
      path: __dirname + '/../views/assets/img/email/TABCORE_FOOTER.png',
      cid: 'tabcore_attach.png'
    }]
  };
  /* Send the email */
  transpo.sendMail(mailDetails, async function(err, result){
    if(err){
      console.log(err);
      req.session.message = email_content.error_mess;
      goMessage(req, res);
    }else{
      req.session.message = email_content.success_mess;
      goMessage(req, res);
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

module.exports = settings_controller;
