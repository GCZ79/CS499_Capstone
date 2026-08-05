/**
 * AuditLog.js
 * Records administrative and employee actions.
 * Used for security auditing.
 */

const mongoose = require('mongoose');

const AuditSchema = new mongoose.Schema({

    username: {type: String, required: true},
    role: {type: String, required: true},
    action: {type: String, required: true},
    timestamp: {type: Date, default: Date.now},
    details: {type: String, required: true}
});

module.exports =  mongoose.model('AuditLog', AuditSchema);