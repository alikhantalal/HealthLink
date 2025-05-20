import React from 'react';
import { 
  Grid, 
  Box, 
  Typography, 
  Container, 
  Card, 
  CardContent, 
  useTheme, 
  Avatar,
  Button,
  useMediaQuery,
} from '@mui/material';
import {
  MonitorHeart as HeartMonitorIcon,
  PersonSearch as DoctorSearchIcon,
  CalendarMonth as CalendarIcon,
  MedicalInformation as MedicalRecordsIcon,
  LocalHospital as HospitalIcon,
  ArrowForward as ArrowIcon,
  Psychology as AIIcon,
  CreditCard as PaymentIcon
} from '@mui/icons-material';

// Enhanced features data focused on connecting patients with specialists
const features = [
  {
    title: 'Find the Right Specialist',
    description: 'Quickly match your symptoms to the most appropriate medical specialists in your area.',
    icon: <DoctorSearchIcon sx={{ fontSize: 40 }} />,
    category: 'Discovery',
    color: '#1976d2'
  },
  {
    title: 'Symptom-Based Matching',
    description: 'Our AI assistant analyzes your symptoms to recommend the most relevant specialists for your condition.',
    icon: <AIIcon sx={{ fontSize: 40 }} />,
    category: 'AI',
    color: '#6200ea'
  },
  {
    title: 'Instant Appointment Booking',
    description: 'Book appointments with specialists directly through our platform with real-time availability.',
    icon: <CalendarIcon sx={{ fontSize: 40 }} />,
    category: 'Booking',
    color: '#00bfa5'
  },
  {
    title: 'Verified Specialist Profiles',
    description: 'Browse detailed profiles with qualifications, experience, patient reviews, and services offered.',
    icon: <MedicalRecordsIcon sx={{ fontSize: 40 }} />,
    category: 'Trust',
    color: '#4caf50'
  },
  {
    title: 'Direct Doctor Communication',
    description: 'Chat directly with specialists before and after appointments for seamless care coordination.',
    icon: <HeartMonitorIcon sx={{ fontSize: 40 }} />,
    category: 'Communication',
    color: '#f50057'
  },
  {
    title: 'Transparent Pricing',
    description: 'View consultation fees upfront with no hidden charges to help you make informed decisions.',
    icon: <PaymentIcon sx={{ fontSize: 40 }} />,
    category: 'Transparency',
    color: '#ff9800'
  },
];

export default function Features() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      id="features-section"
      sx={{
        py: { xs: 8, md: 12 },
        position: 'relative',
        backgroundColor: theme.palette.background.subtle,
        overflow: 'hidden',
      }}
    >
      {/* Background decorations */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '-10%',
          width: '40%',
          height: '40%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.palette.primary.light}22 0%, transparent 70%)`,
          zIndex: 0,
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          bottom: '5%',
          right: '-5%',
          width: '30%',
          height: '30%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.palette.secondary.light}22 0%, transparent 70%)`,
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
          <Typography 
            variant="overline" 
            sx={{ 
              color: theme.palette.primary.main,
              fontWeight: 600,
              letterSpacing: 1.5,
              fontSize: '0.95rem',
              display: 'block',
              mb: 1
            }}
          >
            HOW WE HELP
          </Typography>
          
          <Typography
            variant="h2"
            align="center"
            sx={{ 
              fontWeight: 700, 
              mb: 2,
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Bridging Patients with{' '}
            <Box component="span" sx={{ color: theme.palette.primary.main }}>
              Specialists
            </Box>
          </Typography>
          
          <Typography
            variant="subtitle1"
            align="center"
            sx={{ 
              color: theme.palette.text.secondary,
              maxWidth: '700px',
              mx: 'auto'
            }}
          >
            Connecting you with the right healthcare specialists based on your specific 
            conditions and needs - making quality healthcare accessible to everyone.
          </Typography>
        </Box>

        {/* Features Grid */}
        <Grid container spacing={4} justifyContent="center">
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  borderRadius: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'visible',
                  position: 'relative',
                  background: theme.palette.background.paper,
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.05)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                    '& .feature-icon': {
                      transform: 'scale(1.1)',
                      background: `${feature.color}`,
                      color: '#fff',
                    },
                  },
                }}
              >
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  {/* Feature Icon */}
                  <Box sx={{ mb: 3, position: 'relative' }}>
                    <Avatar
                      className="feature-icon"
                      sx={{
                        width: 70,
                        height: 70,
                        bgcolor: `${feature.color}15`,
                        color: feature.color,
                        borderRadius: 3,
                        boxShadow: `0 10px 25px ${feature.color}22`,
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {feature.icon}
                    </Avatar>
                    
                    <Chip
                      label={feature.category}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -10,
                        right: isMobile ? 15 : 50,
                        backgroundColor: feature.color,
                        color: '#fff',
                        fontWeight: 500,
                        boxShadow: `0 4px 8px ${feature.color}40`,
                        height: 24,
                        px: 0.5,
                        borderRadius: 3,
                      }}
                    />
                  </Box>

                  {/* Feature Title */}
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 1.5,
                      fontSize: '1.2rem',
                    }}
                  >
                    {feature.title}
                  </Typography>
                  
                  {/* Feature Description */}
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      lineHeight: 1.7,
                      mb: 2
                    }}
                  >
                    {feature.description}
                  </Typography>
                  
                  {/* Additional spacing at the bottom */}
                  <Box sx={{ mt: 'auto', height: 8 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {/* Call-to-Action Section */}
        <Box
          sx={{
            mt: 8,
            pt: 5,
            pb: 6,
            px: { xs: 3, md: 6 },
            borderRadius: 4,
            textAlign: 'center',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              backgroundImage: 'url("https://images.pexels.com/photos/247786/pexels-photo-247786.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              mixBlendMode: 'overlay',
            }}
          />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography 
              variant="h3"
              sx={{ 
                fontWeight: 700, 
                mb: 2,
                fontSize: { xs: '1.8rem', md: '2.2rem' }
              }}
            >
              Find Your Specialist Today
            </Typography>
            
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 4, 
                opacity: 0.9,
                maxWidth: '700px',
                mx: 'auto'
              }}
            >
              Whether you're dealing with a specific condition or seeking expert medical advice,
              our platform connects you with the right specialists in just a few clicks.
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: theme.palette.primary.main,
                  px: 4,
                  py: 1.5,
                  boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                  '&:hover': {
                    bgcolor: 'white',
                    opacity: 0.9,
                  },
                }}
              >
                Find a Specialist
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                sx={{
                  color: 'white',
                  borderColor: 'white',
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                How It Works
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

// Custom Chip component for feature categories
const Chip = ({ label, sx, ...rest }) => {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        px: 1,
        py: 0.5,
        borderRadius: 1,
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        ...sx,
      }}
      {...rest}
    >
      {label}
    </Box>
  );
};