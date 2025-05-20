import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Paper,
  CircularProgress,
  Tab,
  Tabs,
  Alert,
  Divider
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  MedicalServices as MedicalIcon,
  Info as InfoIcon,
  Email as EmailIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { appointmentsApi } from '../../services/apiService';

const AppointmentsTab = ({ doctorData, theme }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [usingMockData, setUsingMockData] = useState(false);

  // Sample mock data for demonstration
  const mockAppointments = [
    {
      id: '1',
      patientName: 'John Smith',
      patientEmail: 'john.smith@example.com',
      patientPhone: '+92 300 1234567',
      appointmentDate: '2025-05-10',
      appointmentTime: '10:00 AM',
      reason: 'Consultation',
      status: 'scheduled'
    },
    {
      id: '2',
      patientName: 'Alice Johnson',
      patientEmail: 'alice.j@example.com',
      patientPhone: '+92 301 9876543',
      appointmentDate: '2025-05-11',
      appointmentTime: '11:30 AM',
      reason: 'Follow-up',
      status: 'scheduled'
    },
    {
      id: '3',
      patientName: 'Bob Williams',
      patientEmail: 'bobw@example.com',
      patientPhone: '+92 333 5557777',
      appointmentDate: '2025-05-12',
      appointmentTime: '06:00 PM',
      reason: 'New Symptoms',
      status: 'scheduled'
    }
  ];

  useEffect(() => {
    fetchAppointments();
  }, [doctorData]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      setUsingMockData(false);
      
      // Check if doctorData is available
      if (!doctorData || !doctorData._id) {
        console.log("Doctor data not available for fetching appointments");
        setAppointments(mockAppointments);
        setUsingMockData(true);
        return;
      }
      
      console.log("Fetching appointments for doctor ID:", doctorData._id);
      
      try {
        const response = await appointmentsApi.getDoctorAppointments(doctorData._id);
        
        if (response && response.success && response.data && response.data.length > 0) {
          // Transform the data to match our component's expected format
          const formattedAppointments = response.data.map(app => ({
            id: app._id,
            patientName: app.patient_name,
            patientEmail: app.patient_email,
            patientPhone: app.patient_phone || "Not provided",
            appointmentDate: app.appointmentDate,
            appointmentTime: app.appointmentTime,
            reason: app.reason,
            status: app.status,
            notes: app.notes
          }));
          
          setAppointments(formattedAppointments);
        } else {
          console.log("No appointments found or empty response:", response);
          setAppointments([]);
        }
      } catch (apiError) {
        console.error('API error fetching appointments:', apiError);
        setError("Error fetching your appointments. Please try again later.");
        setAppointments(mockAppointments);
        setUsingMockData(true);
      }
    } catch (error) {
      console.error('Error in fetchAppointments:', error);
      setError('Failed to load appointments. Showing sample data instead.');
      setAppointments(mockAppointments);
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Filter appointments based on selected tab
  const getFilteredAppointments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for accurate comparison
    
    if (tabValue === 0) {
      // Upcoming appointments (future dates)
      return appointments.filter(app => {
        const appointmentDate = new Date(app.appointmentDate);
        return appointmentDate >= today && app.status !== 'cancelled';
      });
    } else {
      // Past appointments (past dates)
      return appointments.filter(app => {
        const appointmentDate = new Date(app.appointmentDate);
        return appointmentDate < today || app.status === 'completed';
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  const filteredAppointments = getFilteredAppointments();

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        My Appointments
      </Typography>
      
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Upcoming" />
        <Tab label="Past" />
      </Tabs>
      
      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {usingMockData && !error && (
        <Alert severity="info" sx={{ mb: 2 }} icon={<InfoIcon />}>
          Currently displaying sample appointment data for demonstration purposes.
        </Alert>
      )}
      
      {filteredAppointments.length > 0 ? (
        <Grid container spacing={2}>
          {filteredAppointments.map((appointment) => (
            <Grid item xs={12} sm={6} md={4} key={appointment.id}>
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {appointment.patientName}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <CalendarIcon fontSize="small" sx={{ color: theme.palette.text.secondary, mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <TimeIcon fontSize="small" sx={{ color: theme.palette.text.secondary, mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {appointment.appointmentTime}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <MedicalIcon fontSize="small" sx={{ color: theme.palette.text.secondary, mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {appointment.reason}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  {/* Patient contact information */}
                  <Typography variant="body2" fontWeight="medium" color="text.secondary" gutterBottom>
                    Contact Information:
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <EmailIcon fontSize="small" sx={{ color: theme.palette.text.secondary, mr: 1 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                      {appointment.patientEmail}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <PhoneIcon fontSize="small" sx={{ color: theme.palette.text.secondary, mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {appointment.patientPhone}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <Chip
                      label={appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      color={
                        appointment.status === 'confirmed' || appointment.status === 'scheduled' ? 'success' :
                        appointment.status === 'completed' ? 'info' : 'primary'
                      }
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No {tabValue === 0 ? 'upcoming' : 'past'} appointments found.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default AppointmentsTab;