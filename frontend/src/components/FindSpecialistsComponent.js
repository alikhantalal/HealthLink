import React, { useState } from "react";
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Container,
  Tabs,
  Tab,
  Chip,
  InputBase,
  Avatar,
  alpha,
  useTheme,
  Button
} from "@mui/material";
import { 
  Search as SearchIcon,
  Star as StarIcon,
  ArrowForward as ArrowIcon,
  Psychology,
  LocalHospital,
  Medication,
  ChildCare,
  MonitorHeart,
  Visibility,
  Spa
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// Specialist categories with icons
const specialtyCategories = [
  { name: "Popular", icon: <StarIcon /> },
  { name: "Heart", icon: <MonitorHeart /> },
  { name: "Mind", icon: <Psychology /> },
  { name: "General", icon: <LocalHospital /> },
  { name: "Surgery", icon: <Medication /> },
  { name: "Children", icon: <ChildCare /> },
  { name: "Skin", icon: <Spa /> },
  { name: "Eye", icon: <Visibility /> },
];

const FindSpecialistsComponent = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("Islamabad");
  
  // Get active category name
  const activeCategory = specialtyCategories[activeTab].name;
  
  // Get specialties for active category
  const activeSpecialties = specialtiesByCategory[activeCategory];
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle specialty click
  const handleSpecialtyClick = (specialty) => {
    navigate(`/specialists/${specialty.toLowerCase().replace(/\s+/g, "-")}`);
  };
  
  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault(); // Prevent default form submission
    
    if (searchTerm.trim()) {
      // Navigate to specialists page with search query parameter
      navigate(`/specialists?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };
  
  // Handle input change
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle key press (for Enter key)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };
  
  return (
    <Box sx={{ py: 6, bgcolor: theme.palette.background.subtle }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ mb: 5, textAlign: "center" }}>
          <Typography 
            variant="h3" 
            component="h2"
            sx={{ 
              fontWeight: 700, 
              mb: 2,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: { xs: "2rem", md: "2.5rem" }
            }}
          >
            Find the Right Specialist
          </Typography>
          
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ 
              maxWidth: "600px", 
              mx: "auto", 
              mb: 4 
            }}
          >
            Connect with the best healthcare specialists in {selectedCity}. Book appointments instantly.
          </Typography>
          
          {/* Search Bar Form */}
          <form onSubmit={handleSearch}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                maxWidth: "600px",
                mx: "auto",
                p: 0.5,
                pl: 2,
                borderRadius: 3,
                bgcolor: "background.paper",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                border: "1px solid",
                borderColor: alpha(theme.palette.primary.main, 0.2),
                mb: 1,
                transition: "all 0.3s ease",
                "&:hover, &:focus-within": {
                  boxShadow: "0 4px 25px rgba(0,0,0,0.12)",
                  borderColor: alpha(theme.palette.primary.main, 0.4),
                },
              }}
            >
              <SearchIcon color="action" sx={{ mr: 1, color: "text.secondary" }} />
              <InputBase
                placeholder="Search for doctors, specialties, clinics..."
                value={searchTerm}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                sx={{ flexGrow: 1 }}
                inputProps={{ 'aria-label': 'search doctors and specialties' }}
              />
              <Button
                variant="contained"
                color="primary"
                type="submit"
                sx={{
                  borderRadius: "50px",
                  px: 3,
                  py: 1,
                  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                }}
              >
                Search
              </Button>
            </Box>
          </form>
          
          {/* City Selection Chips */}
          <Box 
            sx={{ 
              display: "flex", 
              justifyContent: "center", 
              gap: 1, 
              mt: 2 
            }}
          >
            {["Islamabad/Rawalpindi"].map((city) => (
              <Chip
                key={city}
                label={city}
                clickable
                onClick={() => setSelectedCity(city)}
                sx={{
                  borderRadius: "50px",
                  px: 1,
                  bgcolor: selectedCity === city ? "primary.main" : "background.paper",
                  color: selectedCity === city ? "white" : "text.primary",
                  fontWeight: 500,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  border: "1px solid",
                  borderColor: selectedCity === city 
                    ? "primary.main" 
                    : alpha(theme.palette.divider, 0.5),
                  "&:hover": {
                    bgcolor: selectedCity === city 
                      ? "primary.dark" 
                      : alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              />
            ))}
          </Box>
        </Box>
        
        {/* Specialty Categories Tabs */}
        <Box sx={{ mb: 6 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              mb: 4,
              "& .MuiTabs-indicator": {
                display: "none",
              },
              "& .MuiTabs-flexContainer": {
                gap: 2,
              },
            }}
          >
            {specialtyCategories.map((category, index) => (
              <Tab
                key={category.name}
                label={
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: activeTab === index 
                          ? "primary.main" 
                          : alpha(theme.palette.primary.light, 0.1),
                        color: activeTab === index 
                          ? "white" 
                          : "primary.main",
                        width: 56,
                        height: 56,
                        transition: "all 0.3s ease",
                        boxShadow: activeTab === index 
                          ? "0 4px 12px rgba(25, 118, 210, 0.3)" 
                          : "none",
                      }}
                    >
                      {category.icon}
                    </Avatar>
                    <Typography
                      variant="body2"
                      fontWeight={activeTab === index ? 600 : 400}
                      color={activeTab === index ? "primary.main" : "text.primary"}
                    >
                      {category.name}
                    </Typography>
                  </Box>
                }
                disableRipple
                sx={{
                  minWidth: "auto",
                  p: 0,
                  mr: 2,
                  opacity: 1,
                }}
              />
            ))}
          </Tabs>
          
          {/* Specialties Grid */}
          <Grid container spacing={2}>
            {activeSpecialties.map((specialty) => (
              <Grid item xs={12} sm={6} md={3} key={specialty}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: alpha(theme.palette.divider, 0.7),
                    bgcolor: "background.paper",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    "&:hover": {
                      borderColor: "primary.main",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      transform: "translateY(-3px)",
                    },
                  }}
                  onClick={() => handleSpecialtyClick(specialty)}
                >
                  <Typography fontWeight={500}>
                    {specialty}
                  </Typography>
                  <ArrowIcon
                    fontSize="small"
                    sx={{
                      color: "primary.main",
                      opacity: 0.7,
                    }}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
        
        {/* View All Specialists Section */}
        <Box 
          sx={{ 
            display: "flex", 
            justifyContent: "center", 
            mt: 6 
          }}
        >
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate("/specialists")}
            endIcon={<ArrowIcon />}
            sx={{
              borderRadius: "50px",
              px: 4,
              py: 1.5,
              fontWeight: 600,
              borderWidth: 2,
              "&:hover": {
                borderWidth: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
              },
            }}
          >
            Explore All Medical Specialties
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default FindSpecialistsComponent;

// Top specialties by category
const specialtiesByCategory = {
  "Popular": [
    "General Physician",
    "Dentist",
    "Dermatologist",
    "Gynecologist",
    "Pediatrician",
    "Orthopedic Surgeon",
    "Cardiologist",
    "Psychiatrist"
  ],
  "Heart": [
    "Cardiologist",
    "Cardiac Surgeon",
    "Cardiologist - Interventional",
    "Heart Transplant Specialist"
  ],
  "Mind": [
    "Psychiatrist",
    "Neurologist",
    "Psychologist",
    "Mental Health Specialist"
  ],
  "General": [
    "General Physician",
    "Family Physician",
    "Internal Medicine Specialist",
    "Consultant Physician"
  ],
  "Surgery": [
    "General Surgeon",
    "Laparoscopic Surgeon",
    "Orthopedic Surgeon",
    "Neurosurgeon",
    "Plastic Surgeon"
  ],
  "Children": [
    "Pediatrician",
    "Child Specialist",
    "Neonatologist",
    "Pediatric Surgeon"
  ],
  "Skin": [
    "Dermatologist",
    "Cosmetologist",
    "Skin Specialist",
    "Aesthetic Physician"
  ],
  "Eye": [
    "Ophthalmologist",
    "Eye Specialist",
    "LASIK Surgeon",
    "Retina Specialist"
  ]
};