# Redis Setup Guide

## Step 1: Install Redis (Windows)
Redis officially Windows support nahi karta, isliye 2 options hain:

### Option A: WSL (Recommended)
```bash
wsl --install
# WSL open karo
sudo apt update
sudo apt install redis-server
sudo service redis-server start
# test karo
redis-cli ping
# Output: PONG
```

### Option B: Docker
```bash
docker run -d --name redis -p 6379:6379 redis
# test karo
docker exec -it redis redis-cli ping
# Output: PONG
```

---

## Step 2: .env me Redis URL add karo

```env
REDIS_URL=redis://localhost:6379
```

---

## Step 3: src/config/redis.js banao

```js
const { Redis } = require('ioredis');

const redis = new Redis(process.env.REDIS_URL);

redis.on('connect', () => console.log('Redis Connected'));
redis.on('error', (err) => console.error('Redis Error:', err));

module.exports = redis;
```

---

## Step 4: Test karo

```bash
npm run dev
```

Console me dikhna chahiye:
```
MongoDB Connected
Redis Connected
Server running on port 5000
```

---

## Notes
- Redis default port: `6379`
- BullMQ automatically is redis connection ko use karega jobs ke liye
