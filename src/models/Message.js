const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    phone: { type: String, required: true },
    message: { type: String, required: true },
    document: { type: String, default: null },
    status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
