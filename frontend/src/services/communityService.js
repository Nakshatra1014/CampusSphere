import api from './api';

export const communityService = {
  getPosts: async (params = {}) => {
    const res = await api.get('/community/posts', { params });
    return res.data;
  },

  getPostById: async (id) => {
    const res = await api.get(`/community/posts/${id}`);
    return res.data;
  },

  createPost: async (data) => {
    const res = await api.post('/community/posts', data);
    return res.data;
  },

  addComment: async (postId, content) => {
    const res = await api.post(`/community/posts/${postId}/comments`, { content });
    return res.data;
  },

  likePost: async (postId) => {
    const res = await api.post(`/community/posts/${postId}/like`);
    return res.data;
  },

  deletePost: async (postId) => {
    const res = await api.delete(`/community/posts/${postId}`);
    return res.data;
  },
};
