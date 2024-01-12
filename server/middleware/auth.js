require('dotenv').config();
const jwt = require("jsonwebtoken")
const config = require("../../config")
const basicAuth = require('basic-auth');
const jwtSecret = config.secret

exports.adminAuth = (req, res, next) => {
    const token = req.cookies.jwt
    if (token) {
        jwt.verify(token, jwtSecret, (err, decodedToken) => {
            if (err) {
                res.status(401).json({success: false, message: "Not Authorized"})
            } else {
                if (decodedToken.role == "admin") {
                    next()
                } else {
                    res.status(401).json({success: false, message: "Not Authorized"})
                }
            }
        })
    } else {
        res.status(401).json({success: false, message: "Not Authorized"})
    }
}

exports.userAuth = (req, res, next) => {
    const token = req.cookies.jwt
    if (token) {
        jwt.verify(token, jwtSecret, (err, decodedToken) => {
            if (err) {
                res.status(401).json({success: false, message: "Not Authorized"})
            } else {
                if (decodedToken?.reLogin) {
                    res.status(200).json({success: true, message: "Please re-login"})
                } else {
                    if (decodedToken.role == "basic") {
                        next()
                    } else {
                        res.status(401).json({success: false, message: "Not Authorized"})
                    }
                }
            }
        })
    } else {
        res.status(401).json({success: false, message: "Not Authorized"})
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
