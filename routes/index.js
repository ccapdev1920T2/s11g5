var express = require('express')
var router = express.Router()

/* Message routes = just pass message to template */
router.get('/cancelround', function(req, res){
  message = "You canceled the wow!",
  res.render('app/message')
})


router.get('/nocurrent', function(req,res){
  message = "You have no current round",
  res.render('app/message')
})

// finds current round, if there is none, redirects to no current message
router.get('/currentround', function(req, res){
  // logic here for no current round
  res.redirect('/roundroom/' + "12333")
  res.redirect('/nocurrent')
})

// ========== Match History and Statistics Routes ======= //
 router.get('/dashboard', isLoggedIn, function(req, res){
   context = {
     pagename: "Dashboard",
     cur: "dashboard",
     dateoflast: "January 1, 2020",
     avg: 75,
     numdebates: 5,
     wlratio: 25,
   }
   console.log(req.user);
   res.render('app/dashboard', context);
 });

 router.get("/startRound", (req, res) => {
   context = {
     cur: "startRound"
   }
   res.render('app/startRound', context)
 })


 router.get('/settings', (req, res) => {
   context = {
     cur: "settings",
   }
   res.render('app/profileSettings', context)
 })



 router.get('/searchround', (req, res) => {
   res.render('app/searchround')
 })


//============== ROUNDROOM ROUTES ============//
router.get('/roundroom/:roundID', (req, res) => {
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

router.get('/roundroom/:roundID/grade', (req,res) => {
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

router.get('/roundroomPending', (req, res) => {
  roomNO = "G306b"
  context = {
    pagename: "Room " + roomNO,
    cur: "join"
  }
  res.render('app/roundroomPending', context)
})

router.get('/matchHistory', (req, res) => {
  let matches = []
  context = {
    pagename: "Your Match History",
    cur: "matchHistory",
    matches : matches,
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
