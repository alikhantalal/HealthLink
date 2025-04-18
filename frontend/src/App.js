import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { PrimeReactProvider } from "primereact/api";
import { ThemeProvider, CssBaseline, Snackbar, Alert } from "@mui/material";
import Navbar from "./components/Navbar";
import SlideShow from "./components/SlideShow";
import Features from "./components/Features";
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
import theme from "./theme";

export default function App() {
  // Alert state
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "info", // "success", "error", "warning", "info"
  });

  // Global alert handler
  const showAlert = (message, severity = "info") => {
    console.log("Showing alert:", message, severity);
    setAlert({
      open: true,
      message,
      severity,
    });
  };

  // Close alert
  const handleCloseAlert = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setAlert((prev) => ({ ...prev, open: false }));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PrimeReactProvider>
        <Router>
          {/* Global Navbar */}
          <Navbar />

          <main style={{ minHeight: "calc(100vh - 80px)" }}>
            <Routes>
              {/* Authentication Routes */}
              <Route path="/login" element={<Login showAlert={showAlert} />} />
              <Route path="/join-as-doctor" element={<DoctorSignup showAlert={showAlert} />} />
              <Route path="/about" element={<About />} />

              {/* Patient View */}
              <Route path="/patients" element={<PatientView />} />

              {/* Specialists */}
              <Route path="/specialists" element={<SpecialistsPage />} />
              <Route path="/find-specialists" element={<FindSpecialists />} />
              {/* Updated to use SpecialistDoctorsWithFilter */}
              <Route path="/specialists/:specialty" element={<SpecialistDoctorsWithFilter showAlert={showAlert} />} />
              <Route path="/doctor/:id" element={<DoctorProfile />} />
              <Route path="/book-appointment" element={<BookAppointmentPage />} />

              {/* Chatbot Route */}
              <Route path="/chatbot" element={<ChatBot />} />

              {/* Home Page */}
              <Route path="/" element={<HomePage />} />
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