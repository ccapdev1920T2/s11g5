const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var UserSchema = require('mongoose').model('User').schema;

let TeamSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  firstSpeaker: { //User
    type: [UserSchema],
    required: [true, 'First Speaker is required']
  },
  secondSpeaker: {  //User
    type: [UserSchema],
    required: [true, 'Second Speaker is required']
  },
  thirdSpeaker: {  //User
    type: [UserSchema],
    required: [true, 'Third Speaker is required']
  },
  side: {
    type: String,
    required: [true, 'Side is required']
  },
  photo: {
    data: Buffer,
    contentType: String
  }
});


// Export the model
module.exports = mongoose.model('Team', TeamSchema);
