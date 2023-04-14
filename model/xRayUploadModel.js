const mongoose = require("mongoose");

const xrayUploadModel = mongoose.Schema({
    email: {
        type: String,
        require: true,
    },
    file: {
        type: Buffer,
        require: true
    },
    date: {
        type: Date,
        default: Date.now,
    }
});


module.exports = mongoose.model("xrayUpload", xrayUploadModel);