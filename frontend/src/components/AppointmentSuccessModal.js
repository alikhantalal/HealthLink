import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  Divider,
  useTheme,
  Grid,
  alpha,
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  EventAvailable as EventIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  MedicalServices as MedicalIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import AppointmentConfirmationPDF from './AppointmentConfirmationPDF';

const AppointmentSuccessModal = ({ open, handleClose, appointmentData }) => {
  const theme = useTheme();
  const [confettiShown, setConfettiShown] = useState(false);
  
  // Show confetti when the modal opens
  React.useEffect(() => {
    if (open && !confettiShown) {
      // Trigger confetti
      try {
        // Simple confetti effect - in a real app you might use a library like canvas-confetti
        console.log("Appointment booked successfully!");
        setConfettiShown(true);
      } catch (error) {
        console.log("Confetti effect not available");
      }
    } else if (!open) {
      setConfettiShown(false);
    }
  }, [open, confettiShown]);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateString; // Return original if parsing fails
    }
  };
  
  if (!appointmentData) {
    return null;
  }
  
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }
      }}
    >
      {/* Success Header */}
      <Box 
        sx={{ 
          p: 3, 
          background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
          color: 'white',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}
      >
        <IconButton
          onClick={handleClose}
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
        
        <CheckCircleIcon sx={{ fontSize: 60, mb: 1 }} />
        <Typography variant="h5" fontWeight="bold">
          Appointment Confirmed!
        </Typography>
        <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
          Your appointment has been successfully scheduled
        </Typography>
      </Box>
      
      <DialogContent sx={{ p: 3 }}>
        {/* Appointment Summary Card */}
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            borderRadius: 2,
            borderColor: alpha(theme.palette.success.main, 0.3),
            bgcolor: alpha(theme.palette.success.main, 0.05),
            mb: 3
          }}
        >
          {/* Doctor Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PersonIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            <Typography variant="h6">
              Dr. {appointmentData.doctorName}
            </Typography>
          </Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, ml: 4 }}>
            {appointmentData.doctorSpecialty}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Appointment Details */}
          <Grid container spacing={2}>
            {/* Date */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EventIcon sx={{ mr: 1, color: theme.palette.primary.main, fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary">
                  Date
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight="medium" sx={{ mt: 0.5, ml: 4 }}>
                {formatDate(appointmentData.appointmentDate)}
              </Typography>
            </Grid>
            
            {/* Time */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TimeIcon sx={{ mr: 1, color: theme.palette.primary.main, fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary">
                  Time
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight="medium" sx={{ mt: 0.5, ml: 4 }}>
                {appointmentData.appointmentTime}
              </Typography>
            </Grid>
            
            {/* Reason */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MedicalIcon sx={{ mr: 1, color: theme.palette.primary.main, fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary">
                  Reason for Visit
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight="medium" sx={{ mt: 0.5, ml: 4 }}>
                {appointmentData.reason}
              </Typography>
            </Grid>
            
            {/* Location */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationIcon sx={{ mr: 1, color: theme.palette.primary.main, fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary">
                  Location
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight="medium" sx={{ mt: 0.5, ml: 4 }}>
                {appointmentData.clinicAddress || 'HealthLink Medical Center, Main Block'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Instructions */}
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          What to Bring:
        </Typography>
        <Typography variant="body2" paragraph>
          • Your appointment confirmation (download below)
        </Typography>
        <Typography variant="body2" paragraph>
          • Any relevant medical records or test results
        </Typography>
        <Typography variant="body2" paragraph>
          • List of current medications
        </Typography>
        <Typography variant="body2" paragraph>
          • Your health insurance card (if applicable)
        </Typography>
        <Typography variant="body2" paragraph>
          • Please arrive 15 minutes before your scheduled time
        </Typography>
        
        {/* Download Button */}
        <AppointmentConfirmationPDF appointmentData={appointmentData} />
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={handleClose} 
          variant="outlined"
          fullWidth
          sx={{ borderRadius: 2, py: 1, textTransform: 'none' }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentSuccessModal;