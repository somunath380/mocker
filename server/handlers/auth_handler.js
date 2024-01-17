require('dotenv').config();
const config = require("../../config")
const {UserModel, RefreshTokenModel} = require("../../models/user_schema")
const { isAuthorized } = require("../encryption")
const {generateAccessToken, generateRefreshToken} = require("../tokens/generate")
const jwt = require("jsonwebtoken")
const jwtSecret = config.secret

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
        const dbUserId = storedRefreshToken.userId.toString()
        // here take the user id from the decrypted jwt token and compare the dbUserId
        const decodedToken = await jwt.verify(refreshToken, jwtSecret)
        if (decodedToken?.id && dbUserId !== decodedToken.id) {
            return res.status(401).json({
                success: false,
                error: "Invalid token passed!"
            })
        }
        // create new access token and refresh token
        refreshToken = await generateRefreshToken(dbUserId)
        const newRefreshToken = RefreshTokenModel({
            token: refreshToken,
            userId: dbUserId,
            expiresAt: new Date(Date.now() + config.maxRefreshTokenTTL * 1000)
        })
        await newRefreshToken.save();
        //delete old refresh token
        await storedRefreshToken.deleteOne()
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
                sameSite: 'lax',
                secure: true, // for https
            }
        )
        return res.status(200).json({success: true, accessToken});
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "error",
            error: error.message
        })
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
            const refreshToken = await generateRefreshToken(user._id)
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
                    sameSite: 'lax',
                    secure: true
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

exports.getUserDetails = async (req, res, next) => {
    try {
        let refreshToken = reqcookies.refreshToken
        if (!refreshToken) {
            // if no refresh token found re-login
            return res.status(302).json({
                success: false,
                reLogin: true,
                error: "provide cookie in request"
            })
        }
        // verify refresh token from db
        const storedRefreshToken = await RefreshTokenModel.findOne({ token: refreshToken });
        if (!storedRefreshToken || new Date(storedRefreshToken.expiresAt) < new Date()) {
            // If the refresh token is not valid or has expired, send Unauthorized status
            return res.status(302).json({
                success: false,
                reLogin: true,
                error: "user session expired"
            })
        }
        const dbUserId = storedRefreshToken.userId.toString()
        // here take the user id from the decrypted jwt token and compare the dbUserId
        const decodedToken = await jwt.verify(refreshToken, jwtSecret)
        if (decodedToken?.id && dbUserId !== decodedToken.id) {
            return res.status(401).json({
                success: false,
                error: "wrong user is trying to access resource"
            })
        }
        return res.status(200).json({success: true, message: "valid token"});
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "error",
            error: error.message
        })
    }
}
