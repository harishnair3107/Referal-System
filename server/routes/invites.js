import { Router } from 'express';
import { nanoid } from 'nanoid';
import { Invite, User, Connection, Referral, Thanks } from '../models/index.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// POST /api/invites – admin creates an invite link
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const code = nanoid(10);
    const invite = await Invite.create({ code, createdById: req.user._id });
    res.status(201).json({ invite });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/invites – admin lists all invites
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const invites = await Invite.findAll({
      include: [
        { model: User, as: 'createdBy', attributes: ['_id', 'name', 'email'] },
        { model: User, as: 'usedBy', attributes: ['_id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json({ invites });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/invites/members – admin lists all members with stats
router.get('/members', requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await User.findAll({ order: [['createdAt', 'ASC']] });

    const members = await Promise.all(
      users.map(async (u) => {
        const connections = await Connection.count({ where: { referrerId: u._id } });
        const referrals = await Referral.count({ where: { referrerId: u._id } });
        const thankYous = await Thanks.count({ where: { toId: u._id } });
        const safeUser = u.toJSON();
        delete safeUser.password;
        return { ...safeUser, stats: { connections, referrals, thankYous } };
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
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    const user = await User.create({ name, email, password });
    
    const safeUser = await User.findByPk(user._id);
    res.status(201).json({ user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
