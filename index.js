const express = require('express') //express handles url routing and serving files
const app = express()
const http = require('http').Server(app) //http needed for running server
const io = require('socket.io')(http) //socket.io for live client-server interactions
const pug = require('pug') //pug templating language so html can be divided into blocks
const port = process.env.PORT || 3000 //port server will receive requests from

/* Backend */
const mongoose = require ('mongoose');
const flash = require ('connect-flash');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
var LocalStrategy = require('passport-local').Strategy;
const sanitize = require('mongo-sanitize');

/* Middleware for Front-End */
app.set('view engine', 'pug') // sets pug as view engine
app.set('views', __dirname + '/views') //sets view directory
app.use('/assets', express.static(__dirname + "/views/assets")) //static_root

/* Middleware for Cache */
app.use(function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next()
});

/* Middleware for Backend */
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'secretKey',
    saveUninitialized: true,
    resave: true
}));

/* Connect to the database in MongoDB */
async function func(){
  const {MongoClient} = require('mongodb');
  const uri = "mongodb+srv://dbUser:p@ssword@cluster-1.ayffn.gcp.mongodb.net/db?retryWrites=true&w=majority";
  const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});

  try{
    await client.connect();
  }catch (e){
    console.error(e);
  }
}

/* Routes */
var users = require('./routes/users');
app.use("/", users);


/* Socket.io functions for live debate rooms */
io.on('connection', function(socket){
  /* Join a round using the unique Round ID given */
  socket.on('joinRound',function(roundID){
    try{
      console.log('join round:\t'+roundID);
      socket.join(roundID);
    }catch(e){
      console.log('error in join room:\t'+e);
    }
  });

  /* Start the timer of a round */
  socket.on('start', function(details){
    io.in(details.roundID).emit('start', details.seconds);
  });

  /* Stop the timer of a round */
  socket.on('stop', function(details){
    io.in(details.roundID).emit('stop', details.seconds);
  });

  /* Go to the next speaker in a round */
  socket.on('nextSpeaker', function(details){
    io.in(details.roundID).emit('nextSpeaker', details.numSpeaker);
  });

  /* End a round */
  socket.on('endRound', function(roundID){
    io.in(roundID).emit('endRound', roundID);
  });

  /* Leave a round using the unique Round ID given */
  socket.on('leaveRound', function(roundID){
    try{
      console.log('leaving round:\t'+roundID);
      socket.leave(roundID);
    }catch(e){
      console.log('error in leave room:\t'+e);
    }
  });
});


http.listen(port, function(){
  console.log('listening on *:' + port);
});
