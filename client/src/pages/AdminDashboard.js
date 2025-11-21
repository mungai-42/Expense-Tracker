import React, { useEffect, useState, useCallback } from "react";
import {
  Alert,
  Box,
  Card,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import API from "../utils/api";
import { useNavigate } from "react-router-dom";

const currency = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
});

const statCards = [
  { key: "users", label: "Total users" },
  { key: "transactions", label: "Transactions" },
  { key: "income", label: "Income recorded" },
  { key: "expense", label: "Expenses recorded" },
  { key: "balance", label: "Net balance" },
];

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await API.get("/admin/overview");
      setOverview(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, rgba(15,23,42,1) 0%, rgba(30,27,75,1) 60%, rgba(17,24,39,1) 100%)",
        p: { xs: 2, md: 4 },
      }}
    >
      <Card
        sx={{
          maxWidth: 1300,
          m: "0 auto",
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          background: "rgba(2,6,23,0.9)",
          border: "1px solid rgba(148,163,184,0.2)",
          color: "#f8fafc",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
          mb={4}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Admin control room
            </Typography>
            <Typography sx={{ opacity: 0.8 }}>
              Monitor every shilling flowing through Expense Nexus.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Back to user dashboard">
              <IconButton
                onClick={() => navigate("/dashboard")}
                sx={{
                  background: "rgba(148,163,184,0.12)",
                  color: "#f8fafc",
                  "&:hover": { background: "rgba(148,163,184,0.25)" },
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh admin data">
              <span>
                <IconButton
                  onClick={fetchOverview}
                  disabled={loading}
                  sx={{
                    background: "rgba(148,163,184,0.12)",
                    color: "#f8fafc",
                    "&:hover": { background: "rgba(148,163,184,0.25)" },
                  }}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!overview && loading ? (
          <Stack alignItems="center" mt={6}>
            <CircularProgress color="inherit" />
            <Typography sx={{ mt: 2, opacity: 0.8 }}>
              Compiling analytics, hang tight...
            </Typography>
          </Stack>
        ) : (
          overview && (
            <Stack spacing={4}>
              <Grid container spacing={3}>
                {statCards.map((card) => (
                  <Grid item xs={12} sm={6} md={4} key={card.key}>
                    <Card
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        background: "rgba(15,23,42,0.8)",
                        border: "1px solid rgba(148,163,184,0.3)",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ letterSpacing: 1.5, opacity: 0.7 }}
                      >
                        {card.label}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {card.key === "users" || card.key === "transactions"
                          ? overview.totals[card.key].toLocaleString()
                          : currency.format(overview.totals[card.key])}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Card
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: "rgba(15,23,42,0.8)",
                  border: "1px solid rgba(148,163,184,0.3)",
                }}
              >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Top spending categories
                </Typography>
                {overview.categories.length === 0 ? (
                  <Typography sx={{ opacity: 0.7 }}>
                    No expense data recorded yet.
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {overview.categories.map((cat) => (
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        key={cat._id}
                        sx={{
                          background: "rgba(79,70,229,0.15)",
                          borderRadius: 2,
                          p: 2,
                        }}
                      >
                        <Typography sx={{ textTransform: "capitalize" }}>
                          {cat._id || "General"}
                        </Typography>
                        <Typography fontWeight={600}>
                          {currency.format(cat.total)}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                )}
              </Card>

              <Card
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: "rgba(15,23,42,0.8)",
                  border: "1px solid rgba(148,163,184,0.3)",
                }}
              >
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                  mb={2}
                >
                  <Typography variant="h6">Latest transactions</Typography>
                  <Typography sx={{ opacity: 0.7 }}>
                    Last {overview.latestTransactions.length} records
                  </Typography>
                </Stack>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: "#94a3b8" }}>User</TableCell>
                      <TableCell sx={{ color: "#94a3b8" }}>Title</TableCell>
                      <TableCell sx={{ color: "#94a3b8" }}>Category</TableCell>
                      <TableCell sx={{ color: "#94a3b8" }} align="right">
                        Amount
                      </TableCell>
                      <TableCell sx={{ color: "#94a3b8" }}>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {overview.latestTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ color: "#94a3b8" }}>
                          Data will show here once users start adding items.
                        </TableCell>
                      </TableRow>
                    ) : (
                      overview.latestTransactions.map((tx) => (
                        <TableRow key={tx._id}>
                          <TableCell sx={{ color: "#e2e8f0" }}>
                            <Stack spacing={0.5}>
                              <Typography fontWeight={600}>
                                {tx.user?.name || "Unknown"}
                              </Typography>
                              <Typography sx={{ fontSize: 12, opacity: 0.7 }}>
                                {tx.user?.email}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ color: "#e2e8f0" }}>{tx.title}</TableCell>
                          <TableCell>
                            <Chip
                              label={tx.category || "General"}
                              size="small"
                              color={tx.type === "income" ? "success" : "warning"}
                              sx={{ textTransform: "capitalize" }}
                            />
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              color: tx.type === "income" ? "#4ade80" : "#f87171",
                              fontWeight: 600,
                            }}
                          >
                            {tx.type === "expense" ? "-" : "+"}
                            {currency.format(tx.amount)}
                          </TableCell>
                          <TableCell sx={{ color: "#e2e8f0" }}>
                            {new Date(tx.createdAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>

              <Card
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: "rgba(15,23,42,0.8)",
                  border: "1px solid rgba(148,163,184,0.3)",
                }}
              >
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Admin tips
                </Typography>
                <Typography sx={{ opacity: 0.8 }}>
                  Admin access is granted automatically when you register or log in with
                  the email configured in <code>ADMIN_EMAIL</code>. Keep that value safe and
                  rotate the password regularly to control who can view global data.
                </Typography>
              </Card>
            </Stack>
          )
        )}
      </Card>
    </Box>
  );
}

