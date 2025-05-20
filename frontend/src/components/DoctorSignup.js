import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  CircularProgress,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { 
  CloudUpload as UploadIcon, 
  Add as AddIcon,
  Close as CloseIcon,
  Visibility, 
  VisibilityOff,
  AccountCircle as AccountIcon,
  MedicalServices as MedicalIcon,
  Description as DescriptionIcon,
  Attachment as AttachmentIcon,
  Check as CheckIcon
} from "@mui/icons-material";
import theme from "../theme";
import axios from "axios";

const steps = ["Basic Information", "Professional Details", "Document Upload"];

// List of doctor specializations
const specializations = [
  "Cardiologist",
  "Dermatologist",
  "Endocrinologist",
  "Gastroenterologist",
  "General Physician",
  "General Surgeon",
  "Gynecologist",
  "Neurologist",
  "Ophthalmologist",
  "Orthopedic Surgeon",
  "Pediatrician",
  "Psychiatrist",
  "Pulmonologist",
  "Urologist",
  "Dentist",
  "ENT Specialist",
  "Nutritionist"
];

export default function DoctorSignup({ showAlert }) {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    specialization: "",
    experience: "",
    fee: "",
    pmdc: "", // Added PMDC number field
    qualifications: []
  });
  
  // Files state
  const [files, setFiles] = useState({
    license: null,
    degree: null,
    profile_photo: null
  });
  
  // File previews
  const [previews, setPreviews] = useState({
    license: null,
    degree: null,
    profile_photo: null
  });
  
  // Qualification input state
  const [qualificationInput, setQualificationInput] = useState("");
  
  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form validation
  const validateStep = () => {
    switch (activeStep) {
      case 0:
        // Basic Information validation
        if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
          setError("Please fill in all required fields");
          return false;
        }
        
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          return false;
        }
        
        if (formData.password.length < 6) {
          setError("Password must be at least 6 characters long");
          return false;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          setError("Please enter a valid email address");
          return false;
        }
        
        // Phone validation
        if (!/^\d{10,12}$/.test(formData.phone.replace(/[-()\s]/g, ''))) {
          setError("Please enter a valid phone number");
          return false;
        }
        
        break;
      
      case 1:
        // Professional Details validation
        if (!formData.specialization || !formData.experience || !formData.fee || !formData.pmdc) {
          setError("Please fill in all required fields");
          return false;
        }
        
        if (isNaN(formData.experience) || isNaN(formData.fee)) {
          setError("Experience and fee must be numbers");
          return false;
        }
        
        if (formData.qualifications.length === 0) {
          setError("Please add at least one qualification");
          return false;
        }
        
        // PMDC validation
        if (!formData.pmdc.trim()) {
          setError("PMDC number is required");
          return false;
        }
        
        break;
      
      case 2:
        // Document Upload validation
        if (!files.license || !files.degree || !files.profile_photo) {
          setError("Please upload all required documents");
          return false;
        }
        
        break;
      
      default:
        break;
    }
    
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddQualification = () => {
    if (qualificationInput.trim()) {
      setFormData({
        ...formData,
        qualifications: [...formData.qualifications, qualificationInput.trim()]
      });
      setQualificationInput("");
    }
  };

  const handleRemoveQualification = (index) => {
    const updatedQualifications = [...formData.qualifications];
    updatedQualifications.splice(index, 1);
    setFormData({
      ...formData,
      qualifications: updatedQualifications
    });
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      setFiles({
        ...files,
        [fileType]: file
      });
      
      // Create file preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreviews({
          ...previews,
          [fileType]: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async () => {
    try {
      if (!validateStep()) {
        return;
      }
      
      setLoading(true);
      
      // Create form data
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("name", formData.name);
      formDataToSubmit.append("email", formData.email);
      formDataToSubmit.append("phone", formData.phone);
      formDataToSubmit.append("password", formData.password);
      formDataToSubmit.append("specialization", formData.specialization);
      formDataToSubmit.append("experience", formData.experience);
      formDataToSubmit.append("fee", formData.fee);
      
      // Add PMDC number to form data - THIS IS THE CRITICAL ADDITION
      formDataToSubmit.append("pmdc", formData.pmdc);
      
      // Append qualifications as JSON string
      formDataToSubmit.append("qualifications", JSON.stringify(formData.qualifications));
      
      // Append files
      Object.keys(files).forEach(fileType => {
        if (files[fileType]) {
          formDataToSubmit.append(fileType, files[fileType]);
        }
      });
      
      console.log("Submitting doctor registration form...");
      // Debug form data
      for (let pair of formDataToSubmit.entries()) {
        console.log(pair[0]+ ': ' + pair[1]);
      }
      
      // Send registration request
      const response = await axios.post(
        "http://localhost:5000/api/doctor-registration/register",
        formDataToSubmit,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );
      
      console.log("Registration response:", response.data);
      
      if (response.data.success) {
        // Store authentication token
        localStorage.setItem("token", response.data.authToken);
        localStorage.setItem("userRole", "doctor");
        localStorage.setItem("userEmail", formData.email);
        
        // Show success message
        showAlert("Doctor registration successful! Your application is pending verification.", "success");
        
        // Redirect to dashboard
        navigate("/doctor-dashboard");
      }
    } catch (error) {
      console.error("Registration error:", error);
      
      // Display error message
      if (error.response && error.response.data) {
        setError(error.response.data.error || "Registration failed. Please try again.");
        showAlert(error.response.data.error || "Registration failed", "error");
      } else {
        setError("Registration failed. Please check your internet connection and try again.");
        showAlert("Registration failed", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  variant="outlined"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  variant="outlined"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        );
        case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Professional Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Specialization</InputLabel>
                  <Select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    label="Specialization"
                  >
                    {specializations.map((spec) => (
                      <MenuItem key={spec} value={spec}>
                        {spec}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* ADD PMDC NUMBER FIELD HERE */}
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="PMDC Registration Number"
                  name="pmdc"
                  value={formData.pmdc}
                  onChange={handleInputChange}
                  variant="outlined"
                  placeholder="Enter your Pakistan Medical & Dental Council number"
                  helperText="This is required for doctor verification"
                  inputProps={{ 
                    "data-testid": "pmdc-input",
                    maxLength: 50 
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Years of Experience"
                  name="experience"
                  type="number"
                  value={formData.experience}
                  onChange={handleInputChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Consultation Fee (Rs.)"
                  name="fee"
                  type="number"
                  value={formData.fee}
                  onChange={handleInputChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Qualifications
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Add Qualification"
                    value={qualificationInput}
                    onChange={(e) => setQualificationInput(e.target.value)}
                    placeholder="E.g., MBBS, MD, MS, FCPS"
                    variant="outlined"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddQualification();
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddQualification}
                    startIcon={<AddIcon />}
                    sx={{ ml: 1, height: '56px' }}
                  >
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.qualifications.map((qual, index) => (
                    <Chip
                      key={index}
                      label={qual}
                      onDelete={() => handleRemoveQualification(index)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Box>
        );
      
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Document Upload
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Please upload clear, high-quality scans of your documents for faster verification.
            </Typography>
            
            <Grid container spacing={4}>
              {/* Medical License Upload */}
              <Grid item xs={12} md={4}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Medical License
                  </Typography>
                  
                  <Box
                    sx={{
                      border: '1px dashed #ccc',
                      borderRadius: 1,
                      p: 3,
                      textAlign: 'center',
                      mb: 2,
                      bgcolor: 'background.default',
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {previews.license ? (
                      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                        <img
                          src={previews.license}
                          alt="License Preview"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '150px',
                            objectFit: 'contain'
                          }}
                        />
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="success.main">
                            <CheckIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                            File selected
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <>
                        <DescriptionIcon color="primary" fontSize="large" />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Upload your medical license
                        </Typography>
                      </>
                    )}
                  </Box>
                  
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<UploadIcon />}
                    fullWidth
                  >
                    Select License
                    <input
                      type="file"
                      hidden
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(e, 'license')}
                    />
                  </Button>
                </Paper>
              </Grid>
              
              {/* Medical Degree Upload */}
              <Grid item xs={12} md={4}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Medical Degree
                  </Typography>
                  
                  <Box
                    sx={{
                      border: '1px dashed #ccc',
                      borderRadius: 1,
                      p: 3,
                      textAlign: 'center',
                      mb: 2,
                      bgcolor: 'background.default',
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {previews.degree ? (
                      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                        <img
                          src={previews.degree}
                          alt="Degree Preview"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '150px',
                            objectFit: 'contain'
                          }}
                        />
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="success.main">
                            <CheckIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                            File selected
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <>
                        <DescriptionIcon color="primary" fontSize="large" />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Upload your medical degree
                        </Typography>
                      </>
                    )}
                  </Box>
                  
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<UploadIcon />}
                    fullWidth
                  >
                    Select Degree
                    <input
                      type="file"
                      hidden
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(e, 'degree')}
                    />
                  </Button>
                </Paper>
              </Grid>
              
              {/* Profile Photo Upload */}
              <Grid item xs={12} md={4}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Profile Photo
                  </Typography>
                  
                  <Box
                    sx={{
                      border: '1px dashed #ccc',
                      borderRadius: 1,
                      p: 3,
                      textAlign: 'center',
                      mb: 2,
                      bgcolor: 'background.default',
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {previews.profile_photo ? (
                      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                        <Avatar
                          src={previews.profile_photo}
                          alt="Profile Preview"
                          sx={{
                            width: 120,
                            height: 120,
                            margin: '0 auto'
                          }}
                        />
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="success.main">
                            <CheckIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                            File selected
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <>
                        <AccountIcon color="primary" fontSize="large" />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Upload a professional photo
                        </Typography>
                      </>
                    )}
                  </Box>
                  
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<UploadIcon />}
                    fullWidth
                  >
                    Select Photo
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'profile_photo')}
                    />
                  </Button>
                </Paper>
              </Grid>
            </Grid>
            
            <Box mt={3} sx={{ border: '1px solid', borderColor: 'info.light', p: 2, borderRadius: 1, bgcolor: 'info.lighter' }}>
              <Typography variant="subtitle2" color="info.main">
                <MedicalIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                Note:
              </Typography>
              <Typography variant="body2">
                Your documents will be verified by our team. This process usually takes 24-48 hours. You will be notified once your account is verified.
              </Typography>
            </Box>
          </Box>
        );
      
      default:
        return "Unknown step";
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="md" sx={{ mb: 4 }}>
        <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Join as a Doctor
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Complete the following steps to create your doctor account.
          </Typography>
          
          <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {getStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            {activeStep !== 0 ? (
              <Button onClick={handleBack} variant="outlined">
                Back
              </Button>
            ) : (
              <Button onClick={() => navigate('/login')} variant="outlined">
                Cancel
              </Button>
            )}
            
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? "Submitting..." : "Submit Application"}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}