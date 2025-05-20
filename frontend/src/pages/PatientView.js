import React, { useEffect } from "react";
import { Container, Box } from "@mui/material";
import ChatBot from "../components/ChatBot"; 
import FindSpecialistsComponent from "../components/FindSpecialistsComponent";

const PatientView = () => {
  // Reset scroll position when the component mounts
  useEffect(() => {
    // Scroll to top of page when component mounts
    window.scrollTo(0, 0);
    
    // Prevent auto-scrolling behavior
    document.body.style.overflow = 'auto';
    
    return () => {
      // Clean up
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        mt: 4, 
        mb: 8
      }}
    >
      {/* ChatBot with fixed height container to prevent layout shifts */}
      <Box 
        sx={{ 
          height: 'auto',
          minHeight: 600, // Set a minimum height
          position: 'relative',
          mb: 4
        }}
      >
        <ChatBot />
      </Box>
      
      {/* Find Specialists Component */}
      <FindSpecialistsComponent />
    </Container>
  );
};

export default PatientView;