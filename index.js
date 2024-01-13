require('dotenv').config();
const config = require("./config")
const fs = require("fs")

const uploadPath = config.uploadPath

// create folder to store files
checkOrCreateFolder()
//connect to database
require("./models/index")
// start the server
require("./server")

function checkOrCreateFolder() {
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath)
        console.log(`Folder created at ${uploadPath}`);
    } else {
        console.log(`Folder already exists at ${uploadPath}`);
    }
    process.env.ABSOLUTEUPLOADPATH = uploadPath
}

