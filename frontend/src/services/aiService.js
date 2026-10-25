import api from './api';



export { notificationService } from './notificationService';

export const adminService = {
  getStats: async () => {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  getUsers: async (query) => {
    const res = await api.get('/admin/users', { params: { query } });
    return res.data;
  },

  updateUserRole: async (id, role) => {
    const res = await api.put(`/admin/users/${id}/role`, null, { params: { role } });
    return res.data;
  },

  toggleUserStatus: async (id) => {
    const res = await api.put(`/admin/users/${id}/toggle-active`);
    return res.data;
  },

  getAuditLogs: async () => {
    const res = await api.get('/admin/audit-logs');
    return res.data;
  },
};

export const uploadService = {
  uploadFile: async (file, folder = 'general') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const res = await api.post('/upload/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
