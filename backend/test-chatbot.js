// test-chatbot.js
const axios = require('axios');

async function testChatbot() {
  try {
    // Using port 5000 as shown in your server output
    const response = await axios.post('http://localhost:5000/api/chatbot/chat', {
      symptoms: 'I feel dizzy'
    });
    
    console.log('Chatbot Response:');
    console.log(response.data.response);
  } catch (error) {
    console.error('Error testing chatbot:', error.response?.data || error.message);
  }
}

testChatbot();