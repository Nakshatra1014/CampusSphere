import api from './api';

export const internshipService = {
  getInternships: async (params = {}) => {
    const res = await api.get('/internships', { params });
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    return res?.data ?? [];
  },

  getInternshipById: async (id) => {
    const res = await api.get(`/internships/${id}`);
    return res?.data ?? res;
  },

  postInternship: async (data) => {
    const res = await api.post('/internships', data);
    return res?.data ?? res;
  },

  updateInternship: async (id, data) => {
    const res = await api.put(`/internships/${id}`, data);
    return res?.data ?? res;
  },

  apply: async (id, data) => {
    const res = await api.post(`/internships/${id}/apply`, data);
    return res?.data ?? res;
  },

  applyWithFile: async (id, formData) => {
    const res = await api.post(`/internships/${id}/apply`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res?.data ?? res;
  },

  selfReportApplied: async (id) => {
    const res = await api.post(`/internships/${id}/self-report-applied`);
    return res?.data ?? res;
  },

  unmarkSelfReportApplied: async (id) => {
    const res = await api.delete(`/internships/${id}/self-report-applied`);
    return res?.data ?? res;
  },

  withdrawApplication: async (applicationId) => {
    const res = await api.post(`/internship-applications/${applicationId}/withdraw`);
    return res?.data ?? res;
  },

  getApplicationsForInternship: async (id) => {
    const res = await api.get(`/internships/${id}/applications`);
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    return res?.data ?? [];
  },

  updateApplicationStatus: async (internshipId, appId, status) => {
    const res = await api.put(`/internship-applications/${appId}/status`, { status });
    return res?.data ?? res;
  },

  getMyPosts: async () => {
    const res = await api.get('/internships/my-posts');
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    return res?.data ?? [];
  },

  getMyApplications: async () => {
    const res = await api.get('/internships/my-applications');
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    return res?.data ?? [];
  },

  deleteInternship: async (id) => {
    const res = await api.delete(`/internships/${id}`);
    return res.data;
  },

  getSyncStatus: async () => {
    const res = await api.get('/internships/sync/status');
    return res.data;
  },

  triggerSync: async () => {
    const res = await api.post('/internships/sync/trigger');
    return res.data;
  },

  getResumeDownloadUrl: (applicationId) => `/api/internship-applications/${applicationId}/resume`,
};
