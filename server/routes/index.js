const express = require("express")
const router = express.Router()
const usersHandler = require("./users")
const urlsHandler = require("./urls")
const authHandler = require("./auth")

try {
    router.use("/auth", authHandler)
    router.use("/users", usersHandler)
    router.use("/urls", urlsHandler)
} catch (error) {
    console.log(`error occured: ${error}`);
}

module.exports = router