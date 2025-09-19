/**
 * Database Connection Helper
 * Uses pg library directly to avoid Prisma authentication issues
 */

const { Client } = require('pg');

let client = null;

async function getConnection() {
  if (!client) {
    client = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'shabra_os',
      user: process.env.DB_USER || 'postgres',
      password:
        process.env.DB_PASSWORD ||
        process.env.DATABASE_URL?.split('://')[1]
          ?.split('@')[0]
          ?.split(':')[1] ||
        'postgres',
    });

    await client.connect();
    // Direct connection established
  }

  return client;
}

async function query(text, params = []) {
  const conn = await getConnection();
  const result = await conn.query(text, params);
  return result;
}

async function findUserByEmail(email) {
  const result = await query(
    'SELECT id, email, "firstName", "lastName", password, roles, "isActive", avatar FROM "User" WHERE email = $1',
    [email]
  );

  return result.rows[0] || null;
}

async function closeConnection() {
  if (client) {
    await client.end();
    client = null;
  }
}

module.exports = {
  getConnection,
  query,
  findUserByEmail,
  closeConnection,
};
