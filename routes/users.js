var express = require('express');
var sanitize = require('mongo-sanitize');
var app = express();

/* Helpers */
var register_helper = require('../helpers/register_helper.js');
var login_helper = require('../helpers/login_helper.js');
var guest_login_helper = require('../helpers/guest_login_helper.js');
var settings_helper = require('../helpers/settings_helper.js');
var create_helper = require('../helpers/create_helper.js');
var edit_helper = require('../helpers/edit_helper.js');
var team_helper = require('../helpers/team_helper.js');
var round_helper = require('../helpers/round_helper.js');
var stats_helper = require('../helpers/stats_helper.js');
var grade_helper = require('../helpers/grade_helper.js');

/* Controllers */
var home_controller = require('../controller/home_controller.js');
var settings_controller = require('../controller/settings_controller.js');
var team_controller = require('../controller/team_controller.js');
var stats_controller = require('../controller/stats_controller.js');
var new_controller = require('../controller/new_controller.js');
var ongoing_controller = require('../controller/ongoing_controller.js');

/* Favicon.ico */
app.get('/favicon.ico', home_controller.getFavicon);

/* Index / Home Page */
app.get('/', home_controller.getIndex);
app.post('/', home_controller.getIndex);
app.get('/index', home_controller.getIndex);
app.post('/index', home_controller.getIndex);

/* Login as a registered user */
app.get('/login', home_controller.getLogin);
app.post('/login', login_helper.loginValidation(), home_controller.postLogin);

/* Guest specific routes */
app.get('/guestLogin', guest_login_helper.guestLoginValidation(), home_controller.getGuest);
app.post('/guestLogin', home_controller.postGuest);
app.get('/guestName', home_controller.guestName);
app.post('/guestName', home_controller.guestName);
app.get('/addName', home_controller.addName);
app.post('/addName', guest_login_helper.guestNameValidation(), home_controller.addName);
app.get('/guestDashboard', home_controller.guestDashboard);
app.post('/guestDashboard', home_controller.guestDashboard);

/* Register as a new user */
app.get('/register', home_controller.getRegister);
app.post('/register', register_helper.registerValidation(), home_controller.postRegister);
app.get('/checkUsername', home_controller.checkUsername);
app.get('/checkEmail', home_controller.checkEmail);
app.get('/welcome', home_controller.welcome);
app.post('/welcome', home_controller.welcome);

/* Dashboard of a registered user */
app.get('/dashboard', home_controller.dashboard);
app.post('/dashboard', home_controller.dashboard);

/* Logout of a registered account */
app.get('/logout', home_controller.getLogout);

/* Messages that may appear for various reasons */
app.get('/message', home_controller.displayMessage);
app.post('/message', home_controller.displayMessage);

/* Profile settings of a registered user */
app.get('/settings', settings_controller.getSettings);
app.post('/settings', settings_controller.getSettings);
app.get('/settings/user', settings_controller.getSettings);
app.post('/settings/user', settings_helper.userValidation(), settings_controller.update_user);
app.get('/settings/personal', settings_controller.getSettings);
app.post('/settings/personal', settings_helper.personalValidation(), settings_controller.update_personal);
app.get('/settings/password', settings_controller.getSettings);
app.post('/settings/password', settings_helper.passValidation(), settings_controller.update_password);

/* Deleting a registered account */
app.get('/deleteAccount', settings_controller.deleteAccount);
app.post('/deleteAccount', settings_controller.deleteAccount);
app.get('/confirmDelete', settings_controller.confirmDelete);
app.post('/confirmDelete', settings_controller.confirmDelete);

/* Teams Dashboard of a registered user */
app.get('/teamPage', team_controller.teamPage);
app.post('/teamPage', team_controller.teamPage);

/* Creating a team */
app.get('/createTeam', team_controller.createTeam);
app.post('/createTeam', team_controller.createTeam);
app.get('/checkName', team_controller.checkName);
app.get('/checkUsers', team_controller.checkUsers);
app.get('/checkUserEmail', team_controller.checkUserEmail);
app.get('/checkTeam', team_controller.checkTeam);
app.get('/checkInfo', create_helper.createValidation(), team_controller.checkInfo);
app.post('/checkInfo', create_helper.createValidation(), team_controller.checkInfo);

/* Getting the list of teams a user is a part of */
app.get('/teamList', team_controller.teamList);
app.post('/teamList', team_controller.teamList);

/* See the information about a team */
app.get('/teamInfo', team_helper.teamIDValidation(), team_controller.teamInfo);
app.post('/teamInfo', team_helper.teamIDValidation(), team_controller.teamInfo);

/* See all the team updates of a registered user */
app.get('/teamUpdates', team_controller.teamUpdates);
app.post('/teamUpdates', team_controller.teamUpdates);

/* Edit any team */
app.get('/chooseTeam', team_controller.chooseTeam);
app.post('/chooseTeam', team_controller.chooseTeam);
app.get('/editTeams', team_helper.editTeamValidation(), team_controller.editTeams);
app.post('/editTeams', team_helper.editTeamValidation(), team_controller.editTeams);
app.get('/editChosenTeam', team_controller.editChosenTeam);
app.post('/editChosenTeam', edit_helper.editValidation(), team_controller.editChosenTeam);

/* Leave a team */
app.get('/confirmLeave', team_helper.teamIDValidation(), team_controller.confirmLeave);
app.post('/confirmLeave', team_helper.teamIDValidation(), team_controller.confirmLeave);
app.get('/leaveTeam', team_helper.teamIDValidation(), team_controller.leaveTeam);
app.post('/leaveTeam', team_helper.teamIDValidation(), team_controller.leaveTeam);

