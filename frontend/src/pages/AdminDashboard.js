import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  Avatar,
  Stack,
  Tabs,
  Tab,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  Check as ApproveIcon,
  Close as RejectIcon,
  Visibility as ViewIcon,
  VerifiedUser as VerifiedIcon,
  HourglassEmpty as PendingIcon,
  DocumentScanner as DocumentIcon,
  Person as PersonIcon,
  School as EducationIcon,
  LocalHospital as MedicalIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// Import the VerifiedDoctorsTab component from components folder
import VerifiedDoctorsTab from '../components/VerifiedDoctorsTab';

// Custom API function to get pending applications
const fetchPendingApplications = async () => {
  const token = localStorage.getItem('token');
  
  console.log("Token being sent:", token);
  
  try {
    // Use the endpoint without admin check first
    const response = await axios.get('http://localhost:5000/api/admin/pending-applications', {
      headers: {
        'auth-token': token
      }
    });
    
    console.log('Pending applications response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching pending applications:', error);
    
    // Log more details about the error
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    
    throw error;
  }
};

// Custom API function to get application details
const fetchApplicationDetails = async (id) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`http://localhost:5000/api/admin/doctor-application/${id}`, {
      headers: {
        'auth-token': token
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching application details:', error);
    throw error;
  }
};

