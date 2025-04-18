import React from "react";
import { TextField, Button, Box } from "@mui/material";

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      <TextField
        variant="outlined"
        placeholder="Doctors"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ width: 300 }}
      />
      <Button variant="contained" sx={{ bgcolor: "#FF9800", color: "white", px: 3 }}>
        Search
      </Button>
    </Box>
  );
};

export default SearchBar;
