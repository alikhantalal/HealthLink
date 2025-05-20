const express = require("express");
const router = express.Router();
const Appointment = require("../models/AppointmentData");
const Doctor = require("../models/DoctorsData");
const { body, validationResult } = require("express-validator");

// Route 1: Book a new appointment - POST /api/appointments/book
router.post(
  "/book",
  [
    body("doctor_id", "Doctor ID is required").notEmpty(),
    body("appointmentDate", "Appointment date is required").isISO8601(),
    body("appointmentTime", "Appointment time is required").notEmpty(),
    body("reason", "Reason is required").notEmpty(),
    body("patient_name", "Patient name is required").notEmpty(),
    body("patient_email", "Valid email is required").isEmail()
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { doctor_id, appointmentDate, appointmentTime, reason, notes, patient_name, patient_email, patient_phone } = req.body;
      
      // Check if doctor exists
      const doctor = await Doctor.findById(doctor_id);
      if (!doctor) {
        return res.status(404).json({ 
          success: false, 
          error: "Doctor not found" 
        });
      }
      
      // Create new appointment without requiring authentication
      const appointment = new Appointment({
        doctor_id,
        // Instead of storing user ID, store patient contact info
        patient_name,
        patient_email,
        patient_phone: patient_phone || "",
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
  }
);

// Route 2: Get available time slots for a doctor on a specific date - GET /api/appointments/available-slots/:doctorId/:date
router.get("/available-slots/:doctorId/:date", async (req, res) => {
  try {
    const { doctorId, date } = req.params;
    
    console.log(`Fetching available slots for doctor ${doctorId} on date ${date}`);
    
    // Validate date format
    const selectedDate = new Date(date);
    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid date format" 
      });
    }
    
    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        error: "Doctor not found" 
      });
    }
    
    // Get day of week from the date
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = dayNames[selectedDate.getDay()];
    
    console.log(`Day of week: ${dayOfWeek}`);
    console.log(`Doctor availability:`, JSON.stringify(doctor.availability, null, 2));
    
    // Check doctor's availability for this day
    let dayAvailability;
    if (doctor.availability && typeof doctor.availability === 'object') {
      dayAvailability = doctor.availability[dayOfWeek];
      console.log(`Day availability for ${dayOfWeek}:`, JSON.stringify(dayAvailability, null, 2));
    }
    
    // If the doctor is not available on this day or no availability is set, return empty slots
    if (!dayAvailability || !dayAvailability.isAvailable || !dayAvailability.slots || !Array.isArray(dayAvailability.slots) || dayAvailability.slots.length === 0) {
      console.log('No availability for this day, returning empty slots');
      return res.json({
        success: true,
        data: {
          morningSlots: [],
          eveningSlots: []
        }
      });
    }
    
    // Get the time slots from the doctor's availability
    const availableTimeSlots = dayAvailability.slots;
    console.log('Available time slots from schema:', availableTimeSlots);
    
    // Get start and end of the selected date
    const startDate = new Date(selectedDate);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(selectedDate);
    endDate.setHours(23, 59, 59, 999);
    
    // Find appointments for this doctor on the selected date
    const bookedAppointments = await Appointment.find({
      doctor_id: doctorId,
      appointmentDate: { $gte: startDate, $lte: endDate },
      status: { $ne: "cancelled" }
    });
    
    console.log(`Found ${bookedAppointments.length} booked appointments for this date`);
    
    // Get booked time slots
    const bookedSlots = bookedAppointments.map(app => app.appointmentTime);
    console.log('Booked slots:', bookedSlots);
    
    // Convert the doctor's time slots to individual appointment times
    const convertSlotsToTimes = (slots) => {
      const times = [];
      
      slots.forEach(timeRange => {
        console.log(`Processing time range: ${timeRange}`);
        const parts = timeRange.split(' - ');
        
        if (parts.length !== 2) {
          console.log(`Invalid time range format: ${timeRange}`);
          return;
        }
        
        const startTime = parts[0];
        const endTime = parts[1];
        
        // Parse times to get hours and minutes
        const parseTime = (timeStr) => {
          const timeParts = timeStr.split(' ');
          if (timeParts.length !== 2) {
            console.log(`Invalid time string format: ${timeStr}`);
            return null;
          }
          
          const period = timeParts[1]; // AM or PM
          const timePortion = timeParts[0];
          const [hoursStr, minutesStr] = timePortion.split(':');
          
          let hours = parseInt(hoursStr, 10);
          const minutes = parseInt(minutesStr, 10);
          
          if (isNaN(hours) || isNaN(minutes)) {
            console.log(`Invalid time components: ${timeStr}`);
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
          console.log('Failed to parse start or end time, skipping this slot');
          return;
        }
        
        console.log(`Parsed times - Start: ${start.hours}:${start.minutes}, End: ${end.hours}:${end.minutes}`);
        
        // Create appointment slots (assuming 1-hour appointments)
        let currentHour = start.hours;
        let currentMinute = start.minutes;
        
        while ((currentHour < end.hours) || 
              (currentHour === end.hours && currentMinute < end.minutes)) {
          
          // Format time back to 12-hour format
          let displayHour = currentHour % 12;
          if (displayHour === 0) displayHour = 12;
          const period = currentHour >= 12 ? 'PM' : 'AM';
          
          const timeSlot = `${displayHour}:${currentMinute.toString().padStart(2, '0')} ${period}`;
          console.log(`Generated time slot: ${timeSlot}`);
          
          // Add to times if not booked
          if (!bookedSlots.includes(timeSlot)) {
            times.push(timeSlot);
            console.log(`Added available slot: ${timeSlot}`);
          } else {
            console.log(`Slot ${timeSlot} is already booked, skipping`);
          }
          
          // Advance by appointment duration (1 hour)
          currentHour += 1;
        }
      });
      
      return times;
    };
    
    // Get available times
    const availableTimes = convertSlotsToTimes(availableTimeSlots);
    console.log(`Generated ${availableTimes.length} available time slots`);
    
    // Split into morning and evening
    const morningSlots = availableTimes.filter(time => time.includes('AM'));
    const eveningSlots = availableTimes.filter(time => time.includes('PM'));
    
    console.log(`Morning slots: ${morningSlots.length}, Evening slots: ${eveningSlots.length}`);
    
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
      error: "Internal Server Error", 
      details: error.message
    });
  }
});

