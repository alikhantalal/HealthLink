import React, { useState } from 'react';
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Slider,
  Button,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  FormGroup,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ExpandMore as ExpandMoreIcon,
  FilterAlt as FilterIcon,
  RestartAlt as ResetIcon
} from '@mui/icons-material';

const FilterPanel = ({ onFilter }) => {
  const theme = useTheme();
  
  // State for filter options
  const [filters, setFilters] = useState({
    specialties: [],
    availability: [],
    gender: '',
    rating: 0,
    priceRange: [0, 5000]
  });

  // Filter options
  const specialtyOptions = [
    "General Physician", "Cardiologist", "Dermatologist", "Gynecologist", 
    "Neurologist", "Ophthalmologist", "Orthopedic Surgeon", "Pediatrician", 
    "Psychiatrist", "Gastroenterologist"
  ];
  
  const availabilityOptions = [
    "Today", "Tomorrow", "This Week", "Weekend", "Next Week"
  ];

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

  // Apply filters
  const applyFilters = () => {
    onFilter(filters);
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
    onFilter(resetValues);
  };

  return (
    <Paper
      elevation={0}
      sx={{ 
        borderRadius: 3, 
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
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
      <Box sx={{ p: 2 }}>
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
};

export default FilterPanel;