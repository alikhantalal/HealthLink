import React, { useEffect } from "react";
import { Container } from "@mui/material";
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
      {/* AI Chatbot for symptom analysis */}
      <ChatBot />
      
      {/* Find Specialists Component */}
      <FindSpecialistsComponent />
    </Container>
  );
};

export default PatientView;