const pool = require('./db/pool');

async function main() {
  const result = await pool.query('SELECT NOW() AS current_time');
  console.log('Connected. Database time:', result.rows[0].current_time);
  await pool.end();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