// Route 3: Get appointments for a doctor - GET /api/appointments/doctor/:doctorId
router.get("/doctor/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        error: "Doctor not found" 
      });
    }
    
    // Find appointments for this doctor
    const appointments = await Appointment.find({
      doctor_id: doctorId
    }).sort({ appointmentDate: 1, appointmentTime: 1 });
    
    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
    
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    res.status(500).json({ 
      success: false, 
      error: "Internal Server Error" 
    });
  }
});

// Route 4: Get appointments for a patient - GET /api/appointments/patient
router.get("/patient", async (req, res) => {
  try {
    const { patient_email } = req.query;
    
    if (!patient_email) {
      return res.status(400).json({
        success: false,
        error: "Patient email is required"
      });
    }
    
    // Find appointments for this patient email
    const appointments = await Appointment.find({
      patient_email: patient_email
    })
    .populate('doctor_id', 'name specialization profile') // Populate doctor details
    .sort({ appointmentDate: 1, appointmentTime: 1 });
    
    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
    
  } catch (error) {
    console.error("Error fetching patient appointments:", error);
    res.status(500).json({ 
      success: false, 
      error: "Internal Server Error" 
    });
  }
});

// Route 5: Update appointment status - PUT /api/appointments/:id/status
router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['scheduled', 'completed', 'cancelled', 'no-show'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Valid status is required (scheduled, completed, cancelled, or no-show)"
      });
    }
    
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: "Appointment not found"
      });
    }
    
    // Update appointment status
    appointment.status = status;
    await appointment.save();
    
    res.json({
      success: true,
      message: `Appointment status updated to ${status}`,
      data: appointment
    });
    
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({ 
      success: false, 
      error: "Internal Server Error" 
    });
  }
});

// Route for checking if a specific time slot is available - GET /api/appointments/check-slot/:doctorId/:date/:time
router.get("/check-slot/:doctorId/:date/:time", async (req, res) => {
  try {
    const { doctorId, date, time } = req.params;
    
    // Validate date format
    const selectedDate = new Date(date);
    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid date format" 
      });
    }
    
    // Get start and end of the selected date
    const startDate = new Date(selectedDate);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(selectedDate);
    endDate.setHours(23, 59, 59, 999);
    
    // Check if this time slot is already booked
    const existingAppointment = await Appointment.findOne({
      doctor_id: doctorId,
      appointmentDate: { $gte: startDate, $lte: endDate },
      appointmentTime: time,
      status: { $ne: "cancelled" }
    });
    
    res.json({
      success: true,
      available: !existingAppointment
    });
    
  } catch (error) {
    console.error("Error checking slot availability:", error);
    res.status(500).json({ 
      success: false, 
      error: "Internal Server Error" 
    });
  }
});

module.exports = router;