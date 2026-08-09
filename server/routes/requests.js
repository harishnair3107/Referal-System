import { Router } from 'express';
import Request from '../models/Request.js';
import Comment from '../models/Comment.js';
import { requireAuth } from '../middleware/auth.js';
import { notify } from '../utils/notify.js';

const router = Router();

// GET /api/requests – all open/active requests (feed)
router.get('/', requireAuth, async (req, res) => {
  try {
    const requests = await Request.find({ status: { $ne: 'closed' } })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    res.json({ requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/requests/mine – current user's own requests
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const requests = await Request.find({ author: req.user._id })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    res.json({ requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/requests/:id – single request with comments & connections
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate('author', 'name email');
    if (!request) return res.status(404).json({ error: 'Not found' });

    const comments = await Comment.find({ request: request._id })
      .populate('author', 'name email')
      .sort({ createdAt: 1 });

    const { default: Connection } = await import('../models/Connection.js');
    const connections = await Connection.find({ request: request._id })
      .populate('referrer', 'name email');

    const { default: Referral } = await import('../models/Referral.js');
    const referral = await Referral.findOne({ request: request._id })
      .populate('referrer', 'name email');

    const { default: Thanks } = await import('../models/Thanks.js');
    const thanks = await Thanks.findOne({ request: request._id });

    res.json({ request, comments, connections, referral, thanks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/requests – create a new request
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'title and description required' });
    }
    const request = await Request.create({ title, description, author: req.user._id });
    res.status(201).json({ request });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/requests/:id/comments – add a comment
router.post('/:id/comments', requireAuth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate('author');
    if (!request) return res.status(404).json({ error: 'Request not found' });
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'text required' });
    const comment = await Comment.create({ request: request._id, author: req.user._id, text });
    await comment.populate('author', 'name email');

    // Notify request author if commenter is different
    if (String(request.author._id) !== String(req.user._id)) {
      await notify(
        request.author._id,
        'comment',
        `${req.user.name} commented on your request "${request.title}"`,
        request._id
      );
    }
    res.status(201).json({ comment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
