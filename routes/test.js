const router = require('express').Router()
const test = require("../controllers/test.controller")

router.get("/", test.list)


module.exports = router
