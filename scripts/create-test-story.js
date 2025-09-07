const http = require('http');

function createTestStory() {
  const postData = JSON.stringify({
    title: 'تست ویرایش استوری',
    day: '1404-06-16',
    order: 10,
    type: 'تست',
    customTitle: 'تست ویرایش استوری',
    projectId: 'cmf5o9m110001u35cldria860', // Will be fixed by middleware
    storyTypeId: 'cmfa4j2sn0008u3rg2oznvgfm' // تست
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
      console.log('🧪 Creating test story...\n');
      console.log('Status Code:', res.statusCode);
      
      try {
        const result = JSON.parse(data);
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('✅ Test story created successfully!');
          console.log('Story ID:', result.id);
          console.log('Story Title:', result.title);
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

createTestStory();
