const mongoose = require('mongoose');

var TeamSchema = require('./team_model.js')
var UserSchema = require('./user_model.js');

var MatchSchema = new mongoose.Schema({
  status: String,
  roundID: String,
  motion: String,
  gov: {type: Object, ref: 'teams'},
  opp: {type: Object, ref: 'teams'},
  adjudicator: {type: Object, ref: 'users'},
  creator: {type: Object, ref: 'users'},
  creatorRole: String,
  speaker: {name_speaker:String, num_speaker:Number},
  date_Match: String,
  comments: String,
  govFirstScore: Number,
  govSecondScore: Number,
  govThirdScore: Number,
  govTotal: mongoose.Mixed,
  oppFirstScore: Number,
  oppSecondScore: Number,
  oppThirdScore: Number,
  oppTotal: mongoose.Mixed,
  winner: String,
  winner_side: String
});


// Export the model
module.exports = mongoose.model('match', MatchSchema);
