import React from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Divider,
  Paper,
  useTheme,
  alpha
} from '@mui/material';
import { 
  MedicalServices as MedicalIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';

// Import utils
import { generateServicesFromSpecialty, generateServiceDescription } from '../utils/doctorUtils';

const DoctorServices = ({ doctor }) => {
  const theme = useTheme();

  // Get doctor specialization
  const getDoctorSpecialization = () => {
    if (!doctor) return 'Specialist';
    return doctor.specialization || (doctor.qualification && doctor.qualification[0]) || 'Specialist';
  };

  // Get services from doctor data or generate based on specialty
  const services = doctor.services && doctor.services.length > 0 
    ? doctor.services 
    : generateServicesFromSpecialty(getDoctorSpecialization());

  return (
    <Box>
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
        <MedicalIcon color="primary" />
        Services Offered
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4, mt: 1 }}>
        {services.map((service, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Card 
              elevation={0}
              sx={{ 
                borderRadius: 3,
                height: '100%',
                transition: 'all 0.3s ease',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                '&:hover': {
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                  borderColor: theme.palette.primary.main,
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2
                    }}
                  >
                    <MedicalIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
                  </Box>
                  <Typography 
                    variant="subtitle1" 
                    fontWeight="medium"
                    sx={{ color: theme.palette.primary.main }}
                  >
                    {service}
                  </Typography>
                </Box>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    pl: 6,
                    lineHeight: 1.6,
                    mb: 2
                  }}
                >
                  {generateServiceDescription(service)}
                </Typography>
                {index % 2 === 0 && (
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mt: 'auto', 
                      pl: 6,
                      pt: 1,
                      borderTop: `1px dashed ${alpha(theme.palette.divider, 0.5)}`
                    }}
                  >
                    <MoneyIcon 
                      fontSize="small" 
                      sx={{ 
                        color: theme.palette.success.main,
                        mr: 0.8
                      }} 
                    />
                    <Typography 
                      variant="body2"
                      fontWeight="medium"
                      sx={{ color: theme.palette.success.main }}
                    >
                      From Rs. {Math.round((doctor.fee || 2000) * (index === 0 ? 1 : 0.8))}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Divider sx={{ my: 3 }} />
      
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
          mb: 3,
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
        <MoneyIcon color="primary" />
        Treatment Details
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
              borderColor: theme.palette.primary.main,
            }
          }}
        >
          <Typography 
            variant="h6" 
            fontWeight="medium" 
            gutterBottom
            sx={{ color: theme.palette.primary.main }}
          >
            Initial Consultation
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
            Initial consultations typically take 15-30 minutes. The doctor will review your medical history, discuss your symptoms, and may recommend diagnostic tests as needed. This comprehensive assessment helps establish an accurate diagnosis and appropriate treatment plan.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.success.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MoneyIcon fontSize="small" sx={{ color: theme.palette.success.main }} />
            </Box>
            <Typography variant="body1" fontWeight="medium" sx={{ color: theme.palette.success.main }}>
              Fee: Rs. {doctor.fee || '2,000'}
            </Typography>
          </Box>
        </Paper>
        
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
              borderColor: theme.palette.primary.main,
            }
          }}
        >
          <Typography 
            variant="h6" 
            fontWeight="medium" 
            gutterBottom
            sx={{ color: theme.palette.primary.main }}
          >
            Follow-up Visits
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
            Follow-up appointments are typically shorter and focus on monitoring your progress, adjusting treatments, and addressing any new concerns. These visits are essential for managing chronic conditions and ensuring treatments are effective with minimal side effects.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.success.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MoneyIcon fontSize="small" sx={{ color: theme.palette.success.main }} />
            </Box>
            <Typography variant="body1" fontWeight="medium" sx={{ color: theme.palette.success.main }}>
              Fee: Rs. {Math.round((doctor.fee || 2000) * 0.7)} (Follow-up rate)
            </Typography>
          </Box>
        </Paper>
        
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
              borderColor: theme.palette.primary.main,
            }
          }}
        >
          <Typography 
            variant="h6" 
            fontWeight="medium" 
            gutterBottom
            sx={{ color: theme.palette.primary.main }}
          >
            Special Procedures
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
            For specialized diagnostic or therapeutic procedures, additional fees may apply. The exact cost will depend on the complexity of the procedure, equipment required, and time involved. Insurance coverage for these procedures varies.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.info.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MoneyIcon fontSize="small" sx={{ color: theme.palette.info.main }} />
            </Box>
            <Typography variant="body1" fontWeight="medium" sx={{ color: theme.palette.info.main }}>
              Fee: Variable (Please inquire for specific procedures)
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default DoctorServices;