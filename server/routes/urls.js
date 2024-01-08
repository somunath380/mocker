const express = require("express")
const router = express.Router()
const {adminAuth, userAuth} = require("../middleware/auth")

module.exports = router