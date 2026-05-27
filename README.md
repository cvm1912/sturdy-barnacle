# Tech Stack
- Node.js
- Express.js
- Baileys (WhatsApp Web API)
- MongoDB
- BullMQ
- Multer
- XLSX

# Initial Project Setup
npm init -y

# Install Main Dependencies
npm install express mongoose dotenv cors
npm install @whiskeysockets/baileys ( interact with WhatsApp Web programmatically )
npm install multer xlsx
npm install bullmq ioredis

# Development Dependencies
npm install -D nodemon

# Create Folder Structure

src/ 
├── config/ 
├── controllers/ 
├── routes/ 
├── services/ 
├── models/ 
├── jobs/ 
├── middleware/ 
├── uploads/ 
├── utils/ 
├── app.js 
└── server.js

