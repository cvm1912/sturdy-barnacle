const express = require('express');
const router = express.Router();
const { addSession, getSessions, deleteSession } = require('../controllers/sessionController');

router.post('/', addSession);
router.get('/', getSessions);
router.delete('/:sessionId', deleteSession);

module.exports = router;
