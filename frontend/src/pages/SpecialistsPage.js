import React, { useState, useEffect } from "react";
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { Search as SearchIcon } from "@mui/icons-material";
import HealthSearch from "../components/HealthSearch";
import specialists from "../specialistsData"; // Import your existing specialists data

const SpecialistsPage = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [filteredSpecialists, setFilteredSpecialists] = useState([]);
  
  // Get search param from URL if present
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get("search");
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [location.search]);

  // Filter specialists based on search term
  useEffect(() => {
    setLoading(true);
    
    // Use your existing specialists data
    const allSpecialists = specialists.Islamabad || [];
    
    if (!searchTerm) {
      setFilteredSpecialists(allSpecialists);
    } else {
      const filtered = allSpecialists.filter((specialist) => 
        specialist.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSpecialists(filtered);
    }
    
    setLoading(false);
  }, [searchTerm]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <HealthSearch />
      </Box>

      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Find Specialists
          </Typography>
          
          <TextField
            placeholder="Filter specialists..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              sx: { borderRadius: 2 }
            }}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredSpecialists.length > 0 ? (
          <Grid container spacing={2}>
            {filteredSpecialists.map((specialist, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      transform: "translateY(-4px)"
                    }
                  }}
                >
                  <Typography variant="body1" fontWeight="medium">
                    {specialist}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No specialists found matching your criteria.
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default SpecialistsPage;