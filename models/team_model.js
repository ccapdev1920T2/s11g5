const mongoose = require('mongoose');

var UserSchema = require('./user_model.js');

var TeamSchema = new mongoose.Schema({
  teamname: String,
  first: {
    _id: {type: mongoose.ObjectId},
    username: {type: String},
    email: {type: String},
    full_name: {type: String},
    institution: {type: String},
  },
  second: {
    _id: {type: mongoose.ObjectId},
    username: {type: String},
    email: {type: String},
    full_name: {type: String},
    institution: {type: String},
  },
  third: {
    _id: {type: mongoose.ObjectId},
    username: {type: String},
    email: {type: String},
    full_name: {type: String},
    institution: {type: String},
  },
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
