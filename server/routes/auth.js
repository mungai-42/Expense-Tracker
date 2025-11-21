// File: server/routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/user'); // Make sure the file is User.js
const { protect } = require('../middleware/authMiddleware');

const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null;

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  return jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: '1d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const role =
      process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL.toLowerCase() === email.toLowerCase()
        ? 'admin'
        : 'user';

    const user = await User.create({ name, email, password, role });

    res.status(201).json({
      token: generateToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    res.json({
      token: generateToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Google OAuth sign-in
// @route   POST /api/auth/google
// @access  Public
router.post('/google', async (req, res) => {
  const { credential } = req.body;

  if (!googleClient) {
    return res.status(500).json({ message: 'Google Sign-In not configured' });
  }

  if (!credential) {
    return res.status(400).json({ message: 'Missing Google credential' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();
    const email = payload?.email;
    const name = payload?.name || email?.split('@')[0];

    if (!email) {
      return res.status(400).json({ message: 'Google profile missing email' });
    }

    let user = await User.findOne({ email });
    if (!user) {
      const role =
        process.env.ADMIN_EMAIL &&
        process.env.ADMIN_EMAIL.toLowerCase() === email.toLowerCase()
          ? 'admin'
          : 'user';

      user = await User.create({
        name,
        email,
        password: `${payload.sub}${Date.now()}`, // random secret, never used
        role,
      });
    }

    res.json({
      token: generateToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(401).json({ message: 'Invalid Google credential', detail: err.message });
  }
});

// @desc    Get logged-in user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
