const mongoose = require('mongoose');

var TeamSchema = require('./team_model.js')
var UserSchema = require('./user_model.js');

var MatchSchema = new mongoose.Schema({
  status: String,
  roundID: String,
  motion: String,
  gov: {
    teamname: {type: String},
    first: {
      username: {type: String},
      email: {type: String},
      full_name: {type: String},
      institution: {type: String},
    },
    second: {
      username: {type: String},
      email: {type: String},
      full_name: {type: String},
      institution: {type: String},
    },
    third: {
      username: {type: String},
      email: {type: String},
      full_name: {type: String},
      institution: {type: String},
    }
  },
  opp: {
    teamname: {type: String},
    first: {
      username: {type: String},
      email: {type: String},
      full_name: {type: String},
      institution: {type: String},
    },
    second: {
      username: {type: String},
      email: {type: String},
      full_name: {type: String},
      institution: {type: String},
    },
    third: {
      username: {type: String},
      email: {type: String},
      full_name: {type: String},
      institution: {type: String},
    }
  },
  adjudicator: {
    username: {type: String},
    email: {type: String},
    full_name: {type: String},
    institution: {type: String},
  },
  creator: {
    username: {type: String},
    email: {type: String},
    full_name: {type: String},
    institution: {type: String},
  },
  creatorRole: String,
  speaker: {
    name_speaker: {type:String},
    num_speaker: {type:Number}
  },
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
