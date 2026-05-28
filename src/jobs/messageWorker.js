const { Worker } = require('bullmq');
const redisClient = require('../config/redis');
const Message = require('../models/Message');
const { sendMessage } = require('../services/whatsappService');

const worker = new Worker('messageQueue', async (job) => {
    const { phone, message, document, messageId } = job.data;

    try {
        await sendMessage(phone, message, document);
        await Message.findByIdAndUpdate(messageId, { status: 'sent' });
    } catch (err) {
        console.error(`Failed to send to ${phone}:`, err.message);
        await Message.findByIdAndUpdate(messageId, { status: 'failed' });
        throw err;
    }
}, { connection: redisClient });

worker.on('completed', (job) => console.log(`Job ${job.id} completed`));
worker.on('failed', (job, err) => console.error(`Job ${job.id} failed:`, err));

module.exports = worker;