// Custom API function to review application
const reviewApplication = async (id, status, notes) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.put(`http://localhost:5000/api/admin/review-application/${id}`, 
      { status, admin_notes: notes },
      {
        headers: {
          'auth-token': token,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error reviewing application:', error);
    throw error;
  }
};
const AdminDashboard = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pendingApplications, setPendingApplications] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [applicationDetails, setApplicationDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [reviewNotes, setReviewNotes] = useState('');
    const [reviewStatus, setReviewStatus] = useState('');
    const [reviewLoading, setReviewLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    
    // Check authentication on component mount
    useEffect(() => {
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');
      
      // Log to check credentials
      console.log("Auth check - Token:", token ? "exists" : "missing");
      console.log("Auth check - User role:", userRole);
      
      // For testing purposes, we'll temporarily disable this check
      // if (!token || userRole !== 'admin') {
      //  navigate('/login'); // Redirect non-admins to login
      //  return;
      // }
      
      loadPendingApplications();
    }, [navigate]);
    
    // Load pending applications
    const loadPendingApplications = async () => {
      try {
        setLoading(true);
        console.log("Loading pending applications...");
        
        const response = await fetchPendingApplications();
        console.log("Raw response:", response);
        
        if (response && response.success) {
          console.log(`Found ${response.data.length} pending applications`);
          setPendingApplications(response.data);
        } else {
          console.error("API returned success: false or invalid response format");
          setError('Failed to load pending applications: Invalid response format');
        }
      } catch (error) {
        console.error('Error in loadPendingApplications:', error);
        setError('Failed to load pending applications. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    // View application details
    const handleViewApplication = async (id) => {
      try {
        setSelectedApplication(id);
        setDetailsLoading(true);
        
        const response = await fetchApplicationDetails(id);
        
        if (response.success) {
          setApplicationDetails(response.data);
        } else {
          setError('Failed to load application details');
        }
      } catch (error) {
        console.error('Error in handleViewApplication:', error);
        setError('Failed to load application details. Please try again.');
      } finally {
        setDetailsLoading(false);
      }
    };
    
    // Open review dialog
    const handleOpenReviewDialog = (status) => {
      setReviewStatus(status);
      setReviewNotes('');
      setReviewDialogOpen(true);
    };
    
    // Submit review
    const handleSubmitReview = async () => {
      try {
        setReviewLoading(true);
        
        if (!selectedApplication || !reviewStatus) {
          throw new Error('Missing required information for review');
        }
        
        const response = await reviewApplication(
          selectedApplication,
          reviewStatus,
          reviewNotes
        );
        
        if (response.success) {
          // Show success message
          setSuccessMessage(`Application has been ${reviewStatus === 'approved' ? 'approved' : 'rejected'} successfully`);
          
          // Close dialogs and reset state
          setReviewDialogOpen(false);
          setApplicationDetails(null);
          setSelectedApplication(null);
          
          // Reload applications
          loadPendingApplications();
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            setSuccessMessage('');
          }, 3000);
        } else {
          setError('Failed to submit review');
        }
      } catch (error) {
        console.error('Error in handleSubmitReview:', error);
        setError('Failed to submit review. Please try again.');
      } finally {
        setReviewLoading(false);
      }
    };
    
    // Handle tab change
    const handleTabChange = (event, newValue) => {
      setActiveTab(newValue);
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
              background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
              color: 'white'
            }}
          >
            <Typography variant="h4" fontWeight="bold">
              Admin Dashboard
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
              Manage doctor verification and system settings
            </Typography>
          </Paper>
          
          {/* Success Message */}
          {successMessage && (
            <Paper 
              sx={{ 
                p: 2, 
                mb: 3, 
                bgcolor: alpha(theme.palette.success.main, 0.1),
                border: `1px solid ${theme.palette.success.main}`,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <VerifiedIcon sx={{ color: theme.palette.success.main, mr: 1 }} />
              <Typography color="success.main" fontWeight="medium">
                {successMessage}
              </Typography>
            </Paper>
          )}
          
          {/* Error Message */}
          {error && (
            <Paper 
              sx={{ 
                p: 2, 
                mb: 3, 
                bgcolor: alpha(theme.palette.error.main, 0.1),
                border: `1px solid ${theme.palette.error.main}`,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <RejectIcon sx={{ color: theme.palette.error.main, mr: 1 }} />
              <Typography color="error" fontWeight="medium">
                {error}
              </Typography>
            </Paper>
          )}
          
          {/* Tabs */}
          <Paper sx={{ borderRadius: 2, mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
            >
              <Tab label="Pending Verifications" icon={<PendingIcon />} iconPosition="start" />
              <Tab label="Verified Doctors" icon={<VerifiedIcon />} iconPosition="start" />
              <Tab label="System Settings" icon={<DocumentIcon />} iconPosition="start" />
            </Tabs>
          </Paper>
          
          {/* Tab Content */}
          {activeTab === 0 && (
            /* Pending Verifications Tab */
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Doctor Verification Requests
              </Typography>
              
              {pendingApplications.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No pending verification requests found.
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Specialization</TableCell>
                        <TableCell>Submitted On</TableCell>
                        <TableCell>AI Analysis</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingApplications.map((application) => (
                        <TableRow key={application._id}>
                          <TableCell>{application.name}</TableCell>
                          <TableCell>{application.email}</TableCell>
                          <TableCell>{application.specialization}</TableCell>
                          <TableCell>
                            {new Date(application.submitted_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={application.ai_analysis_results?.status || "Pending"} 
                              color={
                                application.ai_analysis_results?.status === 'verified' 
                                  ? 'success'
                                  : application.ai_analysis_results?.status === 'rejected'
                                    ? 'error'
                                    : 'warning'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<ViewIcon />}
                              onClick={() => handleViewApplication(application._id)}
                              sx={{ mr: 1 }}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          )}
          {activeTab === 1 && (
            /* Verified Doctors Tab - Using the separate component with proper import path */
            <VerifiedDoctorsTab />
          )}
      
          {activeTab === 2 && (
            /* System Settings Tab */
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                System Settings
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                This tab would contain system configuration options. Implement this feature based on your application needs.
              </Typography>
            </Paper>
          )}
      
          {/* Application Details Dialog */}
          <Dialog 
            open={!!applicationDetails} 
            onClose={() => setApplicationDetails(null)}
            fullWidth
            maxWidth="md"
          >
            {detailsLoading ? (
              <DialogContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              </DialogContent>
            ) : applicationDetails ? (
              <>
                <DialogTitle>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Doctor Verification Request</Typography>
                    <Chip 
                      label="Pending Review" 
                      color="warning"
                    />
                  </Box>
                </DialogTitle>
                <DialogContent>
                  <Grid container spacing={3}>
                    {/* Doctor Information */}
                    <Grid item xs={12} md={4}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                            <Avatar 
                              src={`http://localhost:5000${applicationDetails.profile_photo}`}
                              alt={applicationDetails.name}
                              sx={{ width: 100, height: 100, mb: 2 }}
                            />
                            <Typography variant="h6" fontWeight="bold">
                              {applicationDetails.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {applicationDetails.specialization}
                            </Typography>
                          </Box>
                          
                          <Divider sx={{ my: 2 }} />
                          
                          <Stack spacing={1.5}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                              <Typography variant="body2">
                                <b>Email:</b> {applicationDetails.email}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                              <Typography variant="body2">
                                <b>Phone:</b> {applicationDetails.phone}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <EducationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                              <Typography variant="body2">
                                <b>Experience:</b> {applicationDetails.experience} years
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <MedicalIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                              <Typography variant="body2">
                                <b>Fee:</b> Rs. {applicationDetails.fee}
                              </Typography>
                            </Box>
                          </Stack>
                          
                          <Divider sx={{ my: 2 }} />
                          
                          <Typography variant="subtitle2" gutterBottom>
                            Qualifications
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {applicationDetails.qualification && applicationDetails.qualification.length > 0 ? 
                              applicationDetails.qualification.map((qual, idx) => (
                                <Chip key={idx} label={qual} size="small" />
                              )) : 
                              <Typography variant="body2" color="text.secondary">
                                No qualifications provided
                              </Typography>
                            }
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    {/* Documents and AI Analysis */}
                    <Grid item xs={12} md={8}>
                      <Card variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Document Verification
                          </Typography>
                          
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Card variant="outlined">
                                <CardContent>
                                  <Typography variant="subtitle2" gutterBottom>
                                    Medical License
                                  </Typography>
                                  {applicationDetails.documents && applicationDetails.documents.license ? (
                                    <Box>
                                      <img 
                                        src={`http://localhost:5000${applicationDetails.documents.license}`}
                                        alt="Medical License"
                                        style={{ 
                                          width: '100%', 
                                          maxHeight: '200px', 
                                          objectFit: 'contain',
                                          marginBottom: '8px',
                                          border: '1px solid #eee',
                                          borderRadius: '4px'
                                        }}
                                      />
                                      <Button 
                                        fullWidth 
                                        variant="outlined" 
                                        size="small"
                                        href={`http://localhost:5000${applicationDetails.documents.license}`}
                                        target="_blank"
                                      >
                                        View Full Size
                                      </Button>
                                    </Box>
                                  ) : (
                                    <Typography variant="body2" color="error">
                                      License document not available
                                    </Typography>
                                  )}
                                </CardContent>
                              </Card>
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                              <Card variant="outlined">
                                <CardContent>
                                  <Typography variant="subtitle2" gutterBottom>
                                    Medical Degree
                                  </Typography>
                                  {applicationDetails.documents && applicationDetails.documents.degree ? (
                                    <Box>
                                      <img 
                                        src={`http://localhost:5000${applicationDetails.documents.degree}`}
                                        alt="Medical Degree"
                                        style={{ 
                                          width: '100%', 
                                          maxHeight: '200px', 
                                          objectFit: 'contain',
                                          marginBottom: '8px',
                                          border: '1px solid #eee',
                                          borderRadius: '4px'
                                        }}
                                      />
                                      <Button 
                                        fullWidth 
                                        variant="outlined" 
                                        size="small"
                                        href={`http://localhost:5000${applicationDetails.documents.degree}`}
                                        target="_blank"
                                      >
                                        View Full Size
                                      </Button>
                                    </Box>
                                  ) : (
                                    <Typography variant="body2" color="error">
                                      Degree document not available
                                    </Typography>
                                  )}
                                </CardContent>
                              </Card>
                            </Grid>
                          </Grid>
                          
                          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                            AI Analysis Results
                          </Typography>
                          
                          {applicationDetails.ai_analysis_results && 
                           Object.keys(applicationDetails.ai_analysis_results).length > 0 ? (
                            <Box>
                              <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius: 1 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Overall Status: 
                                  <Chip 
                                    label={applicationDetails.ai_analysis_results.status || "Unknown"}
                                    size="small"
                                    color={
                                      applicationDetails.ai_analysis_results.status === 'verified' 
                                        ? 'success'
                                        : applicationDetails.ai_analysis_results.status === 'rejected'
                                          ? 'error'
                                          : 'warning'
                                    }
                                    sx={{ ml: 1 }}
                                  />
                                </Typography>
                                
                                <Typography variant="body2" paragraph>
                                  {applicationDetails.ai_analysis_results.message || "No analysis message available"}
                                </Typography>
                              </Paper>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No AI analysis results available
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => setApplicationDetails(null)}
                  >
                    Close
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<RejectIcon />}
                    onClick={() => handleOpenReviewDialog('rejected')}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<ApproveIcon />}
                    onClick={() => handleOpenReviewDialog('approved')}
                  >
                    Approve
                  </Button>
                </DialogActions>
              </>
            ) : null}
          </Dialog>

          {/* Review Confirmation Dialog */}
          <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)}>
            <DialogTitle>
              {reviewStatus === 'approved' ? 'Approve' : 'Reject'} Doctor Application
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" paragraph>
                Are you sure you want to {reviewStatus === 'approved' ? 'approve' : 'reject'} this doctor application?
              </Typography>
              
              <TextField
                label="Admin Notes"
                multiline
                rows={4}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                fullWidth
                placeholder={reviewStatus === 'approved' 
                  ? "Add any notes about this approval (optional)"
                  : "Please provide a reason for rejection (optional)"
                }
                variant="outlined"
                margin="normal"
              />
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => setReviewDialogOpen(false)}
                disabled={reviewLoading}
              >
                Cancel
              </Button>
              <Button 
                variant="contained"
                color={reviewStatus === 'approved' ? 'success' : 'error'}
                onClick={handleSubmitReview}
                disabled={reviewLoading}
              >
                {reviewLoading ? <CircularProgress size={24} /> : (
                  reviewStatus === 'approved' ? 'Confirm Approval' : 'Confirm Rejection'
                )}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      );
    };
    
    export default AdminDashboard;