import { Router } from 'express';
import { Notification } from '../models/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/notifications – current user's notifications (newest first)
router.get('/', requireAuth, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user._id },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    res.json({ notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/notifications/read-all – mark all as read
router.patch('/read-all', requireAuth, async (req, res) => {
  try {
    await Notification.update(
      { read: true },
      { where: { userId: req.user._id, read: false } }
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/notifications/:id/read – mark one as read
router.patch('/:id/read', requireAuth, async (req, res) => {
  try {
    await Notification.update(
      { read: true },
      { where: { _id: req.params.id, userId: req.user._id } }
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
