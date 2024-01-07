
const config = {
    development: {
      server: {
        port: parseInt(process.env.SERVER_PORT, 10) || 3000,
      },
      database: {
        db_url: process.env.DB_URL || 'mongodb://localhost:27017/mockingbird'
      },
    },
    testing: {
      server: {
        port: parseInt(process.env.SERVER_PORT, 10) || 3001,
      },
      database: {
        db_url: 'mongodb://localhost:27017/mockingbird',
      },
    },
    production: {
      server: {
        port: parseInt(process.env.SERVER_PORT, 10) || 80,
      },
      database: {
        db_url: 'mongodb://localhost:27017/mockingbird'
      },
    },
  };
  
  const environment = process.env.ENV;
  module.exports = config[environment];
  