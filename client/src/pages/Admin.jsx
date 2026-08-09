import { useState, useEffect, useCallback } from 'react';
import { api } from '../api.js';
import Modal from '../components/Modal.jsx';
import { toast } from '../components/Toast.jsx';
import './Pages.css';

export default function Admin() {
  const [tab, setTab] = useState('invites');
  const [invites, setInvites] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberForm, setMemberForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadInvites = useCallback(async () => {
    const data = await api.invites.list();
    setInvites(data.invites);
  }, []);

  const loadMembers = useCallback(async () => {
    const data = await api.invites.listMembers();
    setMembers(data.members);
  }, []);

  useEffect(() => {
    Promise.all([loadInvites(), loadMembers()])
      .catch(e => toast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [loadInvites, loadMembers]);

  const createInvite = async () => {
    setCreating(true);
    try {
      const data = await api.invites.create();
      setInvites(prev => [data.invite, ...prev]);
      toast('Invite created!', 'success');
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  const copyLink = (code) => {
    const link = `${window.location.origin}/?invite=${code}`;
    navigator.clipboard.writeText(link).then(() => toast('Link copied!', 'success'));
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await api.invites.addMember(memberForm);
      setMembers(prev => [...prev, { ...data.user, stats: { connections: 0, referrals: 0, thankYous: 0 } }]);
      setMemberForm({ name: '', email: '', password: '' });
      setShowAddMember(false);
      toast('Member added!', 'success');
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading-center"><div className="spinner" /></div>;
  }

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title grad-text">Admin</h1>
          <p>Manage invites and members</p>
        </div>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'invites' ? 'active' : ''}`} onClick={() => setTab('invites')}>
          Invites
        </button>
        <button className={`admin-tab ${tab === 'members' ? 'active' : ''}`} onClick={() => setTab('members')}>
          Members
        </button>
      </div>

      {tab === 'invites' && (
        <div className="admin-section">
          <div className="admin-toolbar">
            <button className="btn btn-primary" onClick={createInvite} disabled={creating}>
              {creating ? 'Creating…' : '+ Generate Invite Link'}
            </button>
          </div>

          {invites.length === 0 ? (
            <div className="empty-state">
              <span className="icon">🎟️</span>
              <h3>No invites yet</h3>
              <p>Generate an invite link to add new members.</p>
            </div>
          ) : (
            <div className="admin-table glass-card">
              <div className="admin-table-header">
                <span>Code</span>
                <span>Status</span>
                <span>Used By</span>
                <span>Created</span>
                <span>Actions</span>
              </div>
              {invites.map(inv => (
                <div key={inv._id} className="admin-table-row">
                  <span className="mono">{inv.code}</span>
                  <span>
                    {inv.usedBy ? (
                      <span className="status-badge status-closed">Used</span>
                    ) : (
                      <span className="status-badge status-open">Available</span>
                    )}
                  </span>
                  <span>{inv.usedBy?.name || '—'}</span>
                  <span className="text-muted">{new Date(inv.createdAt).toLocaleDateString()}</span>
                  <span>
                    {!inv.usedBy && (
                      <button className="btn btn-secondary btn-sm" onClick={() => copyLink(inv.code)}>
                        Copy Link
                      </button>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'members' && (
        <div className="admin-section">
          <div className="admin-toolbar">
            <button className="btn btn-primary" onClick={() => setShowAddMember(true)}>
              + Add Member
            </button>
          </div>

          <div className="admin-table glass-card">
            <div className="admin-table-header members-header">
              <span>Member</span>
              <span>Email</span>
              <span>Role</span>
              <span>Referrals</span>
              <span>Thanks</span>
              <span>Connects</span>
            </div>
            {members.map(m => {
              const initials = m.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
              return (
                <div key={m._id} className="admin-table-row members-row">
                  <span className="col-name">
                    <div className="avatar avatar-sm">{initials}</div>
                    {m.name}
                  </span>
                  <span className="text-muted">{m.email}</span>
                  <span>{m.isAdmin ? '👑 Admin' : 'Member'}</span>
                  <span>{m.stats?.referrals ?? 0}</span>
                  <span>{m.stats?.thankYous ?? 0}</span>
                  <span>{m.stats?.connections ?? 0}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showAddMember && (
        <Modal title="Add Member" onClose={() => setShowAddMember(false)}>
          <form onSubmit={handleAddMember} className="modal-form">
            <div className="field">
              <label>Full Name</label>
              <input
                value={memberForm.name}
                onChange={e => setMemberForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                value={memberForm.email}
                onChange={e => setMemberForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                value={memberForm.password}
                onChange={e => setMemberForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddMember(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Adding…' : 'Add Member'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
