require('dotenv').config();
const config = require("../../config")
const {UserModel, RefreshTokenModel} = require("../../models/user_schema")
const { isAuthorized } = require("../encryption")
const {generateAccessToken, generateRefreshToken} = require("../tokens/generate")

exports.userLogin = async (req, res, next) => {
    try {
        // check then bearer auth token
        const body = req.body
        const userId = body.userid
        const username = body.username
        const reqPassword = body.password
        const user = await UserModel.findById(userId)
        if (!user){
            return res.status(401).json({
                success: false,
                error: "user not found"
            })
        } else {
            const dbPassword = user.password
            const isAuthentic = await isAuthorized(reqPassword, dbPassword)
            if (isAuthentic){
                user.logIn = true
                await user.save()
                res.status(200).json({
                    success: true,
                    "user": {
                        id: user._id,
                        "username": user.username,
                        "login": user.logIn
                    }
                })
            } else {
                return res.status(403).json({
                    success: false,
                    message: "incorrect login details given"
                })
            }
        }
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "error",
            error: error.message
        })
    }
}


exports.userLogout = async (req, res, next) => {
    try {
        const body = req.body
        const userId = body.userid
        const username = body.username
        const user = await UserModel.findById(userId)
        if (!user){
            return res.status(401).json({
                success: false,
                error: "user not found"
            })
        } else {
            user.logIn = false
            await user.save()
            return res.status(200).json({
                success: true,
                msg: "Logged out successfully"
            })
        }
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "error",
            error: error.message
        })
    }
}

exports.getRefreshToken = async (req, res, next) => {
    try {
        // get refresh token from cookie
        let refreshToken = req.cookies.refreshToken
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                error: "provide refresh token"
            })
        }
        // verify refresh token from db
        const storedRefreshToken = await RefreshTokenModel.findOne({ token: refreshToken });
        if (!storedRefreshToken || new Date(storedRefreshToken.expiresAt) < new Date()) {
            // If the refresh token is not valid or has expired, send Unauthorized status
            return res.status(401).json({
                success: false,
                error: "user session expired, please re-login"
            })
        }
        // check the user id is same or not
        const dbUserId = storedRefreshToken.userId
        const reqUserId = req.params.user_id
        if (dbUserId != reqUserId){
            return res.status(401).json({
                success: false,
                error: "incorrect user id passed"
            })
        }
        // create new access token and refresh token
        refreshToken = await generateRefreshToken()
        const newRefreshToken = RefreshTokenModel({
            token: refreshToken,
            userId: dbUserId,
            expiresAt: new Date(Date.now() + config.maxRefreshTokenTTL * 1000)
        })
        await newRefreshToken.save();
        // generate access token
        const user = await UserModel.findById(dbUserId)
        const accessToken = await generateAccessToken({"id": dbUserId, "role": user.role})
        // set refresh token in cookie
        res.cookie(
            "refreshToken",
            refreshToken,
            {
                httpOnly: true, 
                maxAge: config.maxRefreshTokenTTL * 1000, 
                // sameSite: 'strict'
                // secure: process.env.NODE_ENV === 'production', // for https
            }
        )
        return res.status(200).json({success: true, accessToken});
    } catch (error) {
        
    }
}


exports.checkUserDetails = async (req, res, next) => {
    try {
        const body = req.body
        if (body?.skip) {
            return next()
        }
        const username = body.username
        const reqPassword = body.password
        const user = await UserModel.findOne({username})
        if (!user){
            return res.status(401).json({
                success: false,
                error: "user not found"
            })
        } else {
            const dbPassword = user.password
            const isAuthentic = await isAuthorized(reqPassword, dbPassword)
            if (!isAuthentic) {
                return res.status(403).json({
                    success: false,
                    message: "incorrect login details given"
                })
            }
            user.logIn = true
            await user.save()
            // generate new access token and refresh token
            const refreshToken = await generateRefreshToken()
            const newRefreshToken = RefreshTokenModel({
                token: refreshToken,
                userId: user._id,
                expiresAt: new Date(Date.now() + config.maxRefreshTokenTTL * 1000)
            })
            await newRefreshToken.save();
            // generate access token
            const accessToken = await generateAccessToken({"id": user._id, "role": user.role})
            // set refresh token in cookie
            res.cookie(
                "refreshToken",
                refreshToken,
                {
                    httpOnly: true, 
                    maxAge: config.maxRefreshTokenTTL * 1000, 
                    // sameSite: 'strict'
                    // secure: process.env.NODE_ENV === 'production', // for https
                }
            )
            const userResponse = {
                id: user._id,
                username: user.username,
                accesstoken: accessToken
            }
            res.status(200).json({success: true, userResponse, reLogin: true,});
            next("route")
        }
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message});
    }
}
