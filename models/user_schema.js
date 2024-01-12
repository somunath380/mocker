const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        unique: true,
        index: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "basic",
        required: false
    },
    logIn: {
        type: Boolean,
        default: false
    }
})

const UserModel = mongoose.model('User', UserSchema)
module.exports = {UserModel}
