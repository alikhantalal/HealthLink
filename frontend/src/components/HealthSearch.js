import React, { useState } from "react";
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Container, 
  Grid,
  InputAdornment,
  Chip,
  useTheme 
} from "@mui/material";
import { 
  Search as SearchIcon,
  HealthAndSafety as HealthIcon,
  MedicalServices as MedicalIcon,
  Medication as MedicationIcon,
  LocalHospital as HospitalIcon,
  ChildCare as ChildIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const HealthSearch = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState("all");

  // Service categories to replace city selector
  const serviceCategories = [
    { id: "all", label: "All Services", icon: <HealthIcon fontSize="small" /> },
    { id: "doctors", label: "Find Specialists", icon: <MedicalIcon fontSize="small" /> },
    { id: "urgent", label: "Urgent Care", icon: <HospitalIcon fontSize="small" /> },
    { id: "pediatric", label: "Pediatrics", icon: <ChildIcon fontSize="small" /> },
    { id: "medicine", label: "Medicine", icon: <MedicationIcon fontSize="small" /> }
  ];

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    
    // Only proceed if search term is not empty
    if (!searchTerm.trim()) return;
    
    // Navigate based on search term and selected service
    if (selectedService === "doctors" || selectedService === "all") {
      navigate(`/specialists?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      // For other service types, include service in the query
      navigate(`/specialists?search=${encodeURIComponent(searchTerm.trim())}&service=${selectedService}`);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        py: 6,
        px: 4,
        mt: 2,
        mb: 5,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.05)"
      }}
    >
      <Container maxWidth="lg">
        <Box textAlign="center" mb={4}>
          <Typography
            variant="h3"
            component="h1"
            fontWeight="bold"
            gutterBottom
            sx={{
              fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.75rem" }
            }}
          >
            Connect with the{" "}
            <Box
              component="span"
              sx={{
                color: theme.palette.primary.main,
                background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              Right Specialist
            </Box>{" "}
            for Your Needs
          </Typography>

          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              backgroundColor: theme.palette.background.paper,
              color: "text.secondary",
              borderRadius: "20px",
              padding: "5px 15px",
              mt: 2,
              mb: 3,
              fontSize: "14px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
            }}
          >
            <HealthIcon sx={{ fontSize: 18, mr: 1, color: theme.palette.success.main }} />
            Simplifying healthcare access in Pakistan
          </Box>
        </Box>

        {/* Service Category Selector */}
        <Grid container spacing={2} justifyContent="center" mb={3}>
          {serviceCategories.map((service) => (
            <Grid item key={service.id}>
              <Chip
                icon={service.icon}
                label={service.label}
                clickable
                onClick={() => setSelectedService(service.id)}
                sx={{
                  px: 1,
                  py: 2.5,
                  borderRadius: "16px",
                  backgroundColor:
                    selectedService === service.id
                      ? theme.palette.primary.main
                      : theme.palette.background.paper,
                  color:
                    selectedService === service.id
                      ? "white"
                      : "text.primary",
                  fontWeight: 500,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  border: "1px solid",
                  borderColor:
                    selectedService === service.id
                      ? theme.palette.primary.main
                      : theme.palette.divider,
                  "& .MuiChip-icon": {
                    color:
                      selectedService === service.id
                        ? "white"
                        : theme.palette.primary.main
                  },
                  "&:hover": {
                    backgroundColor:
                      selectedService === service.id
                        ? theme.palette.primary.dark
                        : theme.palette.background.default
                  }
                }}
              />
            </Grid>
          ))}
        </Grid>

        {/* Search Bar */}
        <form onSubmit={handleSearch}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              gap: 2,
              maxWidth: "800px",
              mx: "auto"
            }}
          >
            <TextField
              fullWidth
              placeholder={
                selectedService === "all"
                  ? "Search for doctors, symptoms, services..."
                  : `Search for ${selectedService}...`
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: "12px",
                  backgroundColor: "white",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                  height: 56
                }
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(e);
                }
              }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{
                borderRadius: "12px",
                py: 1.5,
                px: { xs: 3, sm: 5 },
                fontWeight: "bold",
                boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                minWidth: { xs: "100%", sm: "auto" },
                height: 56
              }}
            >
              Search
            </Button>
          </Box>
        </form>

        {/* Quick Links */}
        <Box mt={4} textAlign="center">
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Popular searches:
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap" justifyContent="center">
            {["General Physician", "Cardiologist", "Pediatrician", "Dentist"].map(
              (item) => (
                <Chip
                  key={item}
                  label={item}
                  size="small"
                  onClick={() => {
                    setSearchTerm(item);
                    setSelectedService("doctors");
                    navigate(`/specialists?search=${encodeURIComponent(item)}`);
                  }}
                  sx={{
                    bgcolor: "background.paper",
                    "&:hover": {
                      bgcolor: "background.default"
                    }
                  }}
                />
              )
            )}
          </Box>
        </Box>
      </Container>
    </Paper>
  );
};

export default HealthSearch;