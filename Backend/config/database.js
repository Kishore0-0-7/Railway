// Update database connection configuration
module.exports = {
  development: {
    host: '13.126.209.246',
    port: 5432, // Default PostgreSQL port
    database: 'railway_db', // Your database name
    user: 'your_db_user',
    password: 'your_db_password',
    dialect: 'postgres',
    ssl: {
      rejectUnauthorized: false // May be needed for remote connections
    }
  },
  production: {
    host: '13.126.209.246',
    port: 5432,
    database: 'railway_db',
    user: 'your_db_user',
    password: 'your_db_password',
    dialect: 'postgres',
    ssl: {
      rejectUnauthorized: false
    }
  }
};
