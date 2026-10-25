import api from './api';

export const roommateService = {
  searchProfiles: async (params = {}) => {
    const res = await api.get('/roommates', { params });
    return res.data;
  },

  getMyProfile: async () => {
    const res = await api.get('/roommates/me');
    return res.data;
  },

  getProfileById: async (id) => {
    const res = await api.get(`/roommates/${id}`);
    return res.data;
  },

  saveProfile: async (data) => {
    const res = await api.post('/roommates', data);
    return res.data;
  },

  toggleStatus: async () => {
    const res = await api.put('/roommates/toggle-status');
    return res.data;
  },
};
