const redis = require('redis');

const client = redis.createClient({
    host: 'localhost',
    port: 6379,
});

(async () => {
    try {
        await client.connect();
        console.log('Connected to Redis server');
    } catch (error) {
        console.error('Error connecting to Redis:', error);
        process.exit(1);
    }
})();

async function setData(key, value, ttl) {
    try {
        await client.set(key, value, 'EX', ttl);
    } catch (error) {
        console.error('Error setting data in Redis:', error);
    }
}

async function getData(key) {
    try {
        const value = await client.get(key);
        return value
    } catch (error) {
        console.error('Error getting data from Redis:', error);
        return null
    }
}

async function deleteData(key) {
    try {
        await client.del(key);
    } catch (error) {
        console.error('Error deleting key:', error);
    }
}

module.exports = {
    setData, getData, deleteData
}
