
const config = {
    development: {
      server: {
        port: parseInt(process.env.SERVER_PORT, 10) || 3000,
      },
      database: {
        db_url: process.env.DB_URL || 'mongodb://localhost:27017/mockingbird'
      },
      secret: process.env.SECRET,
      superuser: process.env.SUPERUSER,
      superpwd: process.env.SUPERPWD,
      uploadPath: process.env.UPLOADPATH,
      maxRefreshTokenTTL: 60 * 60 * 24 * 7,
      maxAccessTokenTTL: 60 * 15
    }
  };
  
  const environment = process.env.ENV;
  module.exports = config[environment];
  