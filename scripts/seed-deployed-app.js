#!/usr/bin/env node

/**
 * Script to seed the deployed Vercel application database
 * Usage: node scripts/seed-deployed-app.js https://your-app.vercel.app
 */

const https = require('https');
const http = require('http');

const url = process.argv[2];

if (!url) {
  console.log('❌ Please provide your Vercel URL');
  console.log('Usage: node scripts/seed-deployed-app.js https://your-app.vercel.app');
  process.exit(1);
}

console.log('🌱 Seeding deployed database...');
console.log(`📍 URL: ${url}`);

// Make the request
const client = url.startsWith('https') ? https : http;

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
};

const req = client.request(`${url}/api/seed`, options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (res.statusCode === 200) {
        console.log('✅ Database seeded successfully!');
        console.log('📊 Response:', JSON.stringify(response, null, 2));
        console.log('\n🔑 You can now login with:');
        console.log('   Admin: admin@shabra.com / admin-password-123');
        console.log('   User: user@shabra.com / user-password-123');
        console.log('   Manager: manager@shabra.com / manager-password-123');
      } else {
        console.log('❌ Error seeding database:');
        console.log('Status:', res.statusCode);
        console.log('Response:', response);
      }
    } catch (error) {
      console.log('❌ Error parsing response:', error.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Request failed:', error.message);
  console.log('💡 Make sure your Vercel URL is correct and the app is deployed');
});

req.on('timeout', () => {
  console.log('❌ Request timed out');
  req.destroy();
});

req.end();
