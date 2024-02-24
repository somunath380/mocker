require('dotenv').config();
const _ = require("lodash")
const config = require("../../config")
const {UrlModel} = require("../../models/url_schema")
const path = require('path');
const fs = require("fs")

const availableExtensions = [".py", ".js"]


exports.createUrl = async (req, res, next) => {
    try {
        const reqBody = req.body;
        const userId = req.params.userid;
        const newUrl = new UrlModel(reqBody);
        try {
            await newUrl.validate()
        } catch (err) {
            return res.status(400).json({success: false, message: err.message});
        }
        // check if that url is already created or not
        // by getting all the urls of that particular user
        const url = await UrlModel.findOne({
            $and: [
                {"user_details.id": userId},
                {"url": reqBody.url}
            ]
        })
        // if we get any
        if (url) {
            // check if the payload, response, headers are same or not
            const dbPayload = url.body
            const dbResponse = url.response
            const dbHeaders = url.headers
            const isSame = (
                _.isEqual(dbPayload, reqBody.body) 
                &&
                (_.isEqual(dbResponse, reqBody.response) 
                &&
                (_.isEqual(dbHeaders, reqBody.headers)))
            )
            if (isSame) {
                return res.status(400).json({success: false, message: "Url already exists"});
            } else {
                const dbData = {
                    "body": dbPayload,
                    "response": dbResponse,
                    "headers": dbHeaders
                }
                const reqData = {
                    "body": reqBody.body,
                    "response": reqBody.response,
                    "headers": reqBody.headers
                }
                const difference = _.omitBy(reqData, (value, key) => _.isEqual(value, dbData[key]));
                for (const [key, value] of Object.entries(difference)) {
                    url[key] = reqBody[key]
                }
                const updatedUrl = await UrlModel.findOneAndUpdate(url._id, difference, {new: true, runValidators: true})
                if (updatedUrl) {
                    return res.status(200).json({success: true, message: "Url updated", isModified: true, urlData: url, updatedData: difference});
                } else {
                    return res.status(400).json({success: false, message: "Url not updated"});
                }
            }
        } else {
            await newUrl.save()
            return res.status(200).json({success: true, message: "url added", isModified: false});
        }
        // else process the request
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: error.message
        })
    }
}

exports.getUrls = async (req, res, next) => {
    try {
        const userId = req.params.userid;
        const urls = await UrlModel.find({"user_details.id": userId})
        return res.status(200).json({success: true, url: urls})
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: error.message
        })
    }
}

exports.getUrl = async (req, res, next) => {
    try {
        const urlId = req.params.urlid;
        const url = await UrlModel.findById(urlId)
        if (url) {
            return res.status(200).json({success: true, url})
        } else {
            return res.status(404).json({ success: false, message: 'url not found' });
        }
    } catch (err) {
        return res.status(403).json({
            success: false,
            message: err.message
        })
    }
}

exports.updateUrl = async (req, res, next) => {
    try {
        const reqBody = req.body;
        const urlId = req.params.urlid;
        const url = await UrlModel.findById(urlId)
        if (!url){
            return res.status(404).json({ success: false, message: 'url not found' });
        }
        for (const [key, value] of Object.entries(reqBody)) {
            url[key] = reqBody[key]
        }
        await url.validate()
        const updatedUrl = await UrlModel.findOneAndUpdate(url._id, reqBody, {new: true, runValidators: true})
        return res.status(200).json({success: true, message: "Url updated", isModified: true, urlData: updatedUrl});
    } catch (err) {
        return res.status(403).json({
            success: false,
            message: err.message
        })
    }
}

exports.deleteUrl = async (req, res, next) => {
    try {
        const urlId = req.params.urlid;
        const url = await UrlModel.findById(urlId)
        if (!url) {
            return res.status(404).json({ success: false, message: 'url not found' });
        }
        await url.deleteOne()
        return res.status(200).json({success: true, message: "Url deleted", url});
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: err.message
        })
    }
}


exports.uploadFile = async (req, res, next) => {
    try {
        const userId = req.params.userid;
        const filepath = req.uploadPath
        let reqBody = req.body
        reqBody.filepath = filepath
        const canExe = reqBody?.execute_file
        if (!canExe) {
            // const fileName = path.basename(filepath);
            const ext = path.extname(filepath)
            if (availableExtensions.includes(ext)){
                reqBody.execute_file = true
            }
        }
        reqBody.body = JSON.parse(reqBody.body)
        reqBody.response = JSON.parse(reqBody.response)
        reqBody.headers = JSON.parse(reqBody.headers)
        reqBody.user_details = JSON.parse(reqBody.user_details)

        const newUrl = new UrlModel(reqBody);
        try {
            await newUrl.validate()
        } catch (error) {
            return res.status(400).json({success: false, message: error.message});
        }
        const url = await UrlModel.findOne({
            $and: [
                {"user_details.id": userId},
                {"url": reqBody.url}
            ]
        })
        if (url) {
            // check if the payload, response, headers are same or not
            const dbPayload = url.body
            const dbResponse = url.response
            const dbHeaders = url.headers
            const isSame = (
                _.isEqual(dbPayload, reqBody.body) 
                &&
                (_.isEqual(dbResponse, reqBody.response) 
                &&
                (_.isEqual(dbHeaders, reqBody.headers)))
            )
            if (isSame) {
                return res.status(400).json({success: false, message: "Url already exists"});
            } else {
                const dbData = {
                    "body": dbPayload,
                    "response": dbResponse,
                    "headers": dbHeaders
                }
                const reqData = {
                    "body": reqBody.body,
                    "response": reqBody.response,
                    "headers": reqBody.headers
                }
                const difference = _.omitBy(reqData, (value, key) => _.isEqual(value, dbData[key]));
                for (const [key, value] of Object.entries(difference)) {
                    url[key] = reqBody[key]
                }
                const updatedUrl = await UrlModel.findOneAndUpdate(url._id, difference, {new: true, runValidators: true})
                if (updatedUrl) {
                    return res.status(200).json({success: true, message: "Url updated", isModified: true, urlData: url, updatedData: difference});
                } else {
                    return res.status(400).json({success: false, message: "Url not updated"});
                }
            }
        } else {
            await newUrl.save()
            return res.status(200).json({success: true, message: "url added", newUrl});
        }
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: err.message
        })
    }
}


exports.deleteStorage = async (req, res, next) => {
    try {
        const uploadPath = process.env.ABSOLUTEUPLOADPATH
        const currPath = __dirname
        const filePath = path.join(currPath, "..", "..", uploadPath)
        fs.rmSync(filePath, { recursive: true })
        return res.status(200).json({success: true, message: 'files deleted'});
    } catch (error) {
        return res.status(401).json({success: false, message: 'Error deleting storage', error: err.message});
    }
}