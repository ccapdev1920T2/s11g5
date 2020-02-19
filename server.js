const express = require('express') //express handles url routing and serving files
const app = express()
const http = require('http').Server(app) //http needed for running server
const io = require('socket.io')(http) //socket.io for live client-server interactions
const pug = require('pug') //pug templating language so html can be divided into blocks
const port = process.env.PORT || 3000 //port server will receive requests from


app.set('view engine', 'pug') // sets pug as view engine
app.set('views', './views') //sets view directory
app.use(express.static("./views")) //static_root


/* Static get routes */
app.get('/', function(req, res){
  var context = {
    title: "RoundRoom - " + "g306b",
    motion: "THBT that the Philippines should acquire military aid and a loan to develop and occupy the resources owned within the South China Sea",
    roomno:"g306b",
    gov: "DLSU Team A",
    opp: "DLSU Team A Converse",
    user: {name: "Sean Pe"},
    pm:"Sean Pe",
    dpm:"Marc Gonzales",
    gw:"Bernice Betito",
    lo:"Pe Sean",
    dlo:"Gonzales Marc",
    ow:"Betito Bernice",
  }
  res.render('index', context)
});

app.get('/index', function(req, res){
  res.render('index', context);
});

app.get('/register', function(req,res){
  res.render('index')
})

app.get('/roundroom', function(req,res){
  var context = {
    title: "RoundRoom - " + "g306b",
    roomno:"g306b",
    user: {name: "User"},
    pm:"Sean Pe",
    dpm:"Marc Gonzales",
    gw:"Bernice Betito",
    lo:"Pe Sean",
    dlo:"Gonzales Marc",
    ow:"Betito Bernice",
  }
  res.render('roundroom', context)
})

app.get('/testtimer', function(req,res){
  res.sendFile(__dirname + '/views/testtimer.html')
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
