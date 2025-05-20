import React from 'react';
import {
  Paper,
  Box,
  Avatar,
  Typography,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Badge,
  useTheme,
  alpha,
  Rating,
  Stack
} from '@mui/material';
import {
  MedicalServices as MedicalIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  EventAvailable as AvailabilityIcon,
  WorkHistory as ExperienceIcon,
  CalendarMonth as CalendarIcon,
  Verified as VerifiedIcon,
  Chat as ChatIcon
} from '@mui/icons-material';

// Import utils
import { getInitials } from '../utils/doctorUtils';

const DoctorInfoCard = ({ doctor, openAppointmentModal, openChatModal, isMobile }) => {
  const theme = useTheme();

  // Get doctor name or fallback
  const getDoctorName = () => {
    if (!doctor) return 'Doctor';
    return doctor.name || 'Doctor';
  };
  
  // Get doctor specialization
  const getDoctorSpecialization = () => {
    if (!doctor) return 'Specialist';
    return doctor.specialization || (doctor.qualification && doctor.qualification[0]) || 'Specialist';
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        borderRadius: 4, 
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        height: '100%',
        position: 'relative',
        pb: 16, // Increased padding to accommodate two buttons
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 15px 50px rgba(0,0,0,0.15)'
        }
      }}
    >
      {/* Doctor Image Background with Gradient */}
      <Box 
        sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          height: 120, 
          position: 'relative' 
        }} 
      />

      <Box 
        sx={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: -8,
          p: 3,
          textAlign: 'center'
        }}
      >
        {doctor.profile ? (
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Box
                sx={{
                  bgcolor: 'success.main',
                  color: 'white',
                  borderRadius: '50%',
                  width: 30,
                  height: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid white`,
                }}
              >
                <VerifiedIcon sx={{ fontSize: 20 }} />
              </Box>
            }
          >
            <Avatar
              src={doctor.profile}
              alt={getDoctorName()}
              sx={{
                width: 150,
                height: 150,
                border: '5px solid white',
                boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
              }}
            />
          </Badge>
        ) : (
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Box
                sx={{
                  bgcolor: 'success.main',
                  color: 'white',
                  borderRadius: '50%',
                  width: 30,
                  height: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid white`,
                }}
              >
                <VerifiedIcon sx={{ fontSize: 20 }} />
              </Box>
            }
          >
            <Avatar
              sx={{
                width: 150,
                height: 150,
                fontSize: '3.5rem',
                fontWeight: 'bold',
                background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                border: '5px solid white',
                boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
              }}
            >
              {getInitials(getDoctorName())}
            </Avatar>
          </Badge>
        )}

        {/* Doctor Name - Only show on desktop, for mobile it's in the header */}
        {!isMobile && (
          <>
            <Typography variant="h5" sx={{ mt: 3, fontWeight: 'bold' }}>
              {getDoctorName()}
            </Typography>
            
            <Typography color="text.secondary" sx={{ mb: 1 }}>
              {getDoctorSpecialization()}
            </Typography>
          </>
        )}
        
        {/* Rating */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2, mt: isMobile ? 2 : 0 }}>
          <Rating 
            value={4.8} 
            readOnly
            precision={0.5}
            size="small"
            sx={{
              '& .MuiRating-iconFilled': {
                color: theme.palette.warning.main,
              }
            }}
          />
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            ({doctor.reviews?.length || '136'})
          </Typography>
        </Box>
        
        {/* Key Info Chips */}
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 1.5, 
            mb: 3,
            px: 3,
            width: '100%',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}
        >
          <Chip 
            icon={<ExperienceIcon fontSize="small" />} 
            label={`${doctor.experience || '5'} yrs exp`}
            sx={{ 
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              fontWeight: 500,
              '& .MuiChip-icon': {
                color: theme.palette.primary.main
              }
            }}
          />
          
          {doctor.fee && (
            <Chip 
              icon={<MoneyIcon fontSize="small" />} 
              label={`Rs. ${doctor.fee}`}
              sx={{ 
                bgcolor: alpha(theme.palette.success.main, 0.1),
                color: theme.palette.success.main,
                fontWeight: 500,
                '& .MuiChip-icon': {
                  color: theme.palette.success.main
                }
              }}
            />
          )}
        </Box>
        
        <Divider sx={{ width: '100%', mb: 3 }} />
        
        {/* Doctor Info List */}
        <List sx={{ width: '100%', px: 1 }}>
          {/* Show specialization as first item */}
          <ListItem sx={{ px: 1, py: 0.75 }}>
            <ListItemIcon sx={{ minWidth: 42 }}>
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  bgcolor: alpha(theme.palette.primary.main, 0.1) 
                }}
              >
                <MedicalIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
              </Avatar>
            </ListItemIcon>
            <ListItemText 
              primary="Specialization"
              secondary={getDoctorSpecialization()}
              primaryTypographyProps={{ 
                variant: 'body2', 
                color: 'text.secondary',
                fontSize: '0.75rem'
              }}
              secondaryTypographyProps={{ 
                fontWeight: 500,
                fontSize: '0.9rem'
              }}
            />
          </ListItem>
          
          {/* Show location if available */}
          <ListItem sx={{ px: 1, py: 0.75 }}>
            <ListItemIcon sx={{ minWidth: 42 }}>
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  bgcolor: alpha(theme.palette.primary.main, 0.1) 
                }}
              >
                <LocationIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
              </Avatar>
            </ListItemIcon>
            <ListItemText 
              primary="Location"
              secondary="Islamabad Medical Complex"
              primaryTypographyProps={{ 
                variant: 'body2', 
                color: 'text.secondary',
                fontSize: '0.75rem'
              }}
              secondaryTypographyProps={{ 
                fontWeight: 500,
                fontSize: '0.9rem'
              }}
            />
          </ListItem>
          
          {/* Show fee */}
          <ListItem sx={{ px: 1, py: 0.75 }}>
            <ListItemIcon sx={{ minWidth: 42 }}>
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  bgcolor: alpha(theme.palette.success.main, 0.1) 
                }}
              >
                <MoneyIcon fontSize="small" sx={{ color: theme.palette.success.main }} />
              </Avatar>
            </ListItemIcon>
            <ListItemText 
              primary="Consultation Fee"
              secondary={`Rs. ${doctor.fee || '2,000'}`}
              primaryTypographyProps={{ 
                variant: 'body2', 
                color: 'text.secondary',
                fontSize: '0.75rem'
              }}
              secondaryTypographyProps={{ 
                fontWeight: 600,
                fontSize: '0.9rem',
                color: theme.palette.success.main
              }}
            />
          </ListItem>
          
          {/* Availability */}
          <ListItem sx={{ px: 1, py: 0.75 }}>
            <ListItemIcon sx={{ minWidth: 42 }}>
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  bgcolor: alpha(theme.palette.success.main, 0.1) 
                }}
              >
                <AvailabilityIcon fontSize="small" sx={{ color: theme.palette.success.main }} />
              </Avatar>
            </ListItemIcon>
            <ListItemText 
              primary="Availability"
              secondary="Available Today"
              primaryTypographyProps={{ 
                variant: 'body2', 
                color: 'text.secondary',
                fontSize: '0.75rem'
              }}
              secondaryTypographyProps={{ 
                fontWeight: 600,
                fontSize: '0.9rem',
                color: theme.palette.success.main
              }}
            />
          </ListItem>
        </List>
        
        <Stack
          direction="column"
          spacing={2}
          sx={{ 
            position: 'absolute',
            bottom: 16,
            left: 16,
            right: 16,
            maxWidth: 'calc(100% - 32px)',
          }}
        >
          
          </Stack>
      </Box>
    </Paper>
  );
};

export default DoctorInfoCard;