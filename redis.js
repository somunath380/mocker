const config = require("./config")
const Redis = require("ioredis")

const redisHost = config.redisHost || "localhost"
const redisPort = config.redisPort

console.log(`using redis host: ${config.redisHost} and port: ${config.redisPort}`);

let redisInstance

async function getRedis(){
    if (!redisInstance) {
        redisInstance = new Redis({host: redisHost, port: redisPort})
        redisInstance.on("error", (error)=>{console.log("error on redis connection: ", error);})
    }
    return redisInstance
}

async function setData(key, value, ttl) {
    try {
        await getRedis().set(key, value, 'EX', ttl);
    } catch (error) {
        console.error('Error setting data in Redis:', error);
    }
}

async function getData(key) {
    try {
        const value = await getRedis().get(key);
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
    setData, getData, deleteData, getRedis
}
