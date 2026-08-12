const BASE = 'http://localhost:5000/api';

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

// Auth
export const api = {
  auth: {
    register: (body) => req('/auth/register', { method: 'POST', body }),
    login: (body) => req('/auth/login', { method: 'POST', body }),
    logout: () => req('/auth/logout', { method: 'POST' }),
    me: () => req('/auth/me'),
    firstUserCheck: () => req('/auth/first-user-check'),
  },
  invites: {
    create: () => req('/invites', { method: 'POST' }),
    list: () => req('/invites'),
    listMembers: () => req('/invites/members'),
    addMember: (body) => req('/invites/members', { method: 'POST', body }),
  },
  requests: {
    feed: () => req('/requests'),
    mine: () => req('/requests/mine'),
    get: (id) => req(`/requests/${id}`),
    create: (body) => req('/requests', { method: 'POST', body }),
    comment: (id, body) => req(`/requests/${id}/comments`, { method: 'POST', body }),
  },
  connections: {
    connect: (requestId) => req(`/connections/${requestId}`, { method: 'POST' }),
    referring: () => req('/connections/referring'),
  },
  referrals: {
    submit: (requestId, body) => req(`/referrals/${requestId}`, { method: 'POST', body }),
  },
  thanks: {
    send: (requestId) => req(`/thanks/${requestId}`, { method: 'POST' }),
  },
  rankings: {
    list: () => req('/rankings'),
  },
  notifications: {
    list: () => req('/notifications'),
    readAll: () => req('/notifications/read-all', { method: 'PATCH' }),
    readOne: (id) => req(`/notifications/${id}/read`, { method: 'PATCH' }),
  },
};
