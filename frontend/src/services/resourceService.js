import api from './api';
import axios from 'axios';

export const resourceService = {
  /**
   * Search and filter academic resources
   */
  searchResources: async (params = {}) => {
    const res = await api.get('/resources', { params });
    return res.data;
  },

  /**
   * Get resource metadata details by ID (does NOT increment download count)
   */
  getResourceById: async (id) => {
    const res = await api.get(`/resources/${id}`);
    return res.data;
  },

  /**
   * Download the actual binary file from Spring Boot backend.
   * Axios requests binary blob with Authorization header and triggers browser download.
   */
  downloadResourceFile: async (id, fallbackFileName = 'academic_resource') => {
    const token =
      localStorage.getItem('campussphere_token') ||
      localStorage.getItem('campushub_token');

    const response = await axios.get(`/api/resources/${id}/download`, {
      responseType: 'blob',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    // Get filename from backend Content-Disposition
    let fileName = fallbackFileName;

    const disposition = response.headers['content-disposition'];

    if (disposition) {
      // Handles: filename="notes.pdf"
      const filenameMatch = disposition.match(/filename="([^"]+)"/);

      // Handles: filename*=UTF-8''notes.pdf
      const filenameStarMatch = disposition.match(/filename\*=UTF-8''([^;]+)/);

      if (filenameStarMatch?.[1]) {
        fileName = decodeURIComponent(filenameStarMatch[1]);
      } else if (filenameMatch?.[1]) {
        fileName = filenameMatch[1];
      }
    }

    // Make sure filename has an extension
    const contentType = response.headers['content-type'];

    if (
      contentType === 'application/pdf' &&
      !fileName.toLowerCase().endsWith('.pdf')
    ) {
      fileName += '.pdf';
    }

    // Create Blob
    const blob = new Blob([response.data], {
      type: contentType || 'application/octet-stream',
    });

    // Download
    const downloadUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(downloadUrl);

    return {
      success: true,
      fileName,
    };
  },

  /**
   * Upload resource with multipart/form-data
   */
  uploadResource: async (formData) => {
    const token =
      localStorage.getItem('campussphere_token') ||
      localStorage.getItem('campushub_token');

    if (formData instanceof FormData) {
      const res = await axios.post('/api/resources', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: token ? `Bearer ${token}` : '',
        },
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

      const res = await axios.post('/api/resources', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      return res.data?.data || res.data;
    }

    const res = await api.post('/api/resources', formData);
    return res.data;
  },

  /**
   * Get resources uploaded by the logged-in faculty member
   */
  getMyUploadedResources: async () => {
    const res = await api.get('/resources/my');
    return res.data;
  },

  getMyUploads: async () => {
    const res = await api.get('/resources/my');
    return res.data;
  },

  /**
   * Delete resource
   */
  deleteResource: async (id) => {
    const res = await api.delete(`/resources/${id}`);
    return res.data;
  },

  /**
   * Update resource metadata
   */
  updateResource: async (id, data) => {
    const res = await api.put(`/resources/${id}`, data);
    return res.data?.data || res.data;
  },
};

export default resourceService;