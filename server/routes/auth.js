const express = require("express")
const router = express.Router()
router.use(express.json())
const authHandler = require("../handlers/auth_handler")
const {loginAuth} = require("../middleware/auth")

router.post("/login", loginAuth, authHandler.checkUserDetails, authHandler.userLogin)
router.post("/logout", loginAuth, authHandler.userLogout)
router.get("/refresh/token/:user_id", authHandler.getRefreshToken)

module.exports = router