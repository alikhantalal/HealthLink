import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Button,
  Alert,
  useTheme,
  alpha
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorsApi } from '../services/apiService';
import BookAppointmentModal from '../components/BookAppointmentModal';
import AppointmentSuccessModal from '../components/AppointmentSuccessModal';

const BookAppointmentPage = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(true);
  const [appointmentData, setAppointmentData] = useState(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  
  useEffect(() => {
    const fetchDoctor = async () => {
      if (!id) {
        setError('Doctor ID is missing.');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await doctorsApi.getById(id);
        
        if (response && response.success && response.data) {
          setDoctor(response.data);
        } else if (response && response.data) {
          setDoctor(response.data);
        } else {
          throw new Error('Failed to fetch doctor data');
        }
      } catch (error) {
        console.error('Error fetching doctor:', error);
        setError(error.message || 'Could not load doctor information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);
  
  const handleCloseModal = () => {
    setModalOpen(false);
    navigate(`/doctor/${id}`);
  };
  
  const handleAppointmentSuccess = (data) => {
    setAppointmentData(data);
    setModalOpen(false);
    setSuccessModalOpen(true);
  };
  
  const handleSuccessModalClose = () => {
    setSuccessModalOpen(false);
    navigate('/'); // Navigate to home or dashboard
  };
  
  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Box textAlign="center">
          <CircularProgress size={60} thickness={4} sx={{ color: theme.palette.primary.main }} />
          <Typography variant="h6" sx={{ mt: 3, fontWeight: 500 }}>
            Loading doctor information...
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        {/* When modal is closed but no success */}
        {!modalOpen && !successModalOpen && (
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              borderRadius: 3, 
              textAlign: 'center',
              border: `1px solid ${theme.palette.divider}`,
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Booking Cancelled
            </Typography>
            <Typography variant="body1" paragraph>
              Your appointment booking with Dr. {doctor?.name || 'the doctor'} was cancelled.
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/specialists')}
                sx={{ borderRadius: 2, px: 3, py: 1.2, textTransform: 'none' }}
              >
                Browse Specialists
              </Button>
              <Button
                variant="contained"
                onClick={() => setModalOpen(true)}
                sx={{ 
                  borderRadius: 2, 
                  px: 3, 
                  py: 1.2, 
                  textTransform: 'none',
                  fontWeight: 'bold',
                  bgcolor: theme.palette.primary.main,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                Try Again
              </Button>
            </Box>
          </Paper>
        )}
      
        {/* Booking Modal */}
        {doctor && (
          <BookAppointmentModal
            open={modalOpen}
            handleClose={handleCloseModal}
            doctorData={doctor}
            onSuccess={handleAppointmentSuccess}
          />
        )}
        
        {/* Success Modal */}
        {appointmentData && (
          <AppointmentSuccessModal
            open={successModalOpen}
            handleClose={handleSuccessModalClose}
            appointmentData={appointmentData}
          />
        )}
      </Box>
    </Container>
  );
};

export default BookAppointmentPage;