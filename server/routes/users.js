const express = require("express")
const router = express.Router()
const {userAuth, adminAuth} = require("../middleware/auth")
const userHandler = require("../handlers/users_handler")

router.post("/register", userHandler.createUser)
router.put("/updaterole", adminAuth, userHandler.updateUserRole)
router.post("/delete", adminAuth, userHandler.deleteUser)
router.get("/getall", adminAuth, userHandler.getAllUsers)

// get specific user details, not adding :id in param because in the userAuth the param is auto set from the refresh token
router.get("/get", userAuth, userHandler.getUser)

module.exports = router
