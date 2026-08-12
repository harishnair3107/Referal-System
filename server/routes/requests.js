import { Router } from 'express';
import { Op } from 'sequelize';
import { Request, Comment, Connection, Referral, Thanks, User } from '../models/index.js';
import { requireAuth } from '../middleware/auth.js';
import { notify } from '../utils/notify.js';

const router = Router();

// GET /api/requests – all open/active requests (feed)
router.get('/', requireAuth, async (req, res) => {
  try {
    const requests = await Request.findAll({
      where: { status: { [Op.ne]: 'closed' } },
      include: [{ model: User, as: 'author', attributes: ['_id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/requests/mine – current user's own requests
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const requests = await Request.findAll({
      where: { authorId: req.user._id },
      include: [{ model: User, as: 'author', attributes: ['_id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/requests/:id – single request with comments & connections
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const request = await Request.findByPk(req.params.id, {
      include: [{ model: User, as: 'author', attributes: ['_id', 'name', 'email'] }]
    });
    if (!request) return res.status(404).json({ error: 'Not found' });

    const comments = await Comment.findAll({
      where: { requestId: request._id },
      include: [{ model: User, as: 'author', attributes: ['_id', 'name', 'email'] }],
      order: [['createdAt', 'ASC']]
    });

    const connections = await Connection.findAll({
      where: { requestId: request._id },
      include: [{ model: User, as: 'referrer', attributes: ['_id', 'name', 'email'] }]
    });

    const referral = await Referral.findOne({
      where: { requestId: request._id },
      include: [{ model: User, as: 'referrer', attributes: ['_id', 'name', 'email'] }]
    });

    const thanks = await Thanks.findOne({
      where: { requestId: request._id }
    });

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
    const request = await Request.create({ title, description, authorId: req.user._id });
    res.status(201).json({ request });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/requests/:id/comments – add a comment
router.post('/:id/comments', requireAuth, async (req, res) => {
  try {
    const request = await Request.findByPk(req.params.id, {
      include: [{ model: User, as: 'author' }]
    });
    if (!request) return res.status(404).json({ error: 'Request not found' });
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'text required' });
    
    let comment = await Comment.create({ requestId: request._id, authorId: req.user._id, text });
    comment = await Comment.findByPk(comment._id, {
      include: [{ model: User, as: 'author', attributes: ['_id', 'name', 'email'] }]
    });

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
