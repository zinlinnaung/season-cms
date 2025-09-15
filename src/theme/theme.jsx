import { createTheme } from "@mui/material/styles";

// Define the theme structure
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", // Blue
    },
    secondary: {
      main: "#9c27b0", // Purple
    },
    background: {
      default: "#f4f6f8", // Light background color
    },
    text: {
      primary: "#212121", // Primary text color
      secondary: "#757575", // Secondary text color
    },
  },
  typography: {
    fontFamily: "'Roboto', sans-serif",
    h1: {
      fontSize: "2.25rem",
      fontWeight: 700,
    },
    h2: {
      fontSize: "1.875rem",
      fontWeight: 700,
    },
    body1: {
      fontSize: "1rem",
      fontWeight: 400,
    },
  },
  shape: {
    borderRadius: 8, // Rounded corners for components
  },
  spacing: 8, // Base spacing for consistent padding and margins
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px", // Make buttons have rounded edges
        },
      },
    },
  },
});

export default theme;
