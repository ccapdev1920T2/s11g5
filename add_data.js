const mongoose = require ('mongoose');
const db = require('./models/db.js');
const User = require('./models/user_model.js');
const Team = require('./models/team_model.js');
const Match = require('./models/match_model.js');

/* Connect to the database in MongoDB */
async function func(){
  const {MongoClient} = require('mongodb');
  const uri = "mongodb+srv://dbUser:p@ssword@cluster-1.ayffn.gcp.mongodb.net/db?retryWrites=true&w=majority";
  const options = {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false
  };
  await mongoose.connect(uri, options, async function(error) {
    if(error) throw error;
    await db.updateOne(Match, {}, {$set:{'adjudicator.status':'Active', 'gov.first.status':'Active', 'gov.second.status':'Active', 'gov.third.status':'Active', 'opp.first.status':'Active', 'opp.second.status':'Active', 'opp.third.status':'Active'}});
    await db.updateMany(Team, {}, {$set:{'first.status':'Active'}});
    await db.updateMany(Team, {}, {$set:{'second.status':'Active'}});
    await db.updateMany(Team, {}, {$set:{'third.status':'Active'}});
    await db.updateMany(Team, {}, {$set:{'status':'Active'}});
    await db.updateMany(User, {}, {$set:{'status':'Active'}});
    console.log('Updated');
  });
}

func();
