var express = require('express')
var router = express.Router()

/* Message routes = just pass message to template */
router.get('/cancelround', function(req, res){
  message = "You canceled the round!"
  user = req.user
  res.render('app/message')
})


router.get('/nocurrent', function(req,res){
  message = "You have no current round"
  user = req.user
  res.render('app/message')
})

// finds current round, if there is none, redirects to no current message
router.get('/currentround', function(req, res){
  if (false) //add logic to find current round user is in (if any)
    res.redirect('/roundroom/supposedID')
  else
    // if none, send message
    res.redirect('/nocurrent')
})

// ========== Match History and Statistics Routes ======= //
 router.get('/dashboard', isLoggedIn, function(req, res){
   // dummy data rendered to view for now, will retrieve from db in phase 3
   context = {
     pagename: "Dashboard",
     cur: "dashboard",
     dateoflast: "January 1, 2020",
     avg: 75,
     numdebates: 5,
     wlratio: 25,
     user: req.user,
   }
   res.render('app/dashboard', context);
 });

 router.get("/startRound", isLoggedIn, (req, res) => {
   context = {
     cur: "startRound",
     user: req.user,
   }

   //create a new round and cache in socket.io

   res.render('app/startRound', context)
 })


 router.get('/settings', (req, res) => {
   context = {
     cur: "settings",
     user: req.user,
   }
   res.render('app/profileSettings', context)
 })



 router.get('/searchround', (req, res) => {
   context = {
     cur: "searchround",
     user: req.user,
   }
   res.render('app/searchround', context)
 })

 router.post('/searchround', (req, res) => {
   //res.body.query as search params
   if (true) //if found, go to overview pages
    res.redirect('/roundroom/overview/IDofmatchFound')
    else
      res.render('app/searchround', {message: 'No rounds matched your query!'})
 })

 router.get('/roundroom/overview/:roundroomID', (req,res) => {

   res.render('app/roundroomStatistics', context)
 })


//============== ROUNDROOM ROUTES ============//
router.get('/roundroom/:roundID', (req, res) => {
  //dummy for now, will be rendered from db in the future
  var context = {
    pagename: "Room " + "G406B",
    cur: "roundroom",
    user: req.user,
    roomNO: "G306B",
    status: "Ongoing",
    motion: "THBT that the Philippines should acquire military aid and a loan to develop and occupy the resources owned within the South China Sea",
    gov:{teamname: "DLSU Team A", first: "Sean Pe", second: "Marc Gonzales", third: "Bernice Betito"},
    opp:{teamname: "DLSU Team A", first: "Sean Pe", second: "Marc Gonzales", third: "Bernice Betito"}
  }
  res.render('app/roundroomOngoing', context)
})

router.get('/grade/:roundID/grade', (req,res) => {
  // dummy context that should be retrieved from database in phase 3
  var context = {
    pagename: "Room " + "G406B",
    cur: "roundroom",
    user: req.user,
    roomNO: "G306B",
    status: "Complete",
    motion: "THBT that the Philippines should acquire military aid and a loan to develop and occupy the resources owned within the South China Sea",
    gov:{teamname: "DLSU Team A", first: "Sean Pe", second: "Marc Gonzales", third: "Bernice Betito"},
    opp:{teamname: "DLSU Team A", first: "Sean Pe", second: "Marc Gonzales", third: "Bernice Betito"}
  }

  res.render('app/roundroomGrade', context)
})

router.get('/roundroomPending', (req, res) => {
  roomNO = "G306b" //
  context = {
    pagename: "Room " + roomNO,
    cur: "join",
    user: req.user,
    gov:{teamname: "DLSU Team A", first: "Sean Pe", second: "Marc Gonzales", third: "Bernice Betito"},
    opp:{teamname: "DLSU Team A", first: "Sean Pe", second: "Marc Gonzales", third: "Bernice Betito"},
  }
  res.render('app/roundroomPending', context)
})

router.get('/matchHistory', isLoggedIn, (req, res) => {
  let matches = [], //will be retrieved from db
  context = {
    pagename: "Your match history",
    cur: "matchHistory",
    user: req.user,
    matches: [
      {roundID: "640", room: "G306B", motion: "This House would impose a BBC-style impartiality requirement on all news platforms.", gov: "DLSU A",
        opp: "DLSU B", govscore: "213", oppscore: "234", winner: "Opp", role: "DPM", rolescore: 81},
      {roundID: "341", room: "G306B", motion: "This House would allow children to sue their parents for religious indoctrination.",
        gov: "DLSU C", opp: "ADMU C", govscore: "222", oppscore: "210", winner: "Gov", role: "DPM", rolescore: 73},
    ]
  }
  res.render('app/matchHistory', context)
})

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
}

module.exports = router;
