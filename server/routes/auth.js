const express = require("express")
const router = express.Router()
router.use(express.json())
const authHandler = require("../handlers/auth_handler")
const {loginAuth} = require("../middleware/auth")

// check validity of refresh token
router.get("/validate/refresh/token", authHandler.validateRefreshToken)

// check validity of access token
router.get("/validate/access/token", authHandler.validateAccessToken)

// if users authtoken is valid then run the last handler else 
// run the generateTokens to generate new auth tokens (refresh + auth) tokens
router.post("/login", loginAuth, authHandler.generateTokens, authHandler.userLogin)

router.post("/logout", loginAuth, authHandler.userLogout)

// check if this api can be used or not
router.get("/refresh/token", authHandler.getRefreshToken)

// get access token using a valid refresh token
router.get("/access/token", authHandler.getAccessToken)

module.exports = router