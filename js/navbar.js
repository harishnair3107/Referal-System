import { api } from './api.js';

export async function renderNavbar() {
  const container = document.getElementById('navbar-container');
  if (!container) return;

  try {
    const { user } = await api.auth.me();
    if (!user) {
      window.location.href = 'index.html';
      return null;
    }

    const { notifications } = await api.notifications.list();
    const unreadCount = notifications ? notifications.filter(n => !n.read).length : 0;
    
    const initials = user.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();

    container.innerHTML = `
      <nav class="navbar">
        <div class="navbar-inner">
          <a href="feed.html" class="navbar-brand">
            <span class="brand-icon">🔗</span>
            <span class="grad-text">Referral</span>
          </a>
          <div class="navbar-links" id="navbar-links">
            <a href="feed.html" class="nav-link">Feed</a>
            <a href="my-requests.html" class="nav-link">My Requests</a>
            <a href="referring.html" class="nav-link">Referring</a>
            <a href="rankings.html" class="nav-link">Rankings</a>
            <a href="notifications.html" class="nav-link">
              Notifications
              ${unreadCount > 0 ? `<span class="notif-badge">${unreadCount}</span>` : ''}
            </a>
            ${user.isAdmin ? `<a href="admin.html" class="nav-link">Admin</a>` : ''}
          </div>
          <div class="navbar-right">
            <div class="user-pill">
              <div class="avatar avatar-sm">${initials}</div>
              <span class="user-name">${user.name}</span>
            </div>
            <button class="btn btn-ghost btn-sm" id="logout-btn">Logout</button>
          </div>
        </div>
      </nav>
    `;

    document.getElementById('logout-btn').onclick = async () => {
      await api.auth.logout();
      window.location.href = 'index.html';
    };

    // Highlight active link
    const links = container.querySelectorAll('.nav-link');
    links.forEach(l => {
      if(l.href === window.location.href) l.classList.add('active');
    });

    return user;
  } catch (err) {
    window.location.href = 'index.html';
  }
}
