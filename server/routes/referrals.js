import { Router } from 'express';
import { Referral, Request, Connection, User } from '../models/index.js';
import { requireAuth } from '../middleware/auth.js';
import { notify } from '../utils/notify.js';

const router = Router();

// POST /api/referrals/:requestId – submit the actual referral
router.post('/:requestId', requireAuth, async (req, res) => {
  try {
    const request = await Request.findByPk(req.params.requestId, { include: [{ model: User, as: 'author' }] });
    if (!request) return res.status(404).json({ error: 'Request not found' });

    // Only the connected referrer may submit
    const connection = await Connection.findOne({ where: { requestId: request._id, referrerId: req.user._id } });
    if (!connection) return res.status(403).json({ error: 'You have not connected to this request' });

    const { description } = req.body;
    if (!description) return res.status(400).json({ error: 'description required' });

    const existing = await Referral.findOne({ where: { requestId: request._id, referrerId: req.user._id } });
    if (existing) return res.status(400).json({ error: 'You already submitted a referral for this request' });

    const referral = await Referral.create({ requestId: request._id, referrerId: req.user._id, description });

    // Update request status
    request.status = 'referred';
    await request.save();

    // Notify requester
    await notify(
      request.author._id,
      'referred',
      `${req.user.name} submitted a referral for your request "${request.title}"`,
      request._id
    );

    res.status(201).json({ referral });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
