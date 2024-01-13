const {UserModel} = require("../../models/user_schema")

exports.checkUser = async (req, res, next) => {
    try {
        const userId = req.params.userid;
        const user = await UserModel.findById(userId)
        if (user) {
            next()
        } else {
            return res.status(401).json({success: false, message: "no user found"})
        }
    } catch (err) {
        return res.status(401).json({success: false, error: err.message})
    }
}