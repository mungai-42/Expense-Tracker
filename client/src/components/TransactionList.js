import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  MenuItem,
  Chip,
  Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import API from "../utils/api";

const formatter = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
});

const categories = [
  "Food",
  "Transport",
  "Bills",
  "Shopping",
  "Investment",
  "Savings",
  "Other",
];

export default function TransactionList({
  transactions,
  deleteTransaction,
  updateTransaction,
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [actionError, setActionError] = useState("");

  const handleDelete = async (id) => {
    try {
      await API.delete(`/transactions/${id}`);
      deleteTransaction(id);
      setActionError("");
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to delete transaction");
    }
  };

  const handleEditOpen = (transaction) => {
    const normalizedDate = transaction.date
      ? new Date(transaction.date).toISOString().split("T")[0]
      : "";
    setCurrentTransaction({
      ...transaction,
      date: normalizedDate,
    });
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setCurrentTransaction(null);
  };

  const handleEditSave = async () => {
    if (
      !currentTransaction?.title?.trim() ||
      Number.isNaN(Number(currentTransaction?.amount))
    ) {
      setActionError("Please provide a valid title and amount");
      return;
    }
    try {
      const { data } = await API.put(
        `/transactions/${currentTransaction._id}`,
        currentTransaction
      );
      updateTransaction(data);
      setActionError("");
      handleEditClose();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to update transaction");
    }
  };

  const rows = useMemo(
    () =>
      transactions.map((t) => {
        const dateLabel = t.date
          ? new Date(t.date).toLocaleDateString(undefined, {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "—";
        return { ...t, dateLabel };
      }),
    [transactions]
  );

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h6">Recent activity</Typography>
        {actionError && (
          <Typography color="error" variant="body2">
            {actionError}
          </Typography>
        )}
      </Stack>

      <TableContainer
        component={Paper}
        sx={{
          background: "rgba(15,23,42,0.6)",
          border: "1px solid rgba(148,163,184,0.2)",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "#94a3b8" }}>Title</TableCell>
              <TableCell sx={{ color: "#94a3b8" }}>Category</TableCell>
              <TableCell sx={{ color: "#94a3b8" }} align="right">
                Amount
              </TableCell>
              <TableCell sx={{ color: "#94a3b8" }}>Date</TableCell>
              <TableCell sx={{ color: "#94a3b8" }} align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ color: "#94a3b8" }}>
                  No transactions captured yet
                </TableCell>
              </TableRow>
            )}
            {rows.map((t) => (
              <TableRow key={t._id}>
                <TableCell sx={{ color: "#e2e8f0" }}>{t.title}</TableCell>
                <TableCell>
                  <Chip
                    label={t.category || "General"}
                    size="small"
                    color={t.type === "income" ? "success" : "warning"}
                    sx={{ textTransform: "capitalize" }}
                  />
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: t.type === "income" ? "#4ade80" : "#f87171",
                    fontWeight: 600,
                  }}
                >
                  {t.type === "expense" ? "-" : "+"}
                  {formatter.format(t.amount)}
                </TableCell>
                <TableCell sx={{ color: "#e2e8f0" }}>{t.dateLabel}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleEditOpen(t)}>
                    <EditIcon sx={{ color: "#fbbf24" }} />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(t._id)}>
                    <DeleteIcon sx={{ color: "#f87171" }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={editOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit transaction</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            label="Title"
            value={currentTransaction?.title || ""}
            onChange={(e) =>
              setCurrentTransaction((prev) => ({ ...prev, title: e.target.value }))
            }
          />
          <TextField
            label="Amount"
            type="number"
            value={currentTransaction?.amount ?? ""}
            onChange={(e) =>
              setCurrentTransaction((prev) => ({
                ...prev,
                amount: parseFloat(e.target.value),
              }))
            }
          />
          <TextField
            select
            label="Type"
            value={currentTransaction?.type || "expense"}
            onChange={(e) =>
              setCurrentTransaction((prev) => ({ ...prev, type: e.target.value }))
            }
          >
            <MenuItem value="income">Income</MenuItem>
            <MenuItem value="expense">Expense</MenuItem>
          </TextField>
          <TextField
            select
            label="Category"
            value={currentTransaction?.category || "Food"}
            onChange={(e) =>
              setCurrentTransaction((prev) => ({
                ...prev,
                category: e.target.value,
              }))
            }
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Date"
            type="date"
            value={currentTransaction?.date || ""}
            InputLabelProps={{ shrink: true }}
            onChange={(e) =>
              setCurrentTransaction((prev) => ({ ...prev, date: e.target.value }))
            }
          />
          <TextField
            label="Notes"
            multiline
            minRows={2}
            value={currentTransaction?.notes || ""}
            onChange={(e) =>
              setCurrentTransaction((prev) => ({ ...prev, notes: e.target.value }))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
