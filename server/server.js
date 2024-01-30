const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const apiHandler = require("./routes/index")
const mockerHandler = require('./mock')

const app = express()
app.use(cors({
    origin: ['http://127.0.0.1:5173', 'http://localhost:5173'], // means only this origin can use cookies set by the backend
    credentials: true // ui can access the cookie set by backend
}))
app.use(express.json())
app.use(cookieParser())
app.use("/api/v1", apiHandler)

app.use((req, res, next) => {
    mockerHandler(req, res, next)
})


module.exports = app
