const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let UserSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Username is required']
  },
  created: {
    type: Date,
    required: [true, 'Created date is required']
  },
  first_name: {
    type: String,
    required: [true, 'First Name is required']
  },
  last_name: {
    type: String,
    required: [true, 'Last Name is required']
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required']
  },
  photo: {
    data: Buffer,
    contentType: String
  },
  school: {
    type: String,
    required: [true, 'School is required']
  },
  birthdate: {
    type: Date,
    required: [true, 'Birth Date is required']
  },
  debateSociety: {
    type: String,
    required: [true, 'Debate Society is required']
  }
});


// Export the model
module.exports = mongoose.model('User', UserSchema);
