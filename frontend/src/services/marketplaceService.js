import api from './api';

export const marketplaceService = {
  searchItems: async (params = {}) => {
    const res = await api.get('/marketplace', { params });
    return res.data;
  },

  getItemById: async (id) => {
    const res = await api.get(`/marketplace/${id}`);
    return res.data;
  },

  createListing: async (data) => {
    const res = await api.post('/marketplace', data);
    return res.data;
  },

  updateListing: async (id, data) => {
    const res = await api.put(`/marketplace/${id}`, data);
    return res.data;
  },

  markAsSold: async (id) => {
    const res = await api.put(`/marketplace/${id}/sold`);
    return res.data;
  },

  deleteListing: async (id) => {
    const res = await api.delete(`/marketplace/${id}`);
    return res.data;
  },

  getMyListings: async () => {
    const res = await api.get('/marketplace/my');
    return res.data;
  },
};
