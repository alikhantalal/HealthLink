import React from "react";
import SlideShow from "../components/SlideShow";
import Features from "../components/Features";
import HealthSearch from "../components/HealthSearch";
import { Box, Container } from "@mui/material";

const HomePage = () => {
  return (
    <>
      <SlideShow />
      
      {/* Add HealthSearch to home page */}
      <Container maxWidth="xl">
        <Box sx={{ mt: -6, position: "relative", zIndex: 10 }}>
          <HealthSearch />
        </Box>
      </Container>
      
      <Features />
    </>
  );
};

export default HomePage;