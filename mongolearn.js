const mongoose = require('mongoose')
const roundRoom = require('./controllers/roundRoom.controller.js')

var url = "mongodb+srv://seanUserAtlas:WjPqgpp6GRkQOuhy@debateroundroom-hlmd5.gcp.mongodb.net/test?retryWrites=true&w=majority";
mongoose.connect(url, { useNewUrlParser: true });
