import React, { useState } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from "@mui/material";

export default function Signup({ showAlert }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cnic: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, phone, cnic, password, confirmPassword } = formData;

    // Form validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      showAlert("Passwords do not match", "danger");
      return;
    }

    if (!/^[0-9]{13}$/.test(cnic)) {
      setError("CNIC must be a 13-digit number");
      showAlert("Invalid CNIC format", "danger");
      return;
    }

    if (!/^[0-9]{10,11}$/.test(phone)) {
      setError("Phone number must be 10-11 digits long");
      showAlert("Invalid phone number format", "danger");
      return;
    }

    setError(null);
    showAlert("Signup successful!", "success");
    console.log("Form data submitted:", { name, email, phone, cnic });
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          borderRadius: 2,
          width: "100%",
          maxWidth: 500,
        }}
      >
        {/* Title */}
        <Typography
          variant="h5"
          align="center"
          sx={{ fontWeight: "bold", mb: 3 }}
        >
          Create an Account
        </Typography>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Signup Form */}
        <Box component="form" onSubmit={handleSubmit}>
          {/* Name Field */}
          <TextField
            fullWidth
            id="name"
            name="name"
            label="Full Name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            required
          />

          {/* Email Field */}
          <TextField
            fullWidth
            id="email"
            name="email"
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
          />

          {/* Phone Field */}
          <TextField
            fullWidth
            id="phone"
            name="phone"
            label="Phone Number"
            type="text"
            value={formData.phone}
            onChange={handleChange}
            margin="normal"
            required
          />

          {/* CNIC Field */}
          <TextField
            fullWidth
            id="cnic"
            name="cnic"
            label="CNIC"
            type="text"
            value={formData.cnic}
            onChange={handleChange}
            margin="normal"
            required
          />

          {/* Password Field */}
          <TextField
            fullWidth
            id="password"
            name="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
          />

          {/* Confirm Password Field */}
          <TextField
            fullWidth
            id="confirmPassword"
            name="confirmPassword"
            label="Repeat Password"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            margin="normal"
            required
          />

          {/* Signup Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{
              mt: 3,
              py: 1.5,
              fontSize: "1rem",
              fontWeight: "bold",
              textTransform: "none",
            }}
          >
            Signup
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
