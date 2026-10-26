
import api from './api';

export const resourceService = {
  searchResources: async (params = {}) => {
    const res = await api.get('/resources', { params });
    return res.data;
  },

  getResourceById: async (id) => {
    const res = await api.get(`/resources/${id}`);
    return res.data;
  },

  downloadResourceFile: async (id, fallbackFileName = 'academic_resource') => {
    const response = await api.get(`/resources/${id}/download`, {
      responseType: 'blob',
    });

    let fileName = fallbackFileName;
    const disposition = response.headers?.['content-disposition'];

    if (disposition) {
      const filenameMatch = disposition.match(/filename="([^"]+)"/);
      const filenameStarMatch = disposition.match(/filename\*=UTF-8''([^;]+)/);

      if (filenameStarMatch?.[1]) {
        fileName = decodeURIComponent(filenameStarMatch[1]);
      } else if (filenameMatch?.[1]) {
        fileName = filenameMatch[1];
      }
    }

    const contentType = response.headers?.['content-type'];

    if (
      contentType === 'application/pdf' &&
      !fileName.toLowerCase().endsWith('.pdf')
    ) {
      fileName += '.pdf';
    }

    const blob = new Blob([response.data], {
      type: contentType || 'application/octet-stream',
    });

    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    return { success: true, fileName };
  },

  uploadResource: async (formData) => {
    if (formData instanceof FormData) {
      const res = await api.post('/resources', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data?.data || res.data;
    }

    if (formData.file instanceof File) {
      const data = new FormData();
      data.append('file', formData.file);
      data.append('title', formData.title || '');
      data.append('description', formData.description || '');
      data.append('subject', formData.subject || '');
      data.append('department', formData.department || '');
      data.append('semester', formData.semester || 1);
      data.append('resourceType', formData.resourceType || 'Notes');
      if (formData.tags) data.append('tags', formData.tags);

      const res = await api.post('/resources', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data?.data || res.data;
    }

    const res = await api.post('/resources', formData);
    return res.data;
  },

  getMyUploadedResources: async () => {
    const res = await api.get('/resources/my');
    return res.data;
  },

  getMyUploads: async () => {
    const res = await api.get('/resources/my');
    return res.data;
  },

  deleteResource: async (id) => {
    const res = await api.delete(`/resources/${id}`);
    return res.data;
  },

  updateResource: async (id, data) => {
    const res = await api.put(`/resources/${id}`, data);
    return res.data?.data || res.data;
  },
};

export default resourceService;
