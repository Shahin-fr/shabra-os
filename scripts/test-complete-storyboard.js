const http = require('http');

function testCompleteStoryboard() {
  console.log('🧪 Testing complete storyboard functionality...\n');

  // Test 1: Story Types API
  console.log('1️⃣ Testing Story Types API...');
  testAPI('/api/story-types', (result) => {
    if (result && result.length > 0) {
      console.log(`✅ Found ${result.length} story types`);
      const testType = result.find(type => type.name === 'تست');
      if (testType) {
        console.log('✅ "تست" story type found:', testType.id);
      } else {
        console.log('❌ "تست" story type not found');
      }
    } else {
      console.log('❌ No story types found');
    }
  });

  // Test 2: Story Ideas API
  setTimeout(() => {
    console.log('\n2️⃣ Testing Story Ideas API...');
    testAPI('/api/story-ideas', (result) => {
      if (result && result.length > 0) {
        console.log(`✅ Found ${result.length} story ideas`);
        const testIdea = result.find(idea => idea.title === 'اخبار ورزشی');
        if (testIdea) {
          console.log('✅ "اخبار ورزشی" story idea found:', testIdea.id);
        } else {
          console.log('❌ "اخبار ورزشی" story idea not found');
        }
      } else {
        console.log('❌ No story ideas found');
      }
    });
  }, 1000);

  // Test 3: Refresh API
  setTimeout(() => {
    console.log('\n3️⃣ Testing Refresh API...');
    testAPI('/api/storyboard/refresh', (result) => {
      if (result && result.success) {
        console.log('✅ Refresh API working');
        console.log('📋 Story Types:', result.data.storyTypes.length);
        console.log('💡 Story Ideas:', result.data.storyIdeas.length);
        console.log('📁 Project:', result.data.projectName);
      } else {
        console.log('❌ Refresh API failed');
      }
    });
  }, 2000);
}

function testAPI(path, callback) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: path,
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        callback(result);
      } catch (error) {
        console.log('❌ Parse Error for', path, ':', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Request Error for', path, ':', error.message);
  });

  req.end();
}

testCompleteStoryboard();
