import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Chip,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  useMediaQuery,
  useTheme,
  alpha,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar
} from "@mui/material";
import {
  Close as CloseIcon,
  EventAvailable as EventIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckCircleIcon,
  MedicalServices as MedicalIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  InfoOutlined as InfoIcon
} from "@mui/icons-material";
import { bookAppointment } from "../services/appointmentService";
import { doctorsApi } from "../services/apiService";
import AppointmentSuccessModal from "./AppointmentSuccessModal";

const BookAppointmentModal = ({ open, handleClose, doctorData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // Enhanced logging for doctorData
  useEffect(() => {
    console.log("BookAppointmentModal received doctorData:", doctorData);
    // Initialize the doctor name and specialty when component mounts
    if (doctorData) {
      // This will help debug what fields are available
      console.log("Doctor fields:", Object.keys(doctorData));
    }
  }, [doctorData]);
  
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedReason, setSelectedReason] = useState("");
  const [notes, setNotes] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState({
    morningSlots: [],
    eveningSlots: []
  });
  // Patient information fields
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  
  // State for success modal
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "info"
  });
  
  // Define available dates - next 7 days - FIXED for timezone issues
  // Use UTC methods to generate consistent dates
  // Define available dates - next 7 days - FIXED for timezone issues
const generateAvailableDates = () => {
  const today = new Date();
  const dates = [];
  
  for (let i = 0; i < 7; i++) {
    // Create new date for each day by directly setting day components 
    // to avoid timezone issues
    const currentDate = new Date();
    currentDate.setDate(today.getDate() + i);
    
    // Force consistent formatting with explicit padding
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // 1-indexed, padded
    const day = String(currentDate.getDate()).padStart(2, '0'); // padded
    
    // Construct ISO date string manually
    const isoDate = `${year}-${month}-${day}`;
    
    console.log(`Day ${i}: visual date = ${currentDate.getDate()}, ISO string = ${isoDate}`);
    
    dates.push({
      value: isoDate,  // Consistent ISO format
      label: currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      day: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
      date: currentDate.getDate(),
      full: currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    });
  }
  
  return dates;
};
  const availableDates = generateAvailableDates();

  // Common visit reasons
  const visitReasons = [
    "Consultation", 
    "Follow-up", 
    "New Symptoms", 
    "Second Opinion", 
    "Lab Results"
  ];
  // Improved function to get doctor's name with prefix
  const getDoctorName = () => {
    if (!doctorData) return "Unknown Doctor";
    
    // Add "Dr." prefix only if not already in the name
    const name = doctorData.name || "";
    if (name.toLowerCase().startsWith("dr.") || name.toLowerCase().startsWith("dr ")) {
      return name;
    } else {
      return "Dr. " + name;
    }
  };
  
  // Improved function to get doctor's specialty
  const getDoctorSpecialty = () => {
    if (!doctorData) return "Specialist";
    
    if (doctorData.specialization) {
      return doctorData.specialization;
    }
    
    if (doctorData.qualification) {
      if (Array.isArray(doctorData.qualification)) {
        return doctorData.qualification.join(", ");
      }
      return doctorData.qualification;
    }
    
    if (doctorData.qualifications) {
      if (Array.isArray(doctorData.qualifications)) {
        return doctorData.qualifications.join(", ");
      }
      return doctorData.qualifications;
    }
    
    return "Specialist";
  };
  
  // Helper to get doctor ID from doctorData more reliably
  const getDoctorId = () => {
    // First try to get from doctorData
    if (doctorData && doctorData._id) {
      console.log("Using doctor ID from doctorData:", doctorData._id);
      return doctorData._id;
    }
    
    // If not available in doctorData, try to get from URL
    const pathParts = window.location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    
    // Check if last part looks like a MongoDB ID (24 hex chars)
    if (lastPart && /^[0-9a-fA-F]{24}$/.test(lastPart)) {
      console.log("Using doctor ID from URL:", lastPart);
      return lastPart;
    }
    
    console.warn("Could not determine doctor ID");
    return null;
  };

  // Helper function to convert time slot ranges to individual appointment times
  const convertSlotRangesToTimes = (timeRanges) => {
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
  };
  // Fetch available time slots directly from doctor data
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!selectedDate) return;
      
      const doctorId = getDoctorId();
      if (!doctorId) {
        console.error("No doctor ID available");
        return;
      }
      
      try {
        setLoading(true);
        console.log(`Fetching availability for doctor ID: ${doctorId} on date: ${selectedDate}`);
        
        // Fetch the doctor's complete data with the latest availability
        const response = await doctorsApi.getById(doctorId);
        console.log("Doctor data response:", response);
        
        if (response && response.success && response.data) {
          // FIXED: Date parsing to get the correct day of week
          const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          
          // Log the selected date for debugging
          console.log("Selected date string:", selectedDate);
          
          // Parse the date into components using split
          const dateParts = selectedDate.split('-');
          const year = parseInt(dateParts[0], 10);
          const month = parseInt(dateParts[1], 10) - 1; // JS months are 0-indexed
          const day = parseInt(dateParts[2], 10);
          console.log(`Parsed date parts: year=${year}, month=${month+1}, day=${day}`);
          
          // CALCULATE DAY OF WEEK USING DATE.UTC
          // This ensures consistent behavior regardless of timezone
          const dateObj = new Date(Date.UTC(year, month, day));
          console.log("Date constructed with UTC:", dateObj.toUTCString());
          
          // Get day of week
          const dayIndex = dateObj.getUTCDay();
          const dayOfWeek = dayNames[dayIndex];
          console.log(`Day of week for ${selectedDate} is ${dayOfWeek} (index: ${dayIndex})`);
          
          // Get doctor's availability for this day
          const doctorAvailability = response.data.availability || {};
          console.log("Doctor availability:", doctorAvailability);
          
          const dayAvailability = doctorAvailability[dayOfWeek] || { isAvailable: false, slots: [] };
          console.log(`Availability for ${dayOfWeek}:`, dayAvailability);
          
          if (dayAvailability.isAvailable && Array.isArray(dayAvailability.slots) && dayAvailability.slots.length > 0) {
            // Convert slot ranges to individual appointment times
            const allTimeslots = convertSlotRangesToTimes(dayAvailability.slots);
            
            // Split into morning and evening slots
            const morningSlots = allTimeslots.filter(time => time.includes('AM'));
            const eveningSlots = allTimeslots.filter(time => time.includes('PM'));
            
            console.log("Available slots:", { morningSlots, eveningSlots });
            
            setTimeSlots({
              morningSlots,
              eveningSlots
            });
          } else {
            console.log(`Doctor is not available on ${dayOfWeek}`);
            setTimeSlots({
              morningSlots: [],
              eveningSlots: []
            });
          }
        } else {
          console.error("Failed to fetch doctor data:", response?.error);
          setTimeSlots({
            morningSlots: [],
            eveningSlots: []
          });
          
          setAlert({
            open: true,
            message: response?.error || "Could not fetch doctor's availability",
            severity: "error"
          });
        }
      } catch (error) {
        console.error("Error fetching time slots:", error);
        setTimeSlots({
          morningSlots: [],
          eveningSlots: []
        });
        
        setAlert({
          open: true,
          message: "Failed to load available appointment times. Please try again.",
          severity: "error"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTimeSlots();
  }, [selectedDate]);
  // FIXED: Date selection handler logs the exact date value
  const handleDateChange = (date) => {
    console.log("Date selected from calendar UI:", date);
    
    // Verify the date string format
    if (date && typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      console.log("Valid date format selected:", date);
    } else {
      console.warn("Date has invalid format:", date);
      // Attempt to fix the date if needed
      // This shouldn't be necessary with the fixed availableDates generation
    }
    
    setSelectedDate(date);
    setSelectedTime(null); // Reset time when date changes
  };

  const handleReasonChange = (reason) => {
    setSelectedReason(reason);
  };

  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };
  
  // Updated booking handler with fixed date parsing
  const handleBooking = async () => {
    // Validate inputs
    if (!selectedDate || !selectedTime || !selectedReason || !agreed) {
      setAlert({
        open: true,
        message: "Please fill in all required fields and agree to the terms",
        severity: "warning"
      });
      return;
    }

    // Validate patient information
    if (!patientName || patientName.trim().length < 3) {
      setAlert({
        open: true,
        message: "Please enter your full name (at least 3 characters)",
        severity: "warning"
      });
      return;
    }

    if (!patientEmail || !validateEmail(patientEmail)) {
      setAlert({
        open: true,
        message: "Please enter a valid email address",
        severity: "warning"
      });
      return;
    }

    // Get doctor ID
    const doctorId = getDoctorId();
    if (!doctorId) {
      setAlert({
        open: true,
        message: "Unable to identify doctor. Please try again.",
        severity: "error"
      });
      return;
    }

    try {
      setLoading(true);
      
      // Double-check availability with fresh data before booking
      const availabilityCheck = await doctorsApi.getById(doctorId);
      
      if (availabilityCheck.success) {
        // Extract day of week from the selected date - using UTC methods
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        
        // Use the same date parsing as in fetchTimeSlots
        const dateParts = selectedDate.split('-');
        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1;
        const day = parseInt(dateParts[2], 10);
        
        // Use UTC methods for consistent timezone behavior
        const dateObj = new Date(Date.UTC(year, month, day));
        const dayOfWeek = dayNames[dateObj.getUTCDay()];
        
        // Check if doctor is available on this day
        const doctorAvailability = availabilityCheck.data.availability || {};
        const dayAvailability = doctorAvailability[dayOfWeek];
        
        if (!dayAvailability || !dayAvailability.isAvailable) {
          throw new Error(`The doctor is not available on ${dayOfWeek}. Please choose another date.`);
        }
        
        // Convert slots to appointmentTimes
        const availableTimes = convertSlotRangesToTimes(dayAvailability.slots);
        
        // Check if selected time is in available slots
        if (!availableTimes.includes(selectedTime)) {
          throw new Error(`The selected time slot (${selectedTime}) is no longer available. Please choose another time.`);
        }
      }
      
      const appointmentData = {
        doctor_id: doctorId,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        reason: selectedReason,
        notes: notes,
        // Patient information instead of auth
        patient_name: patientName,
        patient_email: patientEmail,
        patient_phone: patientPhone
      };
      
      console.log("Sending appointment data:", appointmentData);
      
      const response = await bookAppointment(appointmentData);
      
      if (response.success) {
        // Prepare data for success modal and PDF
        const appointmentDetails = {
          appointmentId: response.data._id || 'AP' + Date.now().toString().slice(-8),
          doctorName: doctorData?.name || "Unknown",
          doctorSpecialty: getDoctorSpecialty(),
          patientName: patientName,
          patientEmail: patientEmail,
          patientPhone: patientPhone,
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
          reason: selectedReason,
          notes: notes,
          fee: doctorData?.fee || "3000",
          clinicAddress: doctorData?.clinicAddress || "HealthLink Medical Center, Islamabad"
        };
        
        setAppointmentDetails(appointmentDetails);
        
        // Show success modal instead of alert
        setSuccessModalOpen(true);
        
        // Hide the booking modal
        handleClose();
      } else {
        throw new Error(response.error || "Failed to book appointment");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      setAlert({
        open: true,
        message: error.message || "Failed to book appointment. Please try again.",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Reset everything when modal closes
  const handleModalClose = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedReason("");
    setNotes("");
    setAgreed(false);
    setPatientName("");
    setPatientEmail("");
    setPatientPhone("");
    handleClose();
  };

  // Handle alert close
  const handleAlertClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setAlert({ ...alert, open: false });
  };
  
  // Close success modal
  const handleSuccessModalClose = () => {
    setSuccessModalOpen(false);
  };
  return (
    <>
      <Modal 
        open={open} 
        onClose={handleModalClose}
        aria-labelledby="appointment-modal-title"
      >
        <Paper
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: isMobile ? "95%" : 600,
            maxHeight: "90vh",
            overflowY: "auto",
            bgcolor: "background.paper",
            borderRadius: 4,
            boxShadow: 24,
            p: 0,
          }}
          elevation={8}
        >
          {/* Header */}
          <Box 
            sx={{ 
              p: 3, 
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white',
              position: 'relative'
            }}
          >
            <IconButton
              onClick={handleModalClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: 'white',
                bgcolor: alpha('#fff', 0.2),
                '&:hover': {
                  bgcolor: alpha('#fff', 0.3),
                }
              }}
            >
              <CloseIcon />
            </IconButton>
            
            <Typography variant="h6" id="appointment-modal-title" fontWeight="bold">
              Book Appointment
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
              with {getDoctorName()} • {getDoctorSpecialty()}
            </Typography>
          </Box>

          <Box sx={{ p: 3 }}>
            {/* Step 1: Patient Information */}
            <Typography 
              variant="subtitle1" 
              fontWeight="bold" 
              gutterBottom
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <PersonIcon color="primary" />
              Your Information
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <TextField
                  label="Full Name"
                  fullWidth
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  InputProps={{
                    startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Email"
                  fullWidth
                  required
                  type="email"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  InputProps={{
                    startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Phone (Optional)"
                  fullWidth
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  InputProps={{
                    startAdornment: <PhoneIcon color="action" sx={{ mr: 1 }} />
                  }}
                />
              </Grid>
            </Grid>
            {/* Step 2: Select Date */}
            <Typography 
              variant="subtitle1" 
              fontWeight="bold" 
              gutterBottom
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mt: 3
              }}
            >
              <EventIcon color="primary" />
              Select Date
            </Typography>
            
            <Box 
              sx={{ 
                display: 'flex', 
                flexWrap: 'nowrap', 
                overflowX: 'auto', 
                gap: 1.5, 
                pb: 1.5,
                '&::-webkit-scrollbar': {
                  height: 6
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  borderRadius: 3
                },
                mb: 3
              }}
            >
              {availableDates.map((date) => (
                <Paper
                  key={date.value}
                  elevation={0}
                  sx={{
                    minWidth: 80,
                    borderRadius: 2,
                    p: 1.5,
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: `1px solid ${selectedDate === date.value 
                      ? theme.palette.primary.main 
                      : theme.palette.divider}`,
                    bgcolor: selectedDate === date.value 
                      ? alpha(theme.palette.primary.main, 0.1)
                      : 'background.paper',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      bgcolor: alpha(theme.palette.primary.main, 0.05)
                    },
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => {
                    // Log the date info for debugging
                    console.log("Clicking on date chip:", {
                      label: date.label,
                      day: date.day,
                      value: date.value,
                      visualDay: date.date
                    });
                    
                    // Call handleDateChange with the date value
                    handleDateChange(date.value);
                  }}
                >
                  <Typography 
                    variant="caption" 
                    component="div" 
                    sx={{ color: 'text.secondary' }}
                  >
                    {date.day}
                  </Typography>
                  <Typography 
                    variant="h5" 
                    component="div"
                    sx={{ 
                      fontWeight: 'bold',
                      color: selectedDate === date.value ? theme.palette.primary.main : 'text.primary'
                    }}
                  >
                    {date.date}
                  </Typography>
                </Paper>
              ))}
            </Box>

            {/* Step 3: Select Time */}
            {selectedDate && (
              <>
                <Typography 
                  variant="subtitle1" 
                  fontWeight="bold" 
                  gutterBottom
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mt: 3
                  }}
                >
                  <TimeIcon color="primary" />
                  Select Time
                </Typography>
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress size={32} />
                  </Box>
                ) : (
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ pl: 1 }}>
                        Morning
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {timeSlots.morningSlots && timeSlots.morningSlots.length > 0 ? (
                          timeSlots.morningSlots.map((time) => (
                            <Chip
                              key={time}
                              label={time}
                              onClick={() => setSelectedTime(time)}
                              variant={selectedTime === time ? "filled" : "outlined"}
                              sx={{
                                px: 1,
                                borderColor: selectedTime === time ? theme.palette.primary.main : theme.palette.divider,
                                backgroundColor: selectedTime === time ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                color: selectedTime === time ? theme.palette.primary.main : 'text.primary',
                                '&:hover': {
                                  backgroundColor: selectedTime === time 
                                    ? alpha(theme.palette.primary.main, 0.15)
                                    : alpha(theme.palette.primary.main, 0.05),
                                },
                                fontWeight: selectedTime === time ? 'bold' : 'normal'
                              }}
                            />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                            No morning slots available
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ pl: 1 }}>
                        Evening
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {timeSlots.eveningSlots && timeSlots.eveningSlots.length > 0 ? (
                          timeSlots.eveningSlots.map((time) => (
                            <Chip
                              key={time}
                              label={time}
                              onClick={() => setSelectedTime(time)}
                              variant={selectedTime === time ? "filled" : "outlined"}
                              sx={{
                                px: 1,
                                borderColor: selectedTime === time ? theme.palette.primary.main : theme.palette.divider,
                                backgroundColor: selectedTime === time ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                color: selectedTime === time ? theme.palette.primary.main : 'text.primary',
                                '&:hover': {
                                  backgroundColor: selectedTime === time 
                                    ? alpha(theme.palette.primary.main, 0.15)
                                    : alpha(theme.palette.primary.main, 0.05),
                                },
                                fontWeight: selectedTime === time ? 'bold' : 'normal'
                              }}
                            />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                            No evening slots available
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                    
                    {/* No Available Slots Indicator */}
                    {(!timeSlots.morningSlots || timeSlots.morningSlots.length === 0) && 
                     (!timeSlots.eveningSlots || timeSlots.eveningSlots.length === 0) && (
                      <Grid item xs={12}>
                        <Alert severity="info" sx={{ mt: 2 }}>
                          <InfoIcon sx={{ mr: 1 }} />
                          <Box>
                            <Typography variant="body1" fontWeight="medium">
                              The doctor is not available on this date.
                            </Typography>
                            <Typography variant="body2">
                              Please select another date or check the doctor's schedule.
                            </Typography>
                          </Box>
                        </Alert>
                      </Grid>
                    )}
                  </Grid>
                )}
              </>
            )}
            {/* Step 4: Reason for Visit */}
            {selectedTime && (
              <>
                <Typography 
                  variant="subtitle1" 
                  fontWeight="bold" 
                  gutterBottom
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mt: 3
                  }}
                >
                  <MedicalIcon color="primary" />
                  Reason for Visit
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {visitReasons.map((reason) => (
                    <Chip
                      key={reason}
                      label={reason}
                      onClick={() => handleReasonChange(reason)}
                      variant={selectedReason === reason ? "filled" : "outlined"}
                      sx={{
                        px: 1,
                        borderColor: selectedReason === reason ? theme.palette.primary.main : theme.palette.divider,
                        backgroundColor: selectedReason === reason ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                        color: selectedReason === reason ? theme.palette.primary.main : 'text.primary',
                        '&:hover': {
                          backgroundColor: selectedReason === reason 
                            ? alpha(theme.palette.primary.main, 0.15)
                            : alpha(theme.palette.primary.main, 0.05),
                        },
                        fontWeight: selectedReason === reason ? 'bold' : 'normal'
                      }}
                    />
                  ))}
                </Box>
                
                <TextField
                  label="Additional Notes (Optional)"
                  multiline
                  rows={3}
                  fullWidth
                  variant="outlined"
                  placeholder="Please provide any additional information that might help the doctor prepare for your visit."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  sx={{ mb: 3 }}
                />
              </>
            )}
            
            {/* Appointment Summary */}
            {selectedDate && selectedTime && selectedReason && patientName && patientEmail && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  mb: 3
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Appointment Summary
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Patient
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {patientName}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Contact
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {patientEmail}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Date
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {availableDates.find(d => d.value === selectedDate)?.full || selectedDate}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Time
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedTime}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Doctor
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {getDoctorName()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Specialty
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {getDoctorSpecialty()}
                    </Typography>
                  </Grid>
                  {selectedReason && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Reason
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedReason}
                      </Typography>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MoneyIcon fontSize="small" sx={{ color: theme.palette.success.main }} />
                      <Typography variant="body1" fontWeight="medium" color="success.main">
                        Estimated Fee: Rs. {doctorData?.fee || '3000'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            )}
            {/* Terms & Conditions */}
            {selectedDate && selectedTime && (
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={agreed} 
                    onChange={(e) => setAgreed(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to the appointment guidelines and cancellation policy
                  </Typography>
                }
                sx={{ mb: 3 }}
              />
            )}
            
            <Divider sx={{ my: 2 }} />
            
            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button 
                variant="outlined"
                onClick={handleModalClose}
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  textTransform: 'none'
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                disabled={!selectedDate || !selectedTime || !selectedReason || !agreed || 
                          !patientName || !patientEmail || loading}
                onClick={handleBooking}
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  '&:hover': {
                    boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
                  },
                  '&.Mui-disabled': {
                    bgcolor: alpha(theme.palette.primary.main, 0.3),
                    color: 'white'
                  }
                }}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
              >
                {loading ? 'Processing...' : 'Confirm Booking'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Modal>

      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleAlertClose}
          severity={alert.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
      
      {/* Success Modal with PDF download option */}
      {appointmentDetails && (
        <AppointmentSuccessModal
          open={successModalOpen}
          handleClose={handleSuccessModalClose}
          appointmentData={appointmentDetails}
        />
      )}
    </>
  );
};

export default BookAppointmentModal;