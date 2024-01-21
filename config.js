
const config = {
    development: {
      server: {
        port: parseInt(process.env.SERVER_PORT, 10) || 3000,
      },
      database: {
        db_url: process.env.DB_URL || 'mongodb://localhost:27017/mocker'
      },
      secret: process.env.SECRET,
      superuser: process.env.SUPERUSER || 'somu',
      superpwd: process.env.SUPERPWD || 'nath',
      uploadPath: process.env.UPLOADPATH,
      maxRefreshTokenTTL: 60 * 60 * 24 * 7,
      maxAccessTokenTTL: 60 * 15
    }
  };
  
  const environment = process.env.ENV;
  module.exports = config[environment];
  