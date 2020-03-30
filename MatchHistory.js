const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var TeamSchema = require('mongoose').model('Team').schema;
var UserSchema = require('mongoose').model('User').schema;
var MatchSchema = require('mongoose').model('Match').schema;

let MatchHistorySchema = new Schema({
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
    opp: {
      type: [TeamSchema],
      required: true
    },
    gscore: {
      type: Number,
      required: true
    },
    oscore: {
      type: Number,
      required: true
    },
    winner: {
      type: [TeamSchema],
      required: true
    },
    role: {
      type: String,
      required: true
    },
    score: {
      type: Number,
      required: true
    }
});

var TeamModel = require('mongoose').model('Team');
var UserModel = require('mongoose').model('User');
var MatchModel = require('mongoose').model('Match');
var MatchHistoryModel = require('mongoose').model('MatchHistory', MatchHistorySchema);

//Last Debate
MatchModel.find({
  $or: [
    {'gov.firstSpeaker.username':uname},
    {'gov.secondSpeaker.username':uname},
    {'gov.thirdSpeaker.username':uname},
    {'opp.firstSpeaker.username':uname},
    {'opp.secondSpeaker.username':uname},
    {'opp.thirdSpeaker.username':uname}
  ]}, function(err, result){
    if(err) throw err;
    console.log('Date: ' + result);
  }
).sort({dateOfMatch: -1}).limit(1);

//Average Speaks
MatchModel.aggregate([
  {$unwind: "$gov"},
  {$unwind: "$gov.firstSpeaker"},
  {$uniwind: "$gov.secondSpeaker"},
  {$unwind: "$gov.thirdSpeaker"},
  {$unwind: "$opp"},
  {$unwind: "$opp.firstSpeaker"},
  {$uniwind: "$opp.secondSpeaker"},
  {$unwind: "$opp.thirdSpeaker"},
  {
    $match: { _id: uname}
  },
  {
    $switch: {
      branches: [
        {case: {$eq: ["$gov.firstSpeaker", uname]}, then: {
          $group: {
            _id: "$_id",
            avgSpeaks: {$avg: "$firstGovScore"}
          }
        }},
        {case: {$eq: ["$gov.secondSpeaker", uname]}, then: {
          $group: {
            _id: "$_id",
            avgSpeaks: {$avg: "$secondGovScore"}
          }
        }},
        {case: {$eq: ["$gov.thirdSpeaker", uname]}, then: {
          $group: {
            _id: "$_id",
            avgSpeaks: {$avg: "$thirdGovScore"}
          }
        }},
        {case: {$eq: ["$opp.firstSpeaker", uname]}, then: {
          $group: {
            _id: "$_id",
            avgSpeaks: {$avg: "$firstOppScore"}
          }
        }},
        {case: {$eq: ["$opp.secondSpeaker", uname]}, then: {
          $group: {
            _id: "$_id",
            avgSpeaks: {$avg: "$secondOppScore"}
          }
        }},
        {case: {$eq: ["$opp.thirdSpeaker", uname]}, then: {
          $group: {
            _id: "$_id",
            avgSpeaks: {$avg: "$thirdOppScore"}
          }
        }},
      ]
    }
  }
], function (err, result){
  if(err) throw err;
  console.log("Average Speaks: " + result);
});

//Win/Lose Ratio
MatchHistoryModel.aggregate([
  {$unwind: "$winner"},
  {$unwind: "$winner.firstSpeaker"},
  {$uniwind: "$winner.secondSpeaker"},
  {$unwind: "$winner.thirdSpeaker"},
  {
    $match: { _id: uname}
  },
  {
    $group: { _id: "$_id", totalRatio: {$multiply: [{$divide: [{$sum: 1}, getTotalDebate(uname)]}, 10]}
  }
], function (err, result){
  if(err) throw err;
  console.log("Ratio: " + result);
});

//Total Debates
function getTotalDebate(uname){
  MatchModel.count({
    $or: [
      {'gov.firstSpeaker.username':uname},
      {'gov.secondSpeaker.username':uname},
      {'gov.thirdSpeaker.username':uname},
      {'opp.firstSpeaker.username':uname},
      {'opp.secondSpeaker.username':uname},
      {'opp.thirdSpeaker.username':uname}
    ]}, function(err, result){
      if(err) throw err;
      console.log('Total Debates: ' + result);
    }
  );
}

// Export the model
module.exports = mongoose.model('MatchHistory', MatchHistorySchema);
