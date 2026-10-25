import api from './api';

export const notificationService = {
  getMyNotifications: async () => {
    const res = await api.get('/notifications');
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    return res?.data ?? [];
  },

  getUnreadCount: async () => {
    const res = await api.get('/notifications/unread-count');
    return res?.data?.unreadCount ?? res?.unreadCount ?? 0;
  },

  markAsRead: async (id) => {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await api.put('/notifications/read-all');
    return res.data;
  },

  deleteNotification: async (id) => {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  },

  clearAllNotifications: async () => {
    const res = await api.delete('/notifications');
    return res.data;
  },
};

export default notificationService;
