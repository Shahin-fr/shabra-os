/**
 * Database Connection Helper
 * Uses pg library directly to avoid Prisma authentication issues
 */

const { Client } = require('pg');

let client = null;

async function getConnection() {
  if (!client) {
    client = new Client({
      host: 'localhost',
      port: 5432,
      database: 'shabra_os',
      user: 'postgres',
      password: 'postgres',
    });
    
    try {
      await client.connect();
      console.log('✅ [DB] Direct connection established');
    } catch (error) {
      console.error('❌ [DB] Direct connection failed:', error.message);
      throw error;
    }
  }
  
  return client;
}

async function query(text, params = []) {
  const conn = await getConnection();
  try {
    const result = await conn.query(text, params);
    return result;
  } catch (error) {
    console.error('❌ [DB] Query failed:', error.message);
    throw error;
  }
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
  closeConnection
};
