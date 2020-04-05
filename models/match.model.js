const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var TeamSchema = require('./team.model.js')
var UserSchema = require('./user.model.js');

let MatchSchema = new Schema({
  room: {
    type: String,
    required: {true, 'Room is required'},
    max: 32
  },
  motion: {
    type: String,
    required: {true, 'Motion is required'}
  },
  gov: {  //Team
    type: TeamSchema,
    required: {true, 'Gov is required'}
  },
  opp: {  //Team
    type: TeamSchema,
    required: {true, 'Opp is required'}
  },
  firstGovScore: {
    type: Number,
    required: {true, 'PM Score is required'}
  },
  secondGovScore: {
    type: Number,
    required: {true, 'DPM Score is required'}
  },
  thirdGovScore: {
    type: Number,
    required: {true, 'GW Score is required'}
  },
  firstOppScore: {
    type: Number,
    required: {true, 'LO Score is required'}
  },
  secondOppScore: {
    type: Number,
    required: {true, 'DLO Score is required'}
  },
  thirdOppScore: {
    type: Number,
    required: {true, 'OW Score is required'}
  },
  dateOfMatch: {
    type: Date,
    required: {true, 'Date is required'}
  },
  adjudicator: {  //User
    type: UserSchema,
    required: {true, 'Adjudicator is required'}
  },
  comments: {
    type: String,
    required: {true, 'Comment is required'}
  }
});


// Export the model
module.exports = mongoose.model('Match', MatchSchema);
