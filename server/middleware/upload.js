require('dotenv').config();
const path = require("path")
const multer = require('multer');
const uploadPath = process.env.ABSOLUTEUPLOADPATH

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

exports.upload = multer({storage: storage})

