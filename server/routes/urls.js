const express = require("express")
const router = express.Router()
const {adminAuth, userAuth} = require("../middleware/auth")
const urlHandler = require("../handlers/urls_handler")

module.exports = router

router.post("/:userid/add", userAuth, urlHandler.createUrl)
router.get("/:userid/getall", userAuth, urlHandler.getUrls)