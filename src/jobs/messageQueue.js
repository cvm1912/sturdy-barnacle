const { Queue } = require('bullmq');
const redisClient = require('../config/redis');

const messageQueue = new Queue('messageQueue', { connection: redisClient });

module.exports = messageQueue;
