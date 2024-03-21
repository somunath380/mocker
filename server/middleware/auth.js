const jwt = require("jsonwebtoken")
const config = require("../../config")
const basicAuth = require('basic-auth');
const jwtSecret = config.secret


exports.userAuth = (req, res, next) => {
    const token = req.headers['authorization']
    if (token) {
        jwt.verify(token, jwtSecret, (err, decodedToken) => {
            if (err) {
                return res.status(401).json({success: false, message: err.message})
            } else {
                if (decodedToken.role == "basic" || decodedToken.role == "admin") {
                    req.params.userid = decodedToken.id
                    next()
                } else {
                    return res.status(401).json({success: false, message: "Not Authorized"})
                }
            }
        })
    } else {
        return res.status(401).json({success: false, message: "Access token is required"})
    }
}


exports.adminAuth = (req, res, next) => {
    const user = basicAuth(req);
    if (!user || !user.name || !user.pass) {
        res.set('WWW-Authenticate', 'Basic realm=authorization Required');
        return res.status(401).json({success: false, message: 'Unauthorized'})
    }
    if (user.name === config.superuser && user.pass === config.superpwd) {
        return next(); // Authentication successful, proceed to the next middleware or route handler
    } else {
        res.set('WWW-Authenticate', 'Basic realm=authorization Required');
        return res.status(401).json({success: false, message: 'Unauthorized'})
    }
}

exports.loginAuth = (req, res, next) => {
    // check if the access token is expired in the header or not
    const accessToken = req.headers['authorization']
    try {
        // if there is accesstoken then skip generateTokens
        if (accessToken) {
            jwt.verify(accessToken, jwtSecret, (err, decodedToken) => {
                if (err) {
                    return res.status(401).json({success: false, message: err.message})
                } else {
                    if (decodedToken.role == "basic" || decodedToken.role == "admin") {
                        req.body.userid = decodedToken.id
                        req.body.skip = true
                        return next()
                    } else {
                        return res.status(403).json({success: false, message: "Not Authorized"})
                    }
                }
            })
        }
        else {
            return next()
        }
    } catch (err) {
        return res.status(401).json({success: false, message: err.message})
    }
}


exports.logoutAuth = (req, res, next) => {
    // check if the access token is expired in the header or not
    const accessToken = req.headers['authorization']
    try {
        // if there is accesstoken then skip generateTokens
        if (accessToken) {
            jwt.verify(accessToken, jwtSecret, (err, decodedToken) => {
                if (err) {
                    return res.status(401).json({success: false, message: err.message})
                } else {
                    if (decodedToken.role == "basic" || decodedToken.role == "admin") {
                        req.body.userid = decodedToken.id
                        return next()
                    } else {
                        return res.status(403).json({success: false, message: "Not Authorized"})
                    }
                }
            })
        }
        else {
            return res.status(401).json({success: false, message: "Access token required"})
        }
    } catch (err) {
        return res.status(401).json({success: false, message: err.message})
    }
}
