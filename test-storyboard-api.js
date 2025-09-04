// Simple test script to verify storyboard API endpoints
const BASE_URL = 'http://localhost:3000';

async function testStoryboardAPI() {
  console.log('🧪 Testing Storyboard API endpoints...\n');

  try {
    // Test 1: Get stories for today
    console.log('1. Testing GET /api/stories?day=2024-01-15');
    const getResponse = await fetch(`${BASE_URL}/api/stories?day=2024-01-15`);
    const getData = await getResponse.json();
    console.log('✅ GET Response:', getResponse.status, getData);
    console.log('');

    // Test 2: Get story types
    console.log('2. Testing GET /api/story-types');
    const storyTypesResponse = await fetch(`${BASE_URL}/api/story-types`);
    const storyTypesData = await storyTypesResponse.json();
    console.log(
      '✅ Story Types Response:',
      storyTypesResponse.status,
      storyTypesData
    );
    console.log('');

    // Test 3: Create a test story (if we have story types)
    if (storyTypesData.length > 0) {
      console.log('3. Testing POST /api/stories');
      const createResponse = await fetch(`${BASE_URL}/api/stories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Test Story',
          day: '2024-01-15',
          order: 1,
          projectId: 'test-project-id',
          storyTypeId: storyTypesData[0].id,
        }),
      });
      const createData = await createResponse.json();
      console.log('✅ CREATE Response:', createResponse.status, createData);
      console.log('');

      // Test 4: Update the story (if creation was successful)
      if (createResponse.ok && createData.id) {
        console.log('4. Testing PATCH /api/stories/' + createData.id);
        const updateResponse = await fetch(
          `${BASE_URL}/api/stories/${createData.id}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: 'Updated Test Story',
              notes: 'This is an updated story',
            }),
          }
        );
        const updateData = await updateResponse.json();
        console.log('✅ UPDATE Response:', updateResponse.status, updateData);
        console.log('');

        // Test 5: Delete the story
        console.log('5. Testing DELETE /api/stories/' + createData.id);
        const deleteResponse = await fetch(
          `${BASE_URL}/api/stories/${createData.id}`,
          {
            method: 'DELETE',
          }
        );
        const deleteData = await deleteResponse.json();
        console.log('✅ DELETE Response:', deleteResponse.status, deleteData);
        console.log('');
      }
    }

    console.log('🎉 All tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testStoryboardAPI();
