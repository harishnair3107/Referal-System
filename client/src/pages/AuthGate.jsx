import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { toast } from '../components/Toast.jsx';
import './AuthGate.css';

export default function AuthGate({ onAuth }) {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', inviteCode: '' });
  const [loading, setLoading] = useState(false);
  const [isFirstUser, setIsFirstUser] = useState(false);

  useEffect(() => {
    const code = searchParams.get('invite');
    if (code) {
      setForm(f => ({ ...f, inviteCode: code }));
      setMode('register');
    }
    // Check if first user
    api.auth.firstUserCheck()
      .then(d => { if (d.isFirst) setIsFirstUser(true); })
      .catch(() => {});
  }, [searchParams]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let data;
      if (mode === 'login') {
        data = await api.auth.login({ email: form.email, password: form.password });
      } else {
        data = await api.auth.register({
          name: form.name,
          email: form.email,
          password: form.password,
          inviteCode: form.inviteCode || undefined,
        });
      }
      toast(mode === 'login' ? 'Welcome back!' : 'Account created!', 'success');
      onAuth(data.user);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Background blobs */}
      <div className="auth-blob blob-1" />
      <div className="auth-blob blob-2" />
      <div className="auth-blob blob-3" />

      <div className="auth-box glass-card fade-in">
        <div className="auth-header">
          <div className="auth-logo">🔗</div>
          <h1 className="grad-text">Referral</h1>
          <p>A private community for meaningful referrals</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
          >Login</button>
          <button
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => setMode('register')}
          >Register</button>
        </div>

        <form onSubmit={submit} className="auth-form">
          {mode === 'register' && (
            <div className="field">
              <label>Full Name</label>
              <input value={form.name} onChange={set('name')} placeholder="Jane Smith" required autoComplete="name" />
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required autoComplete="email" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          </div>
          {mode === 'register' && !isFirstUser && (
            <div className="field">
              <label>Invite Code</label>
              <input value={form.inviteCode} onChange={set('inviteCode')} placeholder="Enter your invite code" required />
            </div>
          )}

          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? <span className="spinner" style={{width:18,height:18}} /> : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {isFirstUser && mode === 'register' && (
          <div className="auth-note">
            👑 You will be the first user and automatically become <strong>admin</strong>.
          </div>
        )}
      </div>
    </div>
  );
}
