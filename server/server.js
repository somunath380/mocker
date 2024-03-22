const express = require("express")
const config = require("../config")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload');
const apiHandler = require("./routes/index")
const mockerHandler = require('./mock')

const app = express()
app.use(cors({
    origin: [config.clientUrl, 'http://127.0.0.1:8080', 'http://localhost:8080'], // means only this origin can use cookies set by the backend
    credentials: true // ui can access the cookie set by backend
}))
app.use(express.json())
app.use(cookieParser())
app.use(bodyParser.json())
app.use(fileUpload());

app.use("/api/v1", apiHandler)

app.use((req, res, next) => {
    mockerHandler(req, res, next)
})


module.exports = app
