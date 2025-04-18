import React, { useState } from "react";
import { 
  Box, 
  Typography, 
  Grid, 
  Link, 
  Paper, 
  Container,
  Tabs,
  Tab,
  Chip,
  Card,
  CardContent,
  IconButton,
  InputBase,
  Avatar,
  Rating,
  Divider,
  alpha,
  useTheme,
  Button
} from "@mui/material";
import { 
  Search as SearchIcon,
  Star as StarIcon,
  Verified as VerifiedIcon,
  LocationOn as LocationIcon,
  MedicalServices as MedicalIcon,
  ArrowForward as ArrowIcon,
  Psychology,
  LocalHospital,
  Medication,
  Vaccines,
  ChildCare,
  MonitorHeart,
  Visibility,
  Spa,
  AccessTime as TimeIcon,
  Event as EventIcon,
  AttachMoney as MoneyIcon
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
  
  // Handle doctor card click
  const handleDoctorClick = (doctorId) => {
    navigate(`/doctor/${doctorId}`);
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
          
          {/* Search Bar */}
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
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant="contained"
              color="primary"
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
          
          {/* City Selection Chips */}
          <Box 
            sx={{ 
              display: "flex", 
              justifyContent: "center", 
              gap: 1, 
              mt: 2 
            }}
          >
            {["Islamabad", "Rawalpindi", "Lahore"].map((city) => (
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
        
        {/* Featured Doctors Section */}
        <Box sx={{ mt: 8, mb: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
            <Typography variant="h4" fontWeight="bold">
              Top Rated Doctors
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              endIcon={<ArrowIcon />}
              onClick={() => navigate("/specialists")}
              sx={{
                borderRadius: 2,
                fontWeight: 500,
              }}
            >
              View All
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            {featuredDoctors.map((doctor) => (
              <Grid item xs={12} md={4} key={doctor.id}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: alpha(theme.palette.divider, 0.7),
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
                      "& .doctor-image": {
                        transform: "scale(1.05)",
                      },
                    },
                  }}
                >
                  {/* Doctor Image */}
                  <Box
                    sx={{
                      position: "relative",
                      height: 200,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      className="doctor-image"
                      sx={{
                        width: "100%",
                        height: "100%",
                        backgroundImage: `url(${doctor.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        transition: "transform 0.5s ease",
                      }}
                    />
                    {doctor.verified && (
                      <Chip
                        icon={<VerifiedIcon sx={{ fontSize: 16 }} />}
                        label="Verified"
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          bgcolor: alpha("#ffffff", 0.9),
                          color: "primary.main",
                          fontWeight: 500,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                      />
                    )}
                  </Box>
                  
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <Box>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {doctor.name}
                        </Typography>
                        <Typography color="text.secondary" variant="body2" gutterBottom>
                          {doctor.specialty} • {doctor.experience} yrs exp.
                        </Typography>
                      </Box>
                      
                      <Box 
                        sx={{ 
                          display: "flex", 
                          alignItems: "center", 
                          bgcolor: alpha(theme.palette.warning.main, 0.1),
                          px: 1,
                          py: 0.5,
                          borderRadius: 1
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          fontWeight="bold"
                          color="warning.dark"
                          sx={{ mr: 0.5 }}
                        >
                          {doctor.rating}
                        </Typography>
                        <StarIcon 
                          sx={{ 
                            color: theme.palette.warning.main,
                            fontSize: 18
                          }} 
                        />
                      </Box>
                    </Box>
                    
                    <Box 
                      sx={{ 
                        display: "flex", 
                        alignItems: "center",
                        mt: 1
                      }}
                    >
                      <LocationIcon 
                        fontSize="small" 
                        sx={{ 
                          color: "text.secondary",
                          mr: 0.5,
                          fontSize: 18
                        }} 
                      />
                      <Typography variant="body2" color="text.secondary">
                        {doctor.location}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <EventIcon 
                            fontSize="small" 
                            sx={{ 
                              color: doctor.availability.includes("Today") 
                                ? "success.main" 
                                : "text.secondary",
                              mr: 0.5,
                              fontSize: 18
                            }} 
                          />
                          <Typography 
                            variant="body2" 
                            color={
                              doctor.availability.includes("Today") 
                                ? "success.main" 
                                : "text.secondary"
                            }
                            fontWeight={
                              doctor.availability.includes("Today") ? 600 : 400
                            }
                          >
                            {doctor.availability}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <MoneyIcon 
                            fontSize="small" 
                            sx={{ 
                              color: "primary.main",
                              mr: 0.5,
                              fontSize: 18
                            }} 
                          />
                          <Typography variant="body2" fontWeight={500}>
                            Rs. {doctor.fee}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleDoctorClick(doctor.id)}
                      sx={{
                        borderRadius: "50px",
                        py: 1,
                        boxShadow: "0 4px 12px rgba(25, 118, 210, 0.2)",
                      }}
                    >
                      Book Appointment
                    </Button>
                  </CardContent>
                </Card>
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

// Featured doctors data
const featuredDoctors = [
  {
    id: "doc1",
    name: "Dr. Sarah Ahmed",
    specialty: "Cardiologist",
    experience: 15,
    rating: 4.9,
    totalRatings: 235,
    verified: true,
    location: "Islamabad Medical Complex",
    availability: "Available Today",
    fee: 3000,
    image: "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  },
  {
    id: "doc2",
    name: "Dr. Ali Hassan",
    specialty: "Orthopedic Surgeon",
    experience: 12,
    rating: 4.8,
    totalRatings: 187,
    verified: true,
    location: "Capital Health Center",
    availability: "Tomorrow",
    fee: 2500,
    image: "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  },
  {
    id: "doc3",
    name: "Dr. Ayesha Khan",
    specialty: "Dermatologist",
    experience: 8,
    rating: 4.7,
    totalRatings: 156,
    verified: true,
    location: "Rawalpindi Medical Center",
    availability: "Available Today",
    fee: 2800,
    image: "https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  }
];