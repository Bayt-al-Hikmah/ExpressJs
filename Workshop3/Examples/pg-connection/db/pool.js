const { Pool } = require('pg');

const requiredVariables = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
for (const variable of requiredVariables) {
  if (!process.env[variable]) {
    throw new Error(`${variable} is missing from the environment.`);
  }
}

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

pool.on('error', (error) => {
  console.error('Unexpected database connection error:', error);
});

module.exports = pool;
