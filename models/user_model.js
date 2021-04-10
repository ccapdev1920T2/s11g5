var mongoose = require('mongoose');

var User = new mongoose.Schema({
    username: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: false
    },
    first_name: {
      type: String,
      required: true
    },
    last_name: {
      type: String,
      required: true
    },
    full_name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    level: {
      type: String,
      required: true
    },
    dateoflast: {
      type: String,
      required: false
    },
    numdebates: {
      type: Number,
      required: false
    },
    wins: {
      type: mongoose.Mixed,
      required: false
    },
    loses: {
      type: mongoose.Mixed,
      required: false
    },
    draws: {
      type: mongoose.Mixed,
      required: false
    },
    rawWins: {
      type: Number,
      required: false
    },
    rawLose: {
      type: Number,
      required: false
    },
    rawDraw: {
      type: Number,
      required: false
    },
    updates: {
      type: Array,
      required: false
    },
    wlratio: {
      type: mongoose.Mixed,
      required: false
    }
});

module.exports = mongoose.model('users', User);
