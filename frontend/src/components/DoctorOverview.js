import React from 'react';
import {
  Typography,
  Box,
  Divider,
  Grid,
  Chip,
  Card,
  CardContent,
  Button,
  useTheme,
  alpha
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  Event as EventIcon,
  CalendarMonth as CalendarIcon,
  School as EducationIcon,
  Chat as ChatIcon
} from '@mui/icons-material';

// Import utilities
import { calculateCareerStart } from '../utils/doctorUtils';

const DoctorOverview = ({ doctor, openAppointmentModal, openChatModal }) => {
  const theme = useTheme();
  
  // Define available days/timeslots
  const availableDays = ["Monday", "Tuesday", "Wednesday", "Friday"];
  const availableHours = ["Morning: 9:00 AM - 12:00 PM", "Evening: 5:00 PM - 8:00 PM"];

  // Get doctor name or fallback
  const getDoctorName = () => {
    if (!doctor) return 'Doctor';
    return doctor.name || 'Doctor';
  };
  
  // Get doctor qualification or fallback
  const getDoctorQualification = () => {
    if (!doctor || !doctor.qualification || doctor.qualification.length === 0) return 'Specialist';
    return doctor.qualification.join(', ');
  };

  // Get doctor specialization
  const getDoctorSpecialization = () => {
    if (!doctor) return 'Specialist';
    return doctor.specialization || (doctor.qualification && doctor.qualification[0]) || 'Specialist';
  };

  return (
    <Box>
      <Typography 
        variant="h6" 
        fontWeight="bold" 
        gutterBottom
        sx={{
          pb: 1,
          position: 'relative',
          '&:after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: 60,
            height: 3,
            backgroundColor: theme.palette.primary.main,
            borderRadius: 1.5
          }
        }}
      >
        About {getDoctorName()}
      </Typography>
      
      <Typography 
        variant="body1" 
        paragraph
        sx={{ 
          lineHeight: 1.7,
          color: theme.palette.text.secondary,
          mt: 2
        }}
      >
        {getDoctorName()} is a highly skilled {getDoctorQualification().split(',')[0] || 'specialist'} with over {doctor.experience || 'several'} years of experience. {doctor.gender === 'female' ? 'She' : 'He'} specializes in diagnosing and treating a wide range of conditions, with particular expertise in {getDoctorSpecialization().toLowerCase()}.
      </Typography>
      
      <Typography 
        variant="body1" 
        paragraph
        sx={{ 
          lineHeight: 1.7,
          color: theme.palette.text.secondary
        }}
      >
        {doctor.gender === 'female' ? 'She' : 'He'} completed {doctor.gender === 'female' ? 'her' : 'his'} medical training at prestigious institutions and has been practicing in Islamabad since {calculateCareerStart(doctor)}. {getDoctorName()} is known for {doctor.gender === 'female' ? 'her' : 'his'} patient-centered approach and dedication to providing the highest quality care.
      </Typography>
      
      {/* Qualifications Section */}
      <Box 
        sx={{ 
          mt: 4, 
          mb: 3,
          p: 3,
          borderRadius: 3,
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}
      >
        <Typography 
          variant="h6" 
          fontWeight="bold" 
          gutterBottom
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 1
          }}
        >
          <EducationIcon color="primary" />
          Qualifications
        </Typography>
        
        <Grid container spacing={1.5} sx={{ mt: 1 }}>
          {doctor.qualification.map((qual, index) => (
            <Grid item key={index}>
              <Chip 
                label={qual}
                sx={{ 
                  px: 1, 
                  py: 2.5,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  }
                }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
      
      {/* Schedule Section */}
      <Box 
        sx={{ 
          mt: 4, 
          p: 0,
        }}
      >
        <Typography 
          variant="h6" 
          fontWeight="bold" 
          gutterBottom
          sx={{
            pb: 1,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: 60,
              height: 3,
              backgroundColor: theme.palette.primary.main,
              borderRadius: 1.5
            }
          }}
        >
          <EventIcon color="primary" />
          Schedule
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card 
                variant="outlined" 
                sx={{ 
                  borderRadius: 3, 
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    boxShadow: `0 5px 15px ${alpha(theme.palette.primary.main, 0.15)}`
                  },
                  height: '100%'
                }}
              >
                <CardContent sx={{ pb: '16px !important' }}>
                  <Typography 
                    variant="subtitle2" 
                    color="text.secondary" 
                    gutterBottom
                    sx={{ fontWeight: 500 }}
                  >
                    Available Days
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {availableDays.map((day) => (
                      <Chip 
                        key={day}
                        label={day}
                        size="small"
                        icon={<EventIcon fontSize="small" />}
                        sx={{ 
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          color: theme.palette.primary.main,
                          fontWeight: 500
                        }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card 
                variant="outlined" 
                sx={{ 
                  borderRadius: 3, 
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    boxShadow: `0 5px 15px ${alpha(theme.palette.primary.main, 0.15)}`
                  },
                  height: '100%'
                }}
              >
                <CardContent sx={{ pb: '16px !important' }}>
                  <Typography 
                    variant="subtitle2" 
                    color="text.secondary" 
                    gutterBottom
                    sx={{ fontWeight: 500 }}
                  >
                    Consultation Hours
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {availableHours.map((hours) => (
                      <Box key={hours} sx={{ display: 'flex', alignItems: 'center' }}>
                        <TimeIcon 
                          fontSize="small" 
                          sx={{ 
                            color: theme.palette.primary.main, 
                            mr: 1,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            p: 0.5,
                            borderRadius: '50%',
                            boxSizing: 'content-box'
                          }} 
                        />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {hours}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
      
      <Divider sx={{ my: 3 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<CalendarIcon />}
          onClick={openAppointmentModal}
          size="large"
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 3,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
            '&:hover': {
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              transform: 'translateY(-2px)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Book Appointment
        </Button>
        
      </Box>
    </Box>
  );
};

export default DoctorOverview;