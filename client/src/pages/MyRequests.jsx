import { useState, useEffect, useCallback } from 'react';
import { api } from '../api.js';
import RequestCard from '../components/RequestCard.jsx';
import { toast } from '../components/Toast.jsx';
import './Pages.css';

export default function MyRequests({ user }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await api.requests.mine();
      setRequests(data.requests);
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
          <h1 className="page-title grad-text">My Requests</h1>
          <p>Track your referral requests and their progress</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <span className="icon">📝</span>
          <h3>No requests yet</h3>
          <p>Post a request from the Feed to get started.</p>
        </div>
      ) : (
        <div className="request-list">
          {requests.map(r => (
            <RequestCard key={r._id} request={r} currentUser={user} />
          ))}
        </div>
      )}
    </div>
  );
}
