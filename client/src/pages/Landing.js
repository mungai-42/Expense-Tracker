import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import API from "../utils/api";

const highlights = [
  {
    title: "Track effortlessly",
    description: "Capture income and expenses with a single tap.",
  },
  {
    title: "Visual dashboards",
    description: "Understand spending using live charts and insights.",
  },
  {
    title: "Stay accountable",
    description: "Custom categories, notes and audit-ready history.",
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [storedRole, setStoredRole] = useState(null);
  const [checking, setChecking] = useState(true);

  // Validate token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    if (!token) {
      setChecking(false);
      return;
    }

    // Validate token by checking user profile
    API.get("/auth/me")
      .then((res) => {
        setIsAuthenticated(true);
        setStoredRole(res.data.role || role);
      })
      .catch(() => {
        // Token is invalid, clear it
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setIsAuthenticated(false);
        setStoredRole(null);
      })
      .finally(() => {
        setChecking(false);
      });
  }, []);

  const primaryCtaLabel = isAuthenticated
    ? storedRole === "admin"
      ? "Enter admin portal"
      : "Go to dashboard"
    : "Create an account";
  const primaryDestination =
    storedRole === "admin" ? "/admin" : "/dashboard";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 20% 20%, #312e81, #0f172a 60%, #020617)",
        color: "#f8fafc",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography
              variant="h2"
              sx={{ fontWeight: 800, mb: 3, lineHeight: 1.1 }}
            >
              Expense Nexus
            </Typography>
            <Typography variant="h5" sx={{ opacity: 0.8, mb: 4 }}>
              A modern, secure expense tracker that turns your day-to-day
              spending into actionable insight. Glide from capture to analytics
              with zero friction.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              {!checking && (
                <>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() =>
                      navigate(isAuthenticated ? primaryDestination : "/register")
                    }
                    sx={{
                      background:
                        "linear-gradient(120deg, rgba(99,102,241,1), rgba(192,132,252,1))",
                      fontWeight: 700,
                    }}
                  >
                    {primaryCtaLabel}
                  </Button>
                  {!isAuthenticated && (
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate("/login")}
                      sx={{ borderColor: "rgba(248,250,252,0.5)", color: "#f8fafc" }}
                    >
                      Already have an account?
                    </Button>
                  )}
                </>
              )}
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              {highlights.map((item) => (
                <Card
                  key={item.title}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: "rgba(15,23,42,0.7)",
                    border: "1px solid rgba(148,163,184,0.2)",
                    boxShadow: "0 25px 45px rgba(2,6,23,0.55)",
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {item.title}
                  </Typography>
                  <Typography sx={{ opacity: 0.85 }}>
                    {item.description}
                  </Typography>
                </Card>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

