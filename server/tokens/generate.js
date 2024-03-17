const jwt = require("jsonwebtoken")
require('dotenv').config();
const config = require("../../config")
const jwtSecret = config.secret
const {getData, setData, deleteData} = require('../../redis')

exports.generateAccessToken = async (userData) => {
    // userData contains user id, role
    const expiresIn = config.maxAccessTokenTTL // 15 min in secs
    let accessToken
    // get accessToken from redis
    accessToken = await getData('accessToken')
    // if no accessToken is found then generate new accessToken
    if (!accessToken) {
        const newAccessToken = jwt.sign(userData, jwtSecret, { expiresIn })
        // save the new token in redis
        await setData('accessToken', newAccessToken, expiresIn)
        accessToken = newAccessToken
    }
    // return the token from redis
    return accessToken
}

exports.generateRefreshToken = async (user_id) => {
    const expiresIn = config.maxRefreshTokenTTL; // 7 days in secs
    let refreshToken
    // get refreshToken from redis
    refreshToken = await getData('refreshToken')
    // if no token is found then generate new refreshToken
    if (!refreshToken){
        const newRefreshToken = jwt.sign({id: user_id}, jwtSecret, { expiresIn });
        // save the new token in redis
        await setData('refreshToken', newRefreshToken, expiresIn)
        refreshToken = newRefreshToken
    }
    // return the token from redis
    return refreshToken
}

exports.checkAndDeleteAccessToken = async () => {
    try {
        const accessToken = await getData('accessToken')
        if (!accessToken){
            return
        }
        jwt.verify(accessToken, jwtSecret, async (err, decodedToken) => {
            if (err) {
                await deleteData('accessToken')
                console.log('delete accesstoken run success');
            }
        });
        return
    } catch (error) {
        console.error('Error while executing checkAndDeleteAccessToken, error: ', error)
    }
}