import api from './api';

export const rideService = {
  searchRides: async (params = {}) => {
    const res = await api.get('/rides', { params });
    return res.data;
  },

  getRideById: async (id) => {
    const res = await api.get(`/rides/${id}`);
    return res.data;
  },

  createRide: async (data) => {
    const res = await api.post('/rides', data);
    return res.data;
  },

  updateRide: async (id, data) => {
    const res = await api.put(`/rides/${id}`, data);
    return res.data;
  },

  deleteRide: async (id) => {
    const res = await api.delete(`/rides/${id}`);
    return res.data;
  },

  bookRide: async (id, seats = 1) => {
    const res = await api.post(`/rides/${id}/book`, { seats });
    return res.data;
  },

  cancelBooking: async (id) => {
    const res = await api.put(`/rides/${id}/cancel-booking`);
    return res.data;
  },

  confirmBooking: async (rideId, bookingId) => {
    const res = await api.put(`/rides/${rideId}/bookings/${bookingId}/confirm`);
    return res.data;
  },

  rejectBooking: async (rideId, bookingId) => {
    const res = await api.put(`/rides/${rideId}/bookings/${bookingId}/reject`);
    return res.data;
  },

  cancelRide: async (id) => {
    const res = await api.put(`/rides/${id}/cancel-ride`);
    return res.data;
  },

  getMyCreatedRides: async () => {
    const res = await api.get('/rides/my');
    return res.data;
  },

  getMyRides: async () => {
    const res = await api.get('/rides/my');
    return res.data;
  },

  getMyBookedRides: async () => {
  const res = await api.get('/rides/my-bookings');
  return res.data;
  },
};
