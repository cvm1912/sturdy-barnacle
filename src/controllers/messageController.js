const Message = require('../models/Message');
const Contact = require('../models/Contact');
const messageQueue = require('../jobs/messageQueue');

const sendMessage = async (req, res) => {
    try {
        const { phone, message, sessionId } = req.body;
        const document = req.file ? req.file.path : null;

        const newMessage = await Message.create({ phone, message, document, sessionId });

        await messageQueue.add('sendMessage', {
            phone,
            message,
            document,
            sessionId,
            messageId: newMessage._id
        });

        res.status(201).json({ message: 'Job added to queue', id: newMessage._id });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getMessages = async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const DAILY_LIMIT = 200;

const sendBulkMessage = async (req, res) => {
    try {
        const { message, role, sessionId } = req.body;
        const document = req.file ? req.file.path : null;

        if (!sessionId) return res.status(400).json({ message: 'sessionId is required' });

        // Daily limit check
        const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
        const todayCount = await Message.countDocuments({ sessionId, createdAt: { $gte: startOfDay } });
        if (todayCount >= DAILY_LIMIT)
            return res.status(429).json({ message: `Daily limit of ${DAILY_LIMIT} messages reached for this session` });

        const filter = role ? { role } : {};
        const contacts = await Contact.find(filter);

        if (!contacts.length) return res.status(404).json({ message: 'No contacts found' });

        const allowed = contacts.slice(0, DAILY_LIMIT - todayCount);

        const jobs = (await Promise.all(allowed.map(async (contact, index) => {
            // Skip if already sent/pending today
            const alreadySent = await Message.findOne({
                phone: contact.phone, sessionId,
                status: { $in: ['sent', 'pending'] },
                createdAt: { $gte: startOfDay }
            });
            if (alreadySent) return null;

            const personalizedMessage = message.replace(/{name}/gi, contact.name);
            const newMessage = await Message.create({ phone: contact.phone, message: personalizedMessage, document, sessionId });
            const randomDelay = (index * 30000) + Math.floor(Math.random() * 60000);
            await messageQueue.add('sendMessage', {
                phone: contact.phone, message: personalizedMessage,
                document, sessionId, messageId: newMessage._id
            }, { delay: randomDelay });
            return newMessage._id;
        }))).filter(Boolean);

        res.status(201).json({
            message: `${jobs.length} jobs added to queue${ contacts.length > allowed.length ? ` (${contacts.length - allowed.length} skipped — daily limit)` : '' }`,
            ids: jobs
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { sendMessage, getMessages, sendBulkMessage };
