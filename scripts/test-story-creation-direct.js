const http = require('http');

function testStoryCreation() {
  const postData = JSON.stringify({
    title: 'تست استوری مستقیم',
    day: '1404-06-16',
    order: 1,
    type: 'متن',
    customTitle: 'تست استوری مستقیم',
    projectId: 'cmfa17njk0003u31w7tq7skxb', // Project Alpha
    storyTypeId: 'cmfa3vtpk0000u3e0v3yx95rd' // متن
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/stories',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('🧪 Testing story creation with correct IDs...\n');
      console.log('Status Code:', res.statusCode);
      
      try {
        const result = JSON.parse(data);
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('✅ Story created successfully!');
          console.log('Response:', result);
        } else {
          console.log('❌ Error:', result);
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

  req.write(postData);
  req.end();
}

testStoryCreation();
