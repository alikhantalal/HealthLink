import axios from 'axios';

const API_URL = 'http://localhost:5000/api/appointments';

// Book a new appointment without authentication
export const bookAppointment = async (appointmentData) => {
  try {
    const response = await axios.post(
      `${API_URL}/book`,
      appointmentData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error in bookAppointment:", error);
    throw error.response ? error.response.data : error;
  }
};

// Get available time slots for a doctor on a specific date
export const getAvailableTimeSlots = async (doctorId, date) => {
  try {
    console.log("Getting available slots for doctor:", doctorId, "and date:", date);
    const formattedDate = new Date(date).toISOString().split('T')[0];
    const response = await axios.get(
      `${API_URL}/available-slots/${doctorId}/${formattedDate}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching available slots:", error);
    // Return default slots as fallback
    return {
      success: true,
      data: {
        morningSlots: ["09:00 AM", "10:00 AM", "11:00 AM"],
        eveningSlots: ["05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"]
      }
    };
  }
};

// Get all appointments for a specific doctor
export const getDoctorAppointments = async (doctorId) => {
  try {
    const response = await axios.get(`${API_URL}/doctor/${doctorId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    throw error.response ? error.response.data : error;
  }
};