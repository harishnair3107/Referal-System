import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import './Navbar.css';

export default function Navbar({ user, setUser, unreadCount }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await api.auth.logout().catch(() => {});
    setUser(null);
    navigate('/');
  };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/feed" className="navbar-brand">
          <span className="brand-icon">🔗</span>
          <span className="grad-text">Referral</span>
        </NavLink>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/feed" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            Feed
          </NavLink>
          <NavLink to="/my-requests" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            My Requests
          </NavLink>
          <NavLink to="/referring" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            Referring
          </NavLink>
          <NavLink to="/rankings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            Rankings
          </NavLink>
          <NavLink to="/notifications" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            Notifications
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </NavLink>
          {user?.isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
              Admin
            </NavLink>
          )}
        </div>

        <div className="navbar-right">
          <div className="user-pill">
            <div className="avatar avatar-sm">{initials}</div>
            <span className="user-name">{user?.name}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Logout
          </button>
          <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  );
}
