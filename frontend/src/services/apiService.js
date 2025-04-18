// src/services/apiService.js
import axios from 'axios';

// Base URL for API requests
const API_BASE_URL = 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for authentication tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for logging and error handling
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    // Extract the error message to provide better feedback
    let errorMessage = 'An error occurred while connecting to the server';
    
    if (error.response) {
      // Server responded with an error status
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', error.response.data);
      
      if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (error.response.statusText) {
        errorMessage = `Server Error: ${error.response.statusText}`;
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
      errorMessage = 'No response received from the server. Please check your connection.';
    } else {
      // Error in setting up the request
      console.error('Request Error:', error.message);
      errorMessage = error.message;
    }
    
    // Create an enhanced error object
    const enhancedError = new Error(errorMessage);
    enhancedError.originalError = error;
    enhancedError.isApiError = true;
    
    return Promise.reject(enhancedError);
  }
);

// Doctors API
export const doctorsApi = {
  // Get doctors by specialization
  getBySpecialization: async (specialization) => {
    try {
      console.log(`Fetching doctors with specialization: ${specialization}`);
      const response = await api.get(`/api/fetchdoctorsdata?qualification=${specialization}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctors by specialization:', error);
      throw error;
    }
  },

  // Get doctor by ID
  getById: async (doctorId) => {
    try {
      console.log(`Fetching doctor with ID: ${doctorId}`);
      const response = await api.get(`/api/doctor/${doctorId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor details:', error);
      throw error;
    }
  },

  // Get all doctors
  getAll: async () => {
    try {
      console.log('Fetching all doctors');
      const response = await api.get('/api/fetchdoctorsdata');
      return response.data;
    } catch (error) {
      console.error('Error fetching all doctors:', error);
      throw error;
    }
  },

  // Add new doctor
  addDoctor: async (doctorData) => {
    try {
      console.log('Adding new doctor:', doctorData);
      const response = await api.post('/api/adddoctor', doctorData);
      return response.data;
    } catch (error) {
      console.error('Error adding doctor:', error);
      throw error;
    }
  }
};

// Chatbot API
export const chatbotApi = {
  // Get chatbot response based on symptoms
  getResponse: async (symptoms) => {
    try {
      console.log(`Sending symptoms to chatbot: ${symptoms}`);
      const response = await api.post('/api/chatbot/chat', { symptoms });
      return response.data;
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      throw error;
    }
  }
};

// Authentication API (prepared for future connection)
export const authApi = {
  // Register new user
  register: async (userData) => {
    try {
      console.log('Registering new user');
      const response = await api.post('/api/authentication', userData);
      return response.data;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      console.log('Logging in user');
      const response = await api.post('/api/authentication/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  // Get user data
  getUserData: async () => {
    try {
      console.log('Fetching user data');
      const response = await api.post('/api/authentication/getuser');
      return response.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }
};

const apiService = {
  doctorsApi,
  chatbotApi,
  authApi
};

export default apiService;