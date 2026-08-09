import { useState, useEffect } from 'react';
import { api } from '../api.js';
import { toast } from '../components/Toast.jsx';
import './Pages.css';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Rankings({ user }) {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.rankings.list()
      .then(d => setRankings(d.rankings))
      .catch(e => toast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title grad-text">Rankings</h1>
          <p>Community leaderboard — referrals, thank-yous & connections</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : rankings.length === 0 ? (
        <div className="empty-state">
          <span className="icon">🏆</span>
          <h3>No rankings yet</h3>
          <p>Start referring to climb the leaderboard!</p>
        </div>
      ) : (
        <div className="rankings-table glass-card">
          <div className="rankings-header">
            <span className="col-rank">#</span>
            <span className="col-name">Member</span>
            <span className="col-stat" title="Referrals made">📋 Referrals</span>
            <span className="col-stat" title="Thank-yous received">💌 Thanks</span>
            <span className="col-stat" title="Connections made">🤝 Connects</span>
            <span className="col-score">Score</span>
          </div>
          {rankings.map((r, i) => {
            const isMe = String(r._id) === String(user?._id);
            const initials = r.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
            return (
              <div key={r._id} className={`rankings-row ${isMe ? 'is-me' : ''} ${i < 3 ? 'top-three' : ''}`}>
                <span className="col-rank">{MEDALS[i] || i + 1}</span>
                <span className="col-name">
                  <div className="avatar avatar-sm">{initials}</div>
                  <span>{r.name}{isMe && ' (you)'}</span>
                </span>
                <span className="col-stat">{r.referralsMade}</span>
                <span className="col-stat">{r.thankYousReceived}</span>
                <span className="col-stat">{r.connectionsMade}</span>
                <span className="col-score">{r.score}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="score-legend glass-card">
        <h4>How scores are calculated</h4>
        <p>Referrals × 3 + Thank-yous × 5 + Connections × 1</p>
      </div>
    </div>
  );
}