/* Delete a Team Update */
app.get('/deleteUpdate', team_helper.indexValidation(), team_controller.deleteUpdate);
app.post('/deleteUpdate', team_helper.indexValidation(), team_controller.deleteUpdate);
app.get('/deleteAllTeamUpdates', team_helper.teamIDValidation(), team_controller.deleteAllTeamUpdates);
app.post('/deleteAllTeamUpdates', team_helper.teamIDValidation(), team_controller.deleteAllTeamUpdates);
app.get('/confirmDeleteAllTeam', team_helper.teamIDValidation(), team_controller.confirmDeleteAllTeam);
app.post('/confirmDeleteAllTeam', team_helper.teamIDValidation(), team_controller.confirmDeleteAllTeam);
app.get('/deleteAllUpdates', team_controller.deleteAllUpdates);
app.post('/deleteAllUpdates', team_controller.deleteAllUpdates);
app.get('/confirmDeleteAll', team_controller.confirmDeleteAll);
app.post('/confirmDeleteAll', team_controller.confirmDeleteAll);

/* Delete a Team */
app.get('/confirmDeleteTeam', team_helper.teamIDValidation(), team_controller.confirmDeleteTeam);
app.post('/confirmDeleteTeam',team_helper.teamIDValidation(),  team_controller.confirmDeleteTeam);
app.get('/deleteTeam', team_helper.teamIDValidation(), team_controller.deleteTeam);
app.post('/deleteTeam', team_helper.teamIDValidation(), team_controller.deleteTeam);

/* Find a Round's Statistics */
app.get('/roundStats', stats_controller.getStats);
app.post('/roundStats', stats_controller.getStats);

/* See a Round's Statistics */
app.get('/roundroomStatistics', stats_helper.statsValidation(), stats_controller.roundStats);
app.post('/roundroomStatistics', stats_helper.statsValidation(), stats_controller.roundStats);

/* See all of a user's previous matches */
app.get('/roundHistory', stats_controller.roundHistory);
app.post('/roundHistory', stats_controller.roundHistory);

/* Create a New Round or Continue creating / editing a round */
app.get('/createRound', new_controller.createRound);
app.post('/createRound', new_controller.createRound);
app.get('/roundsCreated', new_controller.roundsCreated);
app.post('/roundsCreated', new_controller.roundsCreated);
app.get('/startNew', new_controller.startNew);
app.post('/startNew', new_controller.startNew);
app.get('/matchInfo', round_helper.createRoundValidation(), new_controller.matchInfo);
app.post('/matchInfo', round_helper.createRoundValidation(), new_controller.matchInfo);
app.get('/adjudicatorInfo', new_controller.adjudicatorInfo);
app.post('/adjudicatorInfo', new_controller.adjudicatorInfo);
app.get('/matchAdjudicator', round_helper.adjValidation(), new_controller.matchAdjudicator);
app.post('/matchAdjudicator', round_helper.adjValidation(), new_controller.matchAdjudicator);
app.get('/checkMatch', new_controller.checkMatch);
app.get('/currentInfo',  round_helper.roundIDValidation(), new_controller.currentInfo);
app.post('/currentInfo', round_helper.roundIDValidation(), new_controller.currentInfo);
app.get('/editRound', round_helper.roundIDValidation(), new_controller.editRound);
app.post('/editRound', round_helper.roundIDValidation(), new_controller.editRound);

/* Delete / cancel a round that a registered user is creating / editing */
app.get('/cancelRound', round_helper.roundIDValidation(), new_controller.cancelRound);
app.post('/cancelRound', round_helper.roundIDValidation(), new_controller.cancelRound);
app.get('/deleteRound', round_helper.roundIDValidation(), new_controller.deleteRound);
app.post('/deleteRound', round_helper.roundIDValidation(), new_controller.deleteRound);
app.get('/deleteAllPending', new_controller.deleteAllPending);
app.post('/deleteAllPending', new_controller.deleteAllPending);
app.get('/confirmDeleteAllPending', new_controller.confirmDeleteAllPending);
app.post('/confirmDeleteAllPending', new_controller.confirmDeleteAllPending);

/* Find a round to join */
app.get('/findRound', ongoing_controller.findRound);
app.post('/findRound', ongoing_controller.findRound);

/* Ongoing Round */
app.get('/confirmRoundInfo', round_helper.roundIDValidation(), ongoing_controller.confirmRoundInfo);
app.post('/confirmRoundInfo', round_helper.roundIDValidation(), ongoing_controller.confirmRoundInfo);
app.get('/ongoingRound', round_helper.roundIDValidation(), ongoing_controller.ongoingRound);
app.post('/ongoingRound', round_helper.roundIDValidation(), ongoing_controller.ongoingRound);
app.put('/ongoingRound/updateStatus/:id', ongoing_controller.updateStatus);
app.put('/ongoingRound/updateSpeaker/:id', ongoing_controller.updateSpeaker);

/* End of a Round */
app.get('/endRound', round_helper.roundIDValidation(), ongoing_controller.endRound);
app.post('/endRound', round_helper.roundIDValidation(), ongoing_controller.endRound);

/* Find and Grade a finished round */
app.get('/findGrade', ongoing_controller.findGrade);
app.post('/findGrade', ongoing_controller.findGrade);
app.get('/gradeRound', round_helper.roundIDValidation(), ongoing_controller.gradeRound);
app.post('/gradeRound', round_helper.roundIDValidation(), ongoing_controller.gradeRound);

/* Save the scores and comments for a round as an adjudicator */
app.get('/teamScores', grade_helper.gradeValidation(), ongoing_controller.teamScores);
app.post('/teamScores', grade_helper.gradeValidation(), ongoing_controller.teamScores);

module.exports = app;
