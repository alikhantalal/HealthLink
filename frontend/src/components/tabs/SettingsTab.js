import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Alert
} from '@mui/material';

const SettingsTab = ({ theme }) => {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: 'important',
    smsNotifications: 'important',
    appointmentReminders: true,
    marketingEmails: false
  });
  
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  
  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };
  
  const handleNotificationChange = (e) => {
    setNotificationSettings({
      ...notificationSettings,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSwitchChange = (e) => {
    setNotificationSettings({
      ...notificationSettings,
      [e.target.name]: e.target.checked
    });
  };
  
  const handleUpdatePassword = () => {
    // Password validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }
    
    // Success
    setPasswordError('');
    setPasswordSuccess('Password updated successfully');
    
    // Clear form
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setPasswordSuccess('');
    }, 3000);
  };
  
  const handleSavePreferences = () => {
    // Save preferences logic would go here
    setSettingsSuccess('Notification preferences saved successfully');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSettingsSuccess('');
    }, 3000);
  };
  
  const handleDeactivateAccount = () => {
    if (window.confirm('Are you sure you want to deactivate your account? This action cannot be undone.')) {
      // Deactivation logic would go here
      alert('Account deactivation request submitted');
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Password Section */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Security Settings
          </Typography>
          
          <Card variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Change Password
              </Typography>
              
              {passwordError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {passwordError}
                </Alert>
              )}
              
              {passwordSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {passwordSuccess}
                </Alert>
              )}
              
              <TextField
                fullWidth
                label="Current Password"
                name="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                margin="normal"
              />
              
              <TextField
                fullWidth
                label="New Password"
                name="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                margin="normal"
              />
              
              <TextField
                fullWidth
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                margin="normal"
              />
              
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={handleUpdatePassword}
              >
                Update Password
              </Button>
            </CardContent>
          </Card>
          
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" color="error" gutterBottom>
                Danger Zone
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Deactivating your account will remove your profile from the platform. Patients will no longer be able to book appointments with you.
              </Typography>
              
              <Button
                variant="outlined"
                color="error"
                fullWidth
                onClick={handleDeactivateAccount}
              >
                Deactivate Account
              </Button>
            </CardContent>
          </Card>
        </Paper>
      </Grid>
      
      {/* Notification Preferences */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Notification Preferences
          </Typography>
          
          {settingsSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {settingsSuccess}
            </Alert>
          )}
          
          <Card variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Communication Settings
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Email Notifications</InputLabel>
                    <Select
                      name="emailNotifications"
                      value={notificationSettings.emailNotifications}
                      onChange={handleNotificationChange}
                      label="Email Notifications"
                    >
                      <MenuItem value="all">All notifications</MenuItem>
                      <MenuItem value="important">Important only</MenuItem>
                      <MenuItem value="none">None</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>SMS Notifications</InputLabel>
                    <Select
                      name="smsNotifications"
                      value={notificationSettings.smsNotifications}
                      onChange={handleNotificationChange}
                      label="SMS Notifications"
                    >
                      <MenuItem value="all">All notifications</MenuItem>
                      <MenuItem value="important">Important only</MenuItem>
                      <MenuItem value="none">None</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Notification Types
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.appointmentReminders}
                    onChange={handleSwitchChange}
                    name="appointmentReminders"
                    color="primary"
                  />
                }
                label="Appointment Reminders"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.marketingEmails}
                    onChange={handleSwitchChange}
                    name="marketingEmails"
                    color="primary"
                  />
                }
                label="Marketing & Promotional Emails"
              />
              
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={handleSavePreferences}
              >
                Save Preferences
              </Button>
            </CardContent>
          </Card>
          
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Account Information
              </Typography>
              
              <Typography variant="body2">
                <strong>Account Type:</strong> Doctor
              </Typography>
              
              <Typography variant="body2">
                <strong>Registration Date:</strong> {new Date().toLocaleDateString()}
              </Typography>
              
              <Typography variant="body2">
                <strong>Last Login:</strong> {new Date().toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default SettingsTab;