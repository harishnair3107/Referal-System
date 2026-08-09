import { Router } from 'express';
import { nanoid } from 'nanoid';
import Invite from '../models/Invite.js';
import User from '../models/User.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// POST /api/invites – admin creates an invite link
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const code = nanoid(10);
    const invite = await Invite.create({ code, createdBy: req.user._id });
    res.status(201).json({ invite });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/invites – admin lists all invites
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const invites = await Invite.find()
      .populate('createdBy', 'name email')
      .populate('usedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ invites });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/invites/members – admin lists all members with stats
router.get('/members', requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().lean().sort({ createdAt: 1 });
    const { default: Connection } = await import('../models/Connection.js');
    const { default: Referral } = await import('../models/Referral.js');
    const { default: Thanks } = await import('../models/Thanks.js');

    const members = await Promise.all(
      users.map(async (u) => {
        const connections = await Connection.countDocuments({ referrer: u._id });
        const referrals = await Referral.countDocuments({ referrer: u._id });
        const thankYous = await Thanks.countDocuments({ to: u._id });
        return { ...u, stats: { connections, referrals, thankYous } };
      })
    );
    res.json({ members });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/invites/members – admin directly creates a member
router.post('/members', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, password required' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    const user = await User.create({ name, email, password });
    res.status(201).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
