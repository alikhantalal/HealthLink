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
    return response.data;
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
      const response = await api.get(`/api/fetchdoctorsdata?specialization=${specialization}`);
      return response;
    } catch (error) {
      console.error('Error fetching doctors by specialization:', error);
      throw error;
    }
  },

  // Get doctor by ID
  getById: async (doctorId) => {
    try {
      console.log(`Fetching doctor with ID: ${doctorId}`);
      const response = await api.get(`/api/fetchdoctorsdata/doctor/${doctorId}`);
      return response;
    } catch (error) {
      console.error('Error fetching doctor details:', error);
      throw error;
    }
  },

  // Get doctor by user ID
  getDoctorByUserId: async (userId) => {
    try {
      console.log(`Fetching doctor profile for user ID: ${userId}`);
      const response = await api.get(`/api/doctor-profile/user/${userId}`);
      return response;
    } catch (error) {
      console.error('Error fetching doctor profile by user ID:', error);
      throw error;
    }
  },

  // Get all doctors
  getAll: async () => {
    try {
      console.log('Fetching all doctors');
      const response = await api.get('/api/fetchdoctorsdata');
      return response;
    } catch (error) {
      console.error('Error fetching all doctors:', error);
      throw error;
    }
  },

  // Add new doctor
  addDoctor: async (doctorData) => {
    try {
      console.log('Adding new doctor:', doctorData);
      const response = await api.post('/api/fetchdoctorsdata/adddoctor', doctorData);
      return response;
    } catch (error) {
      console.error('Error adding doctor:', error);
      throw error;
    }
  },

  // Update doctor profile
  updateDoctorProfile: async (doctorId, updateData) => {
    try {
      console.log(`Updating doctor profile with ID: ${doctorId}`, updateData);
      const response = await api.put(`/api/doctor-profile/${doctorId}`, updateData);
      return response;
    } catch (error) {
      console.error('Error updating doctor profile:', error);
      throw error;
    }
  },

  // Update doctor profile image
  updateProfileImage: async (doctorId, formData) => {
    try {
      console.log(`Updating doctor profile image for ID: ${doctorId}`);
      const response = await api.put(`/api/doctor-profile/${doctorId}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response;
    } catch (error) {
      console.error('Error updating doctor profile image:', error);
      throw error;
    }
  },

  // Get doctor verification status
  getVerificationStatus: async () => {
    try {
      console.log('Fetching verification status');
      const response = await api.get('/api/doctor-registration/verification-status');
      return response;
    } catch (error) {
      console.error('Error fetching doctor verification status:', error);
      throw error;
    }
  },
  
  // Get doctor by email - new function
  getByEmail: async (email) => {
    try {
      console.log(`Fetching doctor with email: ${email}`);
      // First try to find in the verified doctors collection
      const response = await api.get(`/api/fetchdoctorsdata?email=${email}`);
      return response;
    } catch (error) {
      console.error('Error fetching doctor by email:', error);
      throw error;
    }
  },
  
  // Get unverified doctor by email - new function
  getDoctorByEmail: async (email) => {
    try {
      console.log(`Fetching unverified doctor with email: ${email}`);
      const response = await api.get(`/api/doctor-registration/doctor-by-email?email=${email}`);
      return response;
    } catch (error) {
      console.error('Error fetching unverified doctor by email:', error);
      throw error;
    }
  },
  
  // Get verification status by email - new function
  getVerificationStatusByEmail: async (email) => {
    try {
      console.log(`Checking verification status for email: ${email}`);
      const response = await api.get(`/api/doctor-registration/verification-status-by-email?email=${email}`);
      return response;
    } catch (error) {
      console.error('Error checking verification status by email:', error);
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
      return response;
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      throw error;
    }
  }
};

// Authentication API
export const authApi = {
  // Register new user
  register: async (userData) => {
    try {
      console.log('Registering new user');
      const response = await api.post('/api/auth/createuser', userData);
      return response;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      console.log('Logging in user with role:', credentials.role);
      const response = await api.post('/api/auth/login', credentials);
      return response;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  // Get user data
  getUserData: async () => {
    try {
      console.log('Fetching user data');
      const response = await api.post('/api/auth/getuser');
      return response;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }
};

// Appointments API
export const appointmentsApi = {
  // Get doctor appointments
  getDoctorAppointments: async (doctorId) => {
    try {
      console.log(`Fetching appointments for doctor ID: ${doctorId}`);
      const response = await api.get(`/api/appointments/doctor/${doctorId}`);
      return response;
    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
      throw error;
    }
  },

  // Get patient appointments
  getPatientAppointments: async () => {
    try {
      console.log('Fetching appointments for patient');
      const response = await api.get('/api/appointments/patient');
      return response;
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      throw error;
    }
  },

  // Update appointment status
  updateAppointmentStatus: async (appointmentId, status) => {
    try {
      console.log(`Updating appointment status for ID: ${appointmentId} to ${status}`);
      const response = await api.put(`/api/appointments/${appointmentId}/status`, { status });
      return response;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  }
};

const apiService = {
  doctorsApi,
  chatbotApi,
  authApi,
  appointmentsApi
};

export default apiService;