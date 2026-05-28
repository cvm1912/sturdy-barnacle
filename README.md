# WhatsApp Bulk Sender

A Node.js backend to send bulk WhatsApp messages with documents using Baileys.

---

# Tech Stack
- Node.js
- Express.js
- Baileys (WhatsApp Web API)
- MongoDB
- BullMQ
- Redis
- Multer
- XLSX

---

# Installation

```bash
npm install
```

# Install Main Dependencies
```bash
npm install express mongoose dotenv cors
npm install @whiskeysockets/baileys
npm install multer xlsx
npm install bullmq ioredis
npm install qrcode-terminal pino
npm install -D nodemon
```

---

# Environment Variables (.env)

```env
PORT=8080
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>
REDIS_URL=redis://localhost:6379
```

---

# Folder Structure

```
src/
├── config/
│   ├── redis.js
│   └── sessions/        (auto-generated, gitignored)
├── controllers/
│   ├── contactController.js
│   ├── messageController.js
│   └── sessionController.js
├── routes/
│   ├── contactRoutes.js
│   ├── messageRoutes.js
│   └── sessionRoutes.js
├── services/
│   └── whatsappService.js
├── models/
│   ├── Contact.js
│   ├── Message.js
│   └── Session.js
├── jobs/
│   ├── messageQueue.js
│   └── messageWorker.js
├── middleware/
│   └── upload.js
├── uploads/
│   ├── excel/
│   └── documents/
├── app.js
└── server.js
```

---

# Run

```bash
npm run dev
```

---

# API Endpoints

### Sessions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/sessions | New WhatsApp session add karo |
| GET | /api/sessions | All sessions dekho |
| DELETE | /api/sessions/:sessionId | Session delete karo |

### Contacts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/contacts/upload | Upload Excel/CSV file |
| GET | /api/contacts | Get all contacts |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/messages/send | Send message to single number |
| POST | /api/messages/send-bulk | Send bulk messages to contacts |
| GET | /api/messages | Get all messages |

---

# Session Flow

```
POST /api/sessions { sessionId: "user1" }
        ↓
QR Code terminal me print hoga
        ↓
WhatsApp → Linked Devices → Scan QR
        ↓
Session connected → use sessionId in messages
```

---

# CSV Format

```
name,phone,role
Animesh,8651437922,HR

```

- Phone: 10 digit number (country code 91 added automatically)
- Role: HR / Senior-Employee / Junior-Employee

---

# Notes
- Multiple WhatsApp sessions supported
- Sessions restore automatically on server restart
- Messages are queued with random 30-90 second delay to avoid WhatsApp ban
- Session is saved in `src/config/sessions/` — no need to scan QR again after first time
- Duplicate phone numbers are automatically skipped on upload
