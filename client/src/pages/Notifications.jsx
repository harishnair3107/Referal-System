import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { toast } from '../components/Toast.jsx';
import './Pages.css';

const TYPE_ICON = {
  connected: '🤝',
  referred: '📋',
  thanked: '💌',
  comment: '💬',
  invite_used: '🎟️',
};

export default function Notifications({ onRead }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      const data = await api.notifications.list();
      setNotifications(data.notifications);
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markAllRead = async () => {
    try {
      await api.notifications.readAll();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      onRead?.();
      toast('All marked as read', 'success');
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const handleClick = async (n) => {
    if (!n.read) {
      await api.notifications.readOne(n._id).catch(() => {});
      setNotifications(prev => prev.map(x => x._id === n._id ? { ...x, read: true } : x));
      onRead?.();
    }
    if (n.relatedRequest) {
      navigate(`/requests/${n.relatedRequest}`);
    }
  };

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title grad-text">Notifications</h1>
          <p>{unread > 0 ? `${unread} unread` : 'All caught up!'}</p>
        </div>
        {unread > 0 && (
          <button className="btn btn-secondary btn-sm" onClick={markAllRead}>
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <span className="icon">🔔</span>
          <h3>No notifications</h3>
          <p>Activity on your requests will show up here.</p>
        </div>
      ) : (
        <div className="notif-list">
          {notifications.map(n => (
            <div
              key={n._id}
              className={`notif-item glass-card ${n.read ? '' : 'unread'} ${n.relatedRequest ? 'clickable' : ''}`}
              onClick={() => handleClick(n)}
              role={n.relatedRequest ? 'button' : undefined}
              tabIndex={n.relatedRequest ? 0 : undefined}
              onKeyDown={e => e.key === 'Enter' && handleClick(n)}
            >
              <span className="notif-icon">{TYPE_ICON[n.type] || 'ℹ️'}</span>
              <div className="notif-body">
                <p>{n.message}</p>
                <span className="notif-time">{new Date(n.createdAt).toLocaleString()}</span>
              </div>
              {!n.read && <span className="unread-dot" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
