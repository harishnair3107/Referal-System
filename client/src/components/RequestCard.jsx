import { useNavigate } from 'react-router-dom';
import './RequestCard.css';

const STATUS_DOT = {
  open: '🟢', connected: '🔵', referred: '🟣', thanked: '🟡', closed: '⚫',
};

export default function RequestCard({ request, currentUser }) {
  const navigate = useNavigate();
  const initials = request.author?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const isOwn = String(request.author?._id) === String(currentUser?._id);

  return (
    <article
      className="request-card glass-card fade-in"
      onClick={() => navigate(`/requests/${request._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/requests/${request._id}`)}
    >
      <div className="rc-top">
        <div className="rc-author">
          <div className="avatar avatar-sm">{initials}</div>
          <div>
            <div className="rc-name">{request.author?.name}</div>
            <div className="rc-time">{new Date(request.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
        <span className={`status-badge status-${request.status}`}>
          {STATUS_DOT[request.status]} {request.status}
        </span>
      </div>

      <h3 className="rc-title">{request.title}</h3>
      <p className="rc-desc">{request.description}</p>

      {isOwn && <span className="rc-own-badge">Your request</span>}
    </article>
  );
}
