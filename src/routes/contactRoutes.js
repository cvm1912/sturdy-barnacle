const express = require('express');
const router = express.Router();
const { uploadContacts, getContacts } = require('../controllers/contactController');
const { uploadExcel } = require('../middleware/upload');

router.post('/upload', uploadExcel.single('file'), uploadContacts);
router.get('/', getContacts);

module.exports = router;
