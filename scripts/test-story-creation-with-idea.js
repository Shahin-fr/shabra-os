const http = require('http');

function testStoryCreationWithIdea() {
  const postData = JSON.stringify({
    title: 'تست استوری با ایده',
    day: '1404-06-16',
    order: 4,
    type: 'تست',
    customTitle: 'تست استوری با ایده',
    projectId: 'cmf5o9m110001u35cldria860', // Will be fixed by middleware
    storyTypeId: 'cmfa4j2sn0008u3rg2oznvgfm', // تست story type
    storyIdeaId: 'cmfa3vtpk0000u3e0v3yx95rd' // اخبار ورزشی
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
      console.log('🧪 Testing story creation with idea...\n');
      console.log('Status Code:', res.statusCode);
      
      try {
        const result = JSON.parse(data);
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('✅ Story created successfully with idea!');
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

testStoryCreationWithIdea();
