import React from "react";
import { Container, Typography, Box } from "@mui/material";

export default function About() {
  return (
    <Container maxWidth="md" sx={{ marginTop: 6, marginBottom: 6 }}>
      <Box
        sx={{
          padding: 4,
          backgroundColor: "#ffffff",
          borderRadius: 3,
          boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        {/* Heading */}
        <Typography
          variant="h3"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "#0056b3",
            textTransform: "uppercase",
            marginBottom: 2,
          }}
        >
          Your Bridge to Better Healthcare
        </Typography>

        {/* Introduction */}
        <Typography
          variant="body1"
          sx={{
            color: "#4f4f4f",
            lineHeight: 1.8,
            textAlign: "justify",
          }}
        >
          Health Link is a smart and user-friendly healthcare platform designed
          to seamlessly connect patients with the right medical professionals.
          Whether you know what you're looking for or just need guidance, our
          system has you covered.
        </Typography>

        {/* Features List */}
        <Box
          sx={{
            textAlign: "left",
            marginTop: 4,
            marginBottom: 4,
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: "medium", marginBottom: 2, color: "#0056b3" }}
          >
            What Health Link Offers:
          </Typography>
          <ul style={{ paddingLeft: "1.5rem" }}>
            <li>
              <Typography variant="body1" sx={{ color: "#4f4f4f", mb: 1 }}>
                🔍 Instantly search and find verified medical specialists
              </Typography>
            </li>
            <li>
              <Typography variant="body1" sx={{ color: "#4f4f4f", mb: 1 }}>
                🤖 Use our AI-powered chatbot to input symptoms and receive a
                predicted diagnosis with specialist recommendations
              </Typography>
            </li>
            <li>
              <Typography variant="body1" sx={{ color: "#4f4f4f", mb: 1 }}>
                🩺 Doctors can register and connect with patients across the country
              </Typography>
            </li>
            <li>
              <Typography variant="body1" sx={{ color: "#4f4f4f" }}>
                🌐 A seamless experience that bridges the gap between patients and
                care providers
              </Typography>
            </li>
          </ul>
        </Box>

        {/* Closing */}
        <Typography
          variant="body1"
          sx={{
            color: "#4f4f4f",
            lineHeight: 1.8,
            textAlign: "justify",
            marginBottom: 3,
          }}
        >
          Our mission is to make healthcare simple, intelligent, and accessible.
          Whether you're seeking care or offering it, Health Link is your trusted
          companion in navigating the healthcare journey — smarter, faster, and
          more human.
        </Typography>

        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            color: "#0056b3",
            textDecoration: "underline",
          }}
        >
          Join us in redefining how Pakistan experiences healthcare.
        </Typography>
      </Box>
    </Container>
  );
}
