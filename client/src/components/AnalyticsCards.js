import React from "react";
import { Card, Grid, Stack, Typography } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SavingsIcon from "@mui/icons-material/Savings";
import DonutSmallIcon from "@mui/icons-material/DonutSmall";

const currency = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

const cardConfig = [
  {
    title: "Income",
    key: "income",
    icon: <TrendingUpIcon fontSize="large" />,
    gradient:
      "linear-gradient(135deg, rgba(16,185,129,0.25), rgba(5,150,105,0.1))",
  },
  {
    title: "Expenses",
    key: "expense",
    icon: <DonutSmallIcon fontSize="large" />,
    gradient:
      "linear-gradient(135deg, rgba(248,113,113,0.3), rgba(239,68,68,0.1))",
  },
  {
    title: "Balance",
    key: "balance",
    icon: <SavingsIcon fontSize="large" />,
    gradient:
      "linear-gradient(135deg, rgba(147,197,253,0.3), rgba(59,130,246,0.12))",
  },
];

export default function AnalyticsCards({ stats }) {
  if (!stats) return null;

  return (
    <Grid container spacing={3}>
      {cardConfig.map((card) => (
        <Grid item xs={12} md={4} key={card.key}>
          <Card
            sx={{
              p: 3,
              borderRadius: 3,
              background: card.gradient,
              border: "1px solid rgba(148,163,184,0.2)",
              color: "#f8fafc",
              boxShadow: "0 20px 45px rgba(15,23,42,0.45)",
              "&:hover": {
                transform: "translateY(-3px)",
                transition: "0.3s ease",
              },
            }}
          >
            <Stack direction="row" justifyContent="space-between" mb={2}>
              <Typography variant="subtitle2" sx={{ letterSpacing: 1.2 }}>
                {card.title}
              </Typography>
              {card.icon}
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {currency.format(stats[card.key] || 0)}
            </Typography>
            {card.key === "balance" && stats.topCategory && (
              <Typography sx={{ mt: 1, opacity: 0.7 }}>
                Top spend: {stats.topCategory.name} (
                {currency.format(stats.topCategory.value)})
              </Typography>
            )}
            {card.key !== "balance" && (
              <Typography sx={{ mt: 1, opacity: 0.7 }}>
                {stats.totalTransactions} tracked transactions
              </Typography>
            )}
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
