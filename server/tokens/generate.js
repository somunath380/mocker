const jwt = require("jsonwebtoken")
const config = require("../../config")
const jwtSecret = config.secret
const {getData, setData, deleteData} = require('../../redis')

exports.generateAccessToken = async (userData, newToken = false) => {
    // userData contains user id, role
    const expiresIn = config.maxAccessTokenTTL;
    let accessToken;
    let id = userData.id;
    accessToken = await getData(`${id}_access_token`);
    if (!accessToken || newToken) {
        const newAccessToken = jwt.sign(userData, jwtSecret, { expiresIn });
        await setData(`${id}_access_token`, newAccessToken, expiresIn);
        accessToken = newAccessToken;
    }
    return accessToken;
};

exports.generateRefreshToken = async (user_id, newToken = false) => {
    const expiresIn = config.maxRefreshTokenTTL; // 7 days in secs
    let refreshToken
    // get refreshToken from redis
    refreshToken = await getData(`${user_id}_refresh_token`)
    // if no token is found then generate new refreshToken
    if (!refreshToken || newToken){
        const newRefreshToken = jwt.sign({id: user_id}, jwtSecret, { expiresIn });
        // save the new token in redis
        await setData(`${user_id}_refresh_token`, newRefreshToken, expiresIn)
        refreshToken = newRefreshToken
    }
    // return the token from redis
    return refreshToken
}

// not using this to delete any token
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