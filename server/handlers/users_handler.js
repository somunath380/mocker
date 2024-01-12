require('dotenv').config();
const config = require("../../config")
const {UserModel} = require("../../models/user_schema")
const { encryptPassword, isAuthorized } = require("../encryption")
const jwt = require("jsonwebtoken")

const maxExpiryInSec = 24 * 60
const jwtSecret = config.secret

exports.createUser = async (req, res, next) => {
    // body = {'username': 'str', 'email': 'str', 'password': 'str'}
    try {
        const body = req.body;
        const password = body.password
        const hashedPassword = await encryptPassword(password)
        body.password = hashedPassword
        // check if the user already exists or not
        let user = await UserModel.findOne({"username": body.username})
        if (user){
            return res.status(401).json({
                success: false,
                error: "user already exists"
            })
        } else {
            // else create the user
            const newUser = new UserModel(body);
            await newUser.validate();
            await newUser.save();
            user = {
                username: newUser.username,
                login: newUser.logIn
            }
            res.status(200).json({success: true, user, reLogin: true});
        }
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message});
    }
}

exports.login = async (req, res, next) => {
    try {
        const body = req.body
        const username = body.username
        const user = await UserModel.findOne({username})
        if (!user){
            return res.status(401).json({
                success: false,
                error: "user not found"
            })
        } else {
            const dbPassword = user.password
            const reqPassword = body.password
            const isAuthentic = await isAuthorized(reqPassword, dbPassword)
            if (isAuthentic){
                // create jwt token
                // token for re-login
                const token = jwt.sign(
                    {
                        reLogin: false,
                        role: user.role
                    },
                    jwtSecret,
                    {
                        expiresIn: maxExpiryInSec
                    }
                )
                res.cookie("jwt", token, {
                    httpOnly: true,
                    maxAge: maxExpiryInSec * 1000
                })
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
                    message: "incorrect password given"
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

exports.logOut = async (req, res, next) => {
    try {
        const body = req.body
        const username = body.username
        const user = await UserModel.findOne({username})
        if (!user){
            return res.status(401).json({
                success: false,
                error: "user not found"
            })
        } else {
            const dbPassword = user.password
            const reqPassword = body.password
            const isAuthentic = await isAuthorized(reqPassword, dbPassword)
            if (isAuthentic) {
                user.logIn = false
                await user.save()
                res.status(200).json({
                    success: true,
                    msg: "Logged out successfully"
                })
            } else {
                return res.status(403).json({
                    success: false,
                    message: "incorrect password given"
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

exports.updateUserRole = async (req, res, next) => {
    try {
        const {role, id } = req.body;
        if (role && id) {
        const user = await UserModel.findById(id)
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "no user found",
            })
        } else {
            user.role = role
            const savedUser = await user.save()
            const token = jwt.sign(
                {
                    reLogin: false,
                    role: user.role
                },
                jwtSecret,
                {
                    expiresIn: maxExpiryInSec
                }
            )
            res.cookie("jwt", token, {
                httpOnly: true,
                maxAge: maxExpiryInSec * 1000
            })
            res.status(201).json({
                success: true,
                message: "role updated",
                "user": {
                    "username": savedUser.username,
                    "role": savedUser.role,
                    "login": savedUser.logIn
                }
            })
        }
        } else {
            return res.status(400).json({success: false, message: "role and user id required"})
        }
    } catch (error) {
        return res.status(400).json({success: false, message: "error occured", error: error.message})
    }
}

exports.deleteUser = async (req, res, next) => {
    const {id} = req.body
    try {
        const user = await UserModel.findById(id)
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "no user found",
            })
        } else {
            await user.deleteOne()
            res.status(200).json({
                success: true,
                message: "user deleted"
            })
        }
    } catch (error) {
        return res.status(400).json({success: false, message: "error occured", error: error.message})
    }
}

exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await UserModel.find()
        res.status(200).json({
            success: true,
            users: users,
          });
    } catch (error) {
        return res.status(400).json({success: false, message: "error occured", error: error.message})
    }
}

exports.getUser = async (req, res, next) => {
    try {
        const id = req.params.id
        const user = await UserModel.findById(id)
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "no user found",
            }) 
        } else {
            res.status(200).json({
                success: true,
                "user": {
                    id: user._id,
                    "username": user.username,
                    "login": user.logIn
                }
              });
        }
    } catch (error) {
        return res.status(400).json({success: false, message: "error occured", error: error.message})
    }
}
