import React, { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  DirectionsCar as RideIcon,
  Add as AddIcon,
  LocationOn as LocationIcon,
  Schedule as TimeIcon,
  EventSeat as SeatIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { rideService } from '../../services/rideService';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate } from '../../utils/formatters';
import StatusChip from '../../components/common/StatusChip';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { LoadingState, EmptyState } from '../../components/common/LoadingState';

export default function RidesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startQuery, setStartQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');
  const [dateQuery, setDateQuery] = useState('');

  // Book dialog
  const [bookDialog, setBookDialog] = useState({ open: false, ride: null, seats: 1, loading: false });
  // Cancel booking dialog
  const [cancelDialog, setCancelDialog] = useState({ open: false, ride: null, loading: false });
  // View passengers dialog
  const [passengersDialog, setPassengersDialog] = useState({ open: false, ride: null });

  const loadRides = async () => {
    try {
      setLoading(true);
      const data = await rideService.searchRides({
        startLocation: startQuery || null,
        destination: destQuery || null,
        date: dateQuery || null,
      });
      setRides(data);
    } catch (err) {
      showToast(err.message || 'Failed to load rides.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRides();
  }, [startQuery, destQuery, dateQuery]);

  const handleOpenBook = (ride) => {
    setBookDialog({ open: true, ride, seats: 1, loading: false });
  };

  const handleConfirmBook = async () => {
    const ride = bookDialog.ride;
    if (!ride) return;

    try {
      setBookDialog((prev) => ({ ...prev, loading: true }));
      await rideService.bookRide(ride.id, bookDialog.seats);
      showToast('Ride booked successfully! The driver has been notified.', 'success');
      setBookDialog({ open: false, ride: null, seats: 1, loading: false });
      loadRides();
    } catch (err) {
      showToast(err.message || 'Booking failed.', 'error');
      setBookDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleConfirmCancelBooking = async () => {
    const ride = cancelDialog.ride;
    if (!ride) return;

    try {
      setCancelDialog((prev) => ({ ...prev, loading: true }));
      await rideService.cancelBooking(ride.id);
      showToast('Booking cancelled.', 'info');
      setCancelDialog({ open: false, ride: null, loading: false });
      loadRides();
    } catch (err) {
      showToast(err.message || 'Failed to cancel booking.', 'error');
      setCancelDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
            Campus Ride Sharing
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Share campus commutes, split transit, and coordinate rides with verified university members.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<SeatIcon />}
            onClick={() => navigate('/rides/my?tab=bookings')}
            sx={{ fontWeight: 600, textTransform: 'none' }}
          >
            My Bookings
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/rides/create')}
            sx={{ fontWeight: 600, textTransform: 'none' }}
          >
            Offer a Ride
          </Button>
        </Box>
      </Box>

      {/* Filter Section */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          label="Starting From"
          value={startQuery}
          onChange={(e) => setStartQuery(e.target.value)}
          placeholder="e.g. North Gate"
          sx={{ minWidth: 200, bgcolor: '#ffffff' }}
        />
        <TextField
          size="small"
          label="Destination"
          value={destQuery}
          onChange={(e) => setDestQuery(e.target.value)}
          placeholder="e.g. Central Station"
          sx={{ minWidth: 200, bgcolor: '#ffffff' }}
        />
        <TextField
          size="small"
          label="Date"
          type="date"
          value={dateQuery}
          onChange={(e) => setDateQuery(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 160, bgcolor: '#ffffff' }}
        />
      </Box>

      {/* Rides Grid */}
      {loading ? (
        <LoadingState message="Searching for available rides..." />
      ) : rides.length === 0 ? (
        <EmptyState
          title="No rides found for your route"
          message="Try changing the start location or date, or post a ride offer yourself!"
          action={
            <Button variant="contained" onClick={() => navigate('/rides/create')}>
              Offer a Ride
            </Button>
          }
        />
      ) : (
        <Grid container spacing={3}>
          {rides.map((ride) => {
            const isCreator = user && ride.creator?.id === user.id;

            return (
              <Grid item xs={12} md={6} key={ride.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <StatusChip status={ride.status} />
                      <Chip
                        icon={<SeatIcon fontSize="small" />}
                        label={`${ride.availableSeats} of ${ride.totalSeats} seats left`}
                        size="small"
                        color={ride.availableSeats > 0 ? 'success' : 'default'}
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>

                    {/* Route */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <LocationIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                        {ride.startLocation} &rarr; {ride.destination}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', ml: 3 }}>
                        <TimeIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                        {formatDate(ride.rideDate)} at {ride.rideTime}
                      </Typography>
                    </Box>

                    {ride.vehicleInfo && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, bgcolor: '#f8fafc', p: 1, borderRadius: 1 }}>
                        🚗 Vehicle: <strong>{ride.vehicleInfo}</strong>
                      </Typography>
                    )}

                    {ride.notes && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                        "{ride.notes}"
                      </Typography>
                    )}

                    <Divider sx={{ my: 1.5 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Driver
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {ride.creator?.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {ride.creator?.department}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>

                  <Box sx={{ px: 3, pb: 3, pt: 1, borderTop: '1px solid #f1f5f9', display: 'flex', gap: 1 }}>
                    {isCreator ? (
                      <Button
                        variant="outlined"
                        fullWidth
                        size="small"
                        startIcon={<PersonIcon />}
                        onClick={() => setPassengersDialog({ open: true, ride })}
                      >
                        View Passengers ({ride.passengers?.length || 0})
                      </Button>
                    ) : ride.isUserBooked ? (
                      <Button
                        variant="outlined"
                        color="error"
                        fullWidth
                        size="small"
                        onClick={() => setCancelDialog({ open: true, ride, loading: false })}
                      >
                        Cancel Booking
                      </Button>
                    ) : ride.availableSeats === 0 ? (
                      <Button variant="contained" disabled fullWidth size="small">
                        Ride Full
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        fullWidth
                        size="small"
                        onClick={() => handleOpenBook(ride)}
                      >
                        Book a Seat
                      </Button>
                    )}
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Book Seat Confirmation Modal */}
      <Dialog open={bookDialog.open} onClose={() => setBookDialog({ ...bookDialog, open: false })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Book Ride Seat</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Reserve a seat on the ride to <strong>{bookDialog.ride?.destination}</strong> on {formatDate(bookDialog.ride?.rideDate)} at {bookDialog.ride?.rideTime}?
          </Typography>
          <TextField
            fullWidth
            type="number"
            label="Seats to Book"
            value={bookDialog.seats}
            onChange={(e) => setBookDialog({ ...bookDialog, seats: Number(e.target.value) })}
            size="small"
            inputProps={{ min: 1, max: bookDialog.ride?.availableSeats || 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setBookDialog({ ...bookDialog, open: false })}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmBook} disabled={bookDialog.loading}>
            {bookDialog.loading ? 'Booking...' : 'Confirm Booking'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Driver Passenger List Modal */}
      <Dialog open={passengersDialog.open} onClose={() => setPassengersDialog({ open: false, ride: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Passenger Roster</DialogTitle>
        <DialogContent>
          {passengersDialog.ride?.passengers?.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No passengers have booked seats on this ride yet.
            </Typography>
          ) : (
            passengersDialog.ride?.passengers?.map((p) => (
              <Box key={p.id} sx={{ p: 1.5, border: '1px solid #e2e8f0', borderRadius: 1.5, mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {p.passenger?.fullName} ({p.seatsBooked} seat{p.seatsBooked > 1 ? 's' : ''})
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {p.passenger?.department} • 📞 {p.passenger?.phone || p.passenger?.email}
                </Typography>
              </Box>
            ))
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPassengersDialog({ open: false, ride: null })}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Confirmation */}
      <ConfirmationDialog
        open={cancelDialog.open}
        title="Cancel Seat Booking"
        message={`Are you sure you want to cancel your seat on the ride to ${cancelDialog.ride?.destination}?`}
        confirmText="Yes, Cancel Booking"
        confirmColor="error"
        loading={cancelDialog.loading}
        onConfirm={handleConfirmCancelBooking}
        onCancel={() => setCancelDialog({ open: false, ride: null, loading: false })}
      />
    </Box>
  );
}
