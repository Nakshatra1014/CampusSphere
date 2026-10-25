import api from './api';

export const lostFoundService = {
  searchItems: async (params = {}) => {
    const res = await api.get('/lost-found', { params });
    return res.data;
  },

  getItemById: async (id) => {
    const res = await api.get(`/lost-found/${id}`);
    return res.data;
  },

  reportItem: async (data) => {
    const res = await api.post('/lost-found', data);
    return res.data;
  },

  claimItem: async (id, claimNote) => {
    const res = await api.put(`/lost-found/${id}/claim`, { claimNote });
    return res.data;
  },

  resolveItem: async (id) => {
    const res = await api.put(`/lost-found/${id}/resolve`);
    return res.data;
  },

  getMyReports: async () => {
    const res = await api.get('/lost-found/my-reports');
    return res.data;
  },
};
