const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const User = require('../models/user');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

router.get('/overview', protect, requireAdmin, async (_req, res) => {
  try {
    const [totalUsers, totalTransactions, totalsByType, totalsByCategory, latestTransactions] =
      await Promise.all([
        User.countDocuments(),
        Transaction.countDocuments(),
        Transaction.aggregate([
          {
            $group: {
              _id: '$type',
              total: { $sum: '$amount' },
            },
          },
        ]),
        Transaction.aggregate([
          { $match: { type: 'expense' } },
          {
            $group: {
              _id: '$category',
              total: { $sum: '$amount' },
            },
          },
          { $sort: { total: -1 } },
          { $limit: 5 },
        ]),
        Transaction.find({})
          .sort({ createdAt: -1 })
          .limit(10)
          .populate('user', 'name email'),
      ]);

    const incomeTotal = totalsByType.find((t) => t._id === 'income')?.total || 0;
    const expenseTotal = totalsByType.find((t) => t._id === 'expense')?.total || 0;

    res.json({
      totals: {
        users: totalUsers,
        transactions: totalTransactions,
        income: incomeTotal,
        expense: expenseTotal,
        balance: incomeTotal - expenseTotal,
      },
      categories: totalsByCategory,
      latestTransactions,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

