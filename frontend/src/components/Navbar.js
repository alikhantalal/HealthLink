import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Box,
  useScrollTrigger,
  Slide,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Home as HomeIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  Info as InfoIcon,
  MedicalServices as MedicalServicesIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Medication as MedicationIcon,
  HealthAndSafety as HealthAndSafetyIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// Hide on scroll component
function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
  // State for login menu
  const [anchorEl, setAnchorEl] = useState(null);
  // State for mobile drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Login menu handlers
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogin = (role) => {
    handleMenuClose();
    navigate("/login", { state: { role } });
  };

  // Mobile drawer handlers
  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  // Navigation links
  const navLinks = [
    { text: "Home", path: "/", icon: <HomeIcon /> },
    { text: "For Patients", path: "/patients", icon: <MedicalServicesIcon /> },
    { text: "About", path: "/about", icon: <InfoIcon /> },
  ];

  // Mobile drawer content
  const drawerContent = (
    <Box
      sx={{ width: 280, height: "100%" }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
          mt: 2,
          mb: 1,
        }}
      >
        <Avatar
          sx={{ 
            width: 60, 
            height: 60, 
            bgcolor: theme.palette.primary.main,
            mb: 1,
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <HealthAndSafetyIcon sx={{ fontSize: 34 }} />
        </Avatar>
        <Typography variant="h6" fontWeight="bold" sx={{ my: 1 }}>
          HealthLink
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your Healthcare Partner
        </Typography>
      </Box>
      
      <Divider sx={{ mt: 1 }} />
      
      <List sx={{ p: 1 }}>
        {navLinks.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              "&:hover": {
                bgcolor: "rgba(25, 118, 210, 0.08)",
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      
      <Divider />
      
      <List sx={{ p: 1 }}>
        <ListItem
          button
          onClick={() => handleLogin("doctor")}
          sx={{
            borderRadius: 2,
            mb: 0.5,
            "&:hover": {
              bgcolor: "rgba(25, 118, 210, 0.08)",
            },
          }}
        >
          <ListItemIcon>
            <MedicationIcon />
          </ListItemIcon>
          <ListItemText primary="Doctor Login" />
        </ListItem>
        
        <ListItem
          button
          onClick={() => handleLogin("patient")}
          sx={{
            borderRadius: 2,
            mb: 0.5,
            "&:hover": {
              bgcolor: "rgba(25, 118, 210, 0.08)",
            },
          }}
        >
          <ListItemIcon>
            <LoginIcon />
          </ListItemIcon>
          <ListItemText primary="Patient Login" />
        </ListItem>
        
        <ListItem
          button
          onClick={() => navigate("/join-as-doctor")}
          sx={{
            borderRadius: 2,
            bgcolor: "primary.main",
            color: "white",
            "&:hover": {
              bgcolor: "primary.dark",
            },
          }}
        >
          <ListItemIcon sx={{ color: "white" }}>
            <PersonAddIcon />
          </ListItemIcon>
          <ListItemText primary="Join as Doctor" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <HideOnScroll>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: "white",
            color: "text.primary",
            boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Container maxWidth="lg">
            <Toolbar
              disableGutters
              sx={{
                display: "flex",
                justifyContent: "space-between",
                height: 70,
              }}
            >
              {/* Logo Area */}
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {isMobile && (
                  <IconButton
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    onClick={toggleDrawer(true)}
                    sx={{ mr: 1 }}
                  >
                    <MenuIcon />
                  </IconButton>
                )}
                
                <Avatar
                  sx={{ 
                    bgcolor: theme.palette.primary.main,
                    width: 38,
                    height: 38,
                    mr: 1.5,
                    boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.1)",
                    display: { xs: "none", sm: "flex" } 
                  }}
                >
                  <HealthAndSafetyIcon fontSize="small" />
                </Avatar>
                
                <Typography
                  variant="h5"
                  onClick={() => navigate("/")}
                  sx={{
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: { xs: "1.25rem", sm: "1.5rem" },
                    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    "&:hover": {
                      opacity: 0.85,
                    },
                  }}
                >
                  HealthLink
                </Typography>
              </Box>

              {/* Desktop Navigation */}
              {!isMobile && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: { md: 1, lg: 2 },
                  }}
                >
                  {navLinks.map((link) => (
                    <Button
                      key={link.text}
                      onClick={() => navigate(link.path)}
                      sx={{
                        color: "text.primary",
                        fontWeight: 500,
                        px: 2,
                        "::after": {
                          content: '""',
                          display: "block",
                          width: "0%",
                          height: "2px",
                          backgroundColor: "primary.main",
                          transition: "width 0.3s ease",
                          marginTop: "2px",
                        },
                        "&:hover": {
                          backgroundColor: "transparent",
                          color: "primary.main",
                          "::after": {
                            width: "100%",
                          },
                        },
                      }}
                    >
                      {link.text}
                    </Button>
                  ))}

                  <Button
                    onClick={handleMenuOpen}
                    sx={{
                      color: "text.primary",
                      fontWeight: 500,
                      ml: 2,
                      px: 2,
                    }}
                    endIcon={<LoginIcon />}
                  >
                    Login
                  </Button>

                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    elevation={3}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "right",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    sx={{
                      "& .MuiPaper-root": {
                        borderRadius: 2,
                        minWidth: 180,
                        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                        mt: 1.5,
                      },
                    }}
                  >
                    <MenuItem
                      onClick={() => handleLogin("doctor")}
                      sx={{ py: 1.5 }}
                    >
                      <MedicationIcon
                        fontSize="small"
                        sx={{ mr: 1.5, color: "primary.main" }}
                      />
                      Login as Doctor
                    </MenuItem>
                    <MenuItem
                      onClick={() => handleLogin("patient")}
                      sx={{ py: 1.5 }}
                    >
                      <LoginIcon
                        fontSize="small"
                        sx={{ mr: 1.5, color: "primary.main" }}
                      />
                      Login as Patient
                    </MenuItem>
                  </Menu>

                  <Button
                    variant="contained"
                    onClick={() => navigate("/join-as-doctor")}
                    startIcon={<PersonAddIcon />}
                    sx={{
                      ml: 1,
                      px: 3,
                      boxShadow: "0px 4px 8px rgba(25, 118, 210, 0.25)",
                    }}
                  >
                    Join as Doctor
                  </Button>
                </Box>
              )}
            </Toolbar>
          </Container>
        </AppBar>
      </HideOnScroll>

      {/* Mobile drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        sx={{
          "& .MuiDrawer-paper": {
            borderTopRightRadius: 16,
            borderBottomRightRadius: 16,
          },
        }}
      >
        <IconButton
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "text.secondary",
          }}
          onClick={toggleDrawer(false)}
        >
          <CloseIcon />
        </IconButton>
        {drawerContent}
      </Drawer>
    </>
  );
}