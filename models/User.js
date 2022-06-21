const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema for Users
const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    roles: [{
        type: String,
        ref: "Role" 
    }],
    date: {
        type: String,
        default: Date.now,
    },
});

module.exports = mongoose.model('users', UserSchema);
