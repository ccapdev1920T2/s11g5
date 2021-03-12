const mongoose = require('mongoose');

var UserSchema = require('./user_model.js');

var TeamSchema = new mongoose.Schema({
  teamname: String,
  first: {type: Object, ref: 'users'},
  second: {type: Object, ref: 'users'},
  third: {type: Object, ref: 'users'},
  numdebates: Number,
  wins: mongoose.Mixed,
  loses: mongoose.Mixed,
  draws: mongoose.Mixed,
  rawWins: Number,
  rawLose: Number,
  rawDraw: Number,
  wlratio: mongoose.Mixed,
  status: String
});


// Export the model
module.exports = mongoose.model('teams', TeamSchema);
