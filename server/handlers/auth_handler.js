require('dotenv').config();
const config = require("../../config")
const {UserModel, RefreshTokenModel} = require("../../models/user_schema")
const { isAuthorized } = require("../encryption")
const {generateAccessToken, generateRefreshToken} = require("../tokens/generate")
const jwt = require("jsonwebtoken")
const jwtSecret = config.secret

exports.userLogin = async (req, res, next) => {
    // this will save login as true of the user, it will also generate new refreshtoken after checking if there is any refreshtoken or not
    console.log("userLogin api is called...");
    try {
        // check the bearer auth token
        const body = req.body
        const user = await UserModel.findOne({username: body.username})
        if (!user){
            return res.status(401).json({
                success: false,
                message: "user not found"
            })
        } else {
            const dbPassword = user.password
            const isAuthentic = await isAuthorized(body.password, dbPassword)
            if (isAuthentic){
                user.logIn = true
                await user.save()
                let refreshToken
                // check if any refreshtoken is present for the user
                const tokenObj = await RefreshTokenModel.findOne({userId: user._id}, {token: 1,  _id: 0})
                if (!tokenObj){
                    // generate new access token and refresh token
                    refreshToken = await generateRefreshToken(user._id, newToken = true)
                    const newRefreshToken = RefreshTokenModel({
                        token: refreshToken,
                        userId: user._id,
                        expiresAt: new Date(Date.now() + config.maxRefreshTokenTTL * 1000)
                    })
                    await newRefreshToken.save();
                    // set refresh token in cookie
                    res.cookie(
                        `${user._id}_refresh_token`,
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
                } else {
                    refreshToken = tokenObj.token
                }
                // generate access token
                const accessToken = await generateAccessToken({id: user._id, role: user.role}, newToken = true)
                const userResponse = {
                    id: user._id,
                    username: user.username,
                    accesstoken: accessToken
                }
                return res.status(200).json({
                    success: true, 
                    'user': userResponse, 
                    'login': user.logIn
                });
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
            let refreshToken;
            // check if refreshToken is already generated for user
            const tokenObj = await RefreshTokenModel.findOne({userId: user._id}, {token: 1,  _id: 0})
            if (!tokenObj){
                // generate new access token and refresh token
                refreshToken = await generateRefreshToken(user._id, newToken = true)
                const newRefreshToken = RefreshTokenModel({
                    token: refreshToken,
                    userId: user._id,
                    expiresAt: new Date(Date.now() + config.maxRefreshTokenTTL * 1000)
                })
                await newRefreshToken.save();
            } else {
                refreshToken = tokenObj.token
            }
            // generate access token
            const accessToken = await generateAccessToken({id: user._id, role: user.role}, newToken = true)
            // set refresh token in cookie
            res.cookie(
                `${user._id}_refresh_token`,
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
            return res.status(200).json({
                success: true, 
                'user': userResponse, 
                'login': user.logIn
            });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message});
    }
}

exports.validateAccessToken = async (req, res, next) => {
    // validates the refreshToken first and then validates accessToken and sends true or false
    console.log("validateAccessToken api token api is called...");
    try {
        const body = req.body
        const userId = body?.id
        if (!userId) {
            return res.status(500).json({
                success: false,
                message: "user id is null"
            })
        }
        const accessToken = req.headers['authorization']
        let cookies = req.cookies // dict
        let refrestTokenKey = `${userId}_refresh_token`
        let refreshToken = cookies[refrestTokenKey]
        if (!refreshToken) {
            return res.status(401).json({ success: false })
        }
        const storedRefreshToken = await RefreshTokenModel.findOne({ token: refreshToken }, {userId: 1, expiresAt: 1});
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
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
    
}

exports.validateRefreshToken = async (req, res, next) => {
    // validates the refreshToken and sends user details
    console.log("validateRefreshToken api token api is called...");
    try {
        const body = req.body
        const userId = body?.id
        if (!userId) {
            return res.status(500).json({
                success: false,
                message: "user id is null"
            })
        }
        let cookies = req.cookies // dict
        let refrestTokenKey = `${userId}_refresh_token`
        let refreshToken = cookies[refrestTokenKey]
        if (!refreshToken) {
            // if no refresh token found re-login
            return res.status(400).json({
                success: false,
                reLogin: true,
                message: "no cookie set"
            })
        }
        // verify refresh token from db
        const storedRefreshToken = await RefreshTokenModel.findOne({ token: refreshToken }, {userId: 1});
        if (!storedRefreshToken || new Date(storedRefreshToken.expiresAt) < new Date()) {
            // If the refresh token is not valid or has expired, send Unauthorized status
            return res.status(302).json({
                success: false,
                reLogin: true,
                message: "session expired, please re login"
            })
        }
        const dbUserId = storedRefreshToken.userId.toString()
        // take the user id from the decrypted jwt token and compare the dbUserId
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
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getAccessToken = async (req, res, next) => {
    // check if the refresh token is valid or not
    console.log("getAccessToken api is called...");
    try {
        const body = req.body
        const userId = body?.id
        if (!userId) {
            return res.status(500).json({
                success: false,
                message: "user id is null"
            })
        }
        let cookies = req.cookies // dict
        let refrestTokenKey = `${userId}_refresh_token`
        let refreshToken = cookies[refrestTokenKey]
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
        const accessToken = await generateAccessToken({"id": dbUserId, "role": user.role}, newToken = true)
        return res.status(200).json({success: true, accesstoken: accessToken});
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "error",
            message: error.message
        })
    }
}


exports.checkRefreshToken = async (req, res, next) => {
    console.log("checkRefreshToken api is called...");
    try {
        const body = req.body
        const userId = body?.id
        if (!userId) {
            return res.status(500).json({
                success: false,
                message: "user id is null"
            })
        }
        let cookies = req.cookies
        let refrestTokenKey = `${userId}_refresh_token`
        let refreshToken = cookies[refrestTokenKey]
        if (!refreshToken) {
            return res.status(200).json({success: false});
        }
        return res.status(200).json({success: true});
    } catch (error) {
        throw new Error(`error occured at checkRefreshToken: ${error}`)
    }
}
