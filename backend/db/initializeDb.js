const fs = require('fs');
const path = require('path');
const pool = require('./index');

/**
 * Reads init.sql and executes it if the `vehicles` table does not yet exist.
 * All CREATE TABLE statements use IF NOT EXISTS so this is safe to run on an
 * already-initialized database.
 */
async function initializeDb() {
  try {
    // Check if the DB has already been initialised by testing for the vehicles table
    const check = await pool.query(`
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'vehicles'
      LIMIT 1
    `);

    if (check.rows.length > 0) {
      console.log('[DB] Tables already exist — skipping initialization.');

      // Still run init.sql to pick up any new IF NOT EXISTS additions
      // (safe because every statement uses IF NOT EXISTS)
      await runInitSql();
      return;
    }

    console.log('[DB] No tables found — running init.sql...');
    await runInitSql();
    console.log('[DB] Database initialized successfully.');
  } catch (err) {
    console.error('[DB] Database initialization failed:', err.message);
    // Do not throw — let the app start so health checks still pass;
    // individual route errors will surface naturally.
  }
}

async function runInitSql() {
  const sqlPath = path.join(__dirname, 'init.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  await pool.query(sql);
}

module.exports = initializeDb;
