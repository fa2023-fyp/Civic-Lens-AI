import { mockApi } from './mock/index.js';

const mockEnabled = import.meta.env.VITE_USE_MOCK !== 'false';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
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

export const apiConfig = Object.freeze({ mockEnabled, apiBaseUrl });
export const api = Object.freeze({
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
