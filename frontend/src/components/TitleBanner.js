import React from "react";
import { Typography, Box } from "@mui/material";

const TitleBanner = () => {
  return (
    <Box sx={{ textAlign: "center", mt: 4 }}>
      <Typography variant="h4" fontWeight="bold">
        Find and Book the <span style={{ color: "#FF9800" }}>Best Doctors</span> near you
      </Typography>
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          backgroundColor: "#8D6E63",
          color: "#fff",
          borderRadius: "20px",
          padding: "5px 15px",
          mt: 2,
          fontSize: "14px",
        }}
      >
        ✅ 50M+ patients served
      </Box>
    </Box>
  );
};

export default TitleBanner;
