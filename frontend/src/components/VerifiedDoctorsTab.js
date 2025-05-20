import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Avatar,
  Pagination,
  alpha,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  Tooltip,
  Chip
} from '@mui/material';
import { 
  Visibility,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as VerifyIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  SendOutlined as SendIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';

// Custom API function to get verified doctors
const fetchVerifiedDoctors = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get('http://localhost:5000/api/admin/verified-doctors', {
      headers: {
        'auth-token': token
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching verified doctors:', error);
    throw error;
  }
};

const VerifiedDoctorsTab = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verifiedDoctors, setVerifiedDoctors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadVerifiedDoctors();
  }, []);

  // Load verified doctors
  const loadVerifiedDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchVerifiedDoctors();
      
      if (response.success) {
        console.log(`Found ${response.data.length} raw doctor records`);
        
        // Process data to remove duplicates by name
        const uniqueDoctors = [];
        const addedNames = new Set();
        
        // First, sort by most complete data (prefer records with email)
        const sortedDoctors = [...response.data].sort((a, b) => {
          // Prioritize records with email
          if (a.email && !b.email) return -1;
          if (!a.email && b.email) return 1;
          
          // Then prioritize records with specialization
          if (a.specialization && !b.specialization) return -1;
          if (!a.specialization && b.specialization) return 1;
          
          // Then prioritize records with more complete data
          const aKeys = Object.keys(a).length;
          const bKeys = Object.keys(b).length;
          return bKeys - aKeys;
        });
        
        // Then filter out duplicates by name
        for (const doctor of sortedDoctors) {
          // Skip entries without a name
          if (!doctor.name) continue;
          
          // Normalize name for comparison (remove Dr., Prof., etc.)
          const normalizedName = doctor.name.replace(/^(Dr\.|Prof\.|Assist\. Prof\.|Lt\. Col\. Dr\.)?\s*/i, '').trim().toLowerCase();
          
          // If we haven't seen this doctor name before, add to unique list
          if (!addedNames.has(normalizedName)) {
            addedNames.add(normalizedName);
            uniqueDoctors.push(doctor);
          }
        }
        
        console.log(`Filtered to ${uniqueDoctors.length} unique doctors`);
        setVerifiedDoctors(uniqueDoctors);
      } else {
        console.error("API returned success: false or invalid response format");
        setError('Failed to load verified doctors: Invalid response format');
      }
    } catch (error) {
      console.error('Error in loadVerifiedDoctors:', error);
      setError('Failed to load verified doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // View doctor profile
  const handleViewDoctorProfile = (doctorId) => {
    // Navigate to doctor profile page in a new tab
    window.open(`/doctor/${doctorId}`, '_blank');
  };
  
  // Helper function to get specialization from doctor object
  const getSpecialization = (doctor) => {
    // First check direct specialization field
    if (doctor.specialization) {
      return doctor.specialization;
    }
    
    // Check qualification array
    if (Array.isArray(doctor.qualification) && doctor.qualification.length > 0) {
      return doctor.qualification[0];
    }
    
    // Check if qualification is a string
    if (typeof doctor.qualification === 'string' && doctor.qualification) {
      return doctor.qualification;
    }
    
    // Check qualifications array (plural variant)
    if (Array.isArray(doctor.qualifications) && doctor.qualifications.length > 0) {
      return doctor.qualifications[0];
    }
    
    // Fallback to other fields that might contain specialization
    if (doctor.Link && doctor.Link.includes('dr/')) {
      // Try to extract specialty from link
      const linkParts = doctor.Link.split('/');
      const specialtyIndex = linkParts.findIndex(part => part === 'dr') + 1;
      if (specialtyIndex < linkParts.length) {
        return linkParts[specialtyIndex].replace(/-/g, ' ');
      }
    }
    
    return 'Not specified';
  };

  // Format experience years
  const formatExperience = (experience) => {
    if (!experience) return 'Not specified';
    
    // Handle cases where experience is a year number (e.g. 2017)
    if (experience > 1900) {
      const yearsExperience = new Date().getFullYear() - experience;
      return `${yearsExperience}+ years`;
    }
    
    // Normal experience number
    return `${experience} years`;
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDoctors = verifiedDoctors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(verifiedDoctors.length / itemsPerPage);

  // Add state for admin actions
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    specialization: '',
    fee: '',
  });
  const [blockReason, setBlockReason] = useState('');
  const [emailContent, setEmailContent] = useState({
    subject: '',
    message: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Handle opening action menu
  const handleOpenActionMenu = (event, doctor) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedDoctor(doctor);
  };

  // Handle closing action menu
  const handleCloseActionMenu = () => {
    setActionMenuAnchor(null);
  };

  // Handle edit doctor
  const handleEditDoctor = () => {
    if (!selectedDoctor) return;
    
    setEditFormData({
      name: selectedDoctor.name || '',
      email: selectedDoctor.email || '',
      specialization: getSpecialization(selectedDoctor),
      fee: selectedDoctor.fee || '',
    });
    
    setEditDialogOpen(true);
    handleCloseActionMenu();
  };

  // Handle block doctor
  const handleBlockDoctor = () => {
    setBlockDialogOpen(true);
    handleCloseActionMenu();
  };

  // Handle delete doctor
  const handleDeleteDoctor = () => {
    setDeleteDialogOpen(true);
    handleCloseActionMenu();
  };

  // Handle email doctor
  const handleEmailDoctor = () => {
    if (!selectedDoctor || !selectedDoctor.email) {
      setSnackbar({
        open: true,
        message: 'Cannot email doctor: No email address found',
        severity: 'error'
      });
      handleCloseActionMenu();
      return;
    }
    
    setEmailContent({
      subject: `HealthLink: Important Information for Dr. ${selectedDoctor.name}`,
      message: `Dear Dr. ${selectedDoctor.name},\n\nWe hope this message finds you well. We are reaching out regarding your account on the HealthLink platform.\n\n[Your message here]\n\nBest regards,\nThe HealthLink Admin Team`
    });
    
    setEmailDialogOpen(true);
    handleCloseActionMenu();
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    try {
      // In a real application, you would make an API call here
      // For demo purposes, we'll just show a success message
      console.log('Saving edits for doctor:', selectedDoctor._id, editFormData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSnackbar({
        open: true,
        message: `Successfully updated Dr. ${selectedDoctor.name}'s information`,
        severity: 'success'
      });
      
      setEditDialogOpen(false);
      
      // Refresh doctor list
      loadVerifiedDoctors();
    } catch (error) {
      console.error('Error updating doctor:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update doctor information',
        severity: 'error'
      });
    }
  };

  // Handle confirm block
  const handleConfirmBlock = async () => {
    try {
      // In a real application, you would make an API call here
      console.log('Blocking doctor:', selectedDoctor._id, 'Reason:', blockReason);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSnackbar({
        open: true,
        message: `Doctor ${selectedDoctor.name} has been blocked from the platform`,
        severity: 'warning'
      });
      
      setBlockDialogOpen(false);
      
      // Refresh doctor list
      loadVerifiedDoctors();
    } catch (error) {
      console.error('Error blocking doctor:', error);
      setSnackbar({
        open: true,
        message: 'Failed to block doctor',
        severity: 'error'
      });
    }
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    try {
      // In a real application, you would make an API call here
      console.log('Deleting doctor:', selectedDoctor._id);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSnackbar({
        open: true,
        message: `Doctor ${selectedDoctor.name} has been removed from the system`,
        severity: 'info'
      });
      
      setDeleteDialogOpen(false);
      
      // Refresh doctor list
      loadVerifiedDoctors();
    } catch (error) {
      console.error('Error deleting doctor:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete doctor',
        severity: 'error'
      });
    }
  };

  // Handle send email
  const handleSendEmail = async () => {
    try {
      // In a real application, you would make an API call here
      console.log('Sending email to doctor:', selectedDoctor.email, emailContent);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSnackbar({
        open: true,
        message: `Email sent successfully to ${selectedDoctor.name}`,
        severity: 'success'
      });
      
      setEmailDialogOpen(false);
    } catch (error) {
      console.error('Error sending email:', error);
      setSnackbar({
        open: true,
        message: 'Failed to send email',
        severity: 'error'
      });
    }
  };

  // Handle close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          Verified Doctors
        </Typography>
        
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={loadVerifiedDoctors}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>
      
      {/* Loading indicator */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="error">
            {error}
          </Typography>
        </Box>
      ) : verifiedDoctors.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No verified doctors found in the system.
          </Typography>
        </Box>
      ) : (
        <>
          {/* Doctors table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Specialization</TableCell>
                  <TableCell>Experience</TableCell>
                  <TableCell>Fee</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentDoctors.map((doctor) => (
                  <TableRow key={doctor._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          src={doctor.profile && doctor.profile.startsWith('/uploads') 
                            ? `http://localhost:5000${doctor.profile}`
                            : doctor.profile} 
                          alt={doctor.name}
                          sx={{ mr: 2, width: 40, height: 40 }}
                        >
                          {doctor.name ? doctor.name.charAt(0) : "D"}
                        </Avatar>
                        <Typography variant="body2" fontWeight="medium">
                          {doctor.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{doctor.email || "Not provided"}</TableCell>
                    <TableCell>{getSpecialization(doctor)}</TableCell>
                    <TableCell>{formatExperience(doctor.experience)}</TableCell>
                    <TableCell>Rs. {doctor.fee || 'Not specified'}</TableCell>
                    <TableCell>
                      <Chip 
                        label="Active" 
                        size="small" 
                        color="success"
                        sx={{ fontWeight: 'medium' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Tooltip title="View Profile">
                          <IconButton 
                            size="small"
                            color="primary"
                            onClick={() => handleViewDoctorProfile(doctor._id)}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="More Actions">
                          <IconButton
                            size="small"
                            onClick={(e) => handleOpenActionMenu(e, doctor)}
                          >
                            <MoreIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Pagination 
                count={totalPages} 
                color="primary"
                shape="rounded"
                page={currentPage}
                onChange={(e, page) => setCurrentPage(page)}
              />
            </Box>
          )}
          
          {/* Action Menu */}
          <Menu
            anchorEl={actionMenuAnchor}
            open={Boolean(actionMenuAnchor)}
            onClose={handleCloseActionMenu}
          >
            <MenuItem onClick={handleEditDoctor}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Edit Doctor
            </MenuItem>
            <MenuItem onClick={handleBlockDoctor}>
              <BlockIcon fontSize="small" sx={{ mr: 1 }} />
              Block Doctor
            </MenuItem>
            <MenuItem onClick={handleDeleteDoctor}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              Delete Doctor
            </MenuItem>
            <MenuItem onClick={handleEmailDoctor}>
              <EmailIcon fontSize="small" sx={{ mr: 1 }} />
              Email Doctor
            </MenuItem>
          </Menu>
          
          {/* Edit Dialog */}
          <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Doctor Information</DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Name"
                  fullWidth
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                />
                <TextField
                  label="Email"
                  fullWidth
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                />
                <TextField
                  label="Specialization"
                  fullWidth
                  value={editFormData.specialization}
                  onChange={(e) => setEditFormData({ ...editFormData, specialization: e.target.value })}
                />
                <TextField
                  label="Fee (Rs.)"
                  fullWidth
                  type="number"
                  value={editFormData.fee}
                  onChange={(e) => setEditFormData({ ...editFormData, fee: e.target.value })}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleSaveEdit}>Save Changes</Button>
            </DialogActions>
          </Dialog>
          
          {/* Block Dialog */}
          <Dialog open={blockDialogOpen} onClose={() => setBlockDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Block Doctor</DialogTitle>
            <DialogContent>
              <Typography variant="body1" paragraph sx={{ mt: 2 }}>
                Are you sure you want to block {selectedDoctor?.name} from the platform?
              </Typography>
              <Typography variant="body2" paragraph color="warning.main">
                This action will prevent the doctor from logging in and accessing any features.
              </Typography>
              <TextField
                label="Reason for blocking"
                fullWidth
                multiline
                rows={3}
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Please provide a reason for blocking this doctor"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setBlockDialogOpen(false)}>Cancel</Button>
              <Button variant="contained" color="warning" onClick={handleConfirmBlock}>Block Doctor</Button>
            </DialogActions>
          </Dialog>
          
          {/* Delete Dialog */}
          <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Delete Doctor</DialogTitle>
            <DialogContent>
              <Typography variant="body1" paragraph sx={{ mt: 2 }}>
                Are you sure you want to permanently delete {selectedDoctor?.name} from the system?
              </Typography>
              <Typography variant="body2" paragraph color="error.main" fontWeight="bold">
                This action cannot be undone. All doctor data will be permanently removed.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="contained" color="error" onClick={handleConfirmDelete}>Delete Permanently</Button>
            </DialogActions>
          </Dialog>
          
          {/* Email Dialog */}
          <Dialog open={emailDialogOpen} onClose={() => setEmailDialogOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle>Email Doctor</DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="To"
                  fullWidth
                  value={selectedDoctor?.email || ''}
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Subject"
                  fullWidth
                  value={emailContent.subject}
                  onChange={(e) => setEmailContent({ ...emailContent, subject: e.target.value })}
                />
                <TextField
                  label="Message"
                  fullWidth
                  multiline
                  rows={8}
                  value={emailContent.message}
                  onChange={(e) => setEmailContent({ ...emailContent, message: e.target.value })}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
              <Button variant="contained" startIcon={<SendIcon />} onClick={handleSendEmail}>Send Email</Button>
            </DialogActions>
          </Dialog>
          
          {/* Snackbar for notifications */}
          <Snackbar 
            open={snackbar.open} 
            autoHideDuration={6000} 
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert 
              onClose={handleCloseSnackbar} 
              severity={snackbar.severity} 
              variant="filled"
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </>
      )}
    </Paper>
  );
};

export default VerifiedDoctorsTab;