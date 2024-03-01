const express = require("express")
const router = express.Router()
const {userAuth, adminAuth} = require("../middleware/auth")
const urlHandler = require("../handlers/urls_handler")

router.post("/:userid/add", userAuth, urlHandler.createUrl)
router.get("/:userid/getall", userAuth, urlHandler.getUrls)
router.get("/:userid/get/:urlid", userAuth, urlHandler.getUrl)
router.put("/:userid/update/:urlid", userAuth, urlHandler.updateUrl)
router.delete("/:userid/delete/:urlid", userAuth, urlHandler.deleteUrl)
router.post("/:userid/upload/file", userAuth, urlHandler.uploadFile)

// admin api for deleting all stored files
router.delete("/delete/files", adminAuth, urlHandler.deleteStorage)

module.exports = router