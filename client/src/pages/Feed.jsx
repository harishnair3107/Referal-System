import { useState, useEffect, useCallback } from 'react';
import { api } from '../api.js';
import RequestCard from '../components/RequestCard.jsx';
import Modal from '../components/Modal.jsx';
import { toast } from '../components/Toast.jsx';
import './Pages.css';

export default function Feed({ user }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.requests.feed();
      setRequests(data.requests);
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.requests.create(form);
      toast('Request posted!', 'success');
      setForm({ title: '', description: '' });
      setShowCreate(false);
      load();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title grad-text">Feed</h1>
          <p>Open referral requests from the community</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + New Request
        </button>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <span className="icon">📭</span>
          <h3>No open requests yet</h3>
          <p>Be the first to post a referral request!</p>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            Post a Request
          </button>
        </div>
      ) : (
        <div className="request-list">
          {requests.map(r => (
            <RequestCard key={r._id} request={r} currentUser={user} />
          ))}
        </div>
      )}

      {showCreate && (
        <Modal title="New Referral Request" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="modal-form">
            <div className="field">
              <label>Title</label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Looking for a referral at Google"
                required
              />
            </div>
            <div className="field">
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe what you're looking for, your background, and any relevant details..."
                required
                rows={5}
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Posting…' : 'Post Request'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
