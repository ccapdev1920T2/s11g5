const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var UserSchema = require('mongoose').model('User').schema;

let TeamSchema = new Schema({
  teamname: {
    type: String,
    required: {true, 'Name is required'}
  },
  first: { //User
    type: UserSchema,
    required: {true, 'First Speaker is required'}
  },
  second: {  //User
    type: UserSchema,
    required: {true, 'Second Speaker is required'}
  },
  third: {  //User
    type: UserSchema,
    required: {true, 'Third Speaker is required'}
  },
  side: {
    type: String,
  },
  photo: {
    data: Buffer,
    contentType: String
  }
});


// Export the model
module.exports = mongoose.model('Team', TeamSchema);
