const jwt = require("jsonwebtoken")
const jwtSecret = process.env.SECRET

exports.adminAuth = (req, res, next) => {
    const token = req.cookies.jwt
    if (token) {
        jwt.verify(token, jwtSecret, (err, decodedToken) => {
            if (err) {
                res.status(401).json({success: false, message: "Not Authorized"})
            } else {
                if (decodedToken.role != "admin") {
                    res.status(401).json({success: false, message: "Not Authorized"})
                } else {
                    next()
                }
            }
        })
    } else {
        res.status(401).json({success: false, message: "token not available, Not Authorized"})
    }
}

exports.userAuth = (req, res, next) => {
    const token = req.cookies.jwt
    if (token) {
        jwt.verify(token, jwtSecret, (err, decodedToken) => {
            if (err) {
                res.status(401).json({success: false, message: "Not Authorized"})
            } else {
                if (decodedToken.role != "basic") {
                    res.status(401).json({success: false, message: "Not Authorized"})
                } else {
                    next()
                }
            }
        })
    } else {
        res.status(401).json({success: false, message: "token not available, Not Authorized"})
    }
}
