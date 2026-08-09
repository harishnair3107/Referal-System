import { Router } from 'express';
import User from '../models/User.js';
import Connection from '../models/Connection.js';
import Referral from '../models/Referral.js';
import Thanks from '../models/Thanks.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/rankings – leaderboard of all members
router.get('/', requireAuth, async (req, res) => {
  try {
    const users = await User.find().lean();

    const rankings = await Promise.all(
      users.map(async (u) => {
        const referralsMade = await Referral.countDocuments({ referrer: u._id });
        const thankYousReceived = await Thanks.countDocuments({ to: u._id });
        const connectionsMade = await Connection.countDocuments({ referrer: u._id });
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
