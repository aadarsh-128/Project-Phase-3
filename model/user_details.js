const mongoose = require("mongoose");

const userDetails = mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
        unique: true,
    },
    gender: {
        type: String,
        require: true,
    },
    yearOfBirth: {
        type: Number,
        require: true,
    },
    height: {
        type: Number,
        require: true,
    },
    weight: {
        type: Number,
        require: true,
    }
});

//change _id key to id only
userDetails.virtual('id').get(function () {
    return this._id.toHexString();
});

userDetails.set('toJSON', {
    virtuals: true,
});

module.exports = mongoose.model("userDetails", userDetails);