import { Router } from 'express';
import { Connection, Request, User } from '../models/index.js';
import { requireAuth } from '../middleware/auth.js';
import { notify } from '../utils/notify.js';

const router = Router();

// POST /api/connections/:requestId – "I can connect & refer"
router.post('/:requestId', requireAuth, async (req, res) => {
  try {
    const request = await Request.findByPk(req.params.requestId, { include: [{ model: User, as: 'author' }] });
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (String(request.author._id) === String(req.user._id)) {
      return res.status(400).json({ error: 'You cannot connect to your own request' });
    }
    if (request.status !== 'open') {
      return res.status(400).json({ error: 'Request is no longer open' });
    }

    const existing = await Connection.findOne({ where: { requestId: request._id, referrerId: req.user._id } });
    if (existing) return res.status(400).json({ error: 'Already connected' });

    const connection = await Connection.create({ requestId: request._id, referrerId: req.user._id });

    // Update request status to connected
    request.status = 'connected';
    await request.save();

    // Notify requester
    await notify(
      request.author._id,
      'connected',
      `${req.user.name} offered to refer you for "${request.title}"`,
      request._id
    );

    res.status(201).json({ connection });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/connections/referring – requests the current user has connected to
router.get('/referring', requireAuth, async (req, res) => {
  try {
    const connections = await Connection.findAll({
      where: { referrerId: req.user._id },
      include: [{
        model: Request,
        as: 'request',
        include: [{ model: User, as: 'author', attributes: ['_id', 'name', 'email'] }]
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ connections });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
