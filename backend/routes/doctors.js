const express = require('express');
const router = express.Router();
const Doctor = require('../models/DoctorsData'); // Correct path with 's'
const Appointment = require('../models/AppointmentData');
const fetchuser = require('../middleware/fetchuser'); // Assuming this middleware exists

// ✅ Get doctor by ID
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Book appointment endpoint
router.post('/book-appointment', fetchuser, async (req, res) => {
  try {
    const { doctor_id, appointmentDate, appointmentTime, reason, notes } = req.body;
    
    // Check if doctor exists
    const doctor = await Doctor.findById(doctor_id);
    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        error: "Doctor not found" 
      });
    }
    
    // Create new appointment
    const appointment = new Appointment({
      doctor_id,
      patient_id: req.user.id,
      appointmentDate,
      appointmentTime,
      reason,
      notes: notes || "",
      status: "scheduled"
    });
    
    await appointment.save();
    
    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: appointment
    });
    
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({ 
      success: false, 
      error: "Internal Server Error", 
      details: error.message 
    });
  }
});

// Get available slots endpoint
router.get('/available-slots/:doctorId/:date', async (req, res) => {
  try {
    const { doctorId, date } = req.params;
    
    // Validate date format
    const selectedDate = new Date(date);
    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid date format" 
      });
    }
    
    // Define available time slots (fixed slots for simplicity)
    const morningSlots = ["09:00 AM", "10:00 AM", "11:00 AM"];
    const eveningSlots = ["05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"];
    
    // For simplicity, just return all slots (you can implement real availability logic later)
    res.json({
      success: true,
      data: {
        morningSlots,
        eveningSlots
      }
    });
    
  } catch (error) {
    console.error("Error fetching available slots:", error);
    res.status(500).json({ 
      success: false, 
      error: "Internal Server Error" 
    });
  }
});

module.exports = router;