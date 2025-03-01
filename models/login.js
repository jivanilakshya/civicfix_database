const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    mobileNumber: {
        type: Number,
        required: true,
        unique: true,
    }
});

const User = mongoose.model('login', userSchema);

module.exports = User;


