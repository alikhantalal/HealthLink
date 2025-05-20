import React, { useState } from "react";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Visibility, 
  VisibilityOff, 
  MedicalServices, 
  Info as InfoIcon,
  AdminPanelSettings as AdminIcon
} from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme";
import axios from "axios";

export default function Login({ showAlert }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 0); // Default to doctor login (0), admin is (1)
  const role = activeTab === 0 ? "Doctor" : "Admin";

  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Verification status dialog
  const [verificationDialog, setVerificationDialog] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState({
    status: 'pending',
    message: ''
  });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = credentials;
    
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Add role to login credentials
      const loginData = { 
        email, 
        password,
        role: role.toLowerCase() // Send role to backend
      };
      
      // Make the login request
      const response = await axios.post('http://localhost:5000/api/auth/login', loginData);
      
      if (response.data.success) {
        // Store auth token and user role
        localStorage.setItem('token', response.data.authToken);
        localStorage.setItem('userRole', role.toLowerCase());
        localStorage.setItem('userEmail', email);
        
        // Handle based on role
        if (role.toLowerCase() === 'admin') {
          // Admin login - direct to admin dashboard
          showAlert("Admin login successful!", "success");
          navigate("/admin-dashboard");
        } else if (role.toLowerCase() === 'doctor') {
          // For doctors, check verification status
          try {
            // Check verification status
            const verificationResponse = await axios.get(
              'http://localhost:5000/api/doctor-registration/verification-status',
              {
                headers: {
                  'auth-token': response.data.authToken
                }
              }
            );
            
            if (verificationResponse.data.success) {
              if (verificationResponse.data.verification_status === 'approved') {
                // Doctor is verified, proceed to dashboard
                showAlert("Login successful! Welcome back", "success");
                navigate("/doctor-dashboard");
              } else {
                // Doctor is not verified, show verification status dialog
                setVerificationStatus({
                  status: verificationResponse.data.verification_status,
                  message: verificationResponse.data.message
                });
                setVerificationDialog(true);
              }
            } else {
              throw new Error(verificationResponse.data.error || "Verification status check failed");
            }
          } catch (verificationError) {
            console.error("Verification status check error:", verificationError);
            
            // If verification status check fails, still allow login but show a warning
            showAlert("Login successful, but verification status could not be checked", "warning");
            navigate("/");
          }
        }
      } else {
        setError(response.data.error || "Login failed");
        showAlert(response.data.error || "Invalid credentials", "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.response?.data?.error || "Login failed. Please try again.");
      showAlert(error.response?.data?.error || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    if (role.toLowerCase() === 'doctor') {
      navigate("/join-as-doctor");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="xs">
        <Paper elevation={3} sx={{ padding: 3, mt: 5, borderRadius: 2 }}>
          {/* Role Toggle Tabs */}
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ mb: 3 }}
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MedicalServices />
                  <span>Doctor</span>
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AdminIcon />
                  <span>Admin</span>
                </Box>
              } 
            />
          </Tabs>
          
          <Typography variant="h5" align="center" fontWeight="bold">
            Sign In as {role}
          </Typography>
          <Typography
            variant="body2"
            align="center"
            color="textSecondary"
            sx={{ mb: 2 }}
          >
            Enter your email and password to continue
          </Typography>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              variant="outlined"
              margin="normal"
              value={credentials.email}
              onChange={handleChange}
              required
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              variant="outlined"
              margin="normal"
              type={showPassword ? "text" : "password"}
              value={credentials.password}
              onChange={handleChange}
              required
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            
            {role.toLowerCase() === 'doctor' && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Doctor accounts require verification before full access is granted.
                </Typography>
              </Alert>
            )}

            <Button
              fullWidth
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : "Sign In"}
            </Button>
          </form>

          {/* Footer Links */}
          <Box mt={2} display="flex" justifyContent="space-between">
            <Button size="small" color="secondary" href="/reset-password">
              Forgot password?
            </Button>
            {role.toLowerCase() === 'doctor' && (
              <Button 
                size="small" 
                color="secondary" 
                onClick={handleSignUp}
              >
                Sign Up
              </Button>
            )}
          </Box>
        </Paper>
      </Container>
      
      {/* Verification Status Dialog */}
      <Dialog 
        open={verificationDialog} 
        onClose={() => {
          setVerificationDialog(false);
          navigate("/");
        }}
      >
        <DialogTitle>
          Doctor Verification Status
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <InfoIcon color="info" sx={{ mr: 1, mt: 0.5 }} />
            <Typography variant="body1">
              {verificationStatus.message || 
                "Your doctor application is still pending verification. You will be notified once the verification is complete."}
            </Typography>
          </Box>
          
          <Alert 
            severity={
              verificationStatus.status === 'approved' ? 'success' : 
              verificationStatus.status === 'rejected' ? 'error' : 
              'warning'
            } 
            sx={{ mt: 2 }}
          >
            {verificationStatus.status === 'approved' 
              ? "Your account is approved! You can now access all doctor features."
              : verificationStatus.status === 'rejected'
                ? "Your application has been rejected. Please contact support for more information."
                : "Your application is being reviewed by our team."}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setVerificationDialog(false);
              navigate("/");
            }}
            variant="contained"
          >
            Go to Home
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}