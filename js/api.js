const BASE = '/api';

async function req(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  auth: {
    register: (body) => req('/auth.php?action=register', { method: 'POST', body }),
    login: (body) => req('/auth.php?action=login', { method: 'POST', body }),
    logout: () => req('/auth.php?action=logout', { method: 'POST' }),
    me: () => req('/auth.php?action=me'),
    firstUserCheck: () => req('/auth.php?action=first-user-check'),
  },
  invites: {
    create: () => req('/invites.php', { method: 'POST' }),
    list: () => req('/invites.php'),
    listMembers: () => req('/invites.php?action=members'),
    addMember: (body) => req('/invites.php?action=members', { method: 'POST', body }),
  },
  requests: {
    feed: () => req('/requests.php'),
    mine: () => req('/requests.php?action=mine'),
    get: (id) => req(`/requests.php?id=${id}`),
    create: (body) => req('/requests.php', { method: 'POST', body }),
    comment: (id, body) => req(`/requests.php?action=comment&id=${id}`, { method: 'POST', body }),
  },
  connections: {
    connect: (requestId) => req(`/connections.php?id=${requestId}`, { method: 'POST' }),
    referring: () => req('/connections.php?action=referring'),
  },
  referrals: {
    submit: (requestId, body) => req(`/referrals.php?id=${requestId}`, { method: 'POST', body }),
  },
  thanks: {
    submit: (requestId) => req(`/thanks.php?id=${requestId}`, { method: 'POST' }),
  },
  rankings: {
    list: () => req('/rankings.php'),
  },
  notifications: {
    list: () => req('/notifications.php'),
    readAll: () => req('/notifications.php?action=read-all', { method: 'PATCH' }),
    readOne: (id) => req(`/notifications.php?action=read&id=${id}`, { method: 'PATCH' }),
  },
};
