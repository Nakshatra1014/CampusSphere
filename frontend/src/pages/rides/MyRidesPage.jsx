import React, { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  Stack,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  DirectionsCar as RideIcon,
  LocationOn as LocationIcon,
  Schedule as TimeIcon,
  EventSeat as SeatIcon,
  Cancel as CancelIcon,
  Groups as GroupsIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { rideService } from '../../services/rideService';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate } from '../../utils/formatters';
import StatusChip from '../../components/common/StatusChip';
import { LoadingState, EmptyState } from '../../components/common/LoadingState';

export default function MyRidesPage({ initialTab = null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useNotifications();

  // Determine initial tab from props or query param
  const getInitialTab = () => {
    if (initialTab !== null) return initialTab;
    const params = new URLSearchParams(location.search);
    if (params.get('tab') === 'bookings' || params.get('tab') === '1' || location.pathname.includes('bookings')) {
      return 1;
    }
    return 0;
  };

  const [tabValue, setTabValue] = useState(getInitialTab);
  const [createdRides, setCreatedRides] = useState([]);
  const [bookedRides, setBookedRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Passengers dialog for driver management
  const [passengersDialog, setPassengersDialog] = useState({ open: false, ride: null });

  const loadData = async () => {
    try {
      setLoading(true);
      const [created, booked] = await Promise.all([
        rideService.getMyCreatedRides(),
        rideService.getMyBookedRides(),
      ]);
      setCreatedRides(created || []);
      setBookedRides(booked || []);
    } catch (err) {
      showToast(err.message || 'Failed to load your rides and bookings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update tab if location search changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('tab') === 'bookings' || params.get('tab') === '1' || location.pathname.includes('bookings')) {
      setTabValue(1);
    }
  }, [location.search, location.pathname]);

  const handleCancelMyCreatedRide = async (rideId) => {
    if (!window.confirm('Are you sure you want to cancel this ride? All booked passengers will be notified.')) return;
    try {
      setActionLoading(true);
      await rideService.cancelRide(rideId);
      showToast('Ride cancelled successfully. Passengers have been notified.', 'success');
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to cancel ride.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelMyBooking = async (rideId, bookingId) => {
    if (!window.confirm('Are you sure you want to cancel your seat booking?')) return;
    try {
      setActionLoading(true);
      if (bookingId && rideId) {
        await rideService.cancelBooking(rideId);
      } else {
        await rideService.cancelBooking(rideId);
      }
      showToast('Booking cancelled and seats returned to ride pool.', 'success');
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to cancel booking.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Driver action: Confirm pending passenger booking
  const handleConfirmPassenger = async (rideId, bookingId) => {
    try {
      setActionLoading(true);
      await rideService.confirmBooking(rideId, bookingId);
      showToast('Booking confirmed! Passenger has been notified.', 'success');
      await loadData();
      // Refresh dialog ride details
      setPassengersDialog((prev) => {
        if (!prev.ride) return prev;
        const updatedPassengers = prev.ride.passengers?.map((p) =>
          p.id === bookingId ? { ...p, status: 'CONFIRMED' } : p
        );
        return { ...prev, ride: { ...prev.ride, passengers: updatedPassengers } };
      });
    } catch (err) {
      showToast(err.message || 'Failed to confirm booking.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Driver action: Decline passenger booking
  const handleRejectPassenger = async (rideId, bookingId) => {
    if (!window.confirm('Are you sure you want to decline this booking request? Seats will be returned.')) return;
    try {
      setActionLoading(true);
      await rideService.rejectBooking(rideId, bookingId);
      showToast('Booking declined. Passenger has been notified.', 'info');
      await loadData();
      setPassengersDialog((prev) => {
        if (!prev.ride) return prev;
        const updatedPassengers = prev.ride.passengers?.map((p) =>
          p.id === bookingId ? { ...p, status: 'REJECTED' } : p
        );
        return { ...prev, ride: { ...prev.ride, passengers: updatedPassengers } };
      });
    } catch (err) {
      showToast(err.message || 'Failed to decline booking.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/rides')}
        sx={{ mb: 2, color: 'text.secondary' }}
      >
        Back to Rides
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
            My Rides & Bookings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage rides you are offering and track your reserved passenger seats.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/rides/create')}
        >
          Offer a Ride
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
          <Tab label={`My Created Rides (${createdRides.length})`} />
          <Tab label={`My Seat Bookings (${bookedRides.length})`} />
        </Tabs>
      </Box>

      {loading ? (
        <LoadingState message="Loading your rides..." />
      ) : tabValue === 0 ? (
        // Tab 0: Created Rides
        createdRides.length === 0 ? (
          <EmptyState
            title="No rides offered yet"
            message="You haven't posted any rides. Share a trip to commute together with classmates!"
            actionLabel="Offer a Ride"
            onAction={() => navigate('/rides/create')}
          />
        ) : (
          <Grid container spacing={3}>
            {createdRides.map((ride) => (
              <Grid item xs={12} sm={6} md={4} key={ride.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <StatusChip status={ride.status} />
                      <Chip
                        icon={<SeatIcon fontSize="small" />}
                        label={`${ride.availableSeats}/${ride.totalSeats} seats free`}
                        size="small"
                        color={ride.availableSeats > 0 ? 'primary' : 'default'}
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                        <LocationIcon color="primary" sx={{ fontSize: 20, mr: 1, mt: 0.2 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">From</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{ride.startLocation}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <LocationIcon color="error" sx={{ fontSize: 20, mr: 1, mt: 0.2 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">To</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{ride.destination}</Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                        <TimeIcon sx={{ fontSize: 14, mr: 0.5 }} /> {formatDate(ride.rideDate)} at {ride.rideTime}
                      </Typography>
                      {ride.vehicleInfo && (
                        <Typography variant="caption" sx={{ bgcolor: '#f1f5f9', px: 1, py: 0.3, borderRadius: 1 }}>
                          🚗 {ride.vehicleInfo}
                        </Typography>
                      )}
                    </Box>

                    {ride.notes && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block', mt: 1 }}>
                        "{ride.notes}"
                      </Typography>
                    )}
                  </CardContent>

                  <Box sx={{ px: 2.5, pb: 2.5, pt: 1, borderTop: '1px solid #f1f5f9', display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<GroupsIcon />}
                      onClick={() => setPassengersDialog({ open: true, ride })}
                      fullWidth
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      Passengers ({ride.passengers?.length || 0})
                    </Button>
                    {ride.status === 'ACTIVE' && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        disabled={actionLoading}
                        onClick={() => handleCancelMyCreatedRide(ride.id)}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                      >
                        Cancel
                      </Button>
                    )}
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )
      ) : (
        // Tab 1: Booked Rides (My Bookings)
        bookedRides.length === 0 ? (
          <EmptyState
            title="No seat bookings found"
            message="You haven't booked seats on any rides yet. Search available campus rides and book a seat!"
            actionLabel="Browse Rides"
            onAction={() => navigate('/rides')}
          />
        ) : (
          <Grid container spacing={3}>
            {bookedRides.map((booking) => {
              const isPending = booking.status === 'PENDING';
              const isConfirmed = booking.status === 'CONFIRMED';
              const isCancelled = booking.status === 'CANCELLED';
              const isRejected = booking.status === 'REJECTED';

              return (
                <Grid item xs={12} sm={6} md={4} key={booking.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: isPending ? '1px solid #fed7aa' : '1px solid #e2e8f0' }}>
                    <CardContent sx={{ p: 2.5 }}>
                      {/* Top Header: Status + Seats */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        {isPending ? (
                          <Chip label="Pending Approval" size="small" sx={{ bgcolor: '#ffedd5', color: '#c2410c', fontWeight: 700 }} />
                        ) : isConfirmed ? (
                          <Chip label="Confirmed" size="small" sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 700 }} />
                        ) : isRejected ? (
                          <Chip label="Declined" size="small" sx={{ bgcolor: '#fee2e2', color: '#b91c1c', fontWeight: 700 }} />
                        ) : (
                          <Chip label="Cancelled" size="small" sx={{ bgcolor: '#f1f5f9', color: '#64748b', fontWeight: 700 }} />
                        )}
                        <Chip
                          icon={<SeatIcon fontSize="small" />}
                          label={`${booking.seatsBooked} seat${booking.seatsBooked > 1 ? 's' : ''} reserved`}
                          size="small"
                          color={isConfirmed ? 'success' : isPending ? 'warning' : 'default'}
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>

                      {/* Route Details */}
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                          <LocationIcon color="primary" sx={{ fontSize: 20, mr: 1, mt: 0.2 }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary">Origin</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {booking.startLocation || 'Campus'}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          <LocationIcon color="error" sx={{ fontSize: 20, mr: 1, mt: 0.2 }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary">Destination</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {booking.destination || 'Destination'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Divider sx={{ my: 1.5 }} />

                      {/* Schedule & Driver Details */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, mb: 1.5 }}>
                        {booking.rideDate && (
                          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                            <TimeIcon sx={{ fontSize: 15, mr: 0.8, color: 'primary.main' }} />
                            {formatDate(booking.rideDate)} at {booking.rideTime || 'Departure time'}
                          </Typography>
                        )}
                        {booking.driver && (
                          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                            <PersonIcon sx={{ fontSize: 15, mr: 0.8, color: 'primary.main' }} />
                            Driver: <strong>{booking.driver.fullName}</strong> ({booking.driver.department || 'Department'})
                          </Typography>
                        )}
                        {booking.vehicleInfo && (
                          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                            🚗 Vehicle: {booking.vehicleInfo}
                          </Typography>
                        )}
                      </Box>

                      {/* Booking Timestamps */}
                      <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed #e2e8f0' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Booked on: {formatDate(booking.bookedAt)}
                        </Typography>
                        {booking.cancelledAt && (
                          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.3 }}>
                            Cancelled on: {formatDate(booking.cancelledAt)}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>

                    {/* Action Footer */}
                    <Box sx={{ px: 2.5, pb: 2.5, pt: 1, borderTop: '1px solid #f1f5f9' }}>
                      {(isConfirmed || isPending) && (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<CancelIcon />}
                          disabled={actionLoading}
                          onClick={() => handleCancelMyBooking(booking.rideId, booking.id)}
                          fullWidth
                          sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                          Cancel My Booking
                        </Button>
                      )}
                      {isCancelled && (
                        <Button fullWidth disabled size="small" sx={{ textTransform: 'none' }}>
                          Booking Cancelled
                        </Button>
                      )}
                      {isRejected && (
                        <Button fullWidth disabled size="small" color="error" sx={{ textTransform: 'none' }}>
                          Request Declined
                        </Button>
                      )}
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )
      )}

      {/* Passengers Management Modal for Driver */}
      <Dialog
        open={passengersDialog.open}
        onClose={() => setPassengersDialog({ open: false, ride: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Passenger Roster & Requests
        </DialogTitle>
        <DialogContent dividers>
          {passengersDialog.ride?.passengers && passengersDialog.ride.passengers.length > 0 ? (
            <List disablePadding>
              {passengersDialog.ride.passengers.map((p, idx) => (
                <ListItem
                  key={idx}
                  sx={{
                    px: 0,
                    py: 1.5,
                    borderBottom: idx < passengersDialog.ride.passengers.length - 1 ? '1px solid #f1f5f9' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 1,
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {p.passenger?.fullName || 'Student Passenger'}
                        </Typography>
                        {p.status === 'PENDING' ? (
                          <Chip label="Pending" size="small" sx={{ bgcolor: '#ffedd5', color: '#c2410c', fontWeight: 600, fontSize: '0.7rem' }} />
                        ) : p.status === 'CONFIRMED' ? (
                          <Chip label="Confirmed" size="small" sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 600, fontSize: '0.7rem' }} />
                        ) : p.status === 'REJECTED' ? (
                          <Chip label="Declined" size="small" sx={{ bgcolor: '#fee2e2', color: '#b91c1c', fontWeight: 600, fontSize: '0.7rem' }} />
                        ) : (
                          <Chip label="Cancelled" size="small" sx={{ bgcolor: '#f1f5f9', color: '#64748b', fontWeight: 600, fontSize: '0.7rem' }} />
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {p.seatsBooked} seat(s) reserved • {p.passenger?.department || 'Department'} • {p.passenger?.email || ''}
                      </Typography>
                    }
                  />

                  {/* Actions for Driver if booking is PENDING */}
                  {p.status === 'PENDING' && (
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckIcon />}
                        disabled={actionLoading}
                        onClick={() => handleConfirmPassenger(passengersDialog.ride.id, p.id)}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                      >
                        Confirm
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<CloseIcon />}
                        disabled={actionLoading}
                        onClick={() => handleRejectPassenger(passengersDialog.ride.id, p.id)}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                      >
                        Decline
                      </Button>
                    </Stack>
                  )}
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              No passengers have booked or requested seats on this ride yet.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPassengersDialog({ open: false, ride: null })}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
