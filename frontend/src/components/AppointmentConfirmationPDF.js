import React from 'react';
import { Button } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';

/**
 * PDF Download component for appointment confirmation
 * Uses server-side PDF generation via form submission
 */
const AppointmentConfirmationPDF = ({ appointmentData }) => {
  const handleDownload = () => {
    try {
      // Create a form to submit a POST request to generate PDF server-side
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = '/api/generate-appointment-pdf'; // Backend endpoint for PDF generation
      form.target = '_blank'; // Open in new tab
      form.style.display = 'none';

      // Add appointment data as hidden form fields
      const addField = (name, value) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value || '';
        form.appendChild(input);
      };

      // Add all appointment data fields
      addField('doctorName', appointmentData.doctorName);
      addField('doctorSpecialty', appointmentData.doctorSpecialty);
      addField('patientName', appointmentData.patientName);
      addField('patientEmail', appointmentData.patientEmail);
      addField('patientPhone', appointmentData.patientPhone);
      addField('appointmentDate', appointmentData.appointmentDate);
      addField('appointmentTime', appointmentData.appointmentTime);
      addField('reason', appointmentData.reason);
      addField('fee', appointmentData.fee);
      addField('clinicAddress', appointmentData.clinicAddress);
      addField('notes', appointmentData.notes);

      // Submit the form to trigger PDF generation
      document.body.appendChild(form);
      form.submit();
      
      // Clean up after submission
      setTimeout(() => {
        document.body.removeChild(form);
      }, 100);

      console.log("PDF generation request sent to server");
    } catch (error) {
      console.error("PDF download error:", error);
      alert("There was an error generating the PDF. Please try again.");
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

export default AppointmentConfirmationPDF;