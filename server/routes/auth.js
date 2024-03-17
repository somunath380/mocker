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

// get access token using a valid refresh token
router.get("/access/token", authHandler.getAccessToken)

// api to check if cookie is set or not
router.get("/check/refreshtoken", authHandler.checkRefreshToken)

module.exports = router