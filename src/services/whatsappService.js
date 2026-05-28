const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const Session = require('../models/Session');

const sessions = {};
const retryCounts = {};
const MAX_RETRIES = 5;

const connectWhatsApp = async (sessionId) => {
    sessionId = sessionId.toLowerCase();
    const authPath = `src/config/sessions/${sessionId}`;

    const { state, saveCreds } = await useMultiFileAuthState(authPath);

    const sock = makeWASocket({ auth: state, logger: require('pino')({ level: 'silent' }) });

    sessions[sessionId] = sock;

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
        if (qr) {
            console.log(`\nQR Code for session [${sessionId}]:`);
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'close') {
            const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                retryCounts[sessionId] = (retryCounts[sessionId] || 0) + 1;
                if (retryCounts[sessionId] > MAX_RETRIES) {
                    console.log(`Session [${sessionId}] max retries reached, giving up`);
                    delete sessions[sessionId];
                    await Session.findOneAndUpdate({ sessionId }, { status: 'disconnected' });
                    return;
                }
                const delay = Math.min(5000 * retryCounts[sessionId], 30000);
                console.log(`Session [${sessionId}] reconnecting in ${delay/1000}s (attempt ${retryCounts[sessionId]})`);
                setTimeout(() => connectWhatsApp(sessionId), delay);
            } else {
                delete sessions[sessionId];
                await Session.findOneAndUpdate({ sessionId }, { status: 'disconnected' });
                console.log(`Session [${sessionId}] logged out`);
            }
        } else if (connection === 'open') {
            retryCounts[sessionId] = 0;
            await Session.findOneAndUpdate({ sessionId }, { status: 'connected' });
            console.log(`Session [${sessionId}] connected`);
        }
    });
};

const restoreSessions = async () => {
    const savedSessions = await Session.find({ status: { $in: ['connected', 'pending'] } });
    for (const session of savedSessions) {
        await connectWhatsApp(session.sessionId);
    }
};

const sendMessage = async (sessionId, phone, message, documentPath = null) => {
    const sock = sessions[sessionId.toLowerCase()];
    if (!sock) throw new Error(`Session [${sessionId}] not found or not connected`);

    const jid = `${phone}@s.whatsapp.net`;

    if (documentPath) {
        const ext = path.extname(documentPath).slice(1);
        const mimeTypes = {
            pdf: 'application/pdf',
            doc: 'application/msword',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        };

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

module.exports = { connectWhatsApp, restoreSessions, sendMessage };
