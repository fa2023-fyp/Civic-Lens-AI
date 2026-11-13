import api from './client';
export const complaintsApi = {
  list: () => api.get('/complaints').then(r => r.data),
  get: id => api.get(`/complaints/${id}`).then(r => r.data),
  submit: values => api.post('/complaints', values).then(r => r.data),
  review: (id, values) => api.post(`/complaints/${id}/review`, values).then(r => r.data),
  start: id => api.post(`/complaints/${id}/start`).then(r => r.data),
  resolve: (id, values) => api.post(`/complaints/${id}/resolutions`, values).then(r => r.data),
  verify: (id, values) => api.post(`/complaints/${id}/verify`, values).then(r => r.data)
};
