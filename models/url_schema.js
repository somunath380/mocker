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
        validate: {
            validator: function(value) {
                return typeof value === 'object' && !Array.isArray(value);
            }, // Use a custom validation function
            message: 'response must be a non-array object' // Error message if validation fails
        }
    },
    // this headers defines the response headers, the response
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
    },
    user_details: {
        id: {type: ObjectId, required: true, index: true, unique: true},
        username: {type: String, required: true, index: true, unique: true}
    },
    createdDate: {
        type: String,
        default: function () {
            return this.formattedDate(new Date())
        }
    }
})

UrlSchema.methods.formattedDate = function (date){
    let day = date.getDate();
    let month = date.getMonth() + 1; // Month is zero-based
    const year = date.getFullYear();
    let hours = date.getHours() % 12 || 12; // Convert to 12-hour format
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    if (day < 10){
        day = '0' + day.toString()
    }
    if (month < 10){
        month = '0' + month.toString()
    }
    if (hours < 10){
        hours = '0' + hours.toString()
    }
    if (minutes < 10){
        minutes = '0' + minutes.toString()
    }
    if (seconds < 10){
        seconds = '0' + seconds.toString()
    }
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
}

const UrlModel = mongoose.model('Url', UrlSchema)
module.exports = {UrlModel}
