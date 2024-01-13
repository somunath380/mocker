const express = require("express")
const cookieParser = require("cookie-parser")
const apiHandler = require("./routes/index")

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use("/api/v1", apiHandler)



module.exports = app
