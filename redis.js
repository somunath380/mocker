const config = require("./config")
const Redis = require("ioredis")

const redisHost = config.redisHost || "localhost"
const redisPort = config.redisPort


console.log("trying to connect redis...");
console.log(`using redis host: ${config.redisHost} and port: ${config.redisPort}`);
const redis = new Redis({host: redisHost, port: redisPort});
redis.on('connect', () => {
    console.log('Connected to Redis server');
});
redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});

async function setData(key, value, ttl) {
    try {
        await redis.set(key, value, 'EX', ttl)
    } catch (error) {
        console.error('Error setting data in Redis:', error);
    }
}

async function getData(key) {
    try {
        const value = await redis.get(key);
        return value
    } catch (error) {
        console.error('Error getting data from Redis:', error);
        return null
    }
}

async function deleteData(key) {
    try {
        await redis.del(key);
    } catch (error) {
        console.error('Error deleting key:', error);
    }
}

module.exports = {
    setData, getData, deleteData, redis
}
