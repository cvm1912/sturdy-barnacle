const XLSX = require('xlsx');
const Contact = require('../models/Contact');

// helper function to parse contacts from uploaded Excel file
const parseContacts = (buffer) => {
    const workbook = XLSX.read(buffer);
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    return data.map(row => ({
        name: row['name'],
        phone: '91' + String(row['phone'] || row['phone '] || '').trim().replace(/\s+/g, ''),
        role: row['role']
    })).filter(c => c.name && c.phone && c.role);
};


const uploadContacts = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const contacts = parseContacts(req.file.path);
        if (!contacts.length) return res.status(400).json({ message: 'No valid contacts found in file' });

        const result = await Contact.insertMany(contacts, { ordered: false }).catch(err => err.result || { insertedCount: 0 });
        res.status(201).json({ message: 'Contacts uploaded', inserted: result.insertedCount, total: contacts.length });
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
