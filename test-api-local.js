const axios = require('axios');

async function testClaudeAPI() {
  try {
    console.log('Testing Claude API endpoint...');
    
    const response = await axios.post('http://localhost:3000/api/claude', {
      messages: [
        {
          role: 'user',
          content: 'Hello, this is a test message. Please respond with "API is working!"'
        }
      ],
      model: 'claude-sonnet-4-20250514'
    });
    
    console.log('✅ API Response:', response.data);
  } catch (error) {
    console.error('❌ API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
  }
}

// Run the test
testClaudeAPI();