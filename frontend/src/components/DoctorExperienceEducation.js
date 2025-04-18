import React from 'react';
import {
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Link,
  useTheme
} from '@mui/material';
import {
  School as EducationIcon,
  LocalHospital as HospitalIcon,
  Web as WebIcon
} from '@mui/icons-material';

// Import utils
import { calculateCareerStart } from '../utils/doctorUtils';

const DoctorExperienceEducation = ({ doctor }) => {
  const theme = useTheme();

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Professional Experience
      </Typography>
      
      <List sx={{ width: '100%', py: 0 }}>
        <ListItem sx={{ pb: 2, alignItems: 'flex-start', px: 0 }}>
          <ListItemIcon sx={{ mt: 0.5, minWidth: 44 }}>
            <Avatar sx={{ 
              bgcolor: theme.palette.primary.light, 
              width: 36, 
              height: 36,
              boxShadow: `0 4px 8px ${theme.palette.primary.light}40` 
            }}>
              <HospitalIcon fontSize="small" />
            </Avatar>
          </ListItemIcon>
          <ListItemText 
            primary={
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                Senior Consultant
              </Typography>
            }
            secondary={
              <>
                <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                  Islamabad Medical Complex
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {calculateCareerStart(doctor) + 3} - Present
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary', fontSize: '0.875rem' }}>
                  Providing expert care in {doctor.specialization || 'specialized medical field'}. 
                  Responsible for diagnosing and treating complex cases, supervising junior doctors, 
                  and implementing innovative treatment protocols.
                </Typography>
              </>
            }
          />
        </ListItem>
        
        <ListItem sx={{ pb: 2, alignItems: 'flex-start', px: 0 }}>
          <ListItemIcon sx={{ mt: 0.5, minWidth: 44 }}>
            <Avatar sx={{ 
              bgcolor: theme.palette.primary.light, 
              width: 36, 
              height: 36,
              boxShadow: `0 4px 8px ${theme.palette.primary.light}40` 
            }}>
              <HospitalIcon fontSize="small" />
            </Avatar>
          </ListItemIcon>
          <ListItemText 
            primary={
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                Medical Officer
              </Typography>
            }
            secondary={
              <>
                <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                  Capital Health Center
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {calculateCareerStart(doctor)} - {calculateCareerStart(doctor) + 3}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary', fontSize: '0.875rem' }}>
                  Managed patient care in outpatient and emergency departments. 
                  Conducted regular health screenings, performed diagnostic procedures, 
                  and developed treatment plans for patients of all ages.
                </Typography>
              </>
            }
          />
        </ListItem>
      </List>
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Education & Training
      </Typography>
      
      <List sx={{ width: '100%', py: 0 }}>
        {doctor.qualification.slice(0, 2).map((qual, index) => (
          <ListItem sx={{ pb: 2, alignItems: 'flex-start', px: 0 }} key={index}>
            <ListItemIcon sx={{ mt: 0.5, minWidth: 44 }}>
              <Avatar sx={{ 
                bgcolor: theme.palette.secondary.light, 
                width: 36, 
                height: 36,
                boxShadow: `0 4px 8px ${theme.palette.secondary.light}40`
              }}>
                <EducationIcon fontSize="small" />
              </Avatar>
            </ListItemIcon>
            <ListItemText 
              primary={
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.secondary.main }}>
                  {qual}
                </Typography>
              }
              secondary={
                <>
                  <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                    {index === 0 ? 'King Edward Medical University' : 'Royal College of Physicians'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {calculateCareerStart(doctor) - 6 + index*5} - {calculateCareerStart(doctor) - 1 + index*4}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary', fontSize: '0.875rem' }}>
                    {index === 0 
                      ? `Graduated with honors in the field of ${doctor.specialization || 'Medicine'}. Participated in research projects and clinical rotations.` 
                      : `Specialized training in advanced ${doctor.specialization || 'medical'} procedures and patient care techniques.`}
                  </Typography>
                </>
              }
            />
          </ListItem>
        ))}
      </List>
      
      {/* Certifications Section */}
      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Certifications & Memberships
      </Typography>
      <List sx={{ width: '100%', py: 0 }}>
        <ListItem sx={{ pb: 2, alignItems: 'flex-start', px: 0 }}>
          <ListItemIcon sx={{ mt: 0.5, minWidth: 44 }}>
            <Avatar sx={{ 
              bgcolor: theme.palette.info.light, 
              width: 36, 
              height: 36,
              boxShadow: `0 4px 8px ${theme.palette.info.light}40`
            }}>
              <EducationIcon fontSize="small" />
            </Avatar>
          </ListItemIcon>
          <ListItemText 
            primary={
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.info.main }}>
                Board Certified Specialist
              </Typography>
            }
            secondary={
              <>
                <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                  Pakistan Medical & Dental Council
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {calculateCareerStart(doctor) + 1} - Present
                </Typography>
              </>
            }
          />
        </ListItem>
        <ListItem sx={{ pb: 2, alignItems: 'flex-start', px: 0 }}>
          <ListItemIcon sx={{ mt: 0.5, minWidth: 44 }}>
            <Avatar sx={{ 
              bgcolor: theme.palette.info.light, 
              width: 36, 
              height: 36,
              boxShadow: `0 4px 8px ${theme.palette.info.light}40`
            }}>
              <EducationIcon fontSize="small" />
            </Avatar>
          </ListItemIcon>
          <ListItemText 
            primary={
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.info.main }}>
                Member
              </Typography>
            }
            secondary={
              <>
                <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                  Pakistan Medical Association
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {calculateCareerStart(doctor)} - Present
                </Typography>
              </>
            }
          />
        </ListItem>
      </List>
      
      {/* Links/Websites if available */}
      {doctor.links && doctor.links.length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Professional Links
          </Typography>
          <List>
            {doctor.links.map((link, index) => (
              <ListItem key={index} sx={{ px: 0 }}>
                <ListItemIcon>
                  <WebIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Link href={link} target="_blank" rel="noopener noreferrer" sx={{ fontWeight: 500 }}>
                      {link.replace(/https?:\/\//i, '')}
                    </Link>
                  }
                />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Box>
  );
};

export default DoctorExperienceEducation;