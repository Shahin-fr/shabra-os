import fetch from 'node-fetch';

async function quickFixVercel() {
  try {
    console.log('🚀 Quick fix for Vercel database...\n');

    // Get Vercel URL
    const vercelUrl = process.env.VERCEL_URL || process.argv[2];
    
    if (!vercelUrl) {
      console.log('❌ Vercel URL not provided');
      console.log('Usage: npx tsx scripts/quick-fix-vercel.ts https://your-domain.vercel.app');
      return;
    }

    const baseUrl = vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`;
    const seedUrl = `${baseUrl}/api/seed`;

    console.log(`🔗 Vercel URL: ${baseUrl}`);
    console.log(`🌱 Seed URL: ${seedUrl}\n`);

    // Step 1: Check current status
    console.log('1. Checking current database status...');
    try {
      const statusResponse = await fetch(seedUrl);
      const statusData = await statusResponse.json();
      
      if (statusData.success) {
        console.log(`   ✅ Database accessible`);
        console.log(`   📊 Current users: ${statusData.userCount}`);
        
        if (statusData.userCount === 0) {
          console.log('   ❌ No users found - this is the problem!');
        } else {
          console.log('   ✅ Users found - database is already seeded');
          console.log('   🔑 Try logging in with: admin@shabra.com / admin-password-123');
          return;
        }
      } else {
        console.log('   ❌ Database not accessible');
        console.log('   Error:', statusData.message || 'Unknown error');
        return;
      }
    } catch (error) {
      console.log('   ❌ Error checking database');
      console.log('   Error:', error instanceof Error ? error.message : 'Unknown error');
      return;
    }

    // Step 2: Seed the database
    console.log('\n2. Seeding database...');
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
        console.log(`   📊 Total users: ${seedData.totalUsers}`);
        
        if (seedData.credentials) {
          console.log('\n   🔑 Login credentials:');
          console.log(`     Admin:   ${seedData.credentials.admin}`);
          console.log(`     User:    ${seedData.credentials.user}`);
          console.log(`     Manager: ${seedData.credentials.manager}`);
        }
      } else {
        console.log('   ❌ Error seeding database');
        console.log('   Error:', seedData.message || 'Unknown error');
        return;
      }
    } catch (error) {
      console.log('   ❌ Error seeding database');
      console.log('   Error:', error instanceof Error ? error.message : 'Unknown error');
      return;
    }

    // Step 3: Final verification
    console.log('\n3. Final verification...');
    try {
      const verifyResponse = await fetch(seedUrl);
      const verifyData = await verifyResponse.json();
      
      if (verifyData.success && verifyData.userCount > 0) {
        console.log('   ✅ Verification successful!');
        console.log(`   📊 Total users: ${verifyData.userCount}`);
        console.log('\n🎉 Problem solved! You can now log in to Vercel.');
        console.log('\n🔑 Try logging in with:');
        console.log('   Email: admin@shabra.com');
        console.log('   Password: admin-password-123');
        console.log(`\n🌐 Login URL: ${baseUrl}/login`);
      } else {
        console.log('   ❌ Verification failed');
        console.log('   Error:', verifyData.message || 'Unknown error');
      }
    } catch (error) {
      console.log('   ❌ Error during verification');
      console.log('   Error:', error instanceof Error ? error.message : 'Unknown error');
    }

  } catch (error) {
    console.error('❌ Error in quick fix process:', error);
  }
}

quickFixVercel();
