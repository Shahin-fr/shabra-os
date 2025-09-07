const http = require('http');

function testRefreshAPI() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/storyboard/refresh',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('🧪 Testing storyboard refresh API...\n');
      console.log('Status Code:', res.statusCode);
      
      try {
        const result = JSON.parse(data);
        if (result.success) {
          console.log('✅ Refresh API working!');
          console.log('📋 Story Types:', result.data.storyTypes.length);
          result.data.storyTypes.forEach((type, index) => {
            console.log(`  ${index + 1}. ${type.name} (${type.id})`);
          });
          
          console.log('\n💡 Story Ideas:', result.data.storyIdeas.length);
          result.data.storyIdeas.forEach((idea, index) => {
            console.log(`  ${index + 1}. ${idea.title} (${idea.storyType})`);
          });
          
          console.log('\n📁 Default Project:', result.data.projectName, `(${result.data.defaultProjectId})`);
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

testRefreshAPI();
