const express = require("express")
const router = express.Router()
router.use(express.json())
const authHandler = require("../handlers/auth_handler")
const {loginAuth} = require("../middleware/auth")

router.get("/validate/token", authHandler.getUserDetails)
router.post("/login", loginAuth, authHandler.checkUserDetails, authHandler.userLogin)
router.post("/logout", loginAuth, authHandler.userLogout)
router.get("/refresh/token", authHandler.getRefreshToken)

// get access token using a valid refresh token
router.get("/access/token", authHandler.getAccessToken)

module.exports = router