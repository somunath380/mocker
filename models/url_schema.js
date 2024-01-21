const { ObjectId } = require("mongodb")
const mongoose = require("mongoose")

const UrlSchema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        unique: true,
        index: true
    },
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true,
        index: true
    },
    filepath: {
        type: String,
        required: false,
        default: false
    },
    url: {
        type: String,
        required: true,
        unique: true,
        index: true,
        validate: {
            validator: function(value) {
                return typeof value === 'string';
            }, // Use a custom validation function
            message: 'Identifier should be a string' // Error message if validation fails
        }
    },
    method: {
        type: String,
        required: true,
        validate: {
            validator: function(value) {
                return typeof value === 'string';
            }, // Use a custom validation function
            message: 'Identifier should be a string' // Error message if validation fails
        }
    },
    body: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        default: {},
        validate: {
            validator: function(value) {
                return typeof value === 'object' && !Array.isArray(value);
            }, // Use a custom validation function
            message: 'body must be a non-array object' // Error message if validation fails
        }
    },
    response: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        default: {},
        validate: {
            validator: function(value) {
                return typeof value === 'object' && !Array.isArray(value);
            }, // Use a custom validation function
            message: 'response must be a non-array object' // Error message if validation fails
        }
    },
    headers: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        default: {},
        validate: {
            validator: function(value) {
                return typeof value === 'object' && !Array.isArray(value);
            }, // Use a custom validation function
            message: 'headers must be a non-array object' // Error message if validation fails
        }
    },
    status_code: {
        type: Number,
        required: true,
        validate: {
            validator: Number.isInteger,
            message: 'Status code should be an Int'
        }
    },
    execute_file: {
        type: Boolean,
        required: false,
        default: false
    },
    user_details: {
        id: {type: ObjectId, required: true, index: true, unique: true},
        username: {type: String, required: true, index: true, unique: true}
    }
})

const UrlModel = mongoose.model('Url', UrlSchema)
module.exports = {UrlModel}
