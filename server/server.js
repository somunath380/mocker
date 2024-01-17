const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const apiHandler = require("./routes/index")

const app = express()
app.use(cors({
    origin: 'http://localhost:5173', // means only this origin can use cookies set by the backend
    credentials: true // ui can access the cookie set by backend
}))
app.use(express.json())
app.use(cookieParser())
app.use("/api/v1", apiHandler)



module.exports = app
