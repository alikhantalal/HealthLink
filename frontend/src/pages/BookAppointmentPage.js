import React, { useState } from "react";
import { Button, Container, Typography, Box } from "@mui/material";
import BookAppointmentModal from "../components/BookAppointmentModal";

const BookAppointmentPage = () => {
  const [open, setOpen] = useState(false);

  return (
    <Container maxWidth="md" sx={{ textAlign: "center", py: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Book Your Appointment
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Schedule a consultation with our healthcare specialists
        </Typography>
      </Box>
      
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={() => setOpen(true)}
        sx={{ 
          py: 1.5, 
          px: 4, 
          borderRadius: 2,
          boxShadow: "0 4px 12px rgba(25, 118, 210, 0.2)"
        }}
      >
        Book Appointment
      </Button>

      {/* Modal Popup */}
      <BookAppointmentModal open={open} handleClose={() => setOpen(false)} />
    </Container>
  );
};

export default BookAppointmentPage;