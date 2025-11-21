// src/pages/Register.js
import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
  Divider,
} from "@mui/material";
import API from "../utils/api";
import GoogleSignInButton from "../components/GoogleSignInButton";

export default function Register() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await API.post("/auth/register", { email, name, password });

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  const handleGoogleCredential = async (credential) => {
    try {
      setError("");
      setSuccess("");
      const res = await API.post("/auth/google", { credential });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user?.role || "user");
      setSuccess("Google sign-in successful! Redirecting...");
      setTimeout(
        () => navigate(res.data.user?.role === "admin" ? "/admin" : "/dashboard"),
        800
      );
    } catch (err) {
      setError(err.response?.data?.message || "Google sign-in failed");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #6d28d9 0%, #a855f7 50%, #9333ea 100%)",
        p: 2,
      }}
    >
      <Card
        component="form"
        onSubmit={handleRegister}
        sx={{
          width: "100%",
          maxWidth: 450,
          p: 4,
          borderRadius: 4,
          backdropFilter: "blur(12px)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.08))",
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow: "0px 20px 40px rgba(0,0,0,0.25)",
        }}
      >
        <Typography
          variant="h4"
          align="center"
          sx={{ color: "#fff", mb: 3, fontWeight: 700 }}
        >
          Create Account
        </Typography>

        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <TextField
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            variant="filled"
            InputProps={{ disableUnderline: true }}
            fullWidth
            sx={{
              borderRadius: 2,
              background: "rgba(255,255,255,0.06)",
              input: { color: "#fff" },
              label: { color: "rgba(255,255,255,0.8)" },
            }}
          />

          <TextField
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            variant="filled"
            InputProps={{ disableUnderline: true }}
            fullWidth
            sx={{
              borderRadius: 2,
              background: "rgba(255,255,255,0.06)",
              input: { color: "#fff" },
              label: { color: "rgba(255,255,255,0.8)" },
            }}
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            variant="filled"
            InputProps={{ disableUnderline: true }}
            fullWidth
            sx={{
              borderRadius: 2,
              background: "rgba(255,255,255,0.06)",
              input: { color: "#fff" },
              label: { color: "rgba(255,255,255,0.8)" },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{
              mt: 1,
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))",
              color: "#fff",
              fontWeight: 700,
            }}
          >
            Create Account
          </Button>

          <Typography align="center" sx={{ color: "#fff" }}>
            Already have an account?{" "}
            <Button
              component={RouterLink}
              to="/login"
              sx={{
                color: "#fff",
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              Login
            </Button>
          </Typography>
        </Stack>
        <Divider sx={{ my: 3, color: "rgba(255,255,255,0.4)" }}>or</Divider>
        <GoogleSignInButton text="signup_with" onCredential={handleGoogleCredential} />
      </Card>
    </Box>
  );
}
