import React, { useState, useEffect } from "react";
import {
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Avatar, 
  Chip, 
  Button, 
  TextField, 
  CircularProgress,
  Paper,
  InputAdornment,
  Alert,
  useTheme,
  alpha,
  Divider,
  Rating
} from "@mui/material";
import { 
  Search as SearchIcon, 
  LocationOn as LocationIcon,
  MedicalServices as MedicalIcon,
  School as SchoolIcon,
  MonetizationOn as PriceIcon,
  Workspaces as ExperienceIcon,
  LocalHospital as HospitalIcon,
  StarRate as StarIcon,
  Sort as SortIcon,
  FilterList as FilterIcon,
  VerifiedUser as VerifiedIcon
} from "@mui/icons-material";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import BookAppointmentModal from "../components/BookAppointmentModal";
import axios from 'axios';

// Use direct axios calls to debug
const API_BASE_URL = 'http://localhost:5000';

const SpecialistDoctorsWithFilter = ({ showAlert }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { specialty } = useParams();
  const location = useLocation();
  
  // Extract search query from URL if present
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('search');
  
  // State
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(searchQuery || '');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  
  // Format specialty name for display
  const getFormattedTitle = () => {
    // If we have a specialization from search or URL
    const specialtyName = specialty 
      ? specialty.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') 
      : searchQuery ? searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1) : null;
    
    if (specialtyName) {
      // Check if specialtyName already ends with "ist" (like Dentist)
      if (specialtyName.toLowerCase().endsWith('ist')) {
        return `${specialtyName}s in Islamabad/Rawalpindi`;
      } else {
        // For other specialties
        return `${specialtyName} Specialists in Islamabad/Rawalpindi`;
      }
    }
    
    return "Medical Specialists in Islamabad/Rawalpindi";
  };

  // Get formatted title
  const pageTitle = getFormattedTitle();
  
  // DIRECT API CALL - bypassing the service for debugging
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build the query string - direct approach
        const query = searchQuery || (specialty ? specialty.replace(/-/g, ' ') : '');
        let apiUrl = `${API_BASE_URL}/api/fetchdoctorsdata`;
        
        // Only add the query parameter if we have a search term
        if (query && query.trim() !== '') {
          apiUrl += `?specialization=${encodeURIComponent(query.trim())}`;
        }
        
        console.log('Making API request to:', apiUrl);
        
        // Make the direct API call
        const response = await axios.get(apiUrl);
        
        console.log('API Response:', response.data);
        
        // Check for success and data
        if (response.data.success && response.data.data) {
          setDoctors(response.data.data);
        } else {
          setDoctors([]);
          setError("No doctors found matching your criteria");
        }
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError("Failed to load doctors. Please try again.");
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDoctors();
  }, [specialty, searchQuery]);
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Update URL with search query
      navigate(`/specialists?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };
  
  // Open booking modal with selected doctor
  const handleBookAppointment = (doctor) => {
    setSelectedDoctor(doctor);
    setBookingModalOpen(true);
  };
  
  // Close booking modal
  const handleCloseBookingModal = () => {
    setBookingModalOpen(false);
  };
  
  // Format experience text
  const getExperienceText = (experience) => {
    if (!experience) return null;
    
    // Handle cases where experience is a year number (e.g. 2017)
    if (experience > 1900) {
      const yearsExperience = new Date().getFullYear() - experience;
      return `${yearsExperience}+ Years Experience`;
    }
    
    // Normal experience number
    if (experience > 0) {
      return `${experience} Years Experience`;
    }
    
    return null;
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with Search */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 4 },
          mb: 4,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.light, 0.15)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative elements */}
        <Box 
          sx={{ 
            position: 'absolute', 
            right: -20, 
            top: -20, 
            width: 120, 
            height: 120, 
            borderRadius: '50%', 
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            zIndex: 0
          }} 
        />
        <Box 
          sx={{ 
            position: 'absolute', 
            left: 30, 
            bottom: -30, 
            width: 80, 
            height: 80, 
            borderRadius: '50%', 
            bgcolor: alpha(theme.palette.secondary.main, 0.1),
            zIndex: 0
          }} 
        />
      
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            fontWeight="bold"
            sx={{ 
              color: "text.primary",
              fontSize: { xs: '1.75rem', md: '2.25rem' }
            }}
          >
            {pageTitle}
          </Typography>
          
          <Typography 
            variant="subtitle1" 
            color="text.secondary"
            sx={{ mb: 3, maxWidth: '70%' }}
          >
            Find and book appointments with the best {searchQuery || specialty || 'medical'} specialists in your area
          </Typography>
          
          {/* Search Form */}
          <form onSubmit={handleSearch}>
            <Box sx={{ 
              display: "flex", 
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              maxWidth: '90%'
            }}>
              <TextField
                fullWidth
                placeholder="Search by name, specialization, qualification..."
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: "background.paper",
                    boxShadow: '0px 3px 10px rgba(0,0,0,0.05)'
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SearchIcon />}
                sx={{ 
                  borderRadius: 2, 
                  px: 3,
                  minWidth: { xs: '100%', sm: 'auto' }
                }}
              >
                Search
              </Button>
            </Box>
          </form>
        </Box>
      </Paper>
      
      {/* Results Section */}
      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 10 }}>
          <CircularProgress size={48} sx={{ mb: 3, color: theme.palette.primary.main }} />
          <Typography variant="h6" color="text.secondary">
            Finding the best specialists for you...
          </Typography>
        </Box>
      ) : error ? (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      ) : doctors.length === 0 ? (
        <Paper
          elevation={0}
          sx={{ 
            p: 4, 
            textAlign: 'center', 
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.background.paper, 0.7)
          }}
        >
          <HospitalIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.secondary, 0.3), mb: 2 }} />
          <Typography variant="h5" gutterBottom fontWeight="medium">
            No specialists found
          </Typography>
          <Typography color="text.secondary" paragraph>
            We couldn't find any specialists matching your search criteria.
          </Typography>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => navigate('/specialists')}
            sx={{ mt: 2 }}
          >
            View All Specialists
          </Button>
        </Paper>
      ) : (
        <>
          {/* Results Header */}
          <Box 
            sx={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              mb: 3, 
              px: 2,
              flexWrap: 'wrap',
              gap: 2
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight="medium">
                {doctors.length} {doctors.length === 1 ? "specialist" : "specialists"} found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available for consultation in Islamabad/Rawalpindi
              </Typography>
            </Box>
            
            {/* Sorting options - for future enhancement */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                icon={<FilterIcon fontSize="small" />} 
                label="Filters"
                variant="outlined"
                onClick={() => {}}
                sx={{ 
                  borderRadius: 2,
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
                }}
              />
              <Chip 
                icon={<SortIcon fontSize="small" />} 
                label="Sort by: Relevance"
                variant="outlined"
                onClick={() => {}}
                sx={{ 
                  borderRadius: 2,
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
                }}
              />
            </Box>
          </Box>
          
          {/* Doctors List */}
          <Grid container spacing={3}>
            {doctors.map((doctor) => (
              <Grid item xs={12} key={doctor._id}>
                <Card 
                  elevation={0}
                  sx={{ 
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': {
                      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.12)}`,
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Grid container spacing={3}>
                      {/* Doctor Avatar/Image */}
                      <Grid item xs={12} sm={2} sx={{ display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
                        <Box sx={{ position: 'relative' }}>
                          <Avatar
                            src={doctor.profile}
                            alt={doctor.name}
                            sx={{ 
                              width: 100, 
                              height: 100,
                              border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                            }}
                          >
                            {doctor.name ? doctor.name.charAt(0) : "D"}
                          </Avatar>
                          
                          {/* Verified badge for every doctor */}
                          <Chip
                            icon={<VerifiedIcon fontSize="small" />}
                            label="Verified"
                            size="small"
                            color="primary"
                            sx={{ 
                              position: 'absolute',
                              bottom: -10,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              borderRadius: '50px',
                              fontSize: '0.7rem',
                              height: 24
                            }}
                          />
                        </Box>
                      </Grid>
                      
                      {/* Doctor Info */}
                      <Grid item xs={12} sm={7}>
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                          <Typography variant="h6" component="h2" fontWeight="bold">
                            {doctor.name}
                          </Typography>
                          
                          {/* Simulated rating */}
                          <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                            <Rating 
                              value={4 + Math.random()} 
                              precision={0.5} 
                              readOnly 
                              size="small"
                              sx={{ color: theme.palette.warning.main }}
                            />
                            <Typography variant="body2" sx={{ ml: 0.5, color: 'text.secondary' }}>
                              {(4 + Math.random()).toFixed(1)}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                          <MedicalIcon 
                            fontSize="small" 
                            sx={{ mr: 1, color: theme.palette.primary.main }} 
                          />
                          <Typography variant="body1" fontWeight={500}>
                            {doctor.specialization || "Specialist"}
                          </Typography>
                        </Box>
                        
                        {doctor.qualification && (
                          <Box sx={{ display: "flex", alignItems: "flex-start", mb: 1 }}>
                            <SchoolIcon 
                              fontSize="small" 
                              sx={{ mr: 1, mt: 0.3, color: theme.palette.secondary.main }} 
                            />
                            <Typography variant="body2" color="text.secondary">
                              {Array.isArray(doctor.qualification) 
                                ? doctor.qualification.join(', ') 
                                : doctor.qualification}
                            </Typography>
                          </Box>
                        )}
                        
                        {/* Experience - only show if available */}
                        {getExperienceText(doctor.experience) && (
                          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                            <ExperienceIcon 
                              fontSize="small" 
                              sx={{ mr: 1, color: theme.palette.success.main }} 
                            />
                            <Typography variant="body2" fontWeight="medium" color="text.secondary">
                              {getExperienceText(doctor.experience)}
                            </Typography>
                          </Box>
                        )}
                        
                        {/* Location */}
                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                          <LocationIcon 
                            fontSize="small" 
                            sx={{ mr: 1, color: theme.palette.error.light }} 
                          />
                          <Typography variant="body2" color="text.secondary">
                            {Math.random() > 0.5 ? 'Islamabad' : 'Rawalpindi'}, Pakistan
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
                          {doctor.specialization && (
                            <Chip 
                              size="small" 
                              label={doctor.specialization} 
                              sx={{ 
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                                fontWeight: 500,
                                borderRadius: '50px'
                              }} 
                            />
                          )}
                          
                          {/* Additional specialization chips could be added here */}
                        </Box>
                      </Grid>
                      
                      {/* Action Buttons */}
                      <Grid item xs={12} sm={3} sx={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 2 }}>
                        <Box sx={{ 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center", 
                          mb: 2,
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.success.main, 0.1),
                        }}>
                          <PriceIcon sx={{ color: theme.palette.success.main, mr: 1 }} />
                          <Typography variant="h6" color="success.main" fontWeight="bold">
                            Rs. {doctor.fee || "2,000"}
                          </Typography>
                        </Box>
                        
                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          onClick={() => handleBookAppointment(doctor)}
                          sx={{ 
                            borderRadius: 2,
                            py: 1.5,
                            fontWeight: "bold",
                            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                          }}
                        >
                          Book Appointment
                        </Button>
                        
                        <Button
                          variant="outlined"
                          fullWidth
                          onClick={() => navigate(`/doctor/${doctor._id}`)}
                          sx={{ 
                            borderRadius: 2,
                            py: 1.5
                          }}
                        >
                          View Profile
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
      
      {/* Booking Modal */}
      {selectedDoctor && (
        <BookAppointmentModal
          open={bookingModalOpen}
          handleClose={handleCloseBookingModal}
          doctorData={selectedDoctor}
        />
      )}
    </Container>
  );
};

export default SpecialistDoctorsWithFilter;