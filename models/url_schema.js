const { ObjectId, Int32 } = require("mongodb")
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
    identifier: {
        type: String,
        index: true,
        unique: true,
        required: true
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
        index: true
    },
    method: {
        type: String,
        required: true
    },
    body: {
        type: mongoose.Schema.Types.Mixed,
        required: false,
        default: {}
    },
    response: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        default: {}
    },
    headers: {
        type: mongoose.Schema.Types.Mixed,
        required: false,
        default: {}
    },
    status_code: {
        type: Number,
        required: true
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
