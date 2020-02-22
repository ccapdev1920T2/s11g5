const mongoose = require('mongoose')
const userSchema = require('../models/userSchema.js')
const User = mongoose.model('user', userSchema, 'user')


async function createUser(username) {
  return new User({
    username,
    created: Date.now()
  }).save()
}

async function findUser(username) {
  return await User.findOne({ username })
}

module.exports = {
  createUser,
  findUser,
}
