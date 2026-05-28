const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, unique: true, lowercase: true },
    status: { type: String, enum: ['pending', 'connected', 'disconnected'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
