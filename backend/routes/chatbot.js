// routes/chatbot.js
const express = require('express');
const router = express.Router();
const chatbotService = require('../services/chatbotService');

router.post('/chat', async (req, res) => {
  try {
    const { symptoms } = req.body;
    
    if (!symptoms) {
      return res.status(400).json({ error: 'Please add correct symptoms' });
    }
    
    // Check if API key is available
    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY is not defined in environment variables');
      console.log('Will try to use hardcoded key instead');
    }
    
    const response = await chatbotService.generateResponse(symptoms);
    
    return res.json({ response });
  } catch (error) {
    console.error('Chatbot API error:', error.message);
    return res.status(500).json({ 
      error: 'Failed to generate response',
      details: error.message
    });
  }
});

module.exports = router;