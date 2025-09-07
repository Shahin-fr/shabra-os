const http = require('http');

function testConfigAPI() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/storyboard/config',
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
        console.log('🧪 Testing storyboard config API...\n');
        
        if (result.success) {
          console.log('✅ Config API working!');
          console.log('📁 Default Project ID:', result.data.defaultProjectId);
          console.log('📝 Default Story Type ID:', result.data.defaultStoryTypeId);
          console.log('📋 Project Name:', result.data.projectName);
          console.log('📋 Story Type Name:', result.data.storyTypeName);
        } else {
          console.log('❌ API Error:', result.error);
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

testConfigAPI();
