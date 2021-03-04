var express = require('express');
var sanitize = require('mongo-sanitize');
var app = express();

/* Home Controller */
var home_controller = require('../controller/home_controller.js');

/* Settings Controller */
var settings_controller = require('../controller/settings_controller.js');

/* Team Controller */
var team_controller = require('../controller/team_controller.js');

/* Statistics Controller */
var stats_controller = require('../controller/stats_controller.js');

/* New Round Controller */
var new_controller = require('../controller/new_controller.js');

/* Ongoing Controller */
var ongoing_controller = require('../controller/ongoing_controller.js');

/* Index / Home Page */
app.get('/', home_controller.getIndex);
app.post('/', home_controller.getIndex);
app.get('/index', home_controller.getIndex);
app.post('/index', home_controller.getIndex);

/* Login as a registered user */
app.get('/login', home_controller.getLogin);
app.post('/login', home_controller.postLogin);

/* Guest specific routes */
app.get('/guestLogin', home_controller.getGuest);
app.post('/guestLogin', home_controller.postGuest);
app.get('/guestName', home_controller.guestName);
app.post('/guestName', home_controller.guestName);
app.get('/addName', home_controller.addName);
app.post('/addName', home_controller.addName);
app.get('/guestDashboard', home_controller.guestDashboard);
app.post('/guestDashboard', home_controller.guestDashboard);

/* Register as a new user */
app.get('/register', home_controller.getRegister);
app.post('/register', home_controller.postRegister);
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
app.post('/settings/user', settings_controller.update_user);
app.get('/settings/personal', settings_controller.getSettings);
app.post('/settings/personal', settings_controller.update_personal);
app.get('/settings/password', settings_controller.getSettings);
app.post('/settings/password', settings_controller.update_password);

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
app.get('/checkInfo', team_controller.checkInfo);
app.post('/checkInfo', team_controller.checkInfo);

/* Getting the list of teams a user is a part of */
app.get('/teamList', team_controller.teamList);
app.post('/teamList', team_controller.teamList);

/* See the information about a team */
app.get('/teamInfo', team_controller.teamInfo);
app.post('/teamInfo', team_controller.teamInfo);

/* See all the team updates of a registered user */
app.get('/teamUpdates', team_controller.teamUpdates);
app.post('/teamUpdates', team_controller.teamUpdates);

/* Edit any team */
app.get('/chooseTeam', team_controller.chooseTeam);
app.post('/chooseTeam', team_controller.chooseTeam);
app.get('/editTeams', team_controller.editTeams);
app.post('/editTeams', team_controller.editTeams);
app.get('/editChosenTeam', team_controller.editChosenTeam);
app.post('/editChosenTeam', team_controller.editChosenTeam);

/* Leave a team */
app.get('/confirmLeave', team_controller.confirmLeave);
app.post('/confirmLeave', team_controller.confirmLeave);
app.get('/leaveTeam', team_controller.leaveTeam);
app.post('/leaveTeam', team_controller.leaveTeam);

/* Delete a Team Update */
app.get('/deleteUpdate', team_controller.deleteUpdate);
app.post('/deleteUpdate', team_controller.deleteUpdate);
app.get('/deleteAllUpdates', team_controller.deleteAllUpdates);
app.post('/deleteAllUpdates', team_controller.deleteAllUpdates);
app.get('/confirmDeleteAll', team_controller.confirmDeleteAll);
app.post('/confirmDeleteAll', team_controller.confirmDeleteAll);

/* Delete a Team */
app.get('/confirmDeleteTeam', team_controller.confirmDeleteTeam);
app.post('/confirmDeleteTeam', team_controller.confirmDeleteTeam);
app.get('/deleteTeam', team_controller.deleteTeam);
app.post('/deleteTeam', team_controller.deleteTeam);

/* Find a Round's Statistics */
app.get('/roundStats', stats_controller.getStats);
app.post('/roundStats', stats_controller.getStats);

/* See a Round's Statistics */
app.get('/roundroomStatistics', stats_controller.roundStats);
app.post('/roundroomStatistics', stats_controller.roundStats);

/* See all of a user's previous matches */
app.get('/matchHistory', stats_controller.matchHistory);
app.post('/matchHistory', stats_controller.matchHistory);

/* Create a New Round or Continue creating / editing a round */
app.get('/createRound', new_controller.createRound);
app.post('/createRound', new_controller.createRound);
app.get('/roundsCreated', new_controller.roundsCreated);
app.post('/roundsCreated', new_controller.roundsCreated);
app.get('/startNew', new_controller.startNew);
app.post('/startNew', new_controller.startNew);
app.get('/matchInfo', new_controller.matchInfo);
app.post('/matchInfo', new_controller.matchInfo);
app.get('/adjudicatorInfo', new_controller.adjudicatorInfo);
app.post('/adjudicatorInfo', new_controller.adjudicatorInfo);
app.get('/matchAdjudicator', new_controller.matchAdjudicator);
app.post('/matchAdjudicator', new_controller.matchAdjudicator);
app.get('/currentInfo', new_controller.currentInfo);
app.post('/currentInfo', new_controller.currentInfo);
app.get('/editRound', new_controller.editRound);
app.post('/editRound', new_controller.editRound);

/* Delete / cancel a round that a registered user is creating / editing */
app.get('/cancelRound', new_controller.cancelRound);
app.post('/cancelRound', new_controller.cancelRound);
app.get('/deleteRound', new_controller.deleteRound);
app.post('/deleteRound', new_controller.deleteRound);
app.get('/deleteAllPending', new_controller.deleteAllPending);
app.post('/deleteAllPending', new_controller.deleteAllPending);
app.get('/confirmDeleteAllPending', new_controller.confirmDeleteAllPending);
app.post('/confirmDeleteAllPending', new_controller.confirmDeleteAllPending);

/* Find a round to join */
app.get('/findRound', ongoing_controller.findRound);
app.post('/findRound', ongoing_controller.findRound);

/* Ongoing Round */
app.get('/confirmRoundInfo', ongoing_controller.confirmRoundInfo);
app.post('/confirmRoundInfo', ongoing_controller.confirmRoundInfo);
app.get('/ongoingRound', ongoing_controller.ongoingRound);
app.post('/ongoingRound', ongoing_controller.ongoingRound);
app.put('/ongoingRound/updateStatus/:id', ongoing_controller.updateStatus);
app.put('/ongoingRound/updateSpeaker/:id', ongoing_controller.updateSpeaker);

/* End of a Round */
app.get('/endRound', ongoing_controller.endRound);
app.post('/endRound', ongoing_controller.endRound);

/* Find and Grade a finished round */
app.get('/findGrade', ongoing_controller.findGrade);
app.post('/findGrade', ongoing_controller.findGrade);
app.get('/gradeRound', ongoing_controller.gradeRound);
app.post('/gradeRound', ongoing_controller.gradeRound);

/* Save the scores and comments for a round as an adjudicator */
app.get('/teamScores', ongoing_controller.teamScores);
app.post('/teamScores', ongoing_controller.teamScores);

module.exports = app;
