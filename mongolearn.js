const mongoose = require('mongoose')
const userController = require('./controllers/userController.js')
const connectionString = 'mongodb+srv://seanUserAtlas:WjPqgpp6GRkQOuhy@cluster0-hlmd5.gcp.mongodb.net/test?retryWrites=true&w=majority'


;(async () => {
  const connector = mongoose.connect(connectionString)
  const username = "hello"

  let user = await connector.then(async () => {
    return userController.findUser(username)
  })

  if (!user) {
    user = await userController.createUser(username)
  }

  console.log(user)
  process.exit(0)
})()
