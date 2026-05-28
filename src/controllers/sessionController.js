const Session = require('../models/Session');
const { connectWhatsApp } = require('../services/whatsappService');

const addSession = async (req, res) => {
    try {
        const sessionId = req.body.sessionId?.toLowerCase();
        if (!sessionId) return res.status(400).json({ message: 'sessionId is required' });

        const existing = await Session.findOne({ sessionId });
        if (existing) return res.status(400).json({ message: 'Session already exists' });

        await Session.create({ sessionId });
        await connectWhatsApp(sessionId);

        res.status(201).json({ message: `Session [${sessionId}] created, scan QR in terminal` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getSessions = async (req, res) => {
    try {
        const sessions = await Session.find();
        res.status(200).json(sessions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        await Session.findOneAndDelete({ sessionId });
        res.status(200).json({ message: `Session [${sessionId}] deleted` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { addSession, getSessions, deleteSession };
