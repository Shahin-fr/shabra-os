import fetch from 'node-fetch';

async function seedVercelDatabase() {
  try {
    console.log('🌱 Seeding Vercel database via API...\n');

    // Get the Vercel URL from environment or prompt user
    const vercelUrl = process.env.VERCEL_URL || process.argv[2];
    
    if (!vercelUrl) {
      console.log('❌ Vercel URL not provided');
      console.log('Usage: npx tsx scripts/seed-vercel-api.ts https://your-domain.vercel.app');
      console.log('Or set VERCEL_URL environment variable');
      return;
    }

    const baseUrl = vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`;
    const seedUrl = `${baseUrl}/api/seed`;

    console.log(`🔗 Using URL: ${seedUrl}\n`);

    // Test 1: Check current database status
    console.log('1. Checking current database status...');
    try {
      const statusResponse = await fetch(seedUrl);
      const statusData = await statusResponse.json();
      
      if (statusData.success) {
        console.log(`   Current users: ${statusData.userCount}`);
        if (statusData.users && statusData.users.length > 0) {
          console.log('   Existing users:');
          statusData.users.forEach((user: any, index: number) => {
            console.log(`     ${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
          });
        }
      } else {
        console.log('   ❌ Error checking database status');
        console.log('   Error:', statusData.message || 'Unknown error');
      }
    } catch (error) {
      console.log('   ❌ Error checking database status:');
      console.log('   Error:', error instanceof Error ? error.message : 'Unknown error');
    }

    console.log('');

    // Test 2: Seed the database
    console.log('2. Seeding database...');
    try {
      const seedResponse = await fetch(seedUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const seedData = await seedResponse.json();
      
      if (seedData.success) {
        console.log('   ✅ Database seeded successfully!');
        console.log(`   Total users: ${seedData.totalUsers}`);
        
        if (seedData.results) {
          console.log('   Results:');
          seedData.results.forEach((result: any) => {
            const status = result.status === 'created' ? '✅' : 
                          result.status === 'exists' ? '⚠️' : '❌';
            console.log(`     ${status} ${result.email}: ${result.message}`);
          });
        }

        if (seedData.credentials) {
          console.log('\n   🔑 Login credentials:');
          console.log(`     Admin:   ${seedData.credentials.admin}`);
          console.log(`     User:    ${seedData.credentials.user}`);
          console.log(`     Manager: ${seedData.credentials.manager}`);
        }
      } else {
        console.log('   ❌ Error seeding database');
        console.log('   Error:', seedData.message || 'Unknown error');
      }
    } catch (error) {
      console.log('   ❌ Error seeding database:');
      console.log('   Error:', error instanceof Error ? error.message : 'Unknown error');
    }

    console.log('');

    // Test 3: Verify the seeding
    console.log('3. Verifying database after seeding...');
    try {
      const verifyResponse = await fetch(seedUrl);
      const verifyData = await verifyResponse.json();
      
      if (verifyData.success) {
        console.log(`   ✅ Verification successful!`);
        console.log(`   Total users: ${verifyData.userCount}`);
        
        if (verifyData.users && verifyData.users.length > 0) {
          console.log('   Users in database:');
          verifyData.users.forEach((user: any, index: number) => {
            console.log(`     ${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
          });
        }
      } else {
        console.log('   ❌ Error verifying database');
        console.log('   Error:', verifyData.message || 'Unknown error');
      }
    } catch (error) {
      console.log('   ❌ Error verifying database:');
      console.log('   Error:', error instanceof Error ? error.message : 'Unknown error');
    }

    console.log('\n🎯 Next steps:');
    console.log('   1. Try logging in with admin@shabra.com / admin-password-123');
    console.log('   2. Check if the CredentialsSignin error is resolved');
    console.log('   3. Test all functionality in the application');

  } catch (error) {
    console.error('❌ Error in seed process:', error);
  }
}

seedVercelDatabase();
