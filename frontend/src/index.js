import React from "react";
import ReactDOM from "react-dom";
import App from "./App"; 
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "./theme"; // Import your custom theme

// PrimeReact styles
import "primereact/resources/themes/lara-light-blue/theme.css"; // Choose theme
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

// Global styles
import "./index.css"; 
import "./App.css"; 

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
