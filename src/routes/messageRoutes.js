const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, sendBulkMessage } = require('../controllers/messageController');
const { uploadDocument } = require('../middleware/upload');

router.post('/send', uploadDocument.single('document'), sendMessage);
router.post('/send-bulk', uploadDocument.single('document'), sendBulkMessage);
router.get('/', getMessages);
router.post('/flush-queue', async (req, res) => {
    const { Queue } = require('bullmq');
    const redisClient = require('../config/redis');
    const q = new Queue('messageQueue', { connection: redisClient });
    await q.obliterate({ force: true });
    await require('../models/Message').deleteMany({});
    res.json({ message: 'Queue and messages flushed' });
});

router.post('/retry-failed', async (req, res) => {
    const messageQueue = require('../jobs/messageQueue');
    const Message = require('../models/Message');
    const failed = await Message.find({ status: 'failed' });
    if (!failed.length) return res.json({ message: 'No failed messages' });
    await Promise.all(failed.map(async (msg, index) => {
        await Message.findByIdAndUpdate(msg._id, { status: 'pending' });
        const randomDelay = (index * 30000) + Math.floor(Math.random() * 60000);
        await messageQueue.add('sendMessage', {
            phone: msg.phone, message: msg.message,
            document: msg.document, sessionId: msg.sessionId,
            messageId: msg._id
        }, { delay: randomDelay });
    }));
    res.json({ message: `${failed.length} failed messages re-queued` });
});

module.exports = router;
