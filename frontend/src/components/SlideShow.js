import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper,
  Fade,
  Grid,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { 
  CalendarMonth as CalendarIcon,
  Search as SearchIcon,
  HealthAndSafety as HealthIcon 
} from "@mui/icons-material";

// Enhanced background images with overlay
const slides = [
  {
    image: "https://images.pexels.com/photos/9741487/pexels-photo-9741487.jpeg",
    title: "Connecting Patients with Care",
    subtitle: "Access quality healthcare services anytime, anywhere",
    cta: "Find a Doctor",
    icon: <SearchIcon />,
    path: "/patients"
  },
  {
    image: "https://images.pexels.com/photos/6129655/pexels-photo-6129655.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    title: "Book Appointments Online",
    subtitle: "Schedule your visit in just a few clicks",
    cta: "Book Now",
    icon: <CalendarIcon />,
    path: "/book-appointment"
  },
  {
    image: "https://images.pexels.com/photos/7108319/pexels-photo-7108319.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    title: "Healthcare Made Simple",
    subtitle: "Streamlined solutions for patients and providers",
    cta: "Explore Features",
    icon: <HealthIcon />,
    path: "/about"
  },
];

// Feature cards to display below hero section
const features = [
  {
    title: "Find Specialists",
    description: "Connect with top doctors across all specialties",
    color: "#1976d2",
  },
  {
    title: "Book Appointments",
    description: "Schedule visits with just a few clicks",
    color: "#00bfa5",
  },
  {
    title: "AI Diagnosis",
    description: "Get preliminary health insights through our AI Assistant",
    color: "#ff9800",
  },
];

export default function SlideShow() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fade, setFade] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  // Preload images
  useEffect(() => {
    slides.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
    });
  }, []);

  // Handle slide transition with fade effect
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setFade(true);
      }, 500);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const currentSlideData = slides[currentSlide];

  return (
    <Box sx={{ position: "relative" }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          height: { xs: "calc(100vh - 70px)", sm: "80vh" },
          maxHeight: "800px",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url(${currentSlideData.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transition: "opacity 1s ease-in-out",
            "&::after": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              background: "linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0.3) 100%)",
            }
          }}
        />

        {/* Slide Navigation Indicators */}
        <Box
          sx={{
            position: "absolute",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1,
            display: "flex",
            gap: 1.5,
          }}
        >
          {slides.map((_, index) => (
            <Box
              key={index}
              onClick={() => {
                setFade(false);
                setTimeout(() => {
                  setCurrentSlide(index);
                  setFade(true);
                }, 500);
              }}
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: currentSlide === index ? "white" : "rgba(255, 255, 255, 0.5)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "scale(1.2)",
                  backgroundColor: "white",
                },
              }}
            />
          ))}
        </Box>

        <Container
          maxWidth="lg"
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Fade in={fade} timeout={800}>
            <Grid 
              container 
              spacing={4}
              alignItems="center"
              sx={{ 
                height: "100%",
                pt: { xs: 6, md: 0 },
                pb: { xs: 8, md: 0 }
              }}
            >
              <Grid 
                item 
                xs={12} 
                md={7} 
                sx={{
                  textAlign: { xs: "center", md: "left" },
                }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    color: "white",
                    fontWeight: 800,
                    fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4rem" },
                    textShadow: "0px 2px 4px rgba(0, 0, 0, 0.3)",
                    mb: 2,
                    lineHeight: 1.1,
                  }}
                >
                  {currentSlideData.title}
                </Typography>
                
                <Typography
                  variant="h5"
                  sx={{
                    color: "rgba(255, 255, 255, 0.9)",
                    mb: 4,
                    textShadow: "0px 1px 2px rgba(0, 0, 0, 0.3)",
                    maxWidth: { md: "80%" },
                  }}
                >
                  {currentSlideData.subtitle}
                </Typography>
                
                <Button
                  variant="contained"
                  size="large"
                  color="primary"
                  startIcon={currentSlideData.icon}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: "1.1rem",
                    boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.3)",
                    backdropFilter: "blur(10px)",
                    backgroundColor: "rgba(25, 118, 210, 0.9)",
                    "&:hover": {
                      backgroundColor: "primary.main",
                      transform: "translateY(-3px)",
                      boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.4)",
                    },
                  }}
                >
                  {currentSlideData.cta}
                </Button>
              </Grid>
              
              {!isMobile && (
                <Grid item md={5}>
                  {/* Could add some floating illustration or animation here */}
                </Grid>
              )}
            </Grid>
          </Fade>
        </Container>
      </Box>
      
      {/* Feature cards grid */}
      <Container maxWidth="lg" sx={{ mt: -6, position: "relative", zIndex: 2, mb: 6 }}>
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                elevation={4}
                sx={{
                  borderRadius: 3,
                  p: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  position: "relative",
                  overflow: "hidden",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 16px 30px rgba(0,0,0,0.1)",
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "5px",
                    height: "100%",
                    background: feature.color,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                    background: `linear-gradient(135deg, ${feature.color}22, ${feature.color}44)`,
                  }}
                >
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: "8px",
                      backgroundColor: feature.color,
                    }}
                  />
                </Box>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ mb: 1 }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                >
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}