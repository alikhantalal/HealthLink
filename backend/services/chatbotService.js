// services/chatbotService.js
const axios = require('axios');
require('dotenv').config();

class ChatbotService {
  async generateResponse(symptoms) {
    try {
      // Check for API key in environment variables
      const apiKey = process.env.GROQ_API_KEY || "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";
      
      // Log API key status (first 10 chars only for security)
      console.log(`Using API key: ${apiKey.substring(0, 10)}...`);
      console.log('Sending request to Groq API...');
      
      const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: "llama3-8b-8192",  // Use a standard model instead of "deepseek-r1-distill-qwen-32b"
        messages: [
          {
            role: "system",
            content: `You are an AI-powered medical assistant.`
          },
          {
            role: "user",
            content: `Given the symptoms: ${symptoms}, 
            your task is to:
            1. Predict the most likely disease.
            2. Suggest the appropriate type of doctor to visit.
            
            Format your response as follows:
            Disease: [Predicted Disease]
            Doctor: [Doctor Specialization]
            
            We have the following doctors:
            1. Cardiologist
            2. Neurologist
            3. Dermatologist
            4. Gastroenterologist
            5. Orthopedic Surgeon
            6. Psychiatrist
            7. Ophthalmologist
            8. Dentist
            9. General Physician`
          }
        ],
        temperature: 0.2
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response received from Groq API');
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("Error generating chatbot response:", error.response?.data || error.message);
      if (error.response) {
        console.error("Status code:", error.response.status);
        console.error("Headers:", JSON.stringify(error.response.headers));
      }
      
      // Provide a fallback response in case of API failure
      return `I'm having trouble analyzing your symptoms right now. Based on what you've shared, I recommend consulting with a General Physician who can properly evaluate your condition. If your symptoms are severe, please seek immediate medical attention.`;
    }
  }
}

module.exports = new ChatbotService();