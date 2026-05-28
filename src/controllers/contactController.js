const XLSX = require('xlsx');
const Contact = require('../models/Contact');

const uploadContacts = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const workbook = XLSX.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);

        const contacts = data.map(row => ({
            name: row['name'],
            phone: '91' + String(row['phone'] || row['phone '] || '').trim().replace(/\s+/g, ''),
            role: row['role']
        })).filter(c => c.name && c.phone);

        await Contact.insertMany(contacts, { ordered: false }).catch(() => {});

        const saved = await Contact.find({ phone: { $in: contacts.map(c => c.phone) } });
        res.status(201).json({ message: 'Contacts uploaded', count: saved.length });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getContacts = async (req, res) => {
    try {
        const contacts = await Contact.find();
        res.status(200).json(contacts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { uploadContacts, getContacts };
