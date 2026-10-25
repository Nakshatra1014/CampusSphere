import api from './api';

export const teamService = {
  searchTeams: async (params = {}) => {
    const res = await api.get('/teams', { params });
    return res.data;
  },

  getTeamById: async (id) => {
    const res = await api.get(`/teams/${id}`);
    return res.data;
  },

  createTeam: async (data) => {
    const res = await api.post('/teams', data);
    return res.data;
  },

  requestToJoin: async (id, message = '') => {
    const res = await api.post(`/teams/${id}/join`, { message });
    return res.data;
  },

  respondToRequest: async (teamId, requestId, accept) => {
    const res = await api.put(`/teams/${teamId}/requests/${requestId}/respond`, null, {
      params: { accept },
    });
    return res.data;
  },

  getMyTeams: async () => {
    const res = await api.get('/teams/my-teams');
    return res.data;
  },
};
