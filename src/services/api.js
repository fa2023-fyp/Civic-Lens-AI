import { mockApi } from './mock/index.js';

const mockEnabled = import.meta.env.VITE_USE_MOCK !== 'false';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
const demoPassword = 'Demo123!';
const sessionDurationMs = 15 * 60 * 1000;
const authUsers = [
  {
    email: 'citizen@demo.civiclens.test',
    password: demoPassword,
    user: { id: 'demo-citizen', name: 'Demo Citizen', role: 'citizen' },
  },
  {
    email: 'officer@demo.civiclens.test',
    password: demoPassword,
    user: { id: 'demo-officer', name: 'Demo Officer', role: 'officer', departmentId: 'roads' },
  },
  {
    email: 'supervisor@demo.civiclens.test',
    password: demoPassword,
    user: {
      id: 'demo-supervisor',
      name: 'Demo Supervisor',
      role: 'supervisor',
      departmentId: 'roads',
    },
  },
  {
    email: 'admin@demo.civiclens.test',
    password: demoPassword,
    user: { id: 'demo-admin', name: 'Demo Administrator', role: 'admin' },
  },
];
let nextRegisteredUserId = 0;
const registeredUsers = [];
const headersFor = (body) =>
  typeof FormData !== 'undefined' && body instanceof FormData
    ? {}
    : { 'Content-Type': 'application/json' };

async function request(path, options = {}) {
  if (!apiBaseUrl) throw new Error('VITE_API_BASE_URL is required when mock mode is disabled.');
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: { ...headersFor(options.body), ...options.headers },
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'The request could not be completed.');
  return body;
}

function createAuthSession(user) {
  const expiresAt = Date.now() + sessionDurationMs;
  return {
    user: { ...user },
    token: `demo.${encodeURIComponent(user.id)}.${expiresAt}`,
    expiresAt,
  };
}

async function login(credentials) {
  const email = String(credentials?.email ?? '').trim().toLowerCase();
  const account = [...authUsers, ...registeredUsers].find(
    (candidate) => candidate.email === email && candidate.password === credentials?.password,
  );
  if (!account) {
    throw Object.assign(new Error('Invalid demo credentials.'), {
      code: 'AUTH_INVALID_CREDENTIALS',
    });
  }
  return createAuthSession(account.user);
}

async function register(input = {}) {
  const email = String(input.email ?? '').trim().toLowerCase();
  const name = String(input.name ?? '').trim();
  if (!email || !name || !input.password) {
    throw Object.assign(new Error('Name, email, and password are required.'), {
      code: 'AUTH_INVALID_REGISTRATION',
    });
  }
  if ([...authUsers, ...registeredUsers].some((account) => account.email === email)) {
    throw Object.assign(new Error('An account already uses this email.'), {
      code: 'AUTH_EMAIL_EXISTS',
    });
  }

  const account = {
    email,
    password: String(input.password),
    user: {
      id: `registered-citizen-${++nextRegisteredUserId}`,
      name,
      role: 'citizen',
    },
  };
  registeredUsers.push(account);
  return createAuthSession(account.user);
}

async function refresh(session) {
  if (
    !session?.token ||
    !session.user?.id ||
    !Number.isFinite(session.expiresAt) ||
    session.expiresAt <= Date.now()
  ) {
    throw Object.assign(new Error('The demo session has expired.'), {
      code: 'AUTH_SESSION_EXPIRED',
    });
  }
  return createAuthSession(session.user);
}

async function logout() {
  return { loggedOut: true };
}

export const apiConfig = Object.freeze({ mockEnabled, apiBaseUrl });
export const api = Object.freeze({
  demoUsers: Object.freeze(
    authUsers.map(({ email, password, user }) =>
      Object.freeze({ email, password, ...user }),
    ),
  ),
  login,
  logout,
  register,
  refresh,
  listComplaints: (...args) =>
    mockEnabled ? mockApi.listComplaints(...args) : request('/complaints'),
  getComplaint: (id) =>
    mockEnabled ? mockApi.getComplaint(id) : request(`/complaints/${encodeURIComponent(id)}`),
  analyzeComplaint: (originalText) =>
    mockEnabled
      ? mockApi.analyzeComplaint(originalText)
      : request('/ai/analyze', {
          method: 'POST',
          body: JSON.stringify({ text: originalText }),
        }),
  submitComplaint: (input) =>
    mockEnabled
      ? mockApi.submitComplaint(input)
      : request('/complaints', {
          method: 'POST',
          body: JSON.stringify(input),
        }),
  reviewComplaint: (input) =>
    mockEnabled
      ? mockApi.reviewComplaint(input)
      : request(`/complaints/${encodeURIComponent(input.complaintId)}/review`, {
          method: 'POST',
          body: JSON.stringify(input),
        }),
  submitResolution: (input) =>
    mockEnabled
      ? mockApi.submitResolution(input)
      : request(`/complaints/${encodeURIComponent(input.complaintId)}/resolutions`, {
          method: 'POST',
          body: JSON.stringify(input),
        }),
  verifyResolution: (input) =>
    mockEnabled
      ? mockApi.verifyResolution(input)
      : request(`/complaints/${encodeURIComponent(input.complaintId)}/verify`, {
          method: 'POST',
          body: JSON.stringify(input),
        }),
  getAuditTrail: (complaintId) =>
    mockEnabled
      ? mockApi.getAuditTrail(complaintId)
      : request(`/admin/audit?complaintId=${encodeURIComponent(complaintId)}`),
});
