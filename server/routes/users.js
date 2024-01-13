const express = require("express")
const router = express.Router()
const {adminAuth, userAuth, basicAuth} = require("../middleware/auth")
const userHandler = require("../handlers/users_handler")

router.post("/register", userHandler.createUser)
router.put("/updaterole", basicAuth, userHandler.updateUserRole)
router.post("/delete", adminAuth, userHandler.deleteUser)
router.get("/getall", adminAuth, userHandler.getAllUsers)
router.get("/get/:id", userAuth, userHandler.getUser)

module.exports = router
