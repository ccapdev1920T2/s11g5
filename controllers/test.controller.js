var testController = {}

testController.list = function(req,res){
  console.log("test list")
  res.send({hello: "hello"})
}


module.exports = testController
