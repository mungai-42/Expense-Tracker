import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#a78bfa",
    },
    secondary: {
      main: "#f472b6",
    },
    background: {
      default: "#020617",
      paper: "rgba(15,23,42,0.9)",
    },
  },
  typography: {
    fontFamily: `'Inter', sans-serif`,
    h4: {
      fontWeight: 700,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: "10px 20px",
          borderRadius: "10px",
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

export default theme;
