const mongoose = require("mongoose")
const validator = require("validator")

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
        index: true,
        trim: true,
        validate: {
        validator: function (value) {
            return /^[a-zA-Z0-9]+$/.test(value);
        },
            message: 'Username must contain only letters and numbers.',
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
        validator: function (value) {
            return validator.isEmail(value);
        },
            message: 'Invalid email address.',
        },
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        validate: {
        validator: function (value) {
            // Custom validation function for password (example: must contain at least one digit)
            const digitRegex = /\d/;
            const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
            const capitalLetterRegex = /[A-Z]/;
            return digitRegex.test(value) && specialCharRegex.test(value) && capitalLetterRegex.test(value);
        },
        message: 'Password must contain at least one digit, one special character, and one capital letter.',
        },
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

const refreshTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    }
})

const UserModel = mongoose.model('User', UserSchema)
const RefreshTokenModel = mongoose.model('RefreshToken', refreshTokenSchema);
module.exports = {UserModel, RefreshTokenModel}
