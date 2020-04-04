const express = require('express') //express handles url routing and serving files
const app = express()
const http = require('http').Server(app) //http needed for running server
const io = require('socket.io')(http) //socket.io for live client-server interactions
const pug = require('pug') //pug templating language so html can be divided into blocks
const port = process.env.PORT || 8000 //port server will receive requests from

//backend stuff
const mongoose = require ('mongoose');
const passport = require ('passport');
const flash = require ('connect-flash');

const morgan       = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const session      = require('express-session');

const configDB = require('./config/database.js');

// configuration
// connect to our database "url to be changed"
mongoose.connect(configDB.url, {useUnifiedTopology: true, useNewUrlParser: true});

// pass passport for configuration
require('./config/passport')(passport);

//middleware for front-end
app.set('view engine', 'pug') // sets pug as view engine
app.set('views', __dirname + '/views') //sets view directory
app.use('/assets', express.static(__dirname + "/views/assets")) //static_root

/* ===============Routes============== */
// please note that in each view, the "cur" variable is for the navbar. usage: name of route
require('./routes/authentication.js')(app, passport)

/*app.post*/

app.get('/dashboard', function(req, res){
  context = {
    pagename: "Dashboard",
    cur: "dashboard",
    dateoflast: "January 1, 2020",
    avg: 75,
    numdebates: 5,
    wlratio: 25,
  }
  res.render('app/dashboard', context);
});

app.get('/cancelround', function(req, res){
  message = "You canceled the round!",
  res.render('app/message')
})

app.get('/currentround', function(req, res){
  res.redirect('/roundroom/' + "12333")
  res.redirect('/nocurrent')
})

app.get('/nocurrent', function(req,res){
  message = "You have no current round",
  res.render('app/message')
})



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
  if (req.params.roundID == "123")
    res.render('app/roundroomOngoing', context)
  else
    res.render('app/roundroomPending', context)
})

app.get('/roundroom/:roundID/grade', (req,res) => {
  var context = {
    pagename: "Room " + "G406B",
    cur: "roundroom",
    roomNO: "G306B",
    status: "Ongoing",
    motion: "THBT that the Philippines should acquire military aid and a loan to develop and occupy the resources owned within the South China Sea",
    gov:{teamname: "DLSU Team A", first: "Sean Pe", second: "Marc Gonzales", third: "Bernice Betito"},
    opp:{teamname: "DLSU Team A", first: "Sean Pe", second: "Marc Gonzales", third: "Bernice Betito"}
  }
  res.render('app/roundroomGrade', context)
})

app.get('/roundroomPending', (req, res) => {
  roomNO = "G306b"
  context = {
    pagename: "Room " + roomNO,
    cur: "join"
  }
  res.render('app/roundroomPending', context)
})


app.get("/matchHistory", (req, res) => {
  context = {
    cur: "matchHistory",
    matches: [
      {roundID: "640", room: "G306B", motion: "This House would impose a BBC-style impartiality requirement on all news platforms.", gov: "DLSU A",
        opp: "DLSU B", govscore: "213", oppscore: "234", winner: "Opp", role: "DPM", rolescore: 81},
      {roundID: "341", room: "G306B", motion: "This House would allow children to sue their parents for religious indoctrination.",
        gov: "DLSU C", opp: "ADMU C", govscore: "222", oppscore: "210", winner: "Gov", role: "DPM", rolescore: 73},
    ]
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
