// Now let's fix the DoctorProfile.js component to properly pass doctor data to the BookAppointmentModal

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Box,
  CircularProgress,
  Alert,
  Button,
  Tabs,
  Tab,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';

// Import sub-components
import DoctorInfoCard from '../components/DoctorInfoCard';
import DoctorOverview from '../components/DoctorOverview';
import DoctorExperienceEducation from '../components/DoctorExperienceEducation';
import DoctorServices from '../components/DoctorServices';
import DoctorReviews from '../components/DoctorReviews';
import BookAppointmentModal from '../components/BookAppointmentModal';

// Import API service
import { doctorsApi } from '../services/apiService';

// Import utils
import { processDoctor } from '../utils/doctorUtils';

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [openAppointmentModal, setOpenAppointmentModal] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!id) {
        setError('Doctor ID is missing.');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Fetching doctor details for ID: ${id}`);
        const response = await doctorsApi.getById(id);
        
        console.log('Doctor API response:', response);
        
        let doctorData;
        if (response && response.success && response.data) {
          doctorData = response.data;
        } else if (response && response.data) {
          doctorData = response.data;
        } else if (response && !response.success && response.message) {
          throw new Error(response.message);
        } else if (response) {
          doctorData = response;
        } else {
          throw new Error('Failed to fetch doctor data - empty response');
        }
        
        setDoctor(processDoctor(doctorData));
      } catch (error) {
        console.error('Error fetching doctor:', error);
        setError(error.message || 'Could not load doctor information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // FIXED: Removed redundant getDoctorName and getDoctorSpecialization functions
  // since we're passing the entire doctor object to the BookAppointmentModal

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Box textAlign="center">
          <CircularProgress size={60} thickness={4} sx={{ color: theme.palette.primary.main }} />
          <Typography variant="h6" sx={{ mt: 3, fontWeight: 500 }}>
            Loading doctor profile...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ 
            mb: 4, 
            borderRadius: 2, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            '& .MuiAlert-icon': { fontSize: 28 }
          }}
        >
          <Typography variant="subtitle1" fontWeight={500}>{error}</Typography>
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate(-1)}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            px: 3,
            py: 1,
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            '&:hover': {
              boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
            }
          }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  if (!doctor) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert 
          severity="warning" 
          sx={{ 
            mb: 4, 
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            '& .MuiAlert-icon': { fontSize: 28 }
          }}
        >
          <Typography variant="subtitle1" fontWeight={500}>Doctor profile not found</Typography>
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/specialists')}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            px: 3,
            py: 1,
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            '&:hover': {
              boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
            }
          }}
        >
          Browse Specialists
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 } }}>
      {isMobile && (
        <Box 
          sx={{ 
            mb: 3, 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {doctor.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {doctor.specialization}
          </Typography>
        </Box>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <DoctorInfoCard 
            doctor={doctor}
            openAppointmentModal={() => setOpenAppointmentModal(true)}
            isMobile={isMobile}
          />
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Box
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              height: '100%',
              bgcolor: 'background.paper',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
              }
            }}
          >
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    minHeight: 64,
                    fontSize: '0.95rem'
                  },
                  '& .Mui-selected': {
                    color: theme.palette.primary.main
                  },
                  '& .MuiTabs-indicator': {
                    height: 3,
                    borderTopLeftRadius: 3,
                    borderTopRightRadius: 3
                  }
                }}
              >
                <Tab label="Overview" />
                <Tab label="Experience & Education" />
                <Tab label="Services" />
                <Tab label="Reviews" />
              </Tabs>
            </Box>
            
            <Box sx={{ p: { xs: 2, md: 4 } }}>
              {activeTab === 0 && (
                <DoctorOverview 
                  doctor={doctor} 
                  openAppointmentModal={() => setOpenAppointmentModal(true)}
                />
              )}
              {activeTab === 1 && (
                <DoctorExperienceEducation doctor={doctor} />
              )}
              {activeTab === 2 && (
                <DoctorServices doctor={doctor} />
              )}
              {activeTab === 3 && (
                <DoctorReviews doctor={doctor} />
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>
      
      {/* FIXED: Now correctly passing the full doctor object to the BookAppointmentModal */}
      <BookAppointmentModal 
        open={openAppointmentModal} 
        handleClose={() => setOpenAppointmentModal(false)}
        doctorData={doctor}
      />
    </Container>
  );
};

export default DoctorProfile;