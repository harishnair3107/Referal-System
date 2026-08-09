import Notification from '../models/Notification.js';

export async function notify(userId, type, message, relatedRequest = null) {
  try {
    await Notification.create({ user: userId, type, message, relatedRequest });
  } catch (err) {
    console.error('Notification error:', err.message);
  }
}
