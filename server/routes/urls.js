const express = require("express")
const router = express.Router()
const {adminAuth, userAuth} = require("../middleware/auth")
const {checkUser} = require("../middleware/checkuser")
const {upload} = require("../middleware/upload")
const urlHandler = require("../handlers/urls_handler")

router.post("/:userid/add", userAuth, checkUser, urlHandler.createUrl)
router.get("/:userid/getall", userAuth, checkUser, urlHandler.getUrls)
router.get("/:userid/get/:urlid", userAuth, checkUser, urlHandler.getUrl)
router.put("/:userid/update/:urlid", userAuth, checkUser, urlHandler.updateUrl)
router.delete("/:userid/delete/:urlid", userAuth, checkUser, urlHandler.deleteUrl)
router.post("/:userid/upload/file", userAuth, checkUser, upload.single('file'), urlHandler.uploadFile)

module.exports = router