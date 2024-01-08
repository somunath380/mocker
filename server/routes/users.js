const express = require("express")
const router = express.Router()
const {adminAuth, userAuth} = require("../middleware/auth")
const userHandler = require("../handlers/users_handler")

router.post("/add", userHandler.createUser)
router.post("/login", userAuth, userHandler.login)
router.put("/updaterole", adminAuth, userHandler.updateUserRole)
router.post("/delete", adminAuth, userHandler.deleteUser)
router.get("/getall", adminAuth, userHandler.getAllUsers)
router.get("/get/:id", userAuth, adminAuth, userHandler.getUser)

module.exports = router
