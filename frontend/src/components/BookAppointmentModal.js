import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
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
  IconButton
} from "@mui/material";
import {
  Close as CloseIcon,
  EventAvailable as EventIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckCircleIcon,
  MedicalServices as MedicalIcon,
  AttachMoney as MoneyIcon
} from "@mui/icons-material";

const BookAppointmentModal = ({ open, handleClose, doctorName, specialty }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedReason, setSelectedReason] = useState("");
  const [agreed, setAgreed] = useState(false);
  
  // Define available dates
  const today = new Date();
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Format to "Mon, Feb 26" or similar
    return {
      value: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.getDate(),
      full: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    };
  });

  // Define available slots - can be customized per day in a real app
  const morningSlots = ["09:00 AM", "10:00 AM", "11:00 AM"];
  const eveningSlots = ["05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"];
  
  // Common visit reasons
  const visitReasons = [
    "Consultation", 
    "Follow-up", 
    "New Symptoms", 
    "Second Opinion", 
    "Lab Results"
  ];

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time when date changes
  };

  const handleReasonChange = (reason) => {
    setSelectedReason(reason);
  };

  const handleBooking = () => {
    // In a real app, this would make an API call to book the appointment
    alert(`Appointment booked for ${selectedDate} at ${selectedTime} with Dr. ${doctorName}`);
    handleClose();
  };

  // Reset everything when modal closes
  const handleModalClose = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedReason("");
    setAgreed(false);
    handleClose();
  };

  return (
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
        elevation={24}
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
            with Dr. {doctorName} • {specialty}
          </Typography>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* Step 1: Select Date */}
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
                onClick={() => handleDateChange(date.value)}
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

          {/* Step 2: Select Time */}
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
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ pl: 1 }}>
                    Morning
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {morningSlots.map((time) => (
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
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ pl: 1 }}>
                    Evening
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {eveningSlots.map((time) => (
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
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </>
          )}
          
          {/* Step 3: Reason for Visit */}
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
                sx={{ mb: 3 }}
              />
            </>
          )}
          
          {/* Appointment Summary */}
          {selectedDate && selectedTime && (
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
                    Date
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {availableDates.find(d => d.value === selectedDate)?.full}
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
                    Dr. {doctorName}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Specialty
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {specialty}
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
                      Estimated Fee: Rs. 2,000
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
            >
              Cancel
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              disabled={!selectedDate || !selectedTime || !agreed}
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
              startIcon={<CheckCircleIcon />}
            >
              Confirm Booking
            </Button>
          </Box>
        </Box>
      </Paper>
    </Modal>
  );
};

export default BookAppointmentModal;