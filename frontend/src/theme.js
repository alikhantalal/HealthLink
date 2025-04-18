import { createTheme } from "@mui/material/styles";

// Custom color palette with healthcare-inspired colors
const theme = createTheme({
  palette: {
    primary: {
      light: "#4dabf5",
      main: "#1976d2", // Medical blue - trustworthy, professional
      dark: "#1565c0",
      contrastText: "#ffffff",
    },
    secondary: {
      light: "#4aedc4",
      main: "#00bfa5", // Teal - fresh, healing
      dark: "#00897b",
      contrastText: "#ffffff",
    },
    accent: {
      light: "#ffad42",
      main: "#ff9800", // Orange for calls-to-action
      dark: "#f57c00",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f8f9fa",
      paper: "#ffffff",
      subtle: "#f0f4f8", // Light blue-gray for cards and sections
    },
    text: {
      primary: "#2c3e50", // Dark blue-gray - easier on eyes than pure black
      secondary: "#546e7a",
      disabled: "#90a4ae",
    },
    success: {
      main: "#43a047", // Green for success messages
    },
    error: {
      main: "#e53935", // Red for error messages
    },
    warning: {
      main: "#f9a825", // Amber for warning messages
    },
    info: {
      main: "#039be5", // Light blue for info messages
    },
    divider: "rgba(0, 0, 0, 0.08)",
  },
  
  // Refined typography system
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontWeight: 700,
      fontSize: "3rem",
      lineHeight: 1.2,
      letterSpacing: "-0.01562em",
    },
    h2: {
      fontWeight: 700,
      fontSize: "2.5rem",
      lineHeight: 1.2,
      letterSpacing: "-0.00833em",
    },
    h3: {
      fontWeight: 700,
      fontSize: "2rem",
      lineHeight: 1.2,
      letterSpacing: "0em",
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.75rem",
      lineHeight: 1.2,
      letterSpacing: "0.00735em",
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.5rem",
      lineHeight: 1.2,
      letterSpacing: "0em",
    },
    h6: {
      fontWeight: 600,
      fontSize: "1.25rem",
      lineHeight: 1.2,
      letterSpacing: "0.0075em",
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: "1.125rem",
      lineHeight: 1.5,
      letterSpacing: "0.00938em",
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: "0.875rem",
      lineHeight: 1.5,
      letterSpacing: "0.00714em",
    },
    body1: {
      fontWeight: 400,
      fontSize: "1rem",
      lineHeight: 1.6,
      letterSpacing: "0.00938em",
    },
    body2: {
      fontWeight: 400,
      fontSize: "0.875rem",
      lineHeight: 1.6,
      letterSpacing: "0.01071em",
    },
    button: {
      fontWeight: 600,
      fontSize: "0.9375rem",
      textTransform: "none",
      letterSpacing: "0.02857em",
    },
    caption: {
      fontWeight: 400,
      fontSize: "0.75rem",
      lineHeight: 1.5,
      letterSpacing: "0.03333em",
    },
  },
  
  shape: {
    borderRadius: 10, // Consistent border radius throughout
  },
  
  // Custom shadow setup for depth
  shadows: [
    "none",
    "0px 2px 4px rgba(0, 0, 0, 0.05)",
    "0px 4px 8px rgba(0, 0, 0, 0.05)",
    "0px 8px 16px rgba(0, 0, 0, 0.06)",
    "0px 12px 24px rgba(0, 0, 0, 0.08)",
    // ... rest of the shadows array
  ],
  
  components: {
    // Button styling
    MuiButton: {
      styleOverrides: {
        root: {
          padding: "10px 20px",
          borderRadius: 8,
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.08)",
          transition: "all 0.2s ease-in-out",
          fontWeight: 600,
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.12)",
          },
        },
        contained: {
          "&:hover": {
            backgroundColor: "#1565c0", // Slightly darker on hover
          },
        },
        containedSecondary: {
          "&:hover": {
            backgroundColor: "#00897b", // Slightly darker on hover
          },
        },
        outlined: {
          borderWidth: "1.5px",
          "&:hover": {
            borderWidth: "1.5px",
          },
        },
      },
    },
    
    // Card styling
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0px 6px 16px rgba(0, 0, 0, 0.05)",
          overflow: "hidden",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0px 12px 24px rgba(0, 0, 0, 0.1)",
          },
        },
      },
    },
    
    // Paper styling
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0px 6px 16px rgba(0, 0, 0, 0.05)",
        },
        elevation1: {
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
        },
        elevation2: {
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)",
        },
        elevation3: {
          boxShadow: "0px 6px 16px rgba(0, 0, 0, 0.1)",
        },
      },
    },
    
    // Form input styling
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            transition: "box-shadow 0.2s ease-in-out",
            "&:hover": {
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#1976d2",
              },
            },
            "&.Mui-focused": {
              boxShadow: "0px 0px 0px 3px rgba(25, 118, 210, 0.1)",
              "& .MuiOutlinedInput-notchedOutline": {
                borderWidth: "1.5px",
              },
            },
          },
        },
      },
    },
    
    // App Bar styling
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.08)",
        },
      },
    },

    // Tabs styling
    MuiTabs: {
      styleOverrides: {
        root: {
          "& .MuiTabs-indicator": {
            height: 3,
            borderRadius: "3px 3px 0 0",
          },
        },
        indicator: {
          backgroundColor: "#1976d2",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          textTransform: "none",
          minWidth: 100,
          "&.Mui-selected": {
            color: "#1976d2",
          },
        },
      },
    },
    
    // List items
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          "&:hover": {
            backgroundColor: "rgba(25, 118, 210, 0.04)",
          },
        },
      },
    },
    
    // Chip styling
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
  },
});

export default theme;