const mongoose = require('mongoose');

var TeamSchema = require('./team_model.js')
var UserSchema = require('./user_model.js');

var MatchSchema = new mongoose.Schema({
  status: String,
  roundID: String,
  motion: String,
  gov: {
    _id: {type: mongoose.ObjectId},
    teamname: {type: String},
    first: {
      _id: {type: mongoose.ObjectId},
      username: {type: String},
      email: {type: String},
      full_name: {type: String},
      level: {type: String},
      status: {type: String}
    },
    second: {
      _id: {type: mongoose.ObjectId},
      username: {type: String},
      email: {type: String},
      full_name: {type: String},
      level: {type: String},
      status: {type: String}
    },
    third: {
      _id: {type: mongoose.ObjectId},
      username: {type: String},
      email: {type: String},
      full_name: {type: String},
      level: {type: String},
      status: {type: String}
    }
  },
  opp: {
    _id: {type: mongoose.ObjectId},
    teamname: {type: String},
    first: {
      _id: {type: mongoose.ObjectId},
      username: {type: String},
      email: {type: String},
      full_name: {type: String},
      level: {type: String},
      status: {type: String}
    },
    second: {
      _id: {type: mongoose.ObjectId},
      username: {type: String},
      email: {type: String},
      full_name: {type: String},
      level: {type: String},
      status: {type: String}
    },
    third: {
      _id: {type: mongoose.ObjectId},
      username: {type: String},
      email: {type: String},
      full_name: {type: String},
      level: {type: String},
      status: {type: String}
    }
  },
  adjudicator: {
    _id: {type: mongoose.ObjectId},
    username: {type: String},
    email: {type: String},
    full_name: {type: String},
    level: {type: String},
    status: {type: String}
  },
  creator: {
    _id: {type: mongoose.ObjectId},
    username: {type: String},
    email: {type: String},
    full_name: {type: String},
    level: {type: String},
  },
  creatorRole: String,
  speaker: {
    name_speaker: {type:String},
    num_speaker: {type:Number}
  },
  date_match: String,
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
