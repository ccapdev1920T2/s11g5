const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var TeamSchema = require('mongoose').model('Team').schema;
var UserSchema = require('mongoose').model('User').schema;

let RndRoomSchema = new Schema({
    roomno: {
      type: String,
      required: true,
      max: 32
    },
    motion: {
      type: String,
      required: true
    },
    gov: {
      type: [TeamSchema],
      required: true
    },
    gscore: {
      type: Number,
      required: true
    },
    firstGov: {
      type: [UserSchema],
      required: true
    },
    firstPosGov: {  //Position of first speaker
      type: String,
      required: true
    },
    firstScoreGov: {  //Score of first speaker
      type: Number,
      required: true
    },
    secondGov: {
      type: [UserSchema],
      required: true
    },
    secondPosGov: {  //Position of second speaker
      type: String,
      required: true
    },
    secondScoreGov: {  //Score of second speaker
      type: Number,
      required: true
    },
    thirdGov: {
      type: [UserSchema],
      required: true
    },
    thirdPosGov: {  //Position of third speaker
      type: String,
      required: true
    },
    thirdScoreGov: {  //Score of third speaker
      type: Number,
      required: true
    },
    opp: {
      type: [TeamSchema],
      required: true
    },
    oscore: {
      type: Number,
      required: true
    },
    firstOpp: {
      type: [UserSchema],
      required: true
    },
    firstPosOpp: {  //Position of first speaker
      type: String,
      required: true
    },
    firstScoreOpp: {  //Score of first speaker
      type: Number,
      required: true
    },
    secondOpp: {
      type: [UserSchema],
      required: true
    },
    secondPosOpp: {  //Position of second speaker
      type: String,
      required: true
    },
    secondScoreOpp: {  //Score of second speaker
      type: Number,
      required: true
    },
    thirdOpp: {
      type: [UserSchema],
      required: true
    },
    thirdPosOpp: {  //Position of third speaker
      type: String,
      required: true
    },
    thirdScoreOpp: {  //Score of third speaker
      type: Number,
      required: true
    },
    winner: {
      type: [TeamSchema],
      required: true
    },
    comment: {
      type: String,
      required: true
    },
    chair: {
      type: [UserSchema],
      required: true
    },
});


// Export the model
module.exports = mongoose.model('RoundRoom', RoundRoomSchema);
