import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { api } from './api.js';
import Navbar from './components/Navbar.jsx';
import ToastContainer from './components/Toast.jsx';
import AuthGate from './pages/AuthGate.jsx';
import Feed from './pages/Feed.jsx';
import MyRequests from './pages/MyRequests.jsx';
import RequestDetail from './pages/RequestDetail.jsx';
import Referring from './pages/Referring.jsx';
import Rankings from './pages/Rankings.jsx';
import Notifications from './pages/Notifications.jsx';
import Admin from './pages/Admin.jsx';

function AppLayout({ user, setUser, unreadCount }) {
  return (
    <>
      <Navbar user={user} setUser={setUser} unreadCount={unreadCount} />
      <Outlet />
    </>
  );
}

function AppRoutes() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnread = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.notifications.list();
      setUnreadCount(data.notifications.filter(n => !n.read).length);
    } catch { /* ignore */ }
  }, [user]);

  useEffect(() => {
    api.auth.me()
      .then(d => setUser(d.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    refreshUnread();
    const id = setInterval(refreshUnread, 30000);
    return () => clearInterval(id);
  }, [user, refreshUnread]);

  if (loading) {
    return (
      <div className="loading-center" style={{ minHeight: '100svh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      <Routes>
        <Route
          path="/"
          element={
            user
              ? <Navigate to="/feed" replace />
              : <AuthGate onAuth={setUser} />
          }
        />
        {user ? (
          <Route element={<AppLayout user={user} setUser={setUser} unreadCount={unreadCount} />}>
            <Route path="/feed" element={<Feed user={user} />} />
            <Route path="/my-requests" element={<MyRequests user={user} />} />
            <Route path="/requests/:id" element={<RequestDetail user={user} />} />
            <Route path="/referring" element={<Referring />} />
            <Route path="/rankings" element={<Rankings user={user} />} />
            <Route path="/notifications" element={<Notifications onRead={refreshUnread} />} />
            {user.isAdmin && <Route path="/admin" element={<Admin />} />}
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/" replace />} />
        )}
        <Route path="*" element={<Navigate to={user ? '/feed' : '/'} replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
