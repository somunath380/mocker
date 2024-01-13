const express = require("express")
const router = express.Router()
const authHandler = require("../handlers/auth_handler")
const {loginAuth} = require("../middleware/auth")

router.post("/login", loginAuth, authHandler.userLogin)
router.post("/logout", loginAuth, authHandler.userLogout)
router.get("/refresh/token/:user_id", authHandler.getRefreshToken)

module.exports = router