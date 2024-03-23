require('dotenv').config();

const env = process.env.SERVER || "development"

console.log(`Using ${env} environment`);

let config

if (env === "production") {
  config = {
    port: parseInt(process.env.SERVER_PORT, 10),
    db_url: process.env.DB_URL,
    secret: process.env.SECRET,
    superuser: process.env.SUPERUSER,
    superpwd: process.env.SUPERPWD,
    uploadPath: process.env.UPLOADPATH,
    redisHost: process.env.REDIS_HOST,
    redisPort: process.env.REDIS_PORT,
    clientUrl: process.env.CLIENT_URL,
    maxRefreshTokenTTL: 60 * 60 * 24 * 7,
    maxAccessTokenTTL: 60 * 15
  };
} else {
  config = {
    port: 3000,
    db_url: "mongodb://127.0.0.1:27017/mocker",
    secret: "jsvskjdnvsnvlksjvsdvsjkhvusnvklrjiohesdn1234",
    superuser: "somu",
    superpwd: "superrrrslammm",
    uploadPath: "./uploads",
    redisHost: "localhost",
    redisPort: 6379,
    clientUrl: "http://127.0.0.1:8080",
    maxRefreshTokenTTL: 60 * 60 * 24 * 7,
    maxAccessTokenTTL: 60 * 15
  };
}

module.exports = config
