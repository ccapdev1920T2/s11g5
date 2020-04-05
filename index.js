const express = require('express') //express handles url routing and serving files
const app = express()
const http = require('http').Server(app) //http needed for running server
const io = require('socket.io')(http) //socket.io for live client-server interactions
const pug = require('pug') //pug templating language so html can be divided into blocks
const port = process.env.PORT || 3000 //port server will receive requests from

//backend stuff
const mongoose = require ('mongoose');
const flash = require ('connect-flash');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

//middleware for front-end
app.set('view engine', 'pug') // sets pug as view engine
app.set('views', __dirname + '/views') //sets view directory
app.use('/assets', express.static(__dirname + "/views/assets")) //static_root

//middleware for backend
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());



const configDB = require('./config/database.js');

// configuration
// connect to our database "url to be changed"
mongoose.connect(configDB.url, {useUnifiedTopology: true, useNewUrlParser: true});

var User = require('./models/user.model');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/* ===============Routes============== */
// please note that in each view, the "cur" variable is for the navbar. usage: name of route
var index = require('./routes/index');
var users = require('./routes/users');
app.use("/", index)
app.use("/", users)




/* Socket.io functions for live debate rooms */
io.on('connection', function(socket){
  console.log("someone connected");
  var elapsed, started;

  socket.on('startstop', function(timerdata){
    io.emit('startstop', timerdata);
    elapsed, started = timerdata['elapsed'], timerdata['started']
  })

  socket.on('wew', ()=>{
    io.emit('wew', {'elapsed':elapsed, 'started':started})
  });

})


http.listen(port, function(){
  console.log('listening on *:' + port);
});
