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
  Person as DoctorIcon,
  Calculate as CalculatorIcon,
  Psychology as BrainIcon,
  LocalHospital as OxygenIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';

// Enhanced features data with icons and categories
const features = [
  {
    title: 'Real-Time Bed Availability',
    description: 'Monitor hospital beds across the network with live updates on capacity and availability.',
    icon: <HeartMonitorIcon sx={{ fontSize: 40 }} />,
    category: 'Hospital',
    color: '#1976d2'
  },
  {
    title: 'Doctor Availability Tracker',
    description: 'Check real-time status of doctors including their specialization and appointment slots.',
    icon: <DoctorIcon sx={{ fontSize: 40 }} />,
    category: 'Doctors',
    color: '#00bfa5'
  },
  {
    title: 'Symptom-Based Bill Estimator',
    description: 'Get accurate medical bill estimates based on your symptoms and required treatments.',
    icon: <CalculatorIcon sx={{ fontSize: 40 }} />,
    category: 'Finance',
    color: '#ff9800'
  },
  {
    title: 'AI-Enhanced Diagnosis',
    description: 'Our AI assistant helps diagnose conditions from symptoms, speeding up the care process.',
    icon: <BrainIcon sx={{ fontSize: 40 }} />,
    category: 'Technology',
    color: '#6200ea'
  },
  {
    title: 'Oxygen Cylinder Tracking',
    description: 'Track real-time availability and usage of oxygen cylinders across all partner hospitals.',
    icon: <OxygenIcon sx={{ fontSize: 40 }} />,
    category: 'Resources',
    color: '#f50057'
  },
  {
    title: 'Medical Records Integration',
    description: 'Access your complete medical history seamlessly across all healthcare providers.',
    icon: <HeartMonitorIcon sx={{ fontSize: 40 }} />,
    category: 'Patient Care',
    color: '#4caf50'
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
            POWERFUL FEATURES
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
            Healthcare Management{' '}
            <Box component="span" sx={{ color: theme.palette.primary.main }}>
              Reimagined
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
            Discover how our platform empowers patients, doctors, and healthcare facilities with
            innovative technology solutions designed to enhance care delivery.
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
                  
                  {/* Learn More Link */}
                  <Box sx={{ mt: 'auto' }}>
                    <Button
                      endIcon={<ArrowIcon fontSize="small" />}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        p: 0,
                        '&:hover': {
                          background: 'transparent',
                          color: feature.color,
                        },
                      }}
                    >
                      Learn more
                    </Button>
                  </Box>
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
              Ready to Transform Your Healthcare Experience?
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
              Join thousands of patients and healthcare providers who are already benefiting from our platform.
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
                Get Started
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
                Learn More
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