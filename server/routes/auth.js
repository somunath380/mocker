const express = require("express")
const router = express.Router()
router.use(express.json())
const authHandler = require("../handlers/auth_handler")
const {loginAuth, logoutAuth} = require("../middleware/auth")

// check validity of refresh token
router.post("/validate/refresh/token", authHandler.validateRefreshToken)

// check validity of access token
router.post("/validate/access/token", authHandler.validateAccessToken)

// if users authtoken is valid then run the last handler else 
// run the generateTokens to generate new auth tokens (refresh + auth) tokens
router.post("/login", authHandler.userLogin)

router.post("/logout", logoutAuth, authHandler.userLogout)

// get access token using a valid refresh token
router.post("/access/token", authHandler.getAccessToken)

// api to check if cookie is set or not
router.post("/check/refreshtoken", authHandler.checkRefreshToken)

module.exports = router