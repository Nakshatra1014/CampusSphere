import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { useNotifications } from '../../context/NotificationContext';
import { formatDateTime } from '../../utils/formatters';
import StatusChip from '../../components/common/StatusChip';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { LoadingState, EmptyState } from '../../components/common/LoadingState';

export default function MyRegistrationsPage() {
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialog, setCancelDialog] = useState({ open: false, reg: null, loading: false });

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const data = await eventService.getMyRegistrations();
      setRegistrations(data);
    } catch (err) {
      showToast(err.message || 'Failed to fetch registrations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  const handleOpenCancel = (reg) => {
    setCancelDialog({ open: true, reg, loading: false });
  };

  const handleConfirmCancel = async () => {
    const reg = cancelDialog.reg;
    if (!reg) return;

    try {
      setCancelDialog((prev) => ({ ...prev, loading: true }));
      await eventService.cancelRegistration(reg.eventId);
      showToast('Registration cancelled successfully.', 'info');
      setCancelDialog({ open: false, reg: null, loading: false });
      loadRegistrations();
    } catch (err) {
      showToast(err.message || 'Failed to cancel registration.', 'error');
      setCancelDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  if (loading) return <LoadingState message="Loading your event registrations..." />;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/events')} sx={{ mb: 2.5 }}>
        Back to Events
      </Button>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
          My Event Registrations
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review your upcoming and past event tickets registered through CampusSphere.
        </Typography>
      </Box>

      {registrations.length === 0 ? (
        <EmptyState
          title="No event registrations found"
          message="Browse the event schedule and register for upcoming sessions!"
          action={
            <Button variant="contained" onClick={() => navigate('/events')}>
              Explore Events
            </Button>
          }
        />
      ) : (
        <Card>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Event Title</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Venue</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Registered On</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {registrations.map((reg) => (
                  <TableRow key={reg.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{reg.eventTitle}</TableCell>
                    <TableCell>{reg.eventCategory}</TableCell>
                    <TableCell>
                      {reg.eventDate} ({reg.eventTime})
                    </TableCell>
                    <TableCell>{reg.eventVenue}</TableCell>
                    <TableCell>
                      <StatusChip status={reg.status} />
                    </TableCell>
                    <TableCell>{formatDateTime(reg.registeredAt)}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/events/${reg.eventId}`)}
                        sx={{ mr: 1, fontSize: '0.75rem' }}
                      >
                        Details
                      </Button>
                      {reg.status === 'REGISTERED' && (
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={() => handleOpenCancel(reg)}
                          sx={{ fontSize: '0.75rem' }}
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
      )}

      {/* Cancellation Confirmation Dialog */}
      <ConfirmationDialog
        open={cancelDialog.open}
        title="Cancel Event Registration"
        message={`Are you sure you want to cancel your seat for "${cancelDialog.reg?.eventTitle}"? Your registration will be marked as Cancelled.`}
        confirmText="Confirm Cancellation"
        confirmColor="error"
        loading={cancelDialog.loading}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelDialog({ open: false, reg: null, loading: false })}
      />
    </Box>
  );
}
