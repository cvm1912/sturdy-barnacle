# Baileys Setup Guide

## What is Baileys?

Baileys ek Node.js library hai jo WhatsApp Web ko programmatically control karti hai.
QR code scan karke session create hota hai, phir messages send kiye ja sakte hain.

---

## Flow

```
Server Start
    ↓
Baileys WhatsApp connection initialize
    ↓
QR Code terminal me print hoga
    ↓
Phone se WhatsApp → Linked Devices → QR Scan karo
    ↓
Session save ho jaayegi (auth_info_baileys/)
    ↓
Ab messages send ho sakte hain
```

---

## Files

```
src/services/
└── whatsappService.js  → Baileys connection + send message function
```

---

## Session

- Session `src/config/auth_info_baileys/` folder me save hogi
- Ek baar scan karne ke baad dobara scan nahi karna padega
- Server restart pe session automatically load ho jaayegi

---

## Send Message with Document

```js
// Text only
await sock.sendMessage(phone@s.whatsapp.net, { text: message });

// Text + Document
await sock.sendMessage(phone@s.whatsapp.net, {
    document: fs.readFileSync(documentPath),
    mimetype: 'application/pdf',
    fileName: 'document.pdf',
    caption: message
});
```

---

## Notes

- Phone number format: `919876543210@s.whatsapp.net` (country code + number, no +)
- Session folder ko `.gitignore` me add karo
- `sock` instance globally available hona chahiye worker ke liye
