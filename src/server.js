require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
require('./config/redis');
require('./jobs/messageWorker');
const { restoreSessions } = require('./services/whatsappService');

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    .then(async () => {
        console.log('MongoDB Connected');
        await require('./models/Message').updateMany({ status: 'pending' }, { status: 'failed' });
        await restoreSessions();
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
