const { Pool } = require("pg");

const pool = new Pool({
  host: "3.108.56.192",
  port: 5432,
  user: "postgres",
  password: "1234",
  database: "railway"
});

// Test connection
pool.on('connect', () => {
  console.log('Database connected successfully');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

module.exports = pool;