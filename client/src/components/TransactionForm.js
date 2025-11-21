import React, { useState } from "react";
import {
  Alert,
  Button,
  Card,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import API from "../utils/api";

const categories = [
  "Food",
  "Transport",
  "Bills",
  "Shopping",
  "Investment",
  "Savings",
  "Other",
];

const fieldStyles = {
  "& .MuiInputBase-root": {
    backgroundColor: "rgba(148,163,184,0.08)",
    color: "#f8fafc",
  },
  "& .MuiInputLabel-root": {
    color: "rgba(248,250,252,0.7)",
  },
};

export default function TransactionForm({ addTransaction }) {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    type: "expense",
    category: "Food",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount) {
      setError("Please provide a title and amount");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
      };
      const { data } = await API.post("/transactions", payload);
      addTransaction(data);
      setError("");
      setForm((prev) => ({
        ...prev,
        title: "",
        amount: "",
        category: "Food",
        type: "expense",
        notes: "",
        date: new Date().toISOString().split("T")[0],
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: 3,
        borderRadius: 3,
        background: "rgba(15,23,42,0.65)",
        border: "1px solid rgba(148,163,184,0.2)",
        color: "#f8fafc",
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Quick capture
      </Typography>
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Title"
          value={form.title}
          onChange={handleChange("title")}
          required
          fullWidth
          sx={fieldStyles}
        />
        <TextField
          label="Amount"
          type="number"
          value={form.amount}
          onChange={handleChange("amount")}
          required
          fullWidth
          sx={fieldStyles}
        />
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            select
            label="Type"
            value={form.type}
            onChange={handleChange("type")}
            fullWidth
            sx={fieldStyles}
          >
            <MenuItem value="income">Income</MenuItem>
            <MenuItem value="expense">Expense</MenuItem>
          </TextField>
          <TextField
            select
            label="Category"
            value={form.category}
            onChange={handleChange("category")}
            fullWidth
            sx={fieldStyles}
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
        <TextField
          label="Date"
          type="date"
          value={form.date}
          onChange={handleChange("date")}
          InputLabelProps={{ shrink: true }}
          fullWidth
          sx={fieldStyles}
        />
        <TextField
          label="Notes"
          value={form.notes}
          onChange={handleChange("notes")}
          multiline
          minRows={2}
          fullWidth
          sx={fieldStyles}
        />
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
        >
          {loading ? "Saving..." : "Add Transaction"}
        </Button>
      </Stack>
    </Card>
  );
}
