const jwt = require("jsonwebtoken")
require('dotenv').config();
const config = require("../../config")
const jwtSecret = config.secret

exports.generateAccessToken = async (userData) => {
    // userData contains user id, role
    const expiresIn = config.maxAccessTokenTTL // 15 min in secs
    return jwt.sign(userData, jwtSecret, { expiresIn })
}

exports.generateRefreshToken = async (user_id) => {
    const expiresIn = config.maxRefreshTokenTTL; // 7 days in secs
    return jwt.sign({"id": user_id}, jwtSecret, { expiresIn });
}