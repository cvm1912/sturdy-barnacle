const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

let sock = null;

const connectWhatsApp = async () => {
    const { state, saveCreds } = await useMultiFileAuthState('src/config/auth_info_baileys');

    sock = makeWASocket({ auth: state, logger: require('pino')({ level: 'silent' }) });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
        if (qr) qrcode.generate(qr, { small: true });
        if (connection === 'close') {
            const shouldReconnect = new Boom(lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed, reconnecting:', shouldReconnect);
            if (shouldReconnect) connectWhatsApp();
        } else if (connection === 'open') {
            console.log('WhatsApp Connected');
        }
    });
};

const sendMessage = async (phone, message, documentPath = null) => {
    const jid = `${phone}@s.whatsapp.net`;

    if (documentPath) {
        const ext = path.extname(documentPath).slice(1);
        const mimeTypes = { pdf: 'application/pdf', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };

        await sock.sendMessage(jid, {
            document: fs.readFileSync(documentPath),
            mimetype: mimeTypes[ext] || 'application/octet-stream',
            fileName: path.basename(documentPath),
            caption: message
        });
    } else {
        await sock.sendMessage(jid, { text: message });
    }
};

module.exports = { connectWhatsApp, sendMessage };
