import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function setTokenCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, inviteCode } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const totalUsers = await User.countDocuments();
    let isAdmin = false;

    if (totalUsers === 0) {
      // First user becomes admin automatically
      isAdmin = true;
    } else {
      // Require a valid unused invite
      if (!inviteCode) return res.status(400).json({ error: 'An invite code is required' });
      const { default: Invite } = await import('../models/Invite.js');
      const invite = await Invite.findOne({ code: inviteCode, usedBy: null });
      if (!invite) return res.status(400).json({ error: 'Invalid or already used invite code' });

      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ error: 'Email already registered' });

      const user = await User.create({ name, email, password, isAdmin, inviteCode });
      invite.usedBy = user._id;
      invite.usedAt = new Date();
      await invite.save();

      const token = signToken(user._id);
      setTokenCookie(res, token);
      return res.status(201).json({ user });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const user = await User.create({ name, email, password, isAdmin });
    const token = signToken(user._id);
    setTokenCookie(res, token);
    return res.status(201).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken(user._id);
    setTokenCookie(res, token);
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// GET /api/auth/first-user-check – public, used by registration UI
router.get('/first-user-check', async (_req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    res.json({ isFirst: totalUsers === 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
