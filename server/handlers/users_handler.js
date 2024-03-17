require('dotenv').config();
const config = require("../../config")
const {UserModel, RefreshTokenModel} = require("../../models/user_schema")
const {generateRefreshToken, generateAccessToken} = require("../tokens/generate")
const {encryptPassword} = require("../encryption")

exports.createUser = async (req, res, next) => {
    // body = {'username': 'str', 'email': 'str', 'password': 'str'}
    console.log("createUser api is called...");
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
                message: "user already exists"
            })
        } else {
            // else create the user
            const newUser = new UserModel(body);
            try {
                await newUser.validate();
            } catch (err) {
                console.log("error occured while creating user: ", err);
                return res.status(501).json({success: false, message: "some issue happend"});
            }
            await newUser.save();
            // generate refresh token and save it in db
            const refreshToken = await generateRefreshToken(newUser._id)
            const newRefreshToken = RefreshTokenModel({
                token: refreshToken,
                userId: newUser._id,
                expiresAt: new Date(Date.now() + config.maxRefreshTokenTTL * 1000)
            })
            await newRefreshToken.save();
            // generate access token
            const accessToken = await generateAccessToken({"id": newUser._id, "role": newUser.role})
            // set refresh token in cookie
            res.cookie(
                "refreshToken",
                refreshToken,
                {
                    httpOnly: true, 
                    maxAge: config.maxRefreshTokenTTL * 1000, 
                    sameSite: 'None',
                    secure: true // for https
                }
            )
            const user = {
                id: newUser._id,
                username: newUser.username,
                accesstoken: accessToken
            }
            return res.status(200).json({success: true, user, login: newUser.logIn});
        }
    } catch (error) {
        console.log("error occured while creating user: ", error);
        return res.status(500).json({ success: false, message: error.message});
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
                maxAge: maxExpiryInSec * 1000,
                secure: true,
                sameSite: 'none'
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
            return res.status(200).json({
                success: true,
                message: "user deleted"
            })
        }
    } catch (error) {
        return res.status(400).json({success: false, message: error.message})
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
        return res.status(400).json({success: false, message: error.message})
    }
}

exports.getUser = async (req, res, next) => {
    try {
        const id = req.params.userid
        const user = await UserModel.findById(id)
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "no user found",
            }) 
        } else {
            return res.status(200).json({
                success: true,
                "user": {
                    id: user._id,
                    "username": user.username,
                    "login": user.logIn,
                    "accesstoken": req.headers['authorization']
                }
            });
        }
    } catch (error) {
        return res.status(500).json({success: false, message: error.message})
    }
}
