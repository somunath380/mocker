require('dotenv').config();
const config = require("../../config")
const {UserModel, RefreshTokenModel} = require("../../models/user_schema")
const { isAuthorized } = require("../encryption")
const {generateAccessToken, generateRefreshToken} = require("../tokens/generate")
const jwt = require("jsonwebtoken")
const jwtSecret = config.secret

exports.userLogin = async (req, res, next) => {
    console.log("userLogin api is called...");
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
                message: "user not found"
            })
        } else {
            const dbPassword = user.password
            const isAuthentic = await isAuthorized(reqPassword, dbPassword)
            if (isAuthentic){
                user.logIn = true
                await user.save()
                return res.status(200).json({
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
            message: error.message
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
                message: "user not found"
            })
        } else {
            user.logIn = false
            await user.save()
            return res.status(200).json({
                success: true,
                message: "Logged out successfully"
            })
        }
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message
        })
    }
}

exports.getRefreshToken = async (req, res, next) => {
    console.log("getRefreshToken api is called...");
    try {
        // get refresh token from cookie
        let refreshToken = req.cookies.refreshToken
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "provide refresh token"
            })
        }
        // verify refresh token from db
        const storedRefreshToken = await RefreshTokenModel.findOne({ token: refreshToken });
        if (!storedRefreshToken || new Date(storedRefreshToken.expiresAt) < new Date()) {
            // If the refresh token is not valid or has expired, send Unauthorized status
            return res.status(401).json({
                success: false,
                message: "user session expired, please re-login"
            })
        }
        // check the user id is same or not
        const dbUserId = storedRefreshToken.userId.toString()
        // here take the user id from the decrypted jwt token and compare the dbUserId
        const decodedToken = await jwt.verify(refreshToken, jwtSecret)
        if (decodedToken?.id && dbUserId !== decodedToken.id) {
            return res.status(401).json({
                success: false,
                message: "Invalid token passed!"
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
            message: error.message
        })
    }
}


exports.generateTokens = async (req, res, next) => {
    console.log("generateTokens api token api is called...");
    try {
        const body = req.body
        if (body?.skip) {
            return next()
        }
        const username = body.username
        const reqPassword = body.password
        const user = await UserModel.findOne({username})
        if (!user){
            return res.status(405).json({
                success: false,
                message: "user not found"
            })
        } else {
            const dbPassword = user.password
            const isAuthentic = await isAuthorized(reqPassword, dbPassword)
            if (!isAuthentic) {
                return res.status(400).json({
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
                    sameSite: 'None',
                    secure: true,
                    // domain: 'http://127.0.0.1:5173',
                    // path: '/'
                }
            )
            const userResponse = {
                id: user._id,
                username: user.username,
                accesstoken: accessToken
            }
            const reLogin = user.logIn? false : true
            return res.status(200).json({success: true, user: userResponse, reLogin});
            // using return here so the next handler will not be called
            // next("route")
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message});
    }
}

exports.validateAccessToken = async (req, res, next) => {
    // validates the refreshToken first and then validates accessToken and sends true or false
    console.log("validateAccessToken api token api is called...");
    const accessToken = req.headers['authorization']
    let refreshToken = req.cookies.refreshToken
    if (!refreshToken){
        return res.status(401).json({ success: false })
    }
    const storedRefreshToken = await RefreshTokenModel.findOne({ token: refreshToken });
    if (!storedRefreshToken || new Date(storedRefreshToken.expiresAt) < new Date()) {
        // If the refresh token is not valid or has expired, send Unauthorized status
        return res.status(401).json({ success: false })
    }
    const dbUserId = storedRefreshToken.userId.toString()
    const decodedToken = await jwt.verify(refreshToken, jwtSecret)
    if (decodedToken?.id && dbUserId !== decodedToken.id){
        return res.status(401).json({ success: false })
    }
    if (!accessToken){
        return res.status(401).json({ success: false })
    }
    jwt.verify(accessToken, jwtSecret, (err, decodedToken) => {
        if (err) {
            return res.status(401).json({success: false})
        }
        return res.status(200).json({ success: true})
    })
}

exports.validateRefreshToken = async (req, res, next) => {
    // validates the refreshToken and sends user details
    console.log("validateRefreshToken api token api is called...");
    try {
        let refreshToken = req.cookies.refreshToken
        if (!refreshToken) {
            // if no refresh token found re-login
            return res.status(400).json({
                success: false,
                reLogin: true,
                message: "no cookie set"
            })
        }
        // verify refresh token from db
        const storedRefreshToken = await RefreshTokenModel.findOne({ token: refreshToken });
        if (!storedRefreshToken || new Date(storedRefreshToken.expiresAt) < new Date()) {
            // If the refresh token is not valid or has expired, send Unauthorized status
            return res.status(302).json({
                success: false,
                reLogin: true,
                message: "session expired, please re login"
            })
        }
        const dbUserId = storedRefreshToken.userId.toString()
        // here take the user id from the decrypted jwt token and compare the dbUserId
        const decodedToken = await jwt.verify(refreshToken, jwtSecret)
        if (decodedToken?.id && dbUserId !== decodedToken.id) {
            return res.status(401).json({
                success: false,
                message: "wrong user is trying to access resource"
            })
        }
        const user = await UserModel.findById(decodedToken.id)
        return res.status(200).json({success: true, message: "valid token", user: {
            id: user._id,
            username: user.username,
            logIn: user.logIn
        }});
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message
        })
    }
}

exports.getAccessToken = async (req, res, next) => {
    // check if the refresh token is valid or not
    console.log("getAccessToken api is called...");
    try {
        let refreshToken = req.cookies.refreshToken
        if (!refreshToken) {
            // if no refresh token found re-login
            return res.status(302).json({
                success: false,
                reLogin: true,
                message: "provide cookie in request"
            })
        }
        // verify refresh token from db
        const storedRefreshToken = await RefreshTokenModel.findOne({ token: refreshToken });
        if (!storedRefreshToken || new Date(storedRefreshToken.expiresAt) < new Date()) {
            // If the refresh token is not valid or has expired, send Unauthorized status
            return res.status(302).json({
                success: false,
                reLogin: true,
                message: "user session expired"
            })
        }
        const dbUserId = storedRefreshToken.userId.toString()
        // here take the user id from the decrypted jwt token and compare the dbUserId
        const decodedToken = await jwt.verify(refreshToken, jwtSecret)
        if (decodedToken?.id && dbUserId !== decodedToken.id) {
            return res.status(401).json({
                success: false,
                message: "wrong user is trying to access resource"
            })
        }
        // generate access token
        const user = await UserModel.findById(dbUserId)
        const accessToken = await generateAccessToken({"id": dbUserId, "role": user.role})
        return res.status(200).json({success: true, accesstoken: accessToken});
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "error",
            message: error.message
        })
    }
}
