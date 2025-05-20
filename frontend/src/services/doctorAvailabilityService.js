// src/services/doctorAvailabilityService.js
import axios from 'axios';
import { doctorsApi } from './apiService';

const API_BASE_URL = 'http://localhost:5000';

// Get API instance with authentication
const getAuthInstance = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'auth-token': token
    }
  });
};

export const doctorAvailabilityService = {
  // Get doctor availability
  getAvailability: async (doctorId) => {
    try {
      console.log(`Fetching availability for doctor ID: ${doctorId}`);
      const response = await doctorsApi.getById(doctorId);
      
      if (response && response.success && response.data) {
        const availability = response.data.availability || {
          monday: { isAvailable: true, slots: ['09:00 AM - 12:00 PM', '05:00 PM - 08:00 PM'] },
          tuesday: { isAvailable: true, slots: ['09:00 AM - 12:00 PM', '05:00 PM - 08:00 PM'] },
          wednesday: { isAvailable: true, slots: ['09:00 AM - 12:00 PM', '05:00 PM - 08:00 PM'] },
          thursday: { isAvailable: true, slots: ['09:00 AM - 12:00 PM', '05:00 PM - 08:00 PM'] },
          friday: { isAvailable: true, slots: ['09:00 AM - 12:00 PM', '05:00 PM - 08:00 PM'] },
          saturday: { isAvailable: true, slots: ['09:00 AM - 12:00 PM'] },
          sunday: { isAvailable: false, slots: [] }
        };
        
        // Ensure the availability object has all days with proper structure
        ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
          if (!availability[day]) {
            availability[day] = { isAvailable: false, slots: [] };
          } else if (typeof availability[day] !== 'object') {
            availability[day] = { isAvailable: false, slots: [] };
          } else if (!Array.isArray(availability[day].slots)) {
            availability[day].slots = [];
          }
        });
        
        console.log("Fetched availability:", availability);
        return {
          success: true,
          availability
        };
      }
      
      return {
        success: false,
        error: "Could not fetch doctor availability"
      };
    } catch (error) {
      console.error("Error fetching doctor availability:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch availability"
      };
    }
  },
  
  // Update doctor availability
  updateAvailability: async (doctorId, availability) => {
    try {
      console.log(`Updating availability for doctor ID: ${doctorId}`);
      console.log("New availability data:", availability);
      
      // Make a deep copy to avoid reference issues
      const availabilityCopy = JSON.parse(JSON.stringify(availability));
      
      // Use the doctor-profile API endpoint for availability updates
      const api = getAuthInstance();
      const response = await api.put(`/api/doctor-profile/${doctorId}`, { 
        availability: availabilityCopy 
      });
      
      if (response && response.data && response.data.success) {
        return {
          success: true,
          message: response.data.message || "Availability updated successfully",
          data: response.data.data
        };
      }
      
      return {
        success: false,
        error: response?.data?.error || "Failed to update availability"
      };
    } catch (error) {
      console.error("Error updating doctor availability:", error);
      return {
        success: false,
        error: error.message || "Failed to update availability"
      };
    }
  },
  
  // Get available time slots for a specific date
  getAvailableTimeSlots: async (doctorId, date) => {
    try {
      console.log(`Getting available slots for doctor ${doctorId} on ${date}`);
      
      // Format date as YYYY-MM-DD for API call
      const formattedDate = new Date(date).toISOString().split('T')[0];
      
      // Call the backend API directly for available slots
      // This is more reliable as it will check both availability AND booked appointments
      const api = axios.create({
        baseURL: API_BASE_URL,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`Calling API endpoint: /api/appointments/available-slots/${doctorId}/${formattedDate}`);
      const response = await api.get(`/api/appointments/available-slots/${doctorId}/${formattedDate}`);
      
      if (response && response.data) {
        console.log("API response for available slots:", response.data);
        return response.data;
      }
      
      throw new Error("Failed to get available slots from API");
    } catch (error) {
      console.error("Error getting available time slots:", error);
      
      // If the API call fails, attempt to calculate slots from availability
      try {
        console.log("API call failed, falling back to availability calculation");
        
        // Get day of week from the date
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayOfWeek = dayNames[new Date(date).getDay()];
        console.log(`Day of week for ${date}: ${dayOfWeek}`);
        
        // Get the doctor's availability
        const availabilityResponse = await this.getAvailability(doctorId);
        
        if (!availabilityResponse.success) {
          throw new Error("Failed to fetch doctor availability");
        }
        
        const availability = availabilityResponse.availability;
        console.log(`Availability for ${dayOfWeek}:`, availability[dayOfWeek]);
        
        // Check if doctor is available on this day
        if (!availability[dayOfWeek] || !availability[dayOfWeek].isAvailable || !availability[dayOfWeek].slots.length) {
          console.log(`Doctor is not available on ${dayOfWeek}`);
          return {
            success: true,
            data: {
              morningSlots: [],
              eveningSlots: []
            }
          };
        }
        
        // Convert time slots to individual appointment times
        const allSlots = this.convertSlotRangesToTimes(availability[dayOfWeek].slots);
        
        // Split into morning and evening slots
        const morningSlots = allSlots.filter(time => time.includes('AM'));
        const eveningSlots = allSlots.filter(time => time.includes('PM'));
        
        console.log("Fallback available slots calculation:", { morningSlots, eveningSlots });
        
        return {
          success: true,
          data: {
            morningSlots,
            eveningSlots
          }
        };
      } catch (fallbackError) {
        console.error("Fallback availability calculation failed:", fallbackError);
        return {
          success: false,
          error: "Could not determine available time slots"
        };
      }
    }
  },
  
  // Convert time slots to individual appointment times
  convertSlotRangesToTimes: (timeRanges) => {
    if (!Array.isArray(timeRanges)) {
      console.error("Invalid time ranges format:", timeRanges);
      return [];
    }
    
    const appointmentTimes = [];
    
    timeRanges.forEach(range => {
      if (!range || !range.includes(' - ')) {
        console.warn(`Invalid time range format: ${range}`);
        return;
      }
      
      const [startTime, endTime] = range.split(' - ');
      
      // Parse the start and end times
      const parseTime = (timeStr) => {
        if (!timeStr || typeof timeStr !== 'string') {
          console.warn(`Invalid time string: ${timeStr}`);
          return null;
        }
        
        const parts = timeStr.split(' ');
        if (parts.length !== 2) {
          console.warn(`Time string doesn't have period (AM/PM): ${timeStr}`);
          return null;
        }
        
        const [time, period] = parts;
        const timeParts = time.split(':');
        if (timeParts.length !== 2) {
          console.warn(`Time doesn't have hours and minutes: ${time}`);
          return null;
        }
        
        let hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
        
        if (isNaN(hours) || isNaN(minutes)) {
          console.warn(`Invalid hours or minutes: ${time}`);
          return null;
        }
        
        if (period === 'PM' && hours < 12) {
          hours += 12;
        } else if (period === 'AM' && hours === 12) {
          hours = 0;
        }
        
        return { hours, minutes };
      };
      
      const start = parseTime(startTime);
      const end = parseTime(endTime);
      
      if (!start || !end) {
        console.warn("Invalid time format, skipping range:", range);
        return;
      }
      
      // Create 1-hour appointment slots
      let currentHour = start.hours;
      let currentMinute = start.minutes;
      
      while ((currentHour < end.hours) || 
             (currentHour === end.hours && currentMinute < end.minutes)) {
        
        // Format time back to 12-hour format
        let displayHour = currentHour % 12;
        if (displayHour === 0) displayHour = 12;
        const period = currentHour >= 12 ? 'PM' : 'AM';
        
        const timeSlot = `${displayHour}:${currentMinute.toString().padStart(2, '0')} ${period}`;
        appointmentTimes.push(timeSlot);
        
        // Advance by appointment duration (1 hour)
        currentHour += 1;
      }
    });
    
    return appointmentTimes;
  },
  
  // Check if a specific time slot is available
  checkTimeAvailability: async (doctorId, date, time) => {
    try {
      console.log(`Checking availability for doctor ${doctorId} on ${date} at ${time}`);
      
      // Format date for API call
      const formattedDate = new Date(date).toISOString().split('T')[0];
      
      // First, call the specific endpoint to check slot availability
      try {
        const api = axios.create({
          baseURL: API_BASE_URL,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const encodedTime = encodeURIComponent(time);
        const response = await api.get(`/api/appointments/check-slot/${doctorId}/${formattedDate}/${encodedTime}`);
        
        if (response && response.data) {
          console.log("Direct slot check response:", response.data);
          return {
            success: response.data.success && response.data.available,
            message: response.data.available ? 
              "Time slot is available" : 
              "This time slot is no longer available"
          };
        }
      } catch (directCheckError) {
        console.warn("Direct slot check failed, falling back to slots list:", directCheckError);
      }
      
      // If direct check fails, fall back to getting all available slots
      const response = await this.getAvailableTimeSlots(doctorId, date);
      
      if (!response.success) {
        throw new Error(response.error || "Failed to get available slots");
      }
      
      // Check if the selected time is in the available slots
      const { morningSlots, eveningSlots } = response.data;
      const isAvailable = [...morningSlots, ...eveningSlots].includes(time);
      
      console.log(`Time ${time} availability:`, isAvailable);
      
      return {
        success: isAvailable,
        message: isAvailable ? 
          "Time slot is available" : 
          "This time slot is no longer available"
      };
    } catch (error) {
      console.error("Error checking time availability:", error);
      // If we can't verify availability, assume it's available to not block booking
      // The server will still validate before booking
      return { 
        success: true,
        message: "Could not verify slot availability, proceeding with booking"
      };
    }
  }
};