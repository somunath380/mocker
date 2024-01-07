const {UserModel} = require("../../models/user_schema")
const { encryptPassword, isAuthorized } = require("../encryption")
const jwt = require("jsonwebtoken")

const maxExpiry = 3 * 60 * 60
const jwtSecret = process.env.SECRET

exports.createuser = async (req, res, next) => {
    // body = {'username': 'str', 'email': 'str', 'password': 'str'}
    try {
        const body = req.body;
        const password = body.password
        const hashedPassword = await encryptPassword(password)
        body.password = hashedPassword
        const newUser = new UserModel(body);
        await newUser.validate();
        const saveUser = await newUser.save();
        
        // create jwt token
        const token = jwt.sign(
            {
                id: newUser._id,
                username: newUser.username,
                role: newUser.role
            },
            jwtSecret,
            {
                expiresIn: maxExpiry
            }
        )
        // set jwt token in cookie
        res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: maxExpiry * 1000
        })

        res.status(200).json({success: true, user: saveUser});
    } catch (error) {
        res.status(400).json({error: error.message});
        process.exit(1)
    }
}

exports.login = async (req, res, next) => {
    try {
        const body = req.body
        const username = body.username
        if (!body.password) {
            res.status(400).json({
                success: false,
                error: "password is required"
            })
        }
        const user = await UserModel.findOne({username})
        if (!user){
            res.status(401).json({
                success: false,
                error: "user not found"
            })
        } else {
            const dbPassword = user.password
            const reqPassword = body.password
            const isAuthentic = await isAuthorized(reqPassword, dbPassword)
            if (isAuthentic){

                // create jwt token
                const token = jwt.sign(
                    {
                        id: user._id,
                        username: user.username,
                        role: user.role
                    },
                    jwtSecret,
                    {
                        expiresIn: maxExpiry
                    }
                )
                // set jwt token in cookie
                res.cookie("jwt", token, {
                    httpOnly: true,
                    maxAge: maxExpiry * 1000
                })

                res.status(200).json({
                    success: true,
                    user
                })
            } else {
                res.status(403).json({
                    success: false,
                    message: "incorrect password given"
                })
            }
        }
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "error",
            error: error.message
        })
    }
}

exports.updateUserRole = async (req, res, next) => {
    try {
        const {role, id} = req.body;
        if (role && id) {
            if (role === "admin") {
                const user = await UserModel.findById(id)
                if (!user) {
                    res.status(400).json({
                        success: false,
                        message: "no user found",
                    })
                } else {
                    if (user.role !== "admin"){
                        user.role = role
                        const savedUser = await user.save()
                        res.status(201).json({
                            success: true,
                            message: "role updated",
                            user: savedUser
                        })
                    } else {
                        res.status(400).json({ success: false, message: "User is already an Admin" });
                    }
                }
            } else {
                res.status(400).json({
                    success: false,
                    message: "role is not admin",
                })
            }
        } else {
            res.status(400).json({success: false, message: "role and user id required"})
        }
    } catch (error) {
        res.status(400).json({success: false, message: "error occured", error: error.message})
        process.exit(1)
    }
}

exports.deleteUser = async (req, res, next) => {
    const {id} = req.body
    try {
        const user = await UserModel.findById(id)
        if (!user) {
            res.status(400).json({
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
        res.status(400).json({success: false, message: "error occured", error: error.message})
        process.exit(1)
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
        res.status(400).json({success: false, message: "error occured", error: error.message})
        process.exit(1)
    }
}

exports.getUser = async (req, res, next) => {
    try {
        const id = req.params.id
        const user = await UserModel.findById(id)
        if (!user) {
            res.status(400).json({
                success: false,
                message: "no user found",
            }) 
        } else {
            res.status(200).json({
                success: true,
                user
              });
        }
    } catch (error) {
        res.status(400).json({success: false, message: "error occured", error: error.message})
        process.exit(1)
    }
}
