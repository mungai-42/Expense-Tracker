import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Divider from "@mui/material/Divider";
import API from "../utils/api";
import GoogleSignInButton from "../components/GoogleSignInButton";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user?.role || "user");
      const destination = res.data.user?.role === "admin" ? "/admin" : "/dashboard";
      navigate(destination);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredential = async (credential) => {
    try {
      setLoading(true);
      const res = await API.post("/auth/google", { credential });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user?.role || "user");
      const destination = res.data.user?.role === "admin" ? "/admin" : "/dashboard";
      navigate(destination);
    } catch (err) {
      setError(err.response?.data?.message || "Google sign-in failed");
    } finally {
      setLoading(false);
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
          "linear-gradient(135deg, #0f172a 0%, #312e81 50%, #6d28d9 100%)",
        p: 2,
      }}
    >
      <Card
        component="form"
        onSubmit={handleLogin}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: 4,
          borderRadius: 4,
          backdropFilter: "blur(12px)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
          border: "1px solid rgba(255,255,255,0.2)",
          boxShadow: "0px 25px 45px rgba(15,23,42,0.6)",
        }}
      >
        <Typography
          variant="h4"
          align="center"
          sx={{ mb: 3, fontWeight: 700, color: "#fff" }}
        >
          Welcome back
        </Typography>

        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            variant="filled"
            InputProps={{ disableUnderline: true }}
            fullWidth
            sx={{
              borderRadius: 2,
              background: "rgba(255,255,255,0.08)",
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
              background: "rgba(255,255,255,0.08)",
              input: { color: "#fff" },
              label: { color: "rgba(255,255,255,0.8)" },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              mt: 1,
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.25), rgba(255,255,255,0.12))",
              color: "#fff",
              fontWeight: 700,
            }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>

          <Typography align="center" sx={{ color: "#fff", mt: 1 }}>
            New here?{" "}
            <Button
              component={RouterLink}
              to="/register"
              sx={{ color: "#fff", textTransform: "none", fontWeight: 700 }}
            >
              Create an account
            </Button>
          </Typography>
        </Stack>

        <Divider sx={{ my: 3, color: "rgba(255,255,255,0.4)" }}>or</Divider>

        <GoogleSignInButton onCredential={handleGoogleCredential} />
      </Card>
    </Box>
  );
}

export default Login;
