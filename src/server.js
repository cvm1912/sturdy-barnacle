require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
require('./config/redis');
require('./jobs/messageWorker');
const { connectWhatsApp } = require('./services/whatsappService');

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log('MongoDB Connected');
        connectWhatsApp();
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
