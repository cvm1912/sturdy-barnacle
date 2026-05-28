const Message = require('../models/Message');
const Contact = require('../models/Contact');
const messageQueue = require('../jobs/messageQueue');

const sendMessage = async (req, res) => {
    try {
        const { phone, message } = req.body;
        const document = req.file ? req.file.path : null;

        const newMessage = await Message.create({ phone, message, document });

        await messageQueue.add('sendMessage', {
            phone,
            message,
            document,
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

const sendBulkMessage = async (req, res) => {
    try {
        const { message, role } = req.body;
        const document = req.file ? req.file.path : null;

        const filter = role ? { role } : {};
        const contacts = await Contact.find(filter);

        if (!contacts.length) return res.status(404).json({ message: 'No contacts found' });

        const jobs = await Promise.all(contacts.map(async (contact, index) => {
            const newMessage = await Message.create({ phone: contact.phone, message, document });
            const randomDelay = (index * 30000) + Math.floor(Math.random() * 60000);
            await messageQueue.add('sendMessage', {
                phone: contact.phone,
                message,
                document,
                messageId: newMessage._id
            }, {
                delay: randomDelay
            });
            return newMessage._id;
        }));

        res.status(201).json({ message: `${jobs.length} jobs added to queue`, ids: jobs });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { sendMessage, getMessages, sendBulkMessage };
