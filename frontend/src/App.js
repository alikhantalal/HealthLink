import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { PrimeReactProvider } from "primereact/api";
import { ThemeProvider, CssBaseline, Snackbar, Alert } from "@mui/material";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import About from "./components/About";
import PatientView from "./pages/PatientView";
import SpecialistsPage from "./pages/SpecialistsPage";
import FindSpecialists from "./pages/FindSpecialists";
import SpecialistDoctorsWithFilter from "./pages/SpecialistDoctorsWithFilter";
import BookAppointmentPage from "./pages/BookAppointmentPage";
import DoctorProfile from "./pages/DoctorProfile";
import ChatBot from './components/ChatBot';
import HomePage from './pages/HomePage';
import DoctorSignup from './components/DoctorSignup';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import theme from "./theme";

// Protected Route Component
const ProtectedRoute = ({ element, allowedRoles = [] }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }
  return element;
};

export default function App() {
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserRole = localStorage.getItem('userRole');
    setIsAuthenticated(!!token);
    setUserRole(storedUserRole || null);
  }, []);

  const showAlert = (message, severity = "info") => {
    console.log("Showing alert:", message, severity);
    setAlert({ open: true, message, severity });
  };

  const handleCloseAlert = (event, reason) => {
    if (reason === "clickaway") return;
    setAlert((prev) => ({ ...prev, open: false }));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PrimeReactProvider>
        <Router>
          <Navbar isAuthenticated={isAuthenticated} userRole={userRole} />

          <main style={{ minHeight: "calc(100vh - 80px)" }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/patients" element={<PatientView />} />
              <Route path="/specialists" element={<SpecialistsPage />} />
              <Route path="/find-specialists" element={<FindSpecialists />} />
              <Route path="/specialists/:specialty" element={<SpecialistDoctorsWithFilter showAlert={showAlert} />} />
              <Route path="/doctor/:id" element={<DoctorProfile />} />
              <Route path="/book-appointment" element={<BookAppointmentPage />} />
              <Route path="/chatbot" element={<ChatBot />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login showAlert={showAlert} />} />
              <Route path="/join-as-doctor" element={<DoctorSignup showAlert={showAlert} />} />

              {/* Protected Routes */}
              <Route 
                path="/doctor-dashboard" 
                element={
                  <ProtectedRoute 
                    element={<DoctorDashboard showAlert={showAlert} />}
                    allowedRoles={['doctor']} 
                  />
                } 
              />
              <Route 
                path="/admin-dashboard" 
                element={
                  <ProtectedRoute 
                    element={<AdminDashboard showAlert={showAlert} />}
                    allowedRoles={['admin']} 
                  />
                } 
              />
            </Routes>
          </main>

          {/* Global Alert Snackbar */}
          <Snackbar
            open={alert.open}
            autoHideDuration={6000}
            onClose={handleCloseAlert}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <Alert
              onClose={handleCloseAlert}
              severity={alert.severity}
              variant="filled"
              sx={{ width: "100%" }}
            >
              {alert.message}
            </Alert>
          </Snackbar>
        </Router>
      </PrimeReactProvider>
    </ThemeProvider>
  );
}
