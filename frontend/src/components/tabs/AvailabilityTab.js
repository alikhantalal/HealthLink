import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  FormControl,
  Select,
  MenuItem,
  Chip,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';

const AvailabilityTab = () => {
  const [editMode, setEditMode] = useState(false);
  const [newSlot, setNewSlot] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
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
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);
  const [activeDay, setActiveDay] = useState(null);
  const [doctorId, setDoctorId] = useState(null);
  
  // Fetch doctor data on component mount
  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error("No authentication token found");
          return;
        }
        
        // Get user data from API
        const response = await axios.get('/api/fetchdoctorsdata', {
          headers: {
            'auth-token': token
          },
          params: {
            email: localStorage.getItem('userEmail')
          }
        });
        
        console.log("Fetched doctor data:", response.data);
        
        if (response.data && response.data.data && response.data.data.length > 0) {
          const doctor = response.data.data[0];
          setDoctorId(doctor._id);
          
          if (doctor.availability) {
            setFormData({ availability: doctor.availability });
          }
        }
      } catch (error) {
        console.error("Error fetching doctor data:", error);
      }
    };
    
    fetchDoctorData();
  }, []);
  
  // Add new time slot
  const handleAddTimeSlot = (day) => {
    if (!newSlot) return;
    
    setFormData({
      ...formData,
      availability: {
        ...formData.availability,
        [day]: {
          ...formData.availability[day],
          slots: [...formData.availability[day].slots, newSlot]
        }
      }
    });
    
    setNewSlot('');
    setActiveDay(null);
  };
  
  // Remove time slot
  const handleRemoveTimeSlot = (day, index) => {
    const newSlots = [...formData.availability[day].slots];
    newSlots.splice(index, 1);
    
    setFormData({
      ...formData,
      availability: {
        ...formData.availability,
        [day]: {
          ...formData.availability[day],
          slots: newSlots
        }
      }
    });
  };
  
  // Toggle day availability
  const handleToggleAvailability = (day, isAvailable) => {
    setFormData({
      ...formData,
      availability: {
        ...formData.availability,
        [day]: {
          ...formData.availability[day],
          isAvailable
        }
      }
    });
  };
  
  // Save availability changes
  const handleSaveAvailability = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      // Ensure we have a doctor ID
      if (!doctorId) {
        throw new Error('Doctor data not available. Please refresh the page and try again.');
      }
      
      // Check if user ID is stored
      const userId = localStorage.getItem('userId');
      
      // Make the API request
      console.log(`Updating availability for doctor ID: ${doctorId}`);
      const response = await axios.put(
        `/api/doctor-profile/${doctorId}/availability`, 
        { availability: formData.availability },
        {
          headers: {
            'auth-token': token,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data && response.data.success) {
        setSuccessMessage('Availability schedule updated successfully');
        setEditMode(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(response.data?.error || 'Failed to update availability');
      }
    } catch (error) {
      console.error('Error saving availability:', error);
      
      if (error.response && error.response.status === 500) {
        setError('Internal server error. The backend may be missing user authentication data. Please try logging out and logging in again.');
      } else {
        setError(error.message || 'Failed to save availability. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          Manage Availability
        </Typography>
        
        <Button
          variant={editMode ? "contained" : "outlined"}
          color={editMode ? "primary" : "secondary"}
          startIcon={editMode ? <SaveIcon /> : <EditIcon />}
          onClick={editMode ? handleSaveAvailability : () => setEditMode(true)}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} /> 
          ) : (
            editMode ? "Save Schedule" : "Edit Schedule"
          )}
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      
      <Grid container spacing={2}>
        {Object.entries(formData.availability).map(([day, dayData]) => (
          <Grid item xs={12} key={day}>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                borderRadius: 2,
                boxShadow: 'none'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ textTransform: 'capitalize' }}>
                  {day}
                </Typography>
                
                {editMode ? (
                  <FormControl size="small">
                    <Select
                      value={dayData.isAvailable ? 'available' : 'unavailable'}
                      onChange={(e) => handleToggleAvailability(day, e.target.value === 'available')}
                      size="small"
                    >
                      <MenuItem value="available">Available</MenuItem>
                      <MenuItem value="unavailable">Unavailable</MenuItem>
                    </Select>
                  </FormControl>
                ) : (
                  <Chip
                    label={dayData.isAvailable ? 'Available' : 'Unavailable'}
                    color={dayData.isAvailable ? 'success' : 'default'}
                    size="small"
                  />
                )}
              </Box>
              
              {dayData.isAvailable && (
                <Box sx={{ mt: 2 }}>
                  {editMode ? (
                    <Box>
                      {dayData.slots.map((slot, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <TextField
                            fullWidth
                            value={slot}
                            onChange={(e) => {
                              const newSlots = [...dayData.slots];
                              newSlots[index] = e.target.value;
                              setFormData({
                                ...formData,
                                availability: {
                                  ...formData.availability,
                                  [day]: {
                                    ...dayData,
                                    slots: newSlots
                                  }
                                }
                              });
                            }}
                            placeholder="Time slot (e.g., 09:00 AM - 12:00 PM)"
                            size="small"
                          />
                          
                          <IconButton 
                            color="error" 
                            onClick={() => handleRemoveTimeSlot(day, index)}
                          >
                            <CloseIcon />
                          </IconButton>
                        </Box>
                      ))}
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <TextField
                          fullWidth
                          placeholder="Add new time slot (e.g., 01:00 PM - 04:00 PM)"
                          size="small"
                          value={activeDay === day ? newSlot : ''}
                          onChange={(e) => {
                            setActiveDay(day);
                            setNewSlot(e.target.value);
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && activeDay === day) {
                              e.preventDefault();
                              handleAddTimeSlot(day);
                            }
                          }}
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => handleAddTimeSlot(day)}
                          sx={{ ml: 1, whiteSpace: 'nowrap' }}
                        >
                          Add
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {dayData.slots.map((slot, index) => (
                        <Chip
                          key={index}
                          label={slot}
                          size="small"
                          icon={<TimeIcon />}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
      
      {editMode && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              setEditMode(false);
            }}
          >
            Cancel
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveAvailability}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {loading ? "Saving..." : "Save Schedule"}
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default AvailabilityTab;