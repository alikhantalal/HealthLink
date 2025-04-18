import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Divider,
  Alert,
  Chip,
  useTheme,
  alpha,
  Card,
  CardContent,
  LinearProgress,
  Avatar
} from "@mui/material";
import {
  FileUpload as FileUploadIcon,
  Check as CheckIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  MedicalServices as MedicalIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  VerifiedUser as VerifiedUserIcon,
  ErrorOutline as ErrorIcon
} from "@mui/icons-material";

const DoctorSignup = ({ showAlert }) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    password: "",
    confirmPassword: "",
    experience: "",
    fee: "",
    qualifications: [],
    bio: ""
  });
  
  // File uploads
  const [files, setFiles] = useState({
    license: null,
    degree: null,
    profile_photo: null
  });
  
  // File preview URLs
  const [previews, setPreviews] = useState({
    license: null,
    degree: null,
    profile_photo: null
  });
  
  // Form errors
  const [errors, setErrors] = useState({});
  
  // Specialization options
  const specializations = [
    "General Physician",
    "Cardiologist",
    "Dermatologist",
    "Gynecologist",
    "Neurologist",
    "Ophthalmologist",
    "Orthopedic Surgeon",
    "Pediatrician",
    "Psychiatrist",
    "Urologist"
  ];
  
  // Steps for the stepper
  const steps = [
    "Personal Information",
    "Professional Details",
    "Document Upload",
    "Verification"
  ];
  
  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      // Revoke object URLs to avoid memory leaks
      Object.values(previews).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [previews]);
  
  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };
  
  // Handle file changes
  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Update files state
    setFiles({ ...files, [fileType]: file });
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPreviews({ ...previews, [fileType]: previewUrl });
    
    // Clear error
    if (errors[fileType]) {
      setErrors({ ...errors, [fileType]: null });
    }
  };
  
  // Add a qualification
  const addQualification = () => {
    const qualification = document.getElementById("qualification-input").value;
    if (qualification && !formData.qualifications.includes(qualification)) {
      setFormData({
        ...formData,
        qualifications: [...formData.qualifications, qualification]
      });
      document.getElementById("qualification-input").value = "";
    }
  };
  
  // Remove a qualification
  const removeQualification = (index) => {
    const updatedQualifications = [...formData.qualifications];
    updatedQualifications.splice(index, 1);
    setFormData({ ...formData, qualifications: updatedQualifications });
  };
  
  // Validate current step
  const validateStep = () => {
    const newErrors = {};
    
    if (activeStep === 0) {
      // Validate personal info
      if (!formData.name) newErrors.name = "Name is required";
      if (!formData.email) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email)) 
        newErrors.email = "Email is invalid";
      
      if (!formData.phone) newErrors.phone = "Phone is required";
      else if (!/^[0-9]{10,11}$/.test(formData.phone))
        newErrors.phone = "Phone must be 10-11 digits";
      
      if (!formData.password) newErrors.password = "Password is required";
      else if (formData.password.length < 6)
        newErrors.password = "Password must be at least 6 characters";
      
      if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
    }
    else if (activeStep === 1) {
      // Validate professional details
      if (!formData.specialization) 
        newErrors.specialization = "Specialization is required";
      
      if (!formData.experience) 
        newErrors.experience = "Experience is required";
      else if (isNaN(formData.experience) || formData.experience < 0)
        newErrors.experience = "Experience must be a positive number";
      
      if (!formData.fee) 
        newErrors.fee = "Consultation fee is required";
      else if (isNaN(formData.fee) || formData.fee < 0)
        newErrors.fee = "Fee must be a positive number";
      
      if (formData.qualifications.length === 0)
        newErrors.qualifications = "At least one qualification is required";
    }
    else if (activeStep === 2) {
      // Validate document uploads
      if (!files.license) 
        newErrors.license = "Medical license document is required";
      
      if (!files.degree) 
        newErrors.degree = "Medical degree document is required";
      
      if (!files.profile_photo) 
        newErrors.profile_photo = "Profile photo is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle next step
  const handleNext = () => {
    if (validateStep()) {
      if (activeStep === steps.length - 2) {
        // Last step before verification - submit documents
        submitForVerification();
      } else {
        setActiveStep((prevStep) => prevStep + 1);
      }
    }
  };
  
  // Handle back step
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // Submit documents for verification
  const submitForVerification = async () => {
    try {
      setLoading(true);
      
      // Create form data for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("specialization", formData.specialization);
      formDataToSend.append("experience", formData.experience);
      formDataToSend.append("fee", formData.fee);
      formDataToSend.append("qualifications", JSON.stringify(formData.qualifications));
      
      // Append files with explicit filenames
      if (files.license) {
        console.log("Appending license file:", files.license.name);
        formDataToSend.append("license", files.license, files.license.name);
      }
      
      if (files.degree) {
        console.log("Appending degree file:", files.degree.name);
        formDataToSend.append("degree", files.degree, files.degree.name);
      }
      
      if (files.profile_photo) {
        console.log("Appending profile photo:", files.profile_photo.name);
        formDataToSend.append("profile_photo", files.profile_photo, files.profile_photo.name);
      }
      
      // Log form data keys (can't view content directly)
      console.log("FormData created with fields:", [...formDataToSend.keys()]);
      
      // Use Node.js backend as a proxy instead of direct Flask service
      console.log("Sending request to verification API through Node.js proxy...");
      
      const response = await fetch("http://localhost:5000/api/doctor-registration/verify-documents", {
        method: "POST",
        // Don't set Content-Type header - browser will set it correctly with boundary for FormData
        body: formDataToSend
      });
      
      console.log("Verification API response status:", response.status);
      
      if (!response.ok) {
        let errorMessage = `Verification failed (${response.status}): ${response.statusText}`;
        try {
          // Try to parse error as JSON
          const errorData = await response.json();
          console.error("Verification API error details:", errorData);
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (jsonError) {
          // If not JSON, try to get text
          try {
            const errorText = await response.text();
            console.error("Verification API error text:", errorText);
            errorMessage = `${errorMessage} - ${errorText}`;
          } catch (textError) {
            // If even that fails, stick with the status message
            console.error("Could not parse error response");
          }
        }
        
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log("Verification result:", result);
      setVerificationResult(result);
      
      // Move to verification result step
      setActiveStep((prevStep) => prevStep + 1);
      
      // Show success message
      showAlert("Documents submitted for verification", "success");
      
    } catch (error) {
      console.error("Verification error:", error);
      showAlert(`Error: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle final submission
  const handleFinalSubmit = async () => {
    try {
      setLoading(true);
      
      // Here you would submit the verified doctor information to your main API
      // This would create the doctor account in your system
      
      // For now, we'll just simulate a successful submission
      setTimeout(() => {
        showAlert("Your application has been submitted successfully! Our team will contact you soon.", "success");
        // Redirect to login page
        window.location.href = "/login?role=doctor";
      }, 1500);
      
    } catch (error) {
      console.error("Submission error:", error);
      showAlert(`Error: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };
  
  // Render document verification status
  const renderVerificationStatus = () => {
    if (!verificationResult) return null;
    
    const licenseStatus = verificationResult.verification_results?.license?.status || "pending_review";
    const degreeStatus = verificationResult.verification_results?.degree?.status || "pending_review";
    const overallStatus = verificationResult.status;
    
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Verification Results
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card 
              variant="outlined" 
              sx={{ 
                borderRadius: 2,
                borderColor: licenseStatus === 'verified' 
                  ? theme.palette.success.main 
                  : licenseStatus === 'error'
                  ? theme.palette.error.main
                  : theme.palette.warning.main
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <MedicalIcon 
                    sx={{ 
                      mr: 1, 
                      color: licenseStatus === 'verified' 
                        ? theme.palette.success.main 
                        : licenseStatus === 'error'
                        ? theme.palette.error.main
                        : theme.palette.warning.main
                    }} 
                  />
                  <Typography variant="h6">Medical License</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Chip 
                    label={licenseStatus === 'verified' ? 'Verified' : licenseStatus === 'error' ? 'Failed' : 'Pending Review'} 
                    size="small"
                    sx={{ 
                      backgroundColor: licenseStatus === 'verified' 
                        ? alpha(theme.palette.success.main, 0.1)
                        : licenseStatus === 'error'
                        ? alpha(theme.palette.error.main, 0.1)
                        : alpha(theme.palette.warning.main, 0.1),
                      color: licenseStatus === 'verified' 
                        ? theme.palette.success.main 
                        : licenseStatus === 'error'
                        ? theme.palette.error.main
                        : theme.palette.warning.main,
                      mr: 1
                    }}
                    icon={
                      licenseStatus === 'verified' 
                        ? <CheckIcon fontSize="small" /> 
                        : licenseStatus === 'error'
                        ? <ErrorIcon fontSize="small" />
                        : <CloseIcon fontSize="small" />
                    }
                  />
                  
                  {verificationResult.verification_results?.license?.confidence && (
                    <Typography variant="body2" color="text.secondary">
                      Confidence: {Math.round(verificationResult.verification_results.license.confidence * 100)}%
                    </Typography>
                  )}
                </Box>
                
                {verificationResult.verification_results?.license?.method && (
                  <Typography variant="body2" color="text.secondary">
                    Verification method: {verificationResult.verification_results.license.method === 'ai_model' ? 'AI Model' : 'Rule-based Analysis'}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card 
              variant="outlined" 
              sx={{ 
                borderRadius: 2,
                borderColor: degreeStatus === 'verified' 
                  ? theme.palette.success.main 
                  : degreeStatus === 'error'
                  ? theme.palette.error.main
                  : theme.palette.warning.main
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SchoolIcon 
                    sx={{ 
                      mr: 1, 
                      color: degreeStatus === 'verified' 
                        ? theme.palette.success.main 
                        : degreeStatus === 'error'
                        ? theme.palette.error.main
                        : theme.palette.warning.main
                    }} 
                  />
                  <Typography variant="h6">Medical Degree</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Chip 
                    label={degreeStatus === 'verified' ? 'Verified' : degreeStatus === 'error' ? 'Failed' : 'Pending Review'} 
                    size="small"
                    sx={{ 
                      backgroundColor: degreeStatus === 'verified' 
                        ? alpha(theme.palette.success.main, 0.1)
                        : degreeStatus === 'error'
                        ? alpha(theme.palette.error.main, 0.1)
                        : alpha(theme.palette.warning.main, 0.1),
                      color: degreeStatus === 'verified' 
                        ? theme.palette.success.main 
                        : degreeStatus === 'error'
                        ? theme.palette.error.main
                        : theme.palette.warning.main,
                      mr: 1
                    }}
                    icon={
                      degreeStatus === 'verified' 
                        ? <CheckIcon fontSize="small" /> 
                        : degreeStatus === 'error'
                        ? <ErrorIcon fontSize="small" />
                        : <CloseIcon fontSize="small" />
                    }
                  />
                  
                  {verificationResult.verification_results?.degree?.confidence && (
                    <Typography variant="body2" color="text.secondary">
                      Confidence: {Math.round(verificationResult.verification_results.degree.confidence * 100)}%
                    </Typography>
                  )}
                </Box>
                
                {verificationResult.verification_results?.degree?.method && (
                  <Typography variant="body2" color="text.secondary">
                    Verification method: {verificationResult.verification_results.degree.method === 'ai_model' ? 'AI Model' : 'Rule-based Analysis'}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Alert 
          severity={overallStatus === 'verified' ? 'success' : 'info'}
          variant="filled"
          sx={{ mb: 3 }}
        >
          {overallStatus === 'verified' 
            ? 'All documents have been verified successfully! You can now complete your registration.'
            : 'Some documents require manual review by our team. You can still submit your application, and we will contact you once the verification process is complete.'}
        </Alert>
      </Box>
    );
  };

  // Render form based on active step
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        // Personal Information
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Please provide your personal details to get started.
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address"
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
          </Grid>
        );
        
      case 1:
        // Professional Details
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Professional Information
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Tell us about your professional background and specialization.
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.specialization}>
                <InputLabel>Specialization</InputLabel>
                <Select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  label="Specialization"
                >
                  {specializations.map((spec) => (
                    <MenuItem key={spec} value={spec}>
                      {spec}
                    </MenuItem>
                  ))}
                </Select>
                {errors.specialization && (
                  <Typography variant="caption" color="error">
                    {errors.specialization}
                  </Typography>
                )}
              </FormControl>
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
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Consultation Fee (Rs.)"
                name="fee"
                type="number"
                value={formData.fee}
                onChange={handleChange}
                error={!!errors.fee}
                helperText={errors.fee}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Qualifications & Education
              </Typography>
              
              <Box sx={{ display: 'flex', mb: 2 }}>
                <TextField
                  id="qualification-input"
                  label="Add Qualification"
                  fullWidth
                  placeholder="E.g., MBBS, MD, Fellowship in Cardiology"
                  sx={{ mr: 1 }}
                />
                <Button 
                  variant="contained" 
                  onClick={addQualification}
                  sx={{ minWidth: 100 }}
                >
                  Add
                </Button>
              </Box>
              
              {errors.qualifications && (
                <Typography variant="caption" color="error" sx={{ mb: 2, display: 'block' }}>
                  {errors.qualifications}
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.qualifications.map((qual, index) => (
                  <Chip
                    key={index}
                    label={qual}
                    onDelete={() => removeQualification(index)}
                    sx={{ mb: 1 }}
                    icon={<SchoolIcon fontSize="small" />}
                  />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Professional Bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                multiline
                rows={4}
                placeholder="Briefly describe your professional background, specialties, and approach to patient care..."
              />
            </Grid>
          </Grid>
        );
        
      case 2:
        // Document Upload
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Document Verification
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Please upload the following documents for verification. Accepted formats: PDF, JPG, PNG.
              </Typography>
            </Grid>
            
            {/* Medical License Upload */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 2,
                  borderColor: errors.license ? 'error.main' : 'divider',
                  borderStyle: 'dashed',
                  bgcolor: 'background.default',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                  Medical License
                </Typography>
                
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  {previews.license ? (
                    <Box
                      component="img"
                      src={previews.license}
                      alt="License Preview"
                      sx={{
                        maxWidth: '100%',
                        maxHeight: 200,
                        objectFit: 'contain',
                        mb: 2
                      }}
                    />
                  ) : (
                    <MedicalIcon
                      sx={{
                        fontSize: 60,
                        color: 'text.secondary',
                        opacity: 0.5,
                        mb: 2
                      }}
                    />
                  )}
                  
                  <input
                    accept="image/png, image/jpeg, application/pdf"
                    style={{ display: 'none' }}
                    id="license-upload"
                    type="file"
                    onChange={(e) => handleFileChange(e, 'license')}
                  />
                  <label htmlFor="license-upload">
                    <Button
                      variant="contained"
                      component="span"
                      startIcon={<CloudUploadIcon />}
                      sx={{ mb: 1 }}
                    >
                      {previews.license ? 'Change' : 'Upload'}
                    </Button>
                  </label>
                  
                  <Typography variant="caption" color="text.secondary" align="center">
                    Upload your current medical license
                  </Typography>
                  
                  {errors.license && (
                    <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                      {errors.license}
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
            
            {/* Medical Degree Upload */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 2,
                  borderColor: errors.degree ? 'error.main' : 'divider',
                  borderStyle: 'dashed',
                  bgcolor: 'background.default',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                  Medical Degree
                </Typography>
                
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  {previews.degree ? (
                    <Box
                      component="img"
                      src={previews.degree}
                      alt="Degree Preview"
                      sx={{
                        maxWidth: '100%',
                        maxHeight: 200,
                        objectFit: 'contain',
                        mb: 2
                      }}
                    />
                  ) : (
                    <SchoolIcon
                      sx={{
                        fontSize: 60,
                        color: 'text.secondary',
                        opacity: 0.5,
                        mb: 2
                      }}
                    />
                  )}
                  
                  <input
                    accept="image/png, image/jpeg, application/pdf"
                    style={{ display: 'none' }}
                    id="degree-upload"
                    type="file"
                    onChange={(e) => handleFileChange(e, 'degree')}
                  />
                  <label htmlFor="degree-upload">
                    <Button
                      variant="contained"
                      component="span"
                      startIcon={<CloudUploadIcon />}
                      sx={{ mb: 1 }}
                    >
                      {previews.degree ? 'Change' : 'Upload'}
                    </Button>
                  </label>
                  
                  <Typography variant="caption" color="text.secondary" align="center">
                    Upload your medical degree certificate
                  </Typography>
                  
                  {errors.degree && (
                    <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                      {errors.degree}
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
            
            {/* Profile Photo Upload */}
            <Grid item xs={12}>
              <Paper
                elevation={0}
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 2,
                  borderColor: errors.profile_photo ? 'error.main' : 'divider',
                  borderStyle: 'dashed',
                  bgcolor: 'background.default',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Box sx={{ mr: 3 }}>
                  {previews.profile_photo ? (
                    <Avatar
                      src={previews.profile_photo}
                      alt="Profile Preview"
                      sx={{
                        width: 100,
                        height: 100,
                        border: '4px solid white',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                      }}
                    />
                  ) : (
                    <Avatar
                      sx={{
                        width: 100,
                        height: 100,
                        bgcolor: 'primary.light',
                        color: 'primary.main'
                      }}
                    >
                      <PersonIcon sx={{ fontSize: 40 }} />
                    </Avatar>
                  )}
                </Box>
                
                <Box>
                  <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                    Profile Photo
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Upload a professional profile photo. This will be displayed to patients.
                  </Typography>
                  
                  <input
                    accept="image/png, image/jpeg"
                    style={{ display: 'none' }}
                    id="profile-upload"
                    type="file"
                    onChange={(e) => handleFileChange(e, 'profile_photo')}
                  />
                  <label htmlFor="profile-upload">
                    <Button
                      variant="contained"
                      component="span"
                      startIcon={<CloudUploadIcon />}
                      size="small"
                    >
                      {previews.profile_photo ? 'Change Photo' : 'Upload Photo'}
                    </Button>
                  </label>
                  
                  {errors.profile_photo && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                      {errors.profile_photo}
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Important:</strong> Your documents will be verified using our AI system. High-quality, clear scans will result in faster verification.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        );
        
      case 3:
        // Verification & Submission
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Document Verification
              </Typography>
              
              {loading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress size={60} />
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    Verifying your documents...
                  </Typography>
                  <LinearProgress sx={{ mt: 2 }} />
                </Box>
              ) : verificationResult ? (
                <>
                  {renderVerificationStatus()}
                  
                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body1" paragraph>
                      You're almost done! Click the button below to complete your registration.
                    </Typography>
                    
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleFinalSubmit}
                      disabled={loading}
                      startIcon={<VerifiedUserIcon />}
                      sx={{ 
                        py: 1.5, 
                        px: 4,
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)'
                      }}
                    >
                      Complete Registration
                    </Button>
                  </Box>
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    Click "Verify Documents" to start the verification process.
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 2,
          backgroundColor: "background.paper",
          boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{ 
              fontWeight: "bold",
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1
            }}
          >
            Join as a Doctor
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Register to become a part of Pakistan's largest healthcare network
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{ mb: 4 }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Form Content */}
        <Box sx={{ mt: 4 }}>
          {renderStepContent()}
        </Box>

        {/* Divider */}
        <Divider sx={{ my: 4 }} />

        {/* Navigation Buttons */}
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0 || loading}
            sx={{ 
              px: 3,
              py: 1,
              borderRadius: 2
            }}
          >
            Back
          </Button>
          
          <Box>
            {activeStep === steps.length - 1 && !verificationResult && (
              <Button
                variant="contained"
                color="primary"
                onClick={submitForVerification}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <FileUploadIcon />}
                sx={{ 
                  px: 3,
                  py: 1,
                  borderRadius: 2
                }}
              >
                Verify Documents
              </Button>
            )}
            
            {activeStep < steps.length - 1 && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                sx={{ 
                  px: 3,
                  py: 1,
                  borderRadius: 2
                }}
              >
                Continue
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default DoctorSignup;