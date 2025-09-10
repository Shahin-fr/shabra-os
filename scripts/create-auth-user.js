#!/usr/bin/env node

/**
 * Create Authentication User Script
 * Creates a simple authentication function that works with the Docker container
 */

const { execSync } = require('child_process');
const bcrypt = require('bcryptjs');

async function createAuthFunction(email, password) {
  try {
    // Hash the password for comparison
    const inputHash = await bcrypt.hash(password, 12);
    
    // Create a SQL query to find and verify the user
    const query = `
      SELECT id, email, "firstName", "lastName", password, roles, "isActive", avatar 
      FROM "User" 
      WHERE email = '${email}' AND "isActive" = true;
    `;
    
    // Create a temporary SQL file for the query
    const fs = require('fs');
    const queryFile = 'temp-auth-query.sql';
    fs.writeFileSync(queryFile, query);
    
    // Execute the query inside the Docker container
    execSync(`docker cp ${queryFile} postgres-shabra-fixed:/tmp/${queryFile}`, { stdio: 'pipe' });
    const result = execSync(`docker exec postgres-shabra-fixed psql -U shabrauser -d shabra_os -t -f /tmp/${queryFile}`, 
      { encoding: 'utf8' });
    
    // Clean up
    fs.unlinkSync(queryFile);
    
    if (!result || result.trim() === '') {
      return { success: false, message: 'User not found' };
    }
    
    // Parse the result
    const userRow = result.trim().split('|').map(s => s.trim());
    if (userRow.length < 7) {
      return { success: false, message: 'Invalid user data' };
    }
    
    const user = {
      id: userRow[0],
      email: userRow[1],
      firstName: userRow[2],
      lastName: userRow[3],
      password: userRow[4],
      roles: userRow[5],
      isActive: userRow[6] === 't',
      avatar: userRow[7] || null
    };
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return { success: false, message: 'Invalid password' };
    }
    
    // Return user data
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        avatar: user.avatar,
        roles: [user.roles]
      }
    };
    
  } catch (error) {
    console.error('❌ Authentication error:', error.message);
    return { success: false, message: 'Authentication failed' };
  }
}

// Export for use in auth.ts
module.exports = { createAuthFunction };

// Test if run directly
if (require.main === module) {
  async function test() {
    console.log('🔍 Testing authentication...');
    const result = await createAuthFunction('admin@shabra.com', 'admin-password-123');
    console.log('Result:', result);
  }
  test();
}
