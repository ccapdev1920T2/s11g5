const express = require('express') //express handles url routing and serving files
const app = express()
const http = require('http').Server(app) //http needed for running server
const io = require('socket.io')(http) //socket.io for live client-server interactions
const pug = require('pug') //pug templating language so html can be divided into blocks
const port = process.env.PORT || 5000 //port server will receive requests from
const mongoose = require('mongoose')



app.set('view engine', 'pug') // sets pug as view engine
app.set('views', __dirname + '/views') //sets view directory
app.use('/assets', express.static(__dirname + "/views/assets")) //static_root


/* Static view routes */
// please note that in each view, the "cur" variable is for the navbar. usage: name of route
app.get('/', function(req, res){
  res.render('index')
});

app.get('/register', function(req,res){
  res.render('register')
})

app.get('/login', function(req,res){
  res.render('login')
})

app.get('/dashboard', function(req, res){
  context = {
    cur: "dashboard"
  }
  res.render('app/dashboard', context);
});



app.get('/roundroom/:roundID', (req, res) => {
  var context = {
    pagename: "Room " + "G406B",
    cur: "roundroom",
    roomNO: "G306B",
    status: "Ongoing",
    motion: "THBT that the Philippines should acquire military aid and a loan to develop and occupy the resources owned within the South China Sea",
    gov:{teamname: "DLSU Team A", first: "Sean Pe", second: "Marc Gonzales", third: "Bernice Betito"},
    opp:{teamname: "DLSU Team A", first: "Sean Pe", second: "Marc Gonzales", third: "Bernice Betito"}
  }
  res.render('app/roundroomOngoing', context)
})


app.get("/matchHistory", (req, res) => {
  context = {
    cur: "matchHistory"
  }
  res.render('app/matchHistory', context)
})

app.get("/startRound", (req, res) => {
  context = {
    cur: "startRound"
  }
  res.render('app/startRound', context)
})


app.get('/settings', (req, res) => {
  context = {
    cur: "settings",
  }
  res.render('app/profileSettings', context)
})

app.get('/roundroomPending', (req, res) => {
  roomNO = "G306b"
  context = {
    pagename: "Room " + roomNO,
    cur: "roundroom"
  }
  res.render('app/roundroomPending', context)
})

app.get('/searchround', (req, res) => {
  res.render('app/searchround')
})


/* Post requests, writes data to mongodb */
// registration functions


//login functions


/* Socket.io functions for live debate rooms */
io.on('connection', function(socket){
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
