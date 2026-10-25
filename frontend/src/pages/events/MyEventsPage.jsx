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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Event as EventIcon,
  People as PeopleIcon,
  Visibility as ViewIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate, formatDateTime } from '../../utils/formatters';
import StatusChip from '../../components/common/StatusChip';
import { LoadingState, EmptyState } from '../../components/common/LoadingState';

export default function MyEventsPage() {
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const [tabValue, setTabValue] = useState(0);
  const [organizedEvents, setOrganizedEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [organized, myRegs] = await Promise.all([
        eventService.getMyOrganizedEvents(),
        eventService.getMyRegistrations(),
      ]);
      setOrganizedEvents(organized);
      setRegistrations(myRegs);
    } catch (err) {
      showToast(err.message || 'Failed to load your events.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCancelRegistration = async (eventId) => {
    if (!window.confirm('Are you sure you want to cancel your event registration?')) return;
    try {
      await eventService.cancelRegistration(eventId);
      showToast('Registration cancelled.', 'info');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to cancel registration.', 'error');
    }
  };

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/events')} sx={{ mb: 2 }}>
        Back to Events
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
            My Events & Registrations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your organized campus events and view your registered event tickets.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/events/create')}>
          Create New Event
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
          <Tab label={`My Organized Events (${organizedEvents.length})`} />
          <Tab label={`My Registrations (${registrations.length})`} />
        </Tabs>
      </Box>

      {loading ? (
        <LoadingState message="Loading event records..." />
      ) : tabValue === 0 ? (
        // Tab 0: Organized Events
        organizedEvents.length === 0 ? (
          <EmptyState
            title="No organized events"
            message="You haven't submitted any event proposals yet."
            actionLabel="Create Event"
            onAction={() => navigate('/events/create')}
          />
        ) : (
          <Grid container spacing={3}>
            {organizedEvents.map((evt) => (
              <Grid item xs={12} sm={6} md={4} key={evt.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Chip label={evt.category} size="small" sx={{ bgcolor: '#e3f2fd', color: 'primary.dark', fontWeight: 600 }} />
                      <StatusChip status={evt.status} />
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, lineHeight: 1.3 }}>
                      {evt.title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      📅 {formatDate(evt.eventDate)} • 📍 {evt.venue}
                    </Typography>

                    <Box sx={{ bgcolor: '#f8fafc', p: 1.2, borderRadius: 1.5, mb: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Capacity: <strong>{evt.registeredCount || 0} / {evt.maxParticipants} registered</strong>
                      </Typography>
                    </Box>

                    {evt.rejectionReason && (
                      <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                        Rejection reason: {evt.rejectionReason}
                      </Typography>
                    )}
                  </CardContent>

                  <Box sx={{ px: 2.5, pb: 2.5, pt: 1, borderTop: '1px solid #f1f5f9', display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<ViewIcon />}
                      onClick={() => navigate(`/events/${evt.id}`)}
                      fullWidth
                    >
                      View Details
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<PeopleIcon />}
                      onClick={() => navigate(`/events/${evt.id}/participants`)}
                      fullWidth
                    >
                      Participants
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )
      ) : (
        // Tab 1: My Registrations
        registrations.length === 0 ? (
          <EmptyState
            title="No registered events"
            message="You haven't registered for any events yet. Explore upcoming campus events!"
            actionLabel="Explore Events"
            onAction={() => navigate('/events')}
          />
        ) : (
          <Card>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Event Title</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Venue & Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Registered On</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {registrations.map((reg) => (
                    <TableRow key={reg.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{reg.eventTitle}</TableCell>
                      <TableCell>{reg.eventVenue} • {reg.eventDate}</TableCell>
                      <TableCell>{formatDateTime(reg.registeredAt)}</TableCell>
                      <TableCell>
                        <StatusChip status={reg.status} />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => navigate(`/events/${reg.eventId}`)}
                          sx={{ mr: 1 }}
                        >
                          Details
                        </Button>
                        {reg.status === 'REGISTERED' && (
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            onClick={() => handleCancelRegistration(reg.eventId)}
                          >
                            Cancel
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )
      )}
    </Box>
  );
}
