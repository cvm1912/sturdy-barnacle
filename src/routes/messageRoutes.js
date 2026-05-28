const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, sendBulkMessage } = require('../controllers/messageController');
const { uploadDocument } = require('../middleware/upload');

router.post('/send', uploadDocument.single('document'), sendMessage);
router.post('/send-bulk', uploadDocument.single('document'), sendBulkMessage);
router.get('/', getMessages);

module.exports = router;
