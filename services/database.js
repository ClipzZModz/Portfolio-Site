const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

function buildConfig({ includeDatabase }) {
  return {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: includeDatabase ? (process.env.DB_NAME || 'portfolio_site') : undefined,
    multipleStatements: true
  };
}

async function ensureDatabase() {
  const dbName = process.env.DB_NAME || 'portfolio_site';
  const connection = await mysql.createConnection(buildConfig({ includeDatabase: false }));
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
  await connection.end();
}

async function runInitScript() {
  const sqlPath = path.join(__dirname, '..', 'storage', 'init.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  if (!sql.trim()) {
    return;
  }
  const connection = await mysql.createConnection(buildConfig({ includeDatabase: true }));
  await connection.query(sql);
  await connection.end();
}

async function init() {
  await ensureDatabase();
  await runInitScript();
  console.log('[DB] Initialization complete');
}

let pool;

function getPool() {
  if (!pool) {
    pool = mysql.createPool(buildConfig({ includeDatabase: true }));
  }
  return pool;
}

async function query(sql, params) {
  const conn = getPool();
  const [rows] = await conn.query(sql, params);
  return rows;
}

module.exports = { init, query };
