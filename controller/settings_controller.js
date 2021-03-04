const crypto = require('crypto');
const db = require('../models/db.js');
const user_collection = 'user';
const teams_collection = 'teams';
const match_collection = 'match';
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
      var validUser = 0, validMail = 0;
      /* Check the format of the username and/or email entered */
      if(uname){
        if(!userFormat.test(uname)){
          validUser = 1;
        }
      }
      if(mail){
        if(!emailFormat.test(mail)){
          validMail = 1;
        }
      }
      if(validUser == 0 && validMail == 0){
        if(uname.length < 1){
          if(mail.length < 1){
            /* if no username or email were entered, redirect back to the settings page */
            reset(req);
            res.redirect('/settings');
            res.end();
          }else{ /* if there was no username entered but an email was entered, check the email entered */
            /* Find the user's account */
            await db.findOne(user_collection, {username:req.session.curr_user.username}, async function(result){
              if(result){
                await db.findOne(user_collection, {email:mail}, async function(found){
                  /* if no user is registered with the indicated email, proceed with the process */
                  if(found){
                    req.session.settings_fields = {new_user:0, new_mail:1, new_first:0, new_last:0, new_insti:0, pass:0};
                    res.redirect('/settings');
                    res.end();
                  }else{ /* Update the account of the user and get the result */
                    await db.findOneAndUpdate(user_collection, {username:req.session.curr_user.username}, {$set: {email:mail}}, async function(updated){
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
          }
        }else{
          if(mail.length < 1){ /* if there was no email entered but a username was entered, check the username entered */
            /* Find the user's account */
            await db.findOne(user_collection, {email:req.session.curr_user.email}, async function(result){
              if(result){
                await db.findOne(user_collection, {username:uname}, async function(found){
                  if(found){ /* if no user is registered with the indicated username, proceed with the process */
                    req.session.settings_fields = {new_user:1, new_mail:0, new_first:0, new_last:0, new_insti:0, pass:0};
                    res.redirect('/settings');
                    res.end();
                  }else{ /* Update the account of the user and get the result */
                    await db.findOneAndUpdate(user_collection, {username:req.session.curr_user.username}, {$set: {username:uname}}, async function(result){
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
          }else{ /* if there was a username and email entered, check the both entered */
            /* Find the user's account */
            await db.findOne(user_collection, {username:req.session.curr_user.username}, async function(result){
              if(result){
                /* See if there are any users registered with the username and/or email entered */
                await db.findOne(user_collection, {username:uname}, async function(found_user){
                  await db.findOne(user_collection, {email:mail}, async function(found_email){
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
                      await db.findOneAndUpdate(user_collection, {username:req.session.curr_user.username}, {$set: {username:uname, email: mail}}, async function(result){
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
        }
      }else{
        req.session.settings_fields = {new_user:validUser, new_mail:validMail, new_first:0, new_last:0, new_insti:0, pass:0};
        res.redirect('/settings');
        res.end();
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
      if(first_name.length >= 1 || last_name.length >= 1 || institution.length >= 1){
        var firstName = 0, lastName = 0, inSti = 0;
        if(first_name){
          /* Check if the first name entered contains only letters and spaces */
          if (!nameFormat.test(first_name)){
            firstName = 1;
          }
        }
        if(last_name){
          /* Check if the first name entered contains only letters and spaces */
          if (!nameFormat.test(last_name)){
            lastName = 1;
          }
        }
        if(institution){
          /* Check if the first name entered contains only letters and spaces */
          if (!nameFormat.test(institution)){
            inSti = 1;
          }
        }
        if(firstName == 1 || lastName == 1 || inSti == 1){
          req.session.settings_fields = {new_user:0, new_mail:0, new_first:firstName, new_last:lastName, new_insti:inSti, pass:0};
          res.redirect('/settings');
          res.end();
        }else{
          if(first_name.length >= 1){
            if(last_name.length >= 1){
              if(institution.length >= 1){
                var full_name = first_name + " " + last_name;
                /* Update the user's account */
                await db.findOneAndUpdate(user_collection, {username:req.session.curr_user.username}, {$set: {first_name:first_name, last_name:last_name, full_name:full_name, institution:institution}}, async function(result){
                  /* Set the email content */
                  var email_content = {
                    html_content:  '<h2>Hey, ' + req.session.curr_user.full_name + '!</h2><br><h3>Your name and institution were recently changed to ' + full_name + ' and ' + institution + '. Didn\'t make these changes? No worries! Reply to this email and we can try to resolve this problem.</h3><br /><img src="cid:tabcore_attach.png" alt="Tabcore" style="display:block; margin-left:auto; margin-right:auto; width: 100%">',
                    error_mess: "Error in updating Name and Institution! Please Try again later.",
                    success_mess: "Successfully updated First Name, Last Name, and Institution to " + first_name + ", " + last_name + ", and " + institution + "!"
                  };
                  /* Send the email */
                  sendEmail(req, res, email_content, req.session.curr_user.email, result);
                });
              }else{
                var full_name = first_name + " " + last_name;
                /* Update the user's account */
                await db.findOneAndUpdate(user_collection, {username:req.session.curr_user.username}, {$set: {first_name:first_name, last_name:last_name, full_name:full_name}}, async function(result){
                  /* Set the email content */
                  var email_content = {
                    html_content:  '<h2>Hey, ' + req.session.curr_user.full_name + '!</h2><br><h3>Your name was recently changed to ' + full_name + '. Didn\'t make these changes? No worries! Reply to this email and we can try to resolve this problem.</h3><br /><img src="cid:tabcore_attach.png" alt="Tabcore" style="display:block; margin-left:auto; margin-right:auto; width: 100%">',
                    error_mess: "Error in updating Name! Please Try again later.",
                    success_mess: "Successfully updated First Name and Last Name to " + first_name + " and " + last_name + "!"
                  };
                  /* Send the email */
                  sendEmail(req, res, email_content, req.session.curr_user.email, result);
                });
              }
            }else{
              var full_name = first_name + " " + req.session.curr_user.last_name;
              /* Update the user's account */
              await db.findOneAndUpdate(user_collection, {username:req.session.curr_user.username}, {$set: {first_name:first_name, full_name:full_name}}, async function(result){
                /* Set the email content */
                var email_content = {
                  html_content:  '<h2>Hey, ' + req.session.curr_user.full_name + '!</h2><br><h3>Your name was recently changed to ' + full_name + '. Didn\'t make these changes? No worries! Reply to this email and we can try to resolve this problem.</h3><br /><img src="cid:tabcore_attach.png" alt="Tabcore" style="display:block; margin-left:auto; margin-right:auto; width: 100%">',
                  error_mess: "Error in updating Name! Please Try again later.",
                  success_mess: "Successfully updated First Name to " + first_name + "!"
                };
                /* Send the email */
                sendEmail(req, res, email_content, req.session.curr_user.email, result);
              });
            }
          }else if(last_name.length >= 1){
            if(institution.length >= 1){
              var full_name = req.session.curr_user.first_name + " " + last_name;
              /* Update the user's account */
              await db.findOneAndUpdate(user_collection, {username:req.session.curr_user.username}, {$set: {last_name:last_name, institution:institution, full_name:full_name}}, async function(result){
                /* Set the email content */
                var email_content = {
                  html_content:  '<h2>Hey, ' + req.session.curr_user.full_name + '!</h2><br><h3>Your name and institution were recently changed to ' + full_name + ' and ' + institution + '. Didn\'t make these changes? No worries! Reply to this email and we can try to resolve this problem.</h3><br /><img src="cid:tabcore_attach.png" alt="Tabcore" style="display:block; margin-left:auto; margin-right:auto; width: 100%">',
                  error_mess: "Error in updating Name and Institution! Please Try again later.",
                  success_mess: "Successfully updated Last Name and Institution to " + last_name + " and " + institution + "!"
                };
                /* Send the email */
                sendEmail(req, res, email_content, req.session.curr_user.email, result);
              });
            }else{
              var full_name = req.session.curr_user.first_name + " " + last_name;
              /* Update the user's account */
              await db.findOneAndUpdate(user_collection, {username:req.session.curr_user.username}, {$set: {last_name:last_name}}, async function(result){
                /* Set the email content */
                var email_content = {
                  html_content:  '<h2>Hey, ' + req.session.curr_user.full_name + '!</h2><br><h3>Your name was recently changed to ' + full_name + '. Didn\'t make these changes? No worries! Reply to this email and we can try to resolve this problem.</h3><br /><img src="cid:tabcore_attach.png" alt="Tabcore" style="display:block; margin-left:auto; margin-right:auto; width: 100%">',
                  error_mess: "Error in updating Name! Please Try again later.",
                  success_mess: "Successfully updated Last Name to " + last_name + "!"
                };
                /* Send the email */
                sendEmail(req, res, email_content, req.session.curr_user.email, result);
              });
            }
          }else if(institution.length >= 1){
            /* Update the user's account */
            await db.findOneAndUpdate(user_collection, {username:req.session.curr_user.username}, {$set: {institution:institution}}, async function(result){
              /* Set the email content */
              var email_content = {
                html_content:  '<h2>Hey, ' + req.session.curr_user.full_name + '!</h2><br><h3>Your institution was recently changed to ' + institution + '. Didn\'t make these changes? No worries! Reply to this email and we can try to resolve this problem.</h3><br /><img src="cid:tabcore_attach.png" alt="Tabcore" style="display:block; margin-left:auto; margin-right:auto; width: 100%">',
                error_mess: "Error in updating Institution! Please Try again later.",
                success_mess: "Successfully updated Institution to " + institution + "!"
              };
              /* Send the email */
              sendEmail(req, res, email_content, req.session.curr_user.email, result);
            });
          }else{
            res.redirect('/settings');
            res.end();
          }
        }
      }else{
        res.redirect('/settings');
        res.end();
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
      /* If not all are filled up, redirect back to the settings page */
      if(curr.length < 1 || passOne.length < 1 || passTwo.length < 1){
        req.session.settings_fields = {new_user:0, new_mail:0, new_first:0, new_last:0, new_insti:0, pass:1};
        res.redirect('/settings');
        res.end();
      }else if(passOne === passTwo){ /* If new password and confirm password are equal, proceed */
        /* Find the user's account */
        await db.findOne(user_collection, {username:req.session.curr_user.username}, async function(result){
          if(result){ /* If the user's account is found, proceed */
            var given_salt = result.password.salt;
            var pass = result.password.newPassword;
            /* Check if the entered current password is valid */
            if(checkHash(pass, curr, given_salt)){
              /* Check if the new password and confirm password entered are 8 characters or more and do not contain whitespaces or any invalid characters */
              if (passOne.length < 8 || passTwo.length < 8){
                req.session.settings_fields = {new_user:0, new_mail:0, new_first:0, new_last:0, new_insti:0, pass:1};
                res.redirect('/settings');
                res.end();
              }else{
                var updated_pass = createHash(passOne);
                /* Update the account of the user and get the result */
                await db.findOneAndUpdate(user_collection, {username:req.session.curr_user.username}, {$set: {password:updated_pass}}, async function(result){
                  /* Set the email content */
                  var email_content = {
                    html_content:  '<h2>Hey, ' + req.session.curr_user.full_name + '!</h2><br><h3>Your password was recently changed. Didn\'t change your password? No worries! Reply to this email and we can try to resolve this problem.</h3><br /><img src="cid:tabcore_attach.png" alt="Tabcore" style="display:block; margin-left:auto; margin-right:auto; width: 100%">',
                    error_mess: "Error in updating Password! Please Try again later.",
                    success_mess: "Successfully updated Password!"
                  };
                  /* Send the email */
                  sendEmail(req, res, email_content, req.session.curr_user.email, result);
                });
              }
            }else{
              req.session.settings_fields = {new_user:0, new_mail:0, new_first:0, new_last:0, new_insti:0, pass:1};
              res.redirect('/settings');
              res.end();
            }
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
      var username = req.session.curr_user.username;
      var full_name = req.session.curr_user.full_name;
      var email = req.session.curr_user.email;
      var fillerUser = {
        username: 'No User',
        full_name: 'No User'
      };
      /* Update all of the teams of the user */
      await db.findMany(teams_collection, {"first.username":username}, async function(result){
        if(result){
          for(i = 0; i < result.length; i++){
            var deleteUpdate = {
              teamname: result[i].teamname,
              update: req.session.curr_user.full_name + " ("+ req.session.curr_user.username +") has deleted their account. [Leader deleted]"
            };
            updateUpdates(result.first, result.second, result.third, deleteUpdate);
            await db.updateOne(teams_collection, {teamname:result[i].teamname}, {$set:{"first":{username:'No User', full_name:'No User'}}});
          }
        }
      });
      await db.findMany(teams_collection, {"second.username":username}, async function(result){
        if(result){
          for(i = 0; i < result.length; i++){
            var deleteUpdate = {
              teamname: result[i].teamname,
              update: req.session.curr_user.full_name + " ("+ req.session.curr_user.username +") has deleted their account. [Deputy Leader deleted]"
            };
            updateUpdates(result.first, result.second, result.third, deleteUpdate);
            await db.updateOne(teams_collection, {teamname:result[i].teamname}, {$set:{"second":{username:'No User', full_name:'No User'}}});
          }
        }
      });
      await db.findMany(teams_collection, {"third.username":username}, async function(result){
        if(result){
          for(i = 0; i < result.length; i++){
            var deleteUpdate = {
              teamname: result[i].teamname,
              update: req.session.curr_user.full_name + " ("+ req.session.curr_user.username +") has deleted their account. [Whip deleted]"
            };
            updateUpdates(result.first, result.second, result.third, deleteUpdate);
            await db.updateOne(teams_collection, {teamname:result[i].teamname}, {$set:{"third":{username:'No User', full_name:'No User'}}});
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
          req.session.message = "Error in deleting account Please Try again later.";
          goMessage(req, res);
        }else{
          await db.deleteOne(user_collection, {username:username});
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

/* Update the updates array of users */
async function updateUpdates(first, second, third, updateAdd){
  await db.updateOne(user_collection, {username:first.username}, {$push:{"updates":updateAdd}});
  await db.updateOne(user_collection, {username:second.username}, {$push:{"updates":updateAdd}});
  await db.updateOne(user_collection, {username:third.username}, {$push:{"updates":updateAdd}});
}

/* Send email notification about changes */
async function sendEmail(req, res, email_content, mail, updated){
  /* Set the email content */
  const mailDetails = {
    from: 'tabcore.ccapdev@gmail.com',
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
      req.session.message = email_content.error_mess;
      goMessage(req, res);
    }else{
      await db.updateMany(teams_collection, {"first.username":req.session.curr_user.username}, {$set:{"first":updated}});
      await db.updateMany(teams_collection, {"second.username":req.session.curr_user.username}, {$set:{"second":updated}});
      await db.updateMany(teams_collection, {"third.username":req.session.curr_user.username}, {$set:{"third":updated}});
      await db.updateMany(match_collection, {"gov.first.username":req.session.curr_user.username}, {$set:{"gov.first":updated}});
      await db.updateMany(match_collection, {"gov.second.username":req.session.curr_user.username}, {$set:{"gov.second":updated}});
      await db.updateMany(match_collection, {"gov.third.username":req.session.curr_user.username}, {$set:{"gov.third":updated}});
      await db.updateMany(match_collection, {"opp.first.username":req.session.curr_user.username}, {$set:{"opp.first":updated}});
      await db.updateMany(match_collection, {"opp.second.username":req.session.curr_user.username}, {$set:{"opp.second":updated}});
      await db.updateMany(match_collection, {"opp.third.username":req.session.curr_user.username}, {$set:{"opp.third":updated}});
      req.session.curr_user = updated;
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

module.exports = settings_controller;
