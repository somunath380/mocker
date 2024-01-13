require('dotenv').config();
const jwt = require("jsonwebtoken")
const config = require("../../config")
const basicAuth = require('basic-auth');
const jwtSecret = config.secret

exports.adminAuth = (req, res, next) => {
    const token = req.headers['Authorization']
    if (token) {
        jwt.verify(token, jwtSecret, (err, decodedToken) => {
            if (err) {
                return res.status(401).json({success: false, message: err.message})
            } else {
                if (decodedToken.role == "admin") {
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

exports.userAuth = (req, res, next) => {
    const token = req.headers['Authorization']
    if (token) {
        jwt.verify(token, jwtSecret, (err, decodedToken) => {
            if (err) {
                return res.status(401).json({success: false, message: err.message})
            } else {
                if (decodedToken.role == "basic" || decodedToken.role == "admin") {
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


exports.basicAuth = (req, res, next) => {
    const user = basicAuth(req);
    if (!user || !user.name || !user.pass) {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        return res.status(401).send('Unauthorized');
    }
    if (user.name === config.superuser && user.pass === config.superpwd) {
        return next(); // Authentication successful, proceed to the next middleware or route handler
    } else {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        return res.status(401).send('Unauthorized');
    }
}

exports.loginAuth = (req, res, next) => {
    // check if the access token is expired in the header or not
    const accessToken = req.headers['Authorization']
    if (accessToken) {
        jwt.verify(accessToken, jwtSecret, (err, decodedToken) => {
            if (err) {
                return res.status(401).json({success: false, message: err.message})
            } else {
                if (decodedToken.role == "basic" || decodedToken.role == "admin") {
                    req.body.userid = decodedToken.id
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
