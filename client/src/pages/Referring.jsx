import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { toast } from '../components/Toast.jsx';
import './Pages.css';

const STATUS_DOT = {
  open: '🟢', connected: '🔵', referred: '🟣', thanked: '🟡', closed: '⚫',
};

export default function Referring() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      const data = await api.connections.referring();
      setConnections(data.connections);
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title grad-text">Referring</h1>
          <p>Requests you've offered to connect & refer</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : connections.length === 0 ? (
        <div className="empty-state">
          <span className="icon">🤝</span>
          <h3>No connections yet</h3>
          <p>Browse the Feed and offer to refer someone!</p>
        </div>
      ) : (
        <div className="request-list">
          {connections.map(c => {
            const req = c.request;
            if (!req) return null;
            const initials = req.author?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
            return (
              <article
                key={c._id}
                className="request-card glass-card fade-in"
                onClick={() => navigate(`/requests/${req._id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && navigate(`/requests/${req._id}`)}
              >
                <div className="rc-top">
                  <div className="rc-author">
                    <div className="avatar avatar-sm">{initials}</div>
                    <div>
                      <div className="rc-name">{req.author?.name}</div>
                      <div className="rc-time">Connected {new Date(c.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <span className={`status-badge status-${req.status}`}>
                    {STATUS_DOT[req.status]} {req.status}
                  </span>
                </div>
                <h3 className="rc-title">{req.title}</h3>
                <p className="rc-desc">{req.description}</p>
                {req.status === 'connected' && (
                  <span className="action-hint">📤 Submit your referral →</span>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
