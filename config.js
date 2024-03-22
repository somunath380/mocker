require('dotenv').config();

// const crypto = require('crypto');

// function generateRandomSHA256Hash() {
//   const randomData = crypto.randomBytes(32);
//   const hash = crypto.createHash('sha256');
//   hash.update(randomData);
//   const hashValue = hash.digest('hex');
//   return hashValue;
// }

// const randomHash = generateRandomSHA256Hash();
// console.log('SERVER SECRET: ', randomHash);

const config = {
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

module.exports = config
