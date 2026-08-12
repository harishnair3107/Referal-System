import { Router } from 'express';
import { User, Connection, Referral, Thanks } from '../models/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/rankings – leaderboard of all members
router.get('/', requireAuth, async (req, res) => {
  try {
    const users = await User.findAll();

    const rankings = await Promise.all(
      users.map(async (u) => {
        const referralsMade = await Referral.count({ where: { referrerId: u._id } });
        const thankYousReceived = await Thanks.count({ where: { toId: u._id } });
        const connectionsMade = await Connection.count({ where: { referrerId: u._id } });
        return {
          _id: u._id,
          name: u.name,
          email: u.email,
          referralsMade,
          thankYousReceived,
          connectionsMade,
          score: referralsMade * 3 + thankYousReceived * 5 + connectionsMade,
        };
      })
    );

    rankings.sort((a, b) => b.score - a.score);
    res.json({ rankings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
