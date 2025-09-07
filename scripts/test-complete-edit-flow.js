const http = require('http');

function testCompleteEditFlow() {
  console.log('🧪 Testing complete story edit flow...\n');

  // Test 1: Get stories
  console.log('1️⃣ Getting stories...');
  testAPI('/api/stories?day=1404-06-16', (result) => {
    if (result && result.length > 0) {
      const story = result[0];
      console.log('✅ Found story:', story.title, 'ID:', story.id);
      
      // Test 2: Get story details
      console.log('\n2️⃣ Getting story details...');
      testAPI(`/api/stories/${story.id}`, (storyDetails) => {
        if (storyDetails && storyDetails.id) {
          console.log('✅ Story details retrieved');
          console.log('📝 Current Story Idea:', storyDetails.storyIdea?.title || 'None');
          
          // Test 3: Update story with idea
          console.log('\n3️⃣ Updating story with idea...');
          const updateData = JSON.stringify({
            storyIdeaId: 'اخبار ورزشی' // Using name instead of ID
          });

          const options = {
            hostname: 'localhost',
            port: 3000,
            path: `/api/stories/${story.id}`,
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(updateData)
            }
          };

          const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
              data += chunk;
            });

            res.on('end', () => {
              console.log('Status Code:', res.statusCode);
              try {
                const result = JSON.parse(data);
                if (res.statusCode === 200) {
                  console.log('✅ Story updated successfully!');
                  console.log('💡 New Story Idea:', result.storyIdea?.title || 'None');
                  console.log('📋 Story Idea ID:', result.storyIdea?.id || 'None');
                } else {
                  console.log('❌ Update failed:', result);
                }
              } catch (error) {
                console.error('❌ Parse Error:', error);
                console.log('Raw response:', data);
              }
            });
          });

          req.on('error', (error) => {
            console.error('❌ Request Error:', error);
          });

          req.write(updateData);
          req.end();
        } else {
          console.log('❌ Failed to get story details');
        }
      });
    } else {
      console.log('❌ No stories found');
    }
  });
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

testCompleteEditFlow();
