require('dotenv').config();
const path = require("path")
const fs = require("fs")
const multer = require('multer');
const absolutePath = process.env.ABSOLUTEUPLOADPATH
const uploadPath = path.join(path.join(path.join(__dirname, '..'), '..'), 'uploads')

function checkOrCreateFolder() {
    if (!fs.existsSync(absolutePath)) {
        fs.mkdirSync(absolutePath)
        console.log(`Folder created at ${absolutePath}`);
    } else {
        console.log(`Folder already exists at ${absolutePath}`);
    }
}

// setup storage path for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath)
    }, 
    filename: (req, file, cb) => {
        const filename = file.originalname
        req.uploadPath = uploadPath + '/' + filename
        cb(null, filename)
    }
})

checkOrCreateFolder()
exports.upload = multer({storage: storage})

