# BullMQ Queue Setup

## What is BullMQ?
BullMQ ek job queue library hai jo Node.js me background jobs handle karne ke liye use hoti hai and Ye Redis ke upar kaam karti hai.

Task ko line (queue) me lagao →
BullMQ ek-ek karke process karega

Jab koi heavy ya delayed task hota hai jo request ke time instantly karna zaroori nahi hota.

Example:
Bulk email sending
WhatsApp message sending
Image processing
PDF generation
Notifications
Video conversion

### Example 
Without queue:

Loop →
200 users →
Server freeze / block risk

With BullMQ:

Messages queue me add →
1 by 1 send →
Delay control →
Retry support

---

## Flow

```
API Request (phone + message + document)
Add Job to Queue (messageQueue.js)
Worker picks Job (messageWorker.js)
Baileys se WhatsApp message send
Message status update (sent/failed) in MongoDB
```

---

## Files

```
src/jobs/
├── messageQueue.js   → queue instance + job add karna
└── messageWorker.js  → job process karna (Baileys + DB update)
```

---

## messageQueue.js

```js
const { Queue } = require('bullmq');
const redisClient = require('../config/redis');

const messageQueue = new Queue('messageQueue', { connection: redisClient });

module.exports = messageQueue;
```

---

## messageWorker.js

```js
const { Worker } = require('bullmq');
const redisClient = require('../config/redis');

const worker = new Worker('messageQueue', async (job) => {
    const { phone, message, document } = job.data;
    // Baileys se message bhejo
    // DB me status update karo
}, { connection: redisClient });

worker.on('completed', (job) => console.log(`Job ${job.id} completed`));
worker.on('failed', (job, err) => console.error(`Job ${job.id} failed:`, err));
```

---

## Job Add Karna (Controller me)

```js
await messageQueue.add('sendMessage', {
    phone: '919876543210',
    message: 'Hello!',
    document: 'uploads/invoice.pdf'
});
```

---

## Notes
- Worker aur Queue dono same Redis connection use karte hain
- Worker `server.js` me import karna hoga taaki server start hone pe chal sake
- Baileys integration `messageWorker.js` me hogi
