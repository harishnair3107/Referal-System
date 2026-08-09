import { Router } from 'express';
import Thanks from '../models/Thanks.js';
import Request from '../models/Request.js';
import Referral from '../models/Referral.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { notify } from '../utils/notify.js';
import { generateThankYouLetter } from '../utils/thankYouGenerator.js';

const router = Router();

// POST /api/thanks/:requestId – requester says thank you
router.post('/:requestId', requireAuth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    // Only the request author can say thank you
    if (String(request.author) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Only the requester can send thanks' });
    }
    if (request.status !== 'referred') {
      return res.status(400).json({ error: 'Request has not been referred yet' });
    }

    const existing = await Thanks.findOne({ request: request._id });
    if (existing) return res.status(400).json({ error: 'Already thanked' });

    const referral = await Referral.findOne({ request: request._id }).populate('referrer');
    if (!referral) return res.status(400).json({ error: 'No referral found' });

    const from = await User.findById(req.user._id);

    const letter = generateThankYouLetter({
      fromName: from.name,
      toName: referral.referrer.name,
      requestTitle: request.title,
      referralDescription: referral.description,
    });

    const thanks = await Thanks.create({
      request: request._id,
      from: req.user._id,
      to: referral.referrer._id,
      letter,
    });

    request.status = 'thanked';
    await request.save();

    await notify(
      referral.referrer._id,
      'thanked',
      `${from.name} sent you a thank-you for your referral on "${request.title}"`,
      request._id
    );

    res.status(201).json({ thanks, letter });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
