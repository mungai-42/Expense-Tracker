const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/authMiddleware');

const parseAmount = (amount) => {
  const parsed = Number(amount);
  if (Number.isNaN(parsed)) {
    const error = new Error('Amount must be a valid number');
    error.status = 400;
    throw error;
  }
  return parsed;
};

const parseDate = (value) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    const error = new Error('Date must be a valid ISO string or timestamp');
    error.status = 400;
    throw error;
  }
  return parsed;
};

const ensureOwnership = (transaction, userId) => {
  if (!transaction) {
    const error = new Error('Transaction not found');
    error.status = 404;
    throw error;
  }

  if (transaction.user.toString() !== userId) {
    const error = new Error('Not authorized');
    error.status = 403;
    throw error;
  }
};

// GET all transactions for logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new transaction
router.post('/', protect, async (req, res) => {
  try {
    const { title, amount, type, category, date, notes } = req.body;

    if (!title || !type || amount === undefined) {
      return res.status(400).json({ message: 'Title, amount and type are required' });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Type must be income or expense' });
    }

    const transaction = await Transaction.create({
      title: title.trim(),
      amount: parseAmount(amount),
      type,
      category: category?.trim() || 'General',
      date: parseDate(date),
      notes: notes?.trim(),
      user: req.user.id,
    });

    res.status(201).json(transaction);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// UPDATE a transaction
router.put('/:id', protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid transaction id' });
    }

    const transaction = await Transaction.findById(req.params.id);
    ensureOwnership(transaction, req.user.id);

    const { title, amount, type, category, date, notes } = req.body;

    if (title) transaction.title = title.trim();
    if (type) {
      if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ message: 'Type must be income or expense' });
      }
      transaction.type = type;
    }
    if (amount !== undefined) transaction.amount = parseAmount(amount);
    if (category) transaction.category = category.trim();
    if (date) transaction.date = parseDate(date);
    if (notes !== undefined) transaction.notes = notes ? notes.trim() : '';

    const updated = await transaction.save();
    res.json(updated);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// DELETE a transaction
router.delete('/:id', protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid transaction id' });
    }

    const transaction = await Transaction.findById(req.params.id);
    ensureOwnership(transaction, req.user.id);

    await transaction.deleteOne();
    res.json({ message: 'Transaction removed' });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// Summary analytics
router.get('/summary/overview', protect, async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);

    const [totals, categories] = await Promise.all([
      Transaction.aggregate([
        { $match: { user: userObjectId } },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
          },
        },
      ]),
      Transaction.aggregate([
        { $match: { user: userObjectId, type: 'expense' } },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
          },
        },
        { $sort: { total: -1 } },
      ]),
    ]);

    const income = totals.find((item) => item._id === 'income')?.total || 0;
    const expense = totals.find((item) => item._id === 'expense')?.total || 0;

    res.json({
      income,
      expense,
      balance: income - expense,
      topCategories: categories,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
