import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Chip,
  CircularProgress,
  Avatar,
  IconButton,
  Alert,
  Divider,
  Card,
  CardContent,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  useTheme,
  alpha
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  AccessTime as TimeIcon,
  CalendarMonth as CalendarIcon,
  MedicalServices as MedicalIcon,
  Verified as VerifiedIcon,
  CloudUpload as UploadIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { doctorsApi, authApi } from '../services/apiService';

// Import Tab Components
import AppointmentsTab from '../components/tabs/AppointmentsTab';
import AvailabilityTab from '../components/tabs/AvailabilityTab';
import SettingsTab from '../components/tabs/SettingsTab';

const DoctorDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctorData, setDoctorData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    qualification: [],
    experience: '',
    fee: '',
    phone: '',
    email: '',
    clinicAddress: '',
    bio: '',
    availability: {
      monday: { isAvailable: true, slots: ['09:00 AM - 12:00 PM', '05:00 PM - 08:00 PM'] },
      tuesday: { isAvailable: true, slots: ['09:00 AM - 12:00 PM', '05:00 PM - 08:00 PM'] },
      wednesday: { isAvailable: true, slots: ['09:00 AM - 12:00 PM', '05:00 PM - 08:00 PM'] },
      thursday: { isAvailable: true, slots: ['09:00 AM - 12:00 PM', '05:00 PM - 08:00 PM'] },
      friday: { isAvailable: true, slots: ['09:00 AM - 12:00 PM', '05:00 PM - 08:00 PM'] },
      saturday: { isAvailable: true, slots: ['09:00 AM - 12:00 PM'] },
      sunday: { isAvailable: false, slots: [] }
    }
  });
  
  const [profileImage, setProfileImage] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [saveLoading, setSaveLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [qualificationInput, setQualificationInput] = useState('');
  
  // Specialization options
  const specializationOptions = [
    "Cardiologist",
    "Dentist",
    "Dermatologist",
    "Endocrinologist",
    "ENT Specialist",
    "Gastroenterologist",
    "General Physician",
    "General Surgeon",
    "Gynecologist",
    "Neurologist",
    "Nutritionist",
    "Ophthalmologist",
    "Orthopedic Surgeon",
    "Pediatrician",
    "Psychiatrist",
    "Pulmonologist",
    "Urologist"
  ];
  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token || userRole !== 'doctor') {
      navigate('/login', { state: { tab: 1 } }); // Redirect to login page with doctor tab active
      return;
    }
    
    fetchDoctorData();
  }, [navigate]);
  
  // Fetch doctor data from API
  const fetchDoctorData = async () => {
    try {
      setLoading(true);
      
      // First get user data from auth API
      const userData = await authApi.getUserData();
      
      if (!userData || !userData.user) {
        throw new Error('Failed to fetch user data');
      }
      
      // Set basic user information immediately (this ensures we have something to display)
      setFormData(prevData => ({
        ...prevData,
        name: userData.user.name || '',
        email: userData.user.email || ''
      }));
      
      // Check user verification status
      if (userData.user.verification_status === 'approved' || 
          userData.user.verification_status === 'verified') {
        setVerificationStatus('verified');
      } else {
        setVerificationStatus(userData.user.verification_status || 'pending');
      }
      
      // Get email from user data
      const email = userData.user.email;
      
      // Try to get doctor from verified doctors
      let doctorFound = false;
      
      try {
        const allDoctorsResponse = await doctorsApi.getAll();
        
        if (allDoctorsResponse && allDoctorsResponse.data) {
          // Find doctor with matching email
          const doctor = allDoctorsResponse.data.find(doc => doc.email === email);
          
          if (doctor) {
            console.log("Found doctor in verified collection:", doctor);
            setDoctorData(doctor);
            doctorFound = true;
            
            // Update form data with doctor details
            setFormData({
              name: doctor.name || '',
              specialization: doctor.specialization || '',
              qualification: Array.isArray(doctor.qualification) ? doctor.qualification : 
                            (doctor.qualification ? [doctor.qualification] : []).filter(Boolean),
              experience: doctor.experience || 0,
              fee: doctor.fee || 0,
              phone: doctor.phone || '',
              email: doctor.email || '',
              clinicAddress: doctor.clinicAddress || '',
              bio: doctor.bio || '',
              availability: doctor.availability || {
                monday: { isAvailable: true, slots: ['09:00 AM - 12:00 PM', '05:00 PM - 08:00 PM'] },
                tuesday: { isAvailable: true, slots: ['09:00 AM - 12:00 PM', '05:00 PM - 08:00 PM'] },
                wednesday: { isAvailable: true, slots: ['09:00 AM - 12:00 PM', '05:00 PM - 08:00 PM'] },
                thursday: { isAvailable: true, slots: ['09:00 AM - 12:00 PM', '05:00 PM - 08:00 PM'] },
                friday: { isAvailable: true, slots: ['09:00 AM - 12:00 PM', '05:00 PM - 08:00 PM'] },
                saturday: { isAvailable: true, slots: ['09:00 AM - 12:00 PM'] },
                sunday: { isAvailable: false, slots: [] }
              }
            });
          }
        }
      } catch (verifiedError) {
        console.error("Error checking verified doctors:", verifiedError);
      }
      
      // If not found in verified collection, check unverified collection
      if (!doctorFound) {
        try {
          console.log("Checking unverified collection for email:", email);
          
          // Get unverified doctor data
          const response = await doctorsApi.getVerificationStatus();
          if (response && response.success) {
            const doctor = response.data;
            
            if (doctor) {
              console.log("Found doctor in unverified collection:", doctor);
              setDoctorData(doctor);
              
              // Update form data with unverified doctor details
              setFormData({
                name: doctor.name || '',
                specialization: doctor.specialization || '',
                qualification: Array.isArray(doctor.qualification) ? doctor.qualification : 
                              (doctor.qualification ? [doctor.qualification] : []).filter(Boolean),
                experience: doctor.experience || 0,
                fee: doctor.fee || 0,
                phone: doctor.phone || '',
                email: doctor.email || '',
                clinicAddress: doctor.clinicAddress || '',
                bio: doctor.bio || '',
                availability: doctor.availability || {
                  monday: { isAvailable: true, slots: ['09:00 AM - 12:00 PM', '05:00 PM - 08:00 PM'] },
                  tuesday: { isAvailable: true, slots: ['09:00 AM - 12:00 PM', '05:00 PM - 08:00 PM'] },
                  wednesday: { isAvailable: true, slots: ['09:00 AM - 12:00 PM', '05:00 PM - 08:00 PM'] },
                  thursday: { isAvailable: true, slots: ['09:00 AM - 12:00 PM', '05:00 PM - 08:00 PM'] },
                  friday: { isAvailable: true, slots: ['09:00 AM - 12:00 PM', '05:00 PM - 08:00 PM'] },
                  saturday: { isAvailable: true, slots: ['09:00 AM - 12:00 PM'] },
                  sunday: { isAvailable: false, slots: [] }
                }
              });
            }
          }
        } catch (unverifiedError) {
          console.error("Error checking unverified doctors:", unverifiedError);
        }
      }
    } catch (error) {
      console.error('Error fetching doctor data:', error);
      setError('Failed to load doctor profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
// Handle tab change
const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle profile image change
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };
  
  // Handle adding qualification
  const handleAddQualification = () => {
    if (qualificationInput.trim()) {
      setFormData({
        ...formData,
        qualification: [...formData.qualification, qualificationInput.trim()]
      });
      setQualificationInput('');
    }
  };
  
  // Handle removing qualification
  const handleRemoveQualification = (index) => {
    const newQualifications = [...formData.qualification];
    newQualifications.splice(index, 1);
    setFormData({
      ...formData,
      qualification: newQualifications
    });
  };
  
  // Handle save profile
  const handleSaveProfile = async () => {
    try {
      setSaveLoading(true);
      
      // Create form data for API request
      const updateData = {
        ...formData,
        qualification: formData.qualification
      };
      
      // If new profile image is selected
      if (profileImage) {
        // This would be handled with FormData in a real API call
        // const formData = new FormData();
        // formData.append('profile_photo', profileImage);
        // await doctorsApi.updateProfileImage(formData);
      }
      
      // Update doctor profile
      const response = await doctorsApi.updateDoctorProfile(doctorData._id, updateData);
      
      if (response.success) {
        setSuccessMessage('Profile updated successfully');
        setDoctorData({
          ...doctorData,
          ...updateData
        });
        setEditMode(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        throw new Error(response.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile. Please try again.');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setSaveLoading(false);
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Dashboard Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h4" fontWeight="bold">
              Doctor Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Chip 
                icon={<VerifiedIcon sx={{ color: 'white !important' }} />}
                label={verificationStatus === 'verified' || verificationStatus === 'approved' ? 'Verified' : 'Pending Verification'}
                sx={{ 
                  bgcolor: (verificationStatus === 'verified' || verificationStatus === 'approved')
                    ? alpha('#4caf50', 0.8) 
                    : alpha('#ff9800', 0.8),
                  color: 'white',
                  fontWeight: 'bold',
                  '& .MuiChip-icon': {
                    color: 'white'
                  }
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Button 
              variant="contained" 
              color="secondary" 
              onClick={handleLogout}
              sx={{ 
                color: 'white', 
                bgcolor: alpha('#fff', 0.2),
                '&:hover': {
                  bgcolor: alpha('#fff', 0.3)
                }
              }}
            >
              Logout
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Tabs Navigation */}
      <Paper sx={{ borderRadius: 2, mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Profile" icon={<PersonIcon />} iconPosition="start" />
          <Tab label="Appointments" icon={<CalendarIcon />} iconPosition="start" />
          <Tab label="Availability" icon={<TimeIcon />} iconPosition="start" />
          <Tab label="Settings" icon={<SettingsIcon />} iconPosition="start" />
        </Tabs>
      </Paper>
      
      {/* Alert Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}
      
      {verificationStatus !== 'verified' && verificationStatus !== 'approved' && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Your profile is pending verification. Some features may be limited until your account is verified.
        </Alert>
      )}
      
      {/* Tab Panels */}
      <Box sx={{ mt: 3 }}>
        {/* Profile Tab */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            {/* Profile Summary Card */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                  <Avatar
                    src={doctorData?.profile || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23ccc' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E"}
                    alt={formData.name}
                    sx={{ width: 120, height: 120, mb: 2 }}
                  />
                  
                  {editMode && (
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<UploadIcon />}
                      sx={{ mt: 1 }}
                    >
                      Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleImageChange}
                      />
                    </Button>
                  )}
                  
                  <Typography variant="h5" fontWeight="bold" align="center" gutterBottom>
                    Dr. {formData.name}
                  </Typography>
                  
                  <Typography variant="body1" color="textSecondary" align="center" gutterBottom>
                    {formData.specialization || "Medical Specialist"}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.5, mt: 1 }}>
                    {formData.qualification.map((qual, index) => (
                      <Chip 
                        key={index} 
                        label={qual}
                        size="small"
                        sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                      />
                    ))}
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <MedicalIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="body2" color="textSecondary">
                      Experience:
                    </Typography>
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {formData.experience || 0} years
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <PhoneIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="body2" color="textSecondary">
                      Phone:
                    </Typography>
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {formData.phone || "Not provided"}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <EmailIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="body2" color="textSecondary">
                      Email:
                    </Typography>
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {formData.email}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ mt: 3 }}>
                  <Button
                    fullWidth
                    variant={editMode ? "contained" : "outlined"}
                    color={editMode ? "primary" : "secondary"}
                    startIcon={editMode ? <SaveIcon /> : <EditIcon />}
                    onClick={editMode ? handleSaveProfile : () => setEditMode(true)}
                    disabled={saveLoading}
                  >
                    {saveLoading ? <CircularProgress size={24} /> : (editMode ? "Save Profile" : "Edit Profile")}
                  </Button>
                  
                  {editMode && (
                    <Button
                      fullWidth
                      variant="outlined"
                      color="secondary"
                      sx={{ mt: 1 }}
                      onClick={() => setEditMode(false)}
                    >
                      Cancel
                    </Button>
                  )}
                </Box>
              </Paper>
            </Grid>
            
            {/* Profile Edit Form */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold">
                    {editMode ? "Edit Profile" : "Profile Information"}
                  </Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Specialization</InputLabel>
                      <Select
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        label="Specialization"
                      >
                        {specializationOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Years of Experience"
                      name="experience"
                      type="number"
                      value={formData.experience}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Consultation Fee (Rs.)"
                      name="fee"
                      type="number"
                      value={formData.fee}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Clinic Address"
                      name="clinicAddress"
                      value={formData.clinicAddress}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Professional Bio"
                      name="bio"
                      multiline
                      rows={4}
                      value={formData.bio}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      margin="normal"
                    />
                  </Grid>
                  
                  {/* Qualifications Section */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Qualifications
                    </Typography>
                    
                    {editMode ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TextField
                          fullWidth
                          label="Add Qualification"
                          value={qualificationInput}
                          onChange={(e) => setQualificationInput(e.target.value)}
                          placeholder="E.g., MBBS, MD, FCPS"
                          size="small"
                        />
                        <Button 
                          variant="contained" 
                          onClick={handleAddQualification}
                          sx={{ ml: 1, whiteSpace: 'nowrap' }}
                        >
                          Add
                        </Button>
                      </Box>
                    ) : null}
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {formData.qualification.length > 0 ? formData.qualification.map((qual, index) => (
                        <Chip
                          key={index}
                          label={qual}
                          onDelete={editMode ? () => handleRemoveQualification(index) : undefined}
                          color="primary"
                          variant="outlined"
                        />
                      )) : (
                        <Typography variant="body2" color="text.secondary">
                          No qualifications added yet.
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}
        
        {/* Appointments Tab */}
        {activeTab === 1 && (
          <AppointmentsTab
            doctorData={doctorData}
            theme={theme}
          />
        )}
        
        {/* Availability Tab */}
        {activeTab === 2 && (
          <AvailabilityTab
            formData={formData}
            setFormData={setFormData}
            editMode={editMode}
            handleSaveProfile={handleSaveProfile}
            theme={theme}
          />
        )}
        
        {/* Settings Tab */}
        {activeTab === 3 && (
          <SettingsTab
            theme={theme}
          />
        )}
      </Box>
    </Container>
  );
};

export default DoctorDashboard;