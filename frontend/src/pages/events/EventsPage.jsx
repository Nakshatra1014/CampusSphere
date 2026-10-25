import React, { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { EVENT_CATEGORIES } from '../../utils/constants';
import { formatDate, formatIndianDateTime } from '../../utils/formatters';
import SearchBar from '../../components/common/SearchBar';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { LoadingState, EmptyState } from '../../components/common/LoadingState';

export default function EventsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Register confirmation modal
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    event: null,
    loading: false,
  });

  const loadEvents = async () => {
    try {
      setLoading(true);
      const categoryParam = selectedCategory === 'All' ? null : selectedCategory;
      const data = await eventService.getApprovedEvents({
        category: categoryParam,
        search: searchQuery || null,
      });
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events:', err);
      showToast(err.message || 'Failed to load events.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [selectedCategory, searchQuery]);

  const handleRegisterClick = (evt) => {
    if (evt.hasCustomForm) {
      // Direct user to details page where custom form questions are displayed
      navigate(`/events/${evt.id}?register=true`);
    } else {
      setConfirmDialog({ open: true, event: evt, loading: false });
    }
  };

  const handleConfirmRegister = async () => {
    const evt = confirmDialog.event;
    if (!evt) return;

    try {
      setConfirmDialog((prev) => ({ ...prev, loading: true }));
      await eventService.registerForEvent(evt.id);
      showToast(`Registered for "${evt.title}" successfully!`, 'success');
      setConfirmDialog({ open: false, event: null, loading: false });
      loadEvents();
    } catch (err) {
      showToast(err.message || 'Failed to register.', 'error');
      setConfirmDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
            Campus Events
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Discover, attend, and register for workshops, hackathons, and seminars.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/events/my-registrations')}
          >
            My Registrations
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/events/create')}
          >
            Organize Event
          </Button>
        </Box>
      </Box>

      {/* Filter Section */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search events by title, venue, keywords..."
          sx={{ flexGrow: 1, minWidth: '240px' }}
        />

        <FormControl size="small" sx={{ minWidth: 180, bgcolor: '#ffffff' }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            label="Category"
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <MenuItem value="All">All Categories</MenuItem>
            {EVENT_CATEGORIES.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Events Grid */}
      {loading ? (
        <LoadingState message="Fetching upcoming approved campus events..." />
      ) : events.length === 0 ? (
        <EmptyState
          title="No events match your criteria"
          message="Try changing the category or search keywords, or organize a new event!"
          action={
            <Button variant="contained" onClick={() => navigate('/events/create')}>
              Submit Event Request
            </Button>
          }
        />
      ) : (
        <Grid container spacing={3}>
          {events.map((evt) => {
            const isRegistered = evt.isUserRegistered || evt.userRegistered;
            const isApproved = evt.status === 'APPROVED';
            const isCancelled = evt.status === 'CANCELLED';
            const isCompleted = evt.status === 'COMPLETED';

            const now = new Date();
            const deadlinePassed = evt.isDeadlinePassed || (evt.registrationDeadline && new Date(evt.registrationDeadline) <= now);
            const eventStarted = evt.isStarted || (evt.eventDate && evt.startTime && new Date(`${evt.eventDate}T${evt.startTime}`) <= now);
            const isFull = evt.availableSeats === 0 || evt.isFull;

            return (
              <Grid item xs={12} sm={6} md={4} key={evt.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="160"
                    image={
                      evt.imageUrl ||
                      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600'
                    }
                    alt={evt.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Chip label={evt.category} size="small" sx={{ bgcolor: '#e3f2fd', color: 'primary.dark', fontWeight: 600 }} />
                        {isFull || evt.availableSeats === 0 ? (
                          <Chip
                            label={`Event Full (${evt.registeredCount ?? evt.maxParticipants}/${evt.maxParticipants} registered)`}
                            size="small"
                            sx={{
                              bgcolor: '#ffedd5',
                              color: '#c2410c',
                              fontWeight: 700,
                              fontSize: '0.72rem',
                              height: 24,
                            }}
                          />
                        ) : (
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                            {evt.availableSeats} of {evt.maxParticipants} seats left
                          </Typography>
                        )}
                      </Box>

                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, lineHeight: 1.3 }}>
                        {evt.title}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          height: '40px',
                        }}
                      >
                        {evt.description}
                      </Typography>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1.5 }}>
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                          <ScheduleIcon fontSize="inherit" sx={{ mr: 0.8, color: 'primary.main' }} />
                          {formatDate(evt.eventDate)} ({evt.startTime} - {evt.endTime})
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                          <LocationIcon fontSize="inherit" sx={{ mr: 0.8, color: 'primary.main' }} />
                          {evt.venue}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                          <PeopleIcon fontSize="inherit" sx={{ mr: 0.8, color: 'primary.main' }} />
                          Organizer: {evt.organizer?.fullName} ({evt.organizer?.department})
                        </Typography>
                      </Box>

                      {evt.registrationDeadline && (
                        <Box
                          sx={{
                            mb: 1.5,
                            p: 1.2,
                            borderRadius: 1.5,
                            bgcolor: deadlinePassed ? '#fef2f2' : '#f0fdf4',
                            border: `1px solid ${deadlinePassed ? '#fecaca' : '#bbf7d0'}`,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              fontWeight: 600,
                              color: deadlinePassed ? '#b91c1c' : '#15803d',
                            }}
                          >
                            <ScheduleIcon fontSize="inherit" sx={{ mr: 0.8 }} />
                            {deadlinePassed ? (
                              <span>
                                <strong>Registration Closed</strong> • Deadline: {formatIndianDateTime(evt.registrationDeadline)}
                              </span>
                            ) : (
                              <span>
                                Registration closes: <strong>{formatIndianDateTime(evt.registrationDeadline)}</strong>
                              </span>
                            )}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Box sx={{ pt: 1.5, borderTop: '1px solid #f1f5f9', display: 'flex', gap: 1.5, alignItems: 'center' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        onClick={() => navigate(`/events/${evt.id}`)}
                        sx={{ textTransform: 'none', fontWeight: 600, minHeight: 36 }}
                      >
                        Details
                      </Button>

                      {isRegistered ? (
                        <Button
                          variant="outlined"
                          color="success"
                          size="small"
                          fullWidth
                          startIcon={<CheckCircleIcon />}
                          onClick={() => navigate('/events/my-registrations')}
                          sx={{ textTransform: 'none', fontWeight: 600, minHeight: 36 }}
                        >
                          Registered
                        </Button>
                      ) : isCancelled ? (
                        <Button
                          variant="contained"
                          disabled
                          size="small"
                          fullWidth
                          sx={{ bgcolor: '#fee2e2', color: '#991b1b', textTransform: 'none', fontWeight: 600, minHeight: 36 }}
                        >
                          Cancelled
                        </Button>
                      ) : isCompleted || eventStarted ? (
                        <Button
                          variant="contained"
                          disabled
                          size="small"
                          fullWidth
                          sx={{ bgcolor: '#e2e8f0', color: '#64748b', textTransform: 'none', fontWeight: 600, minHeight: 36 }}
                        >
                          Event Started / Completed
                        </Button>
                      ) : deadlinePassed ? (
                        <Button
                          variant="contained"
                          disabled
                          size="small"
                          fullWidth
                          sx={{ bgcolor: '#e2e8f0', color: '#64748b', textTransform: 'none', fontWeight: 600, minHeight: 36 }}
                        >
                          Registration Closed
                        </Button>
                      ) : isFull ? (
                        <Button
                          variant="contained"
                          disabled
                          size="small"
                          fullWidth
                          sx={{ bgcolor: '#fed7aa', color: '#c2410c', textTransform: 'none', fontWeight: 600, minHeight: 36 }}
                        >
                          Event Full
                        </Button>
                      ) : isApproved ? (
                        <Button
                          variant="contained"
                          size="small"
                          fullWidth
                          onClick={() => handleRegisterClick(evt)}
                          sx={{ textTransform: 'none', fontWeight: 600, minHeight: 36 }}
                        >
                          Register Now
                        </Button>
                      ) : null}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Profile-based Instant Registration Confirmation Modal */}
      <ConfirmationDialog
        open={confirmDialog.open}
        title="Register for Event"
        message={`Register for "${confirmDialog.event?.title}" using your authenticated CampusSphere profile (${user?.fullName} • ${user?.email} • ${user?.department})?`}
        confirmText="Confirm Registration"
        confirmColor="primary"
        loading={confirmDialog.loading}
        onConfirm={handleConfirmRegister}
        onCancel={() => setConfirmDialog({ open: false, event: null, loading: false })}
      />
    </Box>
  );
}
