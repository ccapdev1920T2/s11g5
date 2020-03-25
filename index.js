const express = require('express') //express handles url routing and serving files
const app = express()
const http = require('http').Server(app) //http needed for running server
const io = require('socket.io')(http) //socket.io for live client-server interactions
const pug = require('pug') //pug templating language so html can be divided into blocks
const port = process.env.PORT || 5000 //port server will receive requests from


app.set('view engine', 'pug') // sets pug as view engine
app.set('views', __dirname + '/views') //sets view directory
app.use('/assets', express.static(__dirname + "/views/assets")) //static_root


/* Static view routes */
// please note that in each view, the "cur" variable is for the navbar. usage: name of route
app.get('/', function(req, res){
  res.render('index')
});

app.get('/dashboard', function(req, res){
  context = {
    cur: "dashboard"
  }
  res.render('dashboard', context);
});

app.get('/register', function(req,res){
  res.render('index')
})

app.get('/roundroom/:roundID', (req, res) => {
  var context = {
    cur: "roundroom",
    roomNO: "G306B",
    status: "Ongoing",
    motion: "THBT that the Philippines should acquire military aid and a loan to develop and occupy the resources owned within the South China Sea",
    gov:{teamname: "DLSU Team A", first: "Sean Pe", second: "Marc Gonzales", third: "Bernice Betito"},
    opp:{teamname: "DLSU Team A", first: "Sean Pe", second: "Marc Gonzales", third: "Bernice Betito"}
  }
  res.render('roundroomOngoing', context)
})


app.get("/matchHistory", (req, res) => {
  context = {
    cur: "matchHistory"
  }
  res.render('matchHistory', context)
})

app.get("/startRound", (req, res) => {
  context = {
    cur: "startRound"
  }
  res.render('startRound', context)
})

app.get('/testtimer', function(req,res){
  res.sendFile(__dirname + '/views/testtimer.html')
})

app.get('/settings', (req, res) => {
  context = {
    cur: "settings",
  }
  res.render('profileSettings', context)
})

app.get('/roundroomPending', (req, res) => {
  context = {
    cur: "roundroom"
  }
  res.render('roundroomPending', context)
})

app.get('/searchround', (req, res) => {
  res.render('searchround')
})


app.get('/', (req, res) => {
  res.render('index')
})


/* Post requests, writes data to mongodb */
// registration functions


//login functions


/* Socket.io functions for live debate rooms */
io.on('connection', function(socket){

  socket.on('user click', function(timerdata){
    io.emit('user click', timerdata);
  });

  socket.on('test timer', function(timerdata){
    io.emit('test timer', timerdata);
  });

  var elapsed, started;
  socket.on('timer event', function(timerdata){
    io.emit('timer event', timerdata);
    elapsed, started = timerdata['elapsed'], timerdata['started']
    console.log('server: ' + timerdata['elapsed'] + timerdata['started'])
  })

  socket.on('wew', ()=>{
    io.emit('wew', {'elapsed':elapsed, 'started':started})
  });

})


http.listen(port, function(){
  console.log('listening on *:' + port);
});
