// src/components/Charts.js
import React, { useMemo } from "react";
import { Card, Typography, Box } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#a855f7", "#6d28d9"];

export default function Charts({ transactions }) {
  // Prepare data for Pie Chart (expenses by category)
  const pieData = useMemo(() => {
    const categoryMap = {};
    transactions.forEach((t) => {
      if (t.type === "expense") {
        const key = t.category || "General";
        if (!categoryMap[key]) categoryMap[key] = 0;
        categoryMap[key] += t.amount;
      }
    });
    return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  // Prepare data for Line Chart (spending history)
  const lineData = useMemo(() => {
    const dataMap = {};
    transactions.forEach((t) => {
      const date = new Date(t.date).toLocaleDateString();
      if (!dataMap[date]) dataMap[date] = 0;
      dataMap[date] += t.type === "income" ? t.amount : -t.amount;
    });
    // Sort by date
    return Object.keys(dataMap)
      .sort((a, b) => new Date(a) - new Date(b))
      .map((date) => ({ date, amount: dataMap[date] }));
  }, [transactions]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4, mt: 4 }}>
      {/* Pie Chart */}
      <Card
        sx={{
          p: 3,
          borderRadius: 3,
          background: "rgba(15,23,42,0.7)",
          border: "1px solid rgba(148,163,184,0.2)",
          color: "#f8fafc",
        }}
      >
        <Typography variant="h6" textAlign="center" mb={2}>
          Expenses by Category
        </Typography>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Line Chart */}
      <Card
        sx={{
          p: 3,
          borderRadius: 3,
          background: "rgba(15,23,42,0.7)",
          border: "1px solid rgba(148,163,184,0.2)",
          color: "#f8fafc",
        }}
      >
        <Typography variant="h6" textAlign="center" mb={2}>
          Spending History
        </Typography>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={lineData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
            <XAxis dataKey="date" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="amount" stroke="#82ca9d" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </Box>
  );
}
