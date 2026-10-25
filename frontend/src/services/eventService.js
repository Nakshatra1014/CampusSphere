import api from './api';

export const eventService = {
  getApprovedEvents: async (params = {}) => {
    const res = await api.get('/events', { params });
    return res.data;
  },

  getEventById: async (id) => {
    const res = await api.get(`/events/${id}`);
    return res.data;
  },

  createEventRequest: async (eventData) => {
    const res = await api.post('/events', eventData);
    return res.data;
  },

  updateEvent: async (id, eventData) => {
    const res = await api.put(`/events/${id}`, eventData);
    return res.data;
  },

  deleteEvent: async (id) => {
    const res = await api.delete(`/events/${id}`);
    return res.data;
  },

  registerForEvent: async (id, registrationData) => {
    const res = await api.post(`/events/${id}/register`, registrationData || {});
    return res.data;
  },

  cancelRegistration: async (id) => {
    const res = await api.post(`/events/${id}/cancel-registration`);
    return res.data;
  },

  getMyOrganizedEvents: async () => {
    const res = await api.get('/events/my');
    return res.data;
  },

  getMyRegistrations: async () => {
    const res = await api.get('/events/my-registrations');
    return res.data;
  },

  getEventParticipants: async (id) => {
    const res = await api.get(`/events/${id}/participants`);
    return res.data;
  },

  cancelEvent: async (id) => {
    const res = await api.put(`/events/${id}/cancel`);
    return res.data;
  },

  // Form Builder
  getEventFormFields: async (id) => {
    const res = await api.get(`/events/${id}/form-fields`);
    return res.data;
  },

  addFormField: async (id, fieldData) => {
    const res = await api.post(`/events/${id}/form-fields`, fieldData);
    return res.data;
  },

  updateFormField: async (id, fieldId, fieldData) => {
    const res = await api.put(`/events/${id}/form-fields/${fieldId}`, fieldData);
    return res.data;
  },

  deleteFormField: async (id, fieldId) => {
    const res = await api.delete(`/events/${id}/form-fields/${fieldId}`);
    return res.data;
  },

  // Admin Actions
  getPendingEvents: async () => {
    const res = await api.get('/admin/events/pending');
    return res.data;
  },

  approveEvent: async (id) => {
    const res = await api.put(`/admin/events/${id}/approve`);
    return res.data;
  },

  rejectEvent: async (id, reason) => {
    const res = await api.put(`/admin/events/${id}/reject`, { reason });
    return res.data;
  },
};
