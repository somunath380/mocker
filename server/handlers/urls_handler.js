require('dotenv').config();
const _ = require("lodash")
const config = require("../../config")
const {UrlModel} = require("../../models/url_schema")
const {UserModel} = require("../../models/user_schema")
const { encryptPassword, isAuthorized } = require("../encryption")
const jwt = require("jsonwebtoken")

const maxExpiryInSec = 24 * 60
const jwtSecret = config.secret

exports.createUrl = async (req, res, next) => {
    try {
        const reqBody = req.body;
        const userId = req.params.userid;
        const newUrl = new UrlModel(reqBody);
        try {
            await newUrl.validate()
        } catch (error) {
            return res.status(400).json({success: false, error});
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
            const dbresponse = url.response
            const dbHeaders = url.headers
            const isSame = (
                _.isEqual(dbPayload, reqBody.body) 
                &&
                (_.isEqual(dbresponse, reqBody.response) 
                &&
                (_.isEqual(dbHeaders, reqBody.headers)))
            )
            if (isSame) {
                return res.status(400).json({success: false, message: "Url already exists"});
            } else {
                const result = await url.updateOne(
                    {_id: url._id},
                    reqBody,
                    { new: true }
                )
                if (result.acknowledged) {
                    return res.status(200).json({success: true, message: "Url updated", isModified: true, urlData: url});
                } else {
                    return res.status(400).json({success: false, message: "Url not updated"});
                }
            }
        } else {
            await newUrl.save()
            return res.status(200).json({success: true, message: "url added"});
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
        const urls = await UrlModel.findById({"user_details.id": userId})
        return res.status(200).json({success: true, url: urls})
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: error.message
        })
    }
}