import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Stepper, 
  Step, 
  StepLabel, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText, 
  Box, 
  Grid, 
  Chip, 
  Divider, 
  Alert, 
  CircularProgress, 
  Avatar, 
  FormControlLabel, 
  Checkbox
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import axios from 'axios';

const DoctorRegistration = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    pmdc: '', // Pakistan Medical & Dental Council number
    cnic: '', // National ID
    
    // Professional Details
    specialization: '',
    qualifications: [],
    experience: '',
    hospitalAffiliations: [{ name: '', position: '', years: '' }],
    bio: '',
    
    // Practice Details
    consultationFee: '',
    location: '',
    availability: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
    
    // Document Verification
    pmdcCertificate: null,
    medicalDegree: null,
    profilePhoto: null,
    
    // Account Information
    username: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  // Field validations
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentQualification, setCurrentQualification] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  
  // List of specializations for dropdown
  const specializations = [
    'Cardiologist',
    'Dermatologist',
    'Endocrinologist',
    'Gastroenterologist',
    'General Physician',
    'Neurologist',
    'Obstetrician/Gynecologist',
    'Oncologist',
    'Ophthalmologist',
    'Orthopedic Surgeon',
    'Pediatrician',
    'Psychiatrist',
    'Pulmonologist',
    'Radiologist',
    'Urologist'
  ];

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  // Handle availability changes
  const handleAvailabilityChange = (day, isAvailable) => {
    setFormData({
      ...formData,
      availability: {
        ...formData.availability,
        [day]: isAvailable
      }
    });
  };
  
  // Handle file uploads
  const handleFileUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        [fieldName]: file
      });
      
      // Clear error when field is changed
      if (errors[fieldName]) {
        setErrors({
          ...errors,
          [fieldName]: null
        });
      }
    }
  };
  
  // Add a qualification
  const addQualification = () => {
    if (currentQualification.trim() !== '') {
      setFormData({
        ...formData,
        qualifications: [...formData.qualifications, currentQualification]
      });
      setCurrentQualification('');
    }
  };
  
  // Remove a qualification
  const removeQualification = (index) => {
    const updatedQualifications = [...formData.qualifications];
    updatedQualifications.splice(index, 1);
    setFormData({
      ...formData,
      qualifications: updatedQualifications
    });
  };

  // Add hospital affiliation
  const addHospitalAffiliation = () => {
    setFormData({
      ...formData,
      hospitalAffiliations: [
        ...formData.hospitalAffiliations,
        { name: '', position: '', years: '' }
      ]
    });
  };

  // Remove hospital affiliation
  const removeHospitalAffiliation = (index) => {
    const updatedAffiliations = [...formData.hospitalAffiliations];
    updatedAffiliations.splice(index, 1);
    setFormData({
      ...formData,
      hospitalAffiliations: updatedAffiliations
    });
  };

  // Handle hospital affiliation field changes
  const handleAffiliationChange = (index, field, value) => {
    const updatedAffiliations = [...formData.hospitalAffiliations];
    updatedAffiliations[index][field] = value;
    setFormData({
      ...formData,
      hospitalAffiliations: updatedAffiliations
    });
  };
  
  // Validate form fields based on current step
  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 0) {
      // Personal Information validation
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
      
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\d{10,11}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
        newErrors.phone = 'Phone number must be 10-11 digits';
      }
      
      if (!formData.gender) newErrors.gender = 'Gender is required';
      
      if (!formData.pmdc.trim()) {
        newErrors.pmdc = 'PMDC number is required';
      } 
      
      if (!formData.cnic.trim()) {
        newErrors.cnic = 'CNIC is required';
      } else if (!/^\d{13}$/.test(formData.cnic.replace(/[^0-9]/g, ''))) {
        newErrors.cnic = 'CNIC must be 13 digits';
      }
    } else if (step === 1) {
      // Professional Details validation
      if (!formData.specialization) newErrors.specialization = 'Specialization is required';
      if (formData.qualifications.length === 0) newErrors.qualifications = 'At least one qualification is required';
      
      if (!formData.experience.trim()) {
        newErrors.experience = 'Years of experience is required';
      } else if (isNaN(formData.experience) || parseInt(formData.experience) < 0) {
        newErrors.experience = 'Experience must be a positive number';
      }
      
      if (!formData.bio.trim()) newErrors.bio = 'Professional bio is required';
    } else if (step === 2) {
      // Practice Details validation
      if (!formData.consultationFee.trim()) {
        newErrors.consultationFee = 'Consultation fee is required';
      } else if (isNaN(formData.consultationFee) || parseInt(formData.consultationFee) <= 0) {
        newErrors.consultationFee = 'Fee must be a positive number';
      }
      
      if (!formData.location.trim()) newErrors.location = 'Location is required';
      
      // Check if at least one day is selected for availability
      const anyDayAvailable = Object.values(formData.availability).some(isAvailable => isAvailable);
      if (!anyDayAvailable) newErrors.availability = 'At least one day must be selected for availability';
    } else if (step === 3) {
      // Document Verification validation
      if (!formData.pmdcCertificate) newErrors.pmdcCertificate = 'PMDC certificate is required';
      if (!formData.medicalDegree) newErrors.medicalDegree = 'Medical degree is required';
      if (!formData.profilePhoto) newErrors.profilePhoto = 'Profile photo is required';
    } else if (step === 4) {
      // Account Information validation
      if (!formData.username.trim()) newErrors.username = 'Username is required';
      
      if (!formData.password.trim()) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      
      if (!formData.acceptTerms) {
        newErrors.acceptTerms = 'You must accept the terms and conditions';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    const isValid = validateStep(activeStep);
    if (isValid) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  // Handle back step
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Handle form submission - updated with proper logging and PMDC handling
  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateStep(activeStep);
    
    if (isValid) {
      setIsSubmitting(true);
      setSubmitError('');
      setSubmitSuccess('');
      
      try {
        // Create form data for submission
        const formDataToSubmit = new FormData();
        
        // Personal Information
        formDataToSubmit.append('name', `${formData.firstName} ${formData.lastName}`);
        formDataToSubmit.append('email', formData.email);
        formDataToSubmit.append('phone', formData.phone);
        formDataToSubmit.append('gender', formData.gender);
        
        // Make sure PMDC field is included - critical fix
        console.log('PMDC number being submitted:', formData.pmdc); // Debug log
        formDataToSubmit.append('pmdc', formData.pmdc);
        
        formDataToSubmit.append('cnic', formData.cnic);
        
        // Professional Details
        formDataToSubmit.append('specialization', formData.specialization);
        formDataToSubmit.append('qualifications', JSON.stringify(formData.qualifications));
        formDataToSubmit.append('experience', formData.experience);
        formDataToSubmit.append('bio', formData.bio);
        
        // Practice Details
        formDataToSubmit.append('fee', formData.consultationFee);
        formDataToSubmit.append('location', formData.location);
        formDataToSubmit.append('availability', JSON.stringify(formData.availability));
        
        // Account Information
        formDataToSubmit.append('username', formData.username);
        formDataToSubmit.append('password', formData.password);
        
        // Files
        formDataToSubmit.append('license', formData.pmdcCertificate);
        formDataToSubmit.append('degree', formData.medicalDegree);
        formDataToSubmit.append('profile_photo', formData.profilePhoto);
        
        // Log FormData contents for debugging
        console.log('Form data being submitted:');
        for (let pair of formDataToSubmit.entries()) {
          console.log(pair[0] + ': ' + (pair[0] === 'password' ? '******' : pair[1]));
        }
        
        // Send registration request
        const response = await axios.post('/api/doctor-registration/register', formDataToSubmit, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        console.log('Registration successful:', response.data);
        
        // Show success message and move to success step
        setSubmitSuccess('Registration successful! Your application is pending verification.');
        setActiveStep(5);
      } catch (error) {
        console.error('Error submitting form:', error);
        
        if (error.response && error.response.data) {
          setSubmitError(error.response.data.error || 'Failed to submit the form. Please try again.');
        } else {
          setSubmitError('Failed to submit the form. Please try again.');
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Steps configuration
  const steps = [
    { label: 'Personal Information', description: 'Basic information' },
    { label: 'Professional Details', description: 'Your qualifications' },
    { label: 'Practice Details', description: 'Practice information' },
    { label: 'Document Verification', description: 'Upload documents' },
    { label: 'Account Setup', description: 'Create your account' }
  ];

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>Personal Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!errors.gender}>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    label="Gender"
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                  {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="PMDC Number"
                  name="pmdc"
                  value={formData.pmdc}
                  onChange={handleChange}
                  error={!!errors.pmdc}
                  helperText={errors.pmdc || "Your Pakistan Medical & Dental Council registration number"}
                  required
                  inputProps={{ 
                    maxLength: 50,
                    "data-testid": "pmdc-input" // For easier testing/debugging
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="CNIC"
                  name="cnic"
                  value={formData.cnic}
                  onChange={handleChange}
                  error={!!errors.cnic}
                  helperText={errors.cnic || "13-digit National Identity Card number (without dashes)"}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>Professional Details</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth required error={!!errors.specialization}>
                  <InputLabel>Specialization</InputLabel>
                  <Select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    label="Specialization"
                  >
                    <MenuItem value="">Select Specialization</MenuItem>
                    {specializations.map((specialization) => (
                      <MenuItem key={specialization} value={specialization}>
                        {specialization}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.specialization && <FormHelperText>{errors.specialization}</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Qualifications*
                  </Typography>
                  
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <TextField
                      fullWidth
                      label="Add Qualification (e.g., MBBS, FCPS)"
                      value={currentQualification}
                      onChange={(e) => setCurrentQualification(e.target.value)}
                      size="small"
                    />
                    <Button 
                      variant="contained" 
                      onClick={addQualification}
                      disabled={!currentQualification.trim()}
                      sx={{ ml: 1, minWidth: 100 }}
                    >
                      Add
                    </Button>
                  </Box>
                  
                  {errors.qualifications && (
                    <FormHelperText error>{errors.qualifications}</FormHelperText>
                  )}
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                    {formData.qualifications.map((qualification, index) => (
                      <Chip
                        key={index}
                        label={qualification}
                        onDelete={() => removeQualification(index)}
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </Box>
                  
                  {formData.qualifications.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      No qualifications added yet
                    </Typography>
                  )}
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Years of Experience"
                  name="experience"
                  type="number"
                  value={formData.experience}
                  onChange={handleChange}
                  error={!!errors.experience}
                  helperText={errors.experience}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Professional Bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  error={!!errors.bio}
                  helperText={errors.bio}
                  required
                  multiline
                  rows={4}
                  placeholder="Describe your professional background, expertise, and approach to patient care..."
                />
              </Grid>
            </Grid>
          </Box>
        );
        case 2:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>Practice Details</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Consultation Fee (PKR)"
                  name="consultationFee"
                  type="number"
                  value={formData.consultationFee}
                  onChange={handleChange}
                  error={!!errors.consultationFee}
                  helperText={errors.consultationFee}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Practice Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  error={!!errors.location}
                  helperText={errors.location}
                  required
                  placeholder="City, Hospital or Clinic"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Availability*
                  </Typography>
                  
                  {errors.availability && (
                    <FormHelperText error sx={{ mb: 2 }}>{errors.availability}</FormHelperText>
                  )}
                  
                  <Grid container spacing={2}>
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                      <Grid item xs={6} sm={4} md={3} key={day}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.availability[day]}
                              onChange={(e) => handleAvailabilityChange(day, e.target.checked)}
                            />
                          }
                          label={day.charAt(0).toUpperCase() + day.slice(1)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Note: You'll be able to set specific time slots after your account is approved.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>Document Verification</Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Please upload clear, legible scans or photos of your documents. All documents will be verified before your profile is approved.
            </Alert>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    PMDC Certificate*
                  </Typography>
                  
                  <input
                    accept="image/*,.pdf"
                    id="pmdc-certificate-upload"
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(e, 'pmdcCertificate')}
                  />
                  <label htmlFor="pmdc-certificate-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<UploadIcon />}
                      fullWidth
                    >
                      Upload PMDC Certificate
                    </Button>
                  </label>
                  
                  {formData.pmdcCertificate && (
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                      <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {formData.pmdcCertificate.name}
                      </Typography>
                    </Box>
                  )}
                  
                  {errors.pmdcCertificate && (
                    <FormHelperText error>{errors.pmdcCertificate}</FormHelperText>
                  )}
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Medical Degree*
                  </Typography>
                  
                  <input
                    accept="image/*,.pdf"
                    id="medical-degree-upload"
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(e, 'medicalDegree')}
                  />
                  <label htmlFor="medical-degree-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<UploadIcon />}
                      fullWidth
                    >
                      Upload Medical Degree
                    </Button>
                  </label>
                  
                  {formData.medicalDegree && (
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                      <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {formData.medicalDegree.name}
                      </Typography>
                    </Box>
                  )}
                  
                  {errors.medicalDegree && (
                    <FormHelperText error>{errors.medicalDegree}</FormHelperText>
                  )}
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Profile Photo*
                  </Typography>
                  
                  <input
                    accept="image/*"
                    id="profile-photo-upload"
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(e, 'profilePhoto')}
                  />
                  <label htmlFor="profile-photo-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<UploadIcon />}
                      fullWidth
                    >
                      Upload Profile Photo
                    </Button>
                  </label>
                  
                  {formData.profilePhoto && (
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                      {formData.profilePhoto && (
                        <Avatar
                          src={URL.createObjectURL(formData.profilePhoto)}
                          alt="Profile Preview"
                          sx={{ width: 64, height: 64, mr: 2 }}
                        />
                      )}
                      <Typography variant="body2">
                        {formData.profilePhoto.name}
                      </Typography>
                    </Box>
                  )}
                  
                  {errors.profilePhoto && (
                    <FormHelperText error>{errors.profilePhoto}</FormHelperText>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
        case 4:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>Account Setup</Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Create your account credentials. You'll use these to log in after your verification is complete.
            </Alert>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  error={!!errors.username}
                  helperText={errors.username}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.acceptTerms}
                      onChange={(e) => 
                        setFormData({
                          ...formData,
                          acceptTerms: e.target.checked
                        })
                      }
                      color="primary"
                    />
                  }
                  label="I accept the terms and conditions"
                />
                {errors.acceptTerms && (
                  <FormHelperText error>{errors.acceptTerms}</FormHelperText>
                )}
              </Grid>
            </Grid>
          </Box>
        );
      case 5:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Avatar
              sx={{
                backgroundColor: 'success.main',
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 3,
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 50 }} />
            </Avatar>
            
            <Typography variant="h5" gutterBottom>
              Registration Submitted Successfully!
            </Typography>
            
            <Typography variant="body1" color="text.secondary" paragraph>
              Thank you for registering with HealthLink. Your application has been received and is now pending verification.
            </Typography>
            
            <Typography variant="body1" paragraph>
              We'll review your credentials and documents within 24-48 hours. You'll receive an email notification once your account is approved.
            </Typography>
            
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              sx={{ mt: 2 }}
              onClick={() => window.location.href = '/'}
            >
              Return to Homepage
            </Button>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Join HealthLink as a Doctor
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Complete this verification form to join our network of healthcare professionals
          </Typography>
        </Box>
        
        {submitError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {submitError}
          </Alert>
        )}
        
        {submitSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {submitSuccess}
          </Alert>
        )}
        
        {activeStep <= 4 && (
          <>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
              {steps.map((step) => (
                <Step key={step.label}>
                  <StepLabel>{step.label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            <Box sx={{ mb: 4 }}>
              {renderStepContent()}
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                Back
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  startIcon={isSubmitting && <CircularProgress size={20} color="inherit" />}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                >
                  Continue
                </Button>
              )}
            </Box>
          </>
        )}
        
        {activeStep > 4 && renderStepContent()}
      </Paper>
    </Container>
  );
};

export default DoctorRegistration;