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
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme"; // Ensure this path is correct

export default function Login({ showAlert }) {
  const location = useLocation();
  const role = location.state?.role || "User"; // Default to "User" if role is not specified

  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = credentials;

    // Mock login validation
    if (email === "test@example.com" && password === "password123") {
      showAlert("Login successful!", "success");
    } else {
      setError("Invalid email or password");
      showAlert("Invalid credentials", "danger");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="xs">
        <Paper elevation={3} sx={{ padding: 3, mt: 5 }}>
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

          {/* Google Login Button */}
          <Box display="flex" flexDirection="column" gap={1.5}>
            <Button
              fullWidth
              variant="outlined"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                alt="Google"
                width={20}
                height={20}
              />
              Sign in with Google
            </Button>
          </Box>

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
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {error && (
              <Typography color="error" variant="body2" align="center" mt={1}>
                {error}
              </Typography>
            )}

            <Button
              fullWidth
              variant="contained"
              color="primary"
              type="submit"
              sx={{ mt: 2 }}
            >
              Sign In
            </Button>
          </form>

          {/* Footer Links */}
          <Box mt={2} display="flex" justifyContent="space-between">
            <Button size="small" color="secondary" href="/reset-password">
              Forgot password?
            </Button>
            <Button size="small" color="secondary" href="/signup">
              Sign Up
            </Button>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}