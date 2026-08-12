import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import ThreadView from '../components/ThreadView.jsx';
import { toast } from '../components/Toast.jsx';
import './Pages.css';

const STATUS_DOT = {
  open: '🟢', connected: '🔵', referred: '🟣', thanked: '🟡', closed: '⚫',
};

export default function RequestDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await api.requests.get(id);
      setThread(data);
    } catch (e) {
      toast(e.message, 'error');
      navigate('/feed');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <div className="loading-center"><div className="spinner" /></div>;
  }

  if (!thread) return null;

  const { request } = thread;
  const initials = request.author?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="page fade-in">
      <button className="btn btn-ghost back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <article className="detail-header glass-card">
        <div className="detail-top">
          <div className="detail-author">
            <div className="avatar">{initials}</div>
            <div>
              <div className="detail-name">{request.author?.name}</div>
              <div className="time-highlight">{new Date(request.createdAt).toLocaleString()}</div>
            </div>
          </div>
          <span className={`status-badge status-${request.status}`}>
            {STATUS_DOT[request.status]} {request.status}
          </span>
        </div>
        <h1 className="detail-title">{request.title}</h1>
        <p className="detail-desc">{request.description}</p>
      </article>

      <ThreadView thread={thread} currentUser={user} onRefresh={load} />
    </div>
  );
}
