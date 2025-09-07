const http = require('http');

function testStoryTypesAPI() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/story-types',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('🧪 Testing story types API...\n');
      console.log('Status Code:', res.statusCode);
      
      try {
        const result = JSON.parse(data);
        if (res.statusCode === 200) {
          console.log('✅ Story types API working!');
          console.log('📋 Found', result.length, 'story types:');
          result.forEach((type, index) => {
            console.log(`${index + 1}. ${type.name} (${type.isActive ? 'Active' : 'Inactive'})`);
          });
        } else {
          console.log('❌ API Error:', result);
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

  req.end();
}

testStoryTypesAPI();
