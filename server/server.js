const express = require("express")
const cookieParser = require("cookie-parser")
const usersHandler = require("./routes/users")
const urlsHandler = require("./routes/urls")
const app = express()
app.use(express.json())
app.use(cookieParser())

try {
    app.use("/users", usersHandler)
    app.use("/urls", urlsHandler)
} catch (error) {
    console.log(`error occured: ${error}`);
}

module.exports = app
