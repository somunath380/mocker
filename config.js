require('dotenv').config();

const config = {
  port: parseInt(process.env.SERVER_PORT, 10),
  db_url: process.env.DB_URL,
  secret: process.env.SECRET,
  superuser: process.env.SUPERUSER,
  superpwd: process.env.SUPERPWD,
  uploadPath: process.env.UPLOADPATH,
  redisHost: process.env.REDIS_HOST,
  redisPort: process.env.REDIS_PORT,
  maxRefreshTokenTTL: 60 * 60 * 24 * 7,
  maxAccessTokenTTL: 60 * 15
};

module.exports = config
