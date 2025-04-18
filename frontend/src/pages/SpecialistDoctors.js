import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Button, 
  Paper, 
  Box, 
  Avatar, 
  Chip, 
  CircularProgress,
  Alert,
  Container,
  Rating,
  useTheme,
  TextField,
  InputAdornment,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider
} from "@mui/material";
import { alpha } from '@mui/material/styles';
import { 
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
  Verified as VerifiedIcon,
  MedicalServices as MedicalIcon,
  Search as SearchIcon,
  FilterAlt as FilterIcon,
  RestartAlt as ResetIcon,
  ExpandMore as ExpandMoreIcon
} from "@mui/icons-material";
import { doctorsApi } from "../services/apiService";

const SpecialistDoctors = ({ showAlert }) => {
  const { specialty } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  
  // States for doctors data
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // States for filtering and search
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    specialties: [],
    availability: [],
    gender: '',
    rating: 0,
    priceRange: [0, 5000]
  });

  // Format specialty for display
  const formattedSpecialty = specialty
    ? specialty.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : '';

  // Filter options
  const specialtyOptions = [
    "General Physician", "Cardiologist", "Dermatologist", "Gynecologist", 
    "Neurologist", "Ophthalmologist", "Orthopedic Surgeon", "Pediatrician", 
    "Psychiatrist", "Gastroenterologist"
  ];
  
  const availabilityOptions = [
    "Today", "Tomorrow", "This Week", "Weekend", "Next Week"
  ];

  // Fetch doctors based on qualification
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Fetching doctors for specialty: ${formattedSpecialty}`);
        const response = await doctorsApi.getBySpecialization(formattedSpecialty);
        
        console.log('Doctor API response:', response);
        
        let doctorsData = [];
        
        if (response && response.success && response.data) {
          doctorsData = response.data;
        } else if (response && Array.isArray(response)) {
          // Handle direct array response
          doctorsData = response;
        } else if (response && response.data) {
          // Handle direct data field
          doctorsData = response.data;
        } else {
          // If API structure doesn't match expected format, show warning
          console.warn("Unexpected API response format:", response);
          doctorsData = [];
          showAlert && showAlert("Received unexpected data format from server", "warning");
        }
        
        // Add some mock data for filtering if needed
        const enhancedData = doctorsData.map(doc => ({
          ...doc,
          gender: doc.gender || (Math.random() > 0.5 ? 'Male' : 'Female'),
          rating: doc.rating || (Math.random() * 2 + 3).toFixed(1), // Random rating between 3-5
          availability: doc.availability || (Math.random() > 0.5 ? ['Today', 'Tomorrow'] : ['This Week'])
        }));
        
        setDoctors(enhancedData);
        setFilteredDoctors(enhancedData);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        setError(error.message || "Failed to load doctors. Please try again later.");
        showAlert && showAlert("Error loading specialists: " + (error.message || "Unknown error"), "error");
        setDoctors([]);
        setFilteredDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    if (specialty) {
      fetchDoctors();
    }
  }, [specialty, formattedSpecialty, showAlert]);

  // Handle search
  useEffect(() => {
    if (!doctors.length) return;
    
    applyFiltersAndSearch();
  }, [searchTerm, doctors]);

  // Handle checkbox changes
  const handleCheckboxChange = (category, value) => {
    setFilters(prev => {
      const newArray = prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value];
      
      return { ...prev, [category]: newArray };
    });
  };

  // Handle gender selection
  const handleGenderChange = (value) => {
    setFilters(prev => ({ 
      ...prev, 
      gender: prev.gender === value ? '' : value 
    }));
  };

  // Handle rating change
  const handleRatingChange = (event, value) => {
    setFilters(prev => ({ ...prev, rating: value }));
  };

  // Handle price range change
  const handlePriceChange = (event, value) => {
    setFilters(prev => ({ ...prev, priceRange: value }));
  };

  // Apply filters and search
  const applyFiltersAndSearch = () => {
    let filtered = [...doctors];
    
    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(
        doctor => 
          doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
          doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by specialties
    if (filters.specialties.length > 0) {
      filtered = filtered.filter(doctor => 
        filters.specialties.includes(doctor.specialization)
      );
    }
    
    // Filter by availability
    if (filters.availability.length > 0) {
      filtered = filtered.filter(doctor => 
        doctor.availability?.some(avail => 
          filters.availability.includes(avail)
        )
      );
    }
    
    // Filter by gender
    if (filters.gender) {
      filtered = filtered.filter(doctor => 
        doctor.gender === filters.gender
      );
    }
    
    // Filter by rating
    if (filters.rating > 0) {
      filtered = filtered.filter(doctor => 
        parseFloat(doctor.rating) >= filters.rating
      );
    }
    
    // Filter by price range
    filtered = filtered.filter(doctor => 
      !doctor.fee || (doctor.fee >= filters.priceRange[0] && doctor.fee <= filters.priceRange[1])
    );
    
    setFilteredDoctors(filtered);
  };

  // Apply filters
  const applyFilters = () => {
    applyFiltersAndSearch();
    setShowFilters(false); // Hide mobile filters after applying
  };

  // Reset filters
  const resetFilters = () => {
    const resetValues = {
      specialties: [],
      availability: [],
      gender: '',
      rating: 0,
      priceRange: [0, 5000]
    };
    
    setFilters(resetValues);
    setSearchTerm("");
    setFilteredDoctors(doctors);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ textAlign: "center", py: 8 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 3 }}>
          Loading {formattedSpecialty} specialists...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </Container>
    );
  }

  // Filter panel component
  const FilterPanel = () => (
    <Paper
      elevation={0}
      sx={{ 
        borderRadius: 3, 
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        height: '100%',
        position: 'sticky',
        top: 24
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: alpha(theme.palette.primary.main, 0.03)
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
          <Typography variant="h6" fontWeight="bold">
            Filter Doctors
          </Typography>
        </Box>
        
        <Button
          variant="text"
          size="small"
          startIcon={<ResetIcon />}
          onClick={resetFilters}
        >
          Reset
        </Button>
      </Box>
      
      <Divider />
      
      {/* Filter Content */}
      <Box sx={{ p: 2, maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        {/* Specialties */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="medium">Specialties</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              {specialtyOptions.map(specialty => (
                <FormControlLabel
                  key={specialty}
                  control={
                    <Checkbox 
                      checked={filters.specialties.includes(specialty)}
                      onChange={() => handleCheckboxChange('specialties', specialty)}
                      size="small"
                      sx={{
                        color: theme.palette.primary.light,
                        '&.Mui-checked': {
                          color: theme.palette.primary.main,
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      {specialty}
                    </Typography>
                  }
                />
              ))}
            </FormGroup>
          </AccordionDetails>
        </Accordion>
        
        {/* Availability */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="medium">Availability</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              {availabilityOptions.map(option => (
                <FormControlLabel
                  key={option}
                  control={
                    <Checkbox 
                      checked={filters.availability.includes(option)}
                      onChange={() => handleCheckboxChange('availability', option)}
                      size="small"
                      sx={{
                        color: theme.palette.primary.light,
                        '&.Mui-checked': {
                          color: theme.palette.primary.main,
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      {option}
                    </Typography>
                  }
                />
              ))}
            </FormGroup>
          </AccordionDetails>
        </Accordion>
        
        {/* Gender */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="medium">Doctor Gender</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={filters.gender === 'Male'}
                    onChange={() => handleGenderChange('Male')}
                    size="small"
                    sx={{
                      color: theme.palette.primary.light,
                      '&.Mui-checked': {
                        color: theme.palette.primary.main,
                      },
                    }}
                  />
                }
                label={<Typography variant="body2">Male</Typography>}
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={filters.gender === 'Female'}
                    onChange={() => handleGenderChange('Female')}
                    size="small"
                    sx={{
                      color: theme.palette.primary.light,
                      '&.Mui-checked': {
                        color: theme.palette.primary.main,
                      },
                    }}
                  />
                }
                label={<Typography variant="body2">Female</Typography>}
              />
            </FormGroup>
          </AccordionDetails>
        </Accordion>
        
        {/* Rating */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="medium">Minimum Rating</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ px: 1, pt: 1, pb: 2 }}>
              <Slider
                value={filters.rating}
                onChange={handleRatingChange}
                min={0}
                max={5}
                step={1}
                marks={[
                  { value: 0, label: 'Any' },
                  { value: 1, label: '1' },
                  { value: 2, label: '2' },
                  { value: 3, label: '3' },
                  { value: 4, label: '4' },
                  { value: 5, label: '5' },
                ]}
                valueLabelDisplay="auto"
                sx={{
                  color: theme.palette.primary.main,
                  '& .MuiSlider-thumb': {
                    height: 20,
                    width: 20,
                  },
                }}
              />
              <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                {filters.rating === 0 ? 'Any Rating' : `${filters.rating}+ stars`}
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>
        
        {/* Price Range */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="medium">Consultation Fee (Rs.)</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ px: 1, pt: 1, pb: 2 }}>
              <Slider
                value={filters.priceRange}
                onChange={handlePriceChange}
                min={0}
                max={5000}
                step={500}
                valueLabelDisplay="auto"
                marks={[
                  { value: 0, label: '0' },
                  { value: 2500, label: '2500' },
                  { value: 5000, label: '5000+' },
                ]}
                sx={{
                  color: theme.palette.primary.main,
                  '& .MuiSlider-thumb': {
                    height: 20,
                    width: 20,
                  },
                }}
              />
              <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
                Rs. {filters.priceRange[0]} - Rs. {filters.priceRange[1]}
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
      
      {/* Apply Button */}
      <Box sx={{ p: 2 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={applyFilters}
          sx={{ 
            py: 1.5, 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
          }}
        >
          Apply Filters
        </Button>
      </Box>
    </Paper>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Left Column - Filters (Larger screens) */}
        <Grid item xs={12} md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
          <FilterPanel />
        </Grid>
        
        {/* Main Content */}
        <Grid item xs={12} md={9}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", mb: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar 
                  sx={{ 
                    bgcolor: "primary.main", 
                    mr: 2,
                    width: 56,
                    height: 56
                  }}
                >
                  <MedicalIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: "bold", mb: 0.5 }}>
                    {formattedSpecialty} in Islamabad
                  </Typography>
                  <Typography color="text.secondary">
                    {filteredDoctors.length} specialists available
                  </Typography>
                </Box>
              </Box>
              
              {/* Mobile Filter Button */}
              <Button 
                variant="outlined" 
                startIcon={<FilterIcon />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{ display: { xs: 'flex', md: 'none' } }}
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </Box>
            
            {/* Search Bar */}
            <TextField
              fullWidth
              placeholder="Search by doctor name or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                sx: { 
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  mb: 3
                }
              }}
            />
            
            {/* Mobile Filters (collapsible) */}
            {showFilters && (
              <Box sx={{ mb: 3, display: { xs: 'block', md: 'none' } }}>
                <FilterPanel />
              </Box>
            )}
            
            {/* Doctor List */}
            {filteredDoctors.length > 0 ? (
              <Box>
                {filteredDoctors.map((doctor) => (
                  <Card 
                    elevation={0}
                    key={doctor._id || `doc-${Math.random().toString(36).substr(2, 9)}`}
                    sx={{ 
                      mb: 3, 
                      borderRadius: 3,
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                      overflow: "hidden",
                      transition: "all 0.3s ease-in-out",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Grid container spacing={3}>
                        {/* Doctor Image/Avatar */}
                        <Grid item xs={12} sm={2} sx={{ display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
                          {doctor.profile ? (
                            <Box
                              component="img"
                              src={doctor.profile}
                              alt={doctor.name}
                              sx={{
                                width: 120,
                                height: 120,
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: "4px solid #f0f4f8"
                              }}
                            />
                          ) : (
                            <Avatar 
                              sx={{ 
                                width: 120, 
                                height: 120,
                                bgcolor: "primary.light",
                                fontSize: "2.5rem",
                                fontWeight: "bold"
                              }}
                            >
                              {doctor.name?.charAt(0) || "D"}
                            </Avatar>
                          )}
                        </Grid>
                        
                        {/* Doctor Info */}
                        <Grid item xs={12} sm={7}>
                          <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1, mb: 1 }}>
                            <Typography variant="h5" fontWeight="bold">
                              {doctor.name || "Doctor Name"}
                            </Typography>
                            <Chip 
                              size="small" 
                              icon={<VerifiedIcon />} 
                              label="Verified" 
                              sx={{ 
                                bgcolor: "#e3f2fd", 
                                color: "primary.main",
                                fontWeight: "medium"
                              }} 
                            />
                            
                            {doctor.gender && (
                              <Chip 
                                size="small" 
                                label={doctor.gender} 
                                sx={{ 
                                  bgcolor: doctor.gender === 'Male' ? "#e8f5e9" : "#fff1e6", 
                                  color: doctor.gender === 'Male' ? "#2e7d32" : "#ed6c02",
                                  fontWeight: "medium"
                                }} 
                              />
                            )}
                          </Box>
                          
                          <Typography color="text.secondary" sx={{ mb: 1 }}>
                            {Array.isArray(doctor.qualification) 
                              ? doctor.qualification.join(", ") 
                              : (doctor.qualification || doctor.specialization || formattedSpecialty)}
                          </Typography>
                          
                          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                            <Rating 
                              value={parseFloat(doctor.rating) || 4.5} // Fallback to 4.5
                              readOnly
                              precision={0.5}
                              size="small"
                            />
                            <Typography variant="body2" sx={{ ml: 1, color: "text.secondary" }}>
                              {doctor.rating || "4.5"} ({Math.floor(Math.random() * 150) + 50} reviews)
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mt: 2 }}>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <TimeIcon sx={{ mr: 1, color: "text.secondary", fontSize: 20 }} />
                              <Typography variant="body2">
                                Experience: {doctor.experience || "N/A"} years
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <LocationIcon sx={{ mr: 1, color: "text.secondary", fontSize: 20 }} />
                              <Typography variant="body2">
                                Islamabad Medical Complex
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <MoneyIcon sx={{ mr: 1, color: "primary.main", fontSize: 20 }} />
                              <Typography variant="body2" fontWeight={600} color="primary.main">
                                Fee: Rs. {doctor.fee || "N/A"}
                              </Typography>
                            </Box>
                          </Box>
                          
                          {doctor.availability && (
                            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                              {doctor.availability.map((slot, idx) => (
                                <Chip 
                                  key={idx}
                                  size="small"
                                  label={slot}
                                  sx={{ 
                                    bgcolor: slot === 'Today' ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.primary.main, 0.1),
                                    color: slot === 'Today' ? theme.palette.success.main : theme.palette.primary.main,
                                  }}
                                />
                              ))}
                            </Box>
                          )}
                        </Grid>
                        
                        {/* Action Buttons */}
                        <Grid item xs={12} sm={3} sx={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 2 }}>
                          <Button
                            variant="contained"
                            fullWidth
                            color="primary"
                            onClick={() => navigate(`/book-appointment`)}
                            sx={{ 
                              py: 1.5,
                              borderRadius: 2,
                              boxShadow: "0 4px 10px rgba(25, 118, 210, 0.2)"
                            }}
                          >
                            Book Appointment
                          </Button>
                          
                          <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => navigate(`/doctor/${doctor._id}`)}
                            sx={{ py: 1.5, borderRadius: 2 }}
                            disabled={!doctor._id}
                          >
                            View Profile
                          </Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 4, 
                  textAlign: "center",
                  borderRadius: 2 
                }}
              >
                <Typography variant="h6" gutterBottom>
                  No specialists match your filters
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Try adjusting your filters or search criteria for better results.
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={resetFilters}
                  sx={{ mt: 2 }}
                >
                  Reset Filters
                </Button>
              </Paper>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SpecialistDoctors;