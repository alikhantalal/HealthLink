import React from 'react';
import { Button } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';

/**
 * A super-simplified download button component that generates a plain text file
 * This version eliminates potential issues with file type or browser compatibility
 */
const DownloadAppointmentButton = ({ appointmentData }) => {
  const handleDownload = () => {
    // Basic validation
    if (!appointmentData) {
      alert("No appointment data available to download");
      return;
    }

    try {
      // Generate a simple text version of the appointment details
      const content = `
HEALTHLINK APPOINTMENT CONFIRMATION

Doctor: Dr. ${appointmentData.doctorName || "Abdullah Mir"}
Specialty: ${appointmentData.doctorSpecialty || "Neurologist"}

Patient: ${appointmentData.patientName || ""}
Date: ${new Date(appointmentData.appointmentDate).toLocaleDateString()}
Time: ${appointmentData.appointmentTime || ""}
Reason: ${appointmentData.reason || ""}
Fee: Rs. ${appointmentData.fee || "3999"}

Please arrive 15 minutes before your appointment.
HealthLink - Your Health, Our Priority
      `;

      // Create a download link for the text
      const element = document.createElement('a');
      const file = new Blob([content], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = "HealthLink_Appointment.txt";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error("Error generating download:", error);
      alert("Could not download appointment details. Please try again.");
    }
  };

  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<DownloadIcon />}
      fullWidth
      onClick={handleDownload}
      sx={{
        mt: 2,
        py: 1.5,
        borderRadius: 2,
        textTransform: 'none',
        fontWeight: 'medium'
      }}
    >
      Download Appointment Details
    </Button>
  );
};

export default DownloadAppointmentButton;