import React from "react";
import { Container, Typography, Box, Button } from "@mui/material";

export default function About() {
  return (
    <Container maxWidth="md" sx={{ marginTop: 4, marginBottom: 4 }}>
      <Box
        sx={{
          padding: 4,
          backgroundColor: "#f5f5f5",
          borderRadius: 2,
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <Typography
          variant="h3"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "#0056b3",
            textTransform: "uppercase",
          }}
        >
          Enter Health Link: A Ray of Hope
        </Typography>
        <Typography
          variant="body1"
          sx={{
            marginTop: 2,
            color: "#4f4f4f",
            lineHeight: 1.8,
            textAlign: "justify",
          }}
        >
          This is where Health Link steps in – not just as another healthcare
          system, but as a comprehensive solution that understands the human
          side of healthcare. By integrating AI-driven technology with
          human-centered design, Health Link aims to:
        </Typography>
        <Box
          sx={{
            textAlign: "left",
            marginTop: 3,
            marginBottom: 3,
          }}
        >
          <ul>
            <li>
              <Typography variant="body1" sx={{ color: "#4f4f4f" }}>
                Make finding the right healthcare as easy as finding directions
                on your phone
              </Typography>
            </li>
            <li>
              <Typography variant="body1" sx={{ color: "#4f4f4f" }}>
                Ensure medical records follow patients wherever they go
              </Typography>
            </li>
            <li>
              <Typography variant="body1" sx={{ color: "#4f4f4f" }}>
                Transform resource management from guesswork to precision
              </Typography>
            </li>
            <li>
              <Typography variant="body1" sx={{ color: "#4f4f4f" }}>
                Help hospitals prepare for disease outbreaks before they peak
              </Typography>
            </li>
          </ul>
        </Box>
        <Typography
          variant="body1"
          sx={{
            marginBottom: 2,
            color: "#4f4f4f",
            lineHeight: 1.8,
            textAlign: "justify",
          }}
        >
          The goal isn't just to digitize healthcare – it's to humanize it. To
          ensure that stories like Fatima's become tales of the past, not daily
          realities of the present.
        </Typography>
        <Typography
          variant="body1"
          sx={{
            marginBottom: 3,
            color: "#4f4f4f",
            lineHeight: 1.8,
            textAlign: "justify",
          }}
        >
          This isn't just about implementing new technology; it's about
          transforming how millions of Pakistanis experience healthcare. It's
          about ensuring that when someone walks into a hospital, they find
          care, not confusion; help, not hurdles; and solutions, not more
          problems.
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            color: "#0056b3",
          }}
        >
          Health Link represents our commitment to changing these stories, one
          patient at a time.
        </Typography>
        <Button
          variant="contained"
          sx={{
            marginTop: 4,
            backgroundColor: "#0056b3",
            color: "#ffffff",
            padding: "10px 20px",
            textTransform: "none",
            "&:hover": {
              backgroundColor: "#003f87",
            },
          }}
        >
          Learn More
        </Button>
      </Box>
    </Container>
  );
}
