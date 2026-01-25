const { Pool } = require("pg");

const pool = new Pool({
  host: "13.127.7.255",
  port: 5432,
  user: "postgres",
  password: "1234",
  database: "railway",
});

// Test connection
pool.on("connect", () => {
  // Database connected successfully
});

pool.on("error", (err) => {
  console.error("Database connection error:", err);
});

module.exports = pool;
