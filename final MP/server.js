//express handles url routing and serving files
var express = require('express')
var app = express()
//http needed for running server
var http = require('http').Server(app)
//socket.io for live client-server interactions
var io = require('socket.io')(http)
//pug templating language so html can be divided into blocks
var pug = require('pug')
//port server will receive requests from
var port = process.env.PORT || 3000



app.set('view engine', 'pug') // sets pug as view engine
app.set('views', './views') //sets view directory
app.use(express.static("./views"))


/* Static get requests, simply serve files */
app.get('/', function(req, res){
  var context = {title: 'Oh Dang', message:'owow!', inside:"im in!"}
  res.render('index', context)
});

app.get('/register', function(req,res){
  res.render('index')
})

app.get('/roundroom', function(req,res){
  var context = {
    title: "da room",
    roomno:"g402",
    user: {name: "Guest"}
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
