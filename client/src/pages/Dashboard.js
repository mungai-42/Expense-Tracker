// src/pages/Dashboard.js
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useNavigate } from "react-router-dom";

import AnalyticsCards from "../components/AnalyticsCards";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";
import Charts from "../components/Charts";
import API from "../utils/api";

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/transactions");
      setTransactions(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchTransactions();
  }, [token, navigate, fetchTransactions]);

  const addTransaction = (transaction) =>
    setTransactions((prev) => [transaction, ...prev]);

  const deleteTransaction = (id) =>
    setTransactions((prev) => prev.filter((t) => t._id !== id));

  const updateTransaction = (updatedTransaction) =>
    setTransactions((prev) =>
      prev.map((t) => (t._id === updatedTransaction._id ? updatedTransaction : t))
    );

  const stats = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((acc, curr) => acc + curr.amount, 0);
    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, curr) => acc + curr.amount, 0);
    const balance = income - expense;

    const categories = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, curr) => {
        const key = curr.category || "General";
        acc[key] = (acc[key] || 0) + curr.amount;
        return acc;
      }, {});

    const topCategory = Object.entries(categories).sort(
      (a, b) => b[1] - a[1]
    )[0];

    return {
      income,
      expense,
      balance,
      topCategory: topCategory
        ? { name: topCategory[0], value: topCategory[1] }
        : null,
      totalTransactions: transactions.length,
    };
  }, [transactions]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #1e1b4b, #0f172a 55%, #020617 100%)",
        p: { xs: 2, md: 4 },
      }}
    >
      <Card
        sx={{
          maxWidth: 1280,
          m: "0 auto",
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          background: "rgba(15,23,42,0.85)",
          border: "1px solid rgba(148,163,184,0.2)",
          boxShadow: "0px 30px 60px rgba(2,6,23,0.65)",
          color: "#f8fafc",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={3}
          mb={4}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, letterSpacing: 0.5, mb: 1 }}
            >
              Expense Nexus
            </Typography>
            <Typography sx={{ opacity: 0.8 }}>
              Smart insights for every shilling you move.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh data">
              <span>
                <IconButton
                  onClick={fetchTransactions}
                  disabled={loading}
                  sx={{
                    background: "rgba(148,163,184,0.12)",
                    color: "#f8fafc",
                    "&:hover": { background: "rgba(148,163,184,0.25)" },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <RefreshIcon />
                  )}
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Logout">
              <IconButton
                onClick={handleLogout}
                sx={{
                  background: "rgba(220,38,38,0.15)",
                  color: "#f87171",
                  "&:hover": { background: "rgba(220,38,38,0.3)" },
                }}
              >
                <LogoutIcon />
              </IconButton>
            </Tooltip>
            {isAdmin && (
              <Button
                variant="outlined"
                sx={{
                  borderColor: "rgba(248,250,252,0.5)",
                  color: "#f8fafc",
                  textTransform: "none",
                }}
                onClick={() => navigate("/admin")}
              >
                Admin view
              </Button>
            )}
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          <Grid item xs={12}>
            <AnalyticsCards stats={stats} />
          </Grid>

          <Grid item xs={12} md={5}>
            <TransactionForm addTransaction={addTransaction} />
          </Grid>

          <Grid item xs={12} md={7}>
            <TransactionList
              transactions={transactions}
              deleteTransaction={deleteTransaction}
              updateTransaction={updateTransaction}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ borderColor: "rgba(148,163,184,0.2)", my: 1 }} />
          </Grid>

          <Grid item xs={12}>
            <Charts transactions={transactions} />
          </Grid>
        </Grid>

        {!loading && transactions.length === 0 && !error && (
          <Box textAlign="center" mt={6}>
            <Typography variant="h6" gutterBottom>
              No transactions yet
            </Typography>
            <Typography sx={{ opacity: 0.75 }}>
              Start by adding your first income or expense to unlock insights.
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 3 }}
              onClick={() =>
                window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
              }
            >
              Add a transaction
            </Button>
          </Box>
        )}
      </Card>
    </Box>
  );
}
