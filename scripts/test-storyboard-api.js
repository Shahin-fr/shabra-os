const fetch = require('node-fetch');

async function testStoryboardAPI() {
  try {
    console.log('🧪 Testing storyboard API...\n');

    // Test the new IDs endpoint
    const response = await fetch('http://localhost:3000/api/storyboard/ids');
    const data = await response.json();

    if (data.success) {
      console.log('✅ IDs API working!');
      console.log('📁 Projects:', data.data.projects);
      console.log('📝 Story Types:', data.data.storyTypes);
      console.log('🎯 Default Project:', data.data.defaultProject);
      console.log('🎯 Default Story Type:', data.data.defaultStoryType);
    } else {
      console.log('❌ API Error:', data.error);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testStoryboardAPI();
