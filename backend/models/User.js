const mongoose = require('mongoose');
const { Schema } = mongoose; // Destructure Schema from mongoose

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
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
        enum: ['user', 'doctor', 'admin'],
        default: 'user'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', UserSchema); // Capitalized model name
User.createIndexes();
module.exports = User;