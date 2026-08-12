import { useState } from 'react';
import { api } from '../api.js';
import { toast } from './Toast.jsx';
import './ThreadView.css';

export default function ThreadView({ thread, currentUser, onRefresh }) {
  const { request, comments, connections, referral, thanks } = thread;
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [referralText, setReferralText] = useState('');
  const [submittingReferral, setSubmittingReferral] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const isOwner = String(request.author?._id) === String(currentUser?._id);
  const hasConnected = connections?.some(c => String(c.referrer?._id) === String(currentUser?._id));
  const myReferral = referral && String(referral.referrer?._id) === String(currentUser?._id);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await api.connections.connect(request._id);
      toast('You connected to this request!', 'success');
      onRefresh();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setConnecting(false);
    }
  };

  const handleReferral = async (e) => {
    e.preventDefault();
    if (!referralText.trim()) return;
    setSubmittingReferral(true);
    try {
      await api.referrals.submit(request._id, { description: referralText });
      toast('Referral submitted!', 'success');
      setReferralText('');
      onRefresh();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setSubmittingReferral(false);
    }
  };

  const handleThankYou = async () => {
    try {
      await api.thanks.send(request._id);
      toast('Thank you letter sent!', 'success');
      onRefresh();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmittingComment(true);
    try {
      await api.requests.comment(request._id, { text: comment });
      setComment('');
      onRefresh();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="thread-view">
      {/* Who connected */}
      {connections?.length > 0 && (
        <div className="thread-section glass-card">
          <h4 className="section-title">🤝 Connected Referrers</h4>
          <div className="connection-list">
            {connections.map(c => {
              const ini = c.referrer?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
              return (
                <div key={c._id} className="connection-item">
                  <div className="avatar avatar-sm">{ini}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span>{c.referrer?.name}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Referral detail */}
      {referral && (
        <div className="thread-section glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h4 className="section-title" style={{ marginBottom: 0 }}>📋 Referral Submitted</h4>
            <span className="time-highlight">{new Date(referral.createdAt).toLocaleString()}</span>
          </div>
          <div className="referral-by">by <strong>{referral.referrer?.name}</strong></div>
          <p className="referral-text">{referral.description}</p>
        </div>
      )}

      {/* Thank you letter */}
      {thanks && (
        <div className="thread-section glass-card thanks-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h4 className="section-title" style={{ marginBottom: 0 }}>💌 Thank You Letter</h4>
            <span className="time-highlight">{new Date(thanks.createdAt).toLocaleString()}</span>
          </div>
          <pre className="letter-text">{thanks.letter}</pre>
        </div>
      )}

      {/* Actions */}
      <div className="thread-actions glass-card">
        <h4 className="section-title">Actions</h4>
        <div className="action-row">
          {!isOwner && request.status === 'open' && !hasConnected && (
            <button className="btn btn-primary" onClick={handleConnect} disabled={connecting}>
              {connecting ? '…' : '🤝 I can connect & refer'}
            </button>
          )}
          {hasConnected && !referral && (
            <form onSubmit={handleReferral} className="referral-form">
              <div className="field">
                <label>Submit your referral write-up</label>
                <textarea
                  value={referralText}
                  onChange={e => setReferralText(e.target.value)}
                  placeholder="Describe the referral you are providing..."
                  required
                />
              </div>
              <button className="btn btn-primary" type="submit" disabled={submittingReferral}>
                {submittingReferral ? '…' : '📤 Submit Referral'}
              </button>
            </form>
          )}
          {isOwner && request.status === 'referred' && !thanks && (
            <button className="btn btn-primary" onClick={handleThankYou}>
              💌 Say Thank You
            </button>
          )}
          {isOwner && request.status === 'open' && connections?.length === 0 && (
            <span className="waiting-msg">⏳ Waiting for someone to connect…</span>
          )}
        </div>
      </div>

      {/* Comments */}
      <div className="thread-section glass-card">
        <h4 className="section-title">💬 Discussion ({comments?.length || 0})</h4>
        <div className="comments-list">
          {comments?.map(c => {
            const ini = c.author?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
            return (
              <div key={c._id} className="comment-item">
                <div className="avatar avatar-sm">{ini}</div>
                <div className="comment-content">
                  <div className="comment-meta">
                    <strong>{c.author?.name}</strong>
                    <span className="time-highlight">{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  <p>{c.text}</p>
                </div>
              </div>
            );
          })}
          {!comments?.length && <div className="no-comments">No comments yet. Be the first!</div>}
        </div>
        <form onSubmit={handleComment} className="comment-form">
          <div className="field">
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Write a comment…"
              rows={3}
            />
          </div>
          <button className="btn btn-secondary btn-sm" type="submit" disabled={submittingComment || !comment.trim()}>
            {submittingComment ? '…' : 'Post Comment'}
          </button>
        </form>
      </div>
    </div>
  );
}
