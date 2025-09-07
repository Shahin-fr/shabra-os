const http = require('http');

function testStoryEditAPI() {
  console.log('🧪 Testing story edit API...\n');

  // First, get a story ID
  console.log('1️⃣ Getting a story ID...');
  testAPI('/api/stories?day=1404-06-16', (result) => {
    if (result && result.length > 0) {
      const storyId = result[0].id;
      console.log('✅ Found story ID:', storyId);
      
      // Test GET story
      console.log('\n2️⃣ Testing GET story...');
      testAPI(`/api/stories/${storyId}`, (story) => {
        if (story && story.id) {
          console.log('✅ Story retrieved successfully');
          console.log('📋 Story Title:', story.title);
          console.log('📝 Story Type:', story.storyType?.name || 'None');
          console.log('💡 Story Idea:', story.storyIdea?.title || 'None');
          
          // Test PATCH story with story idea
          console.log('\n3️⃣ Testing PATCH story with story idea...');
          const updateData = JSON.stringify({
            storyIdeaId: 'cmfa3xu6k0001u3242t6yx4oa' // اخبار ورزشی
          });

          const options = {
            hostname: 'localhost',
            port: 3000,
            path: `/api/stories/${storyId}`,
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
                  console.log('💡 Story Idea after update:', result.storyIdea?.title || 'None');
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
          console.log('❌ Failed to retrieve story');
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

testStoryEditAPI();
