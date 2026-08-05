/**
 * User.js
 * Stores application users for JWT authentication.
 * Roles:
 * - public
 * - employee
 * - admin
 */

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({

    username: {type: String, required: true, unique: true},

    password: {type: String, required: true},

    role: {
        type: String,
        enum: [
            'public',
            'employee',
            'admin'
        ],
        default: 'public'
    }
});

module.exports = mongoose.model('User', UserSchema);