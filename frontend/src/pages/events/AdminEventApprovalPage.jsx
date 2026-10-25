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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Stack,
} from '@mui/material';
import {
  Check as ApproveIcon,
  Close as RejectIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate } from '../../utils/formatters';
import { LoadingState, EmptyState } from '../../components/common/LoadingState';

export default function AdminEventApprovalPage() {
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Reject dialog
  const [rejectDialog, setRejectDialog] = useState({ open: false, eventId: null, eventTitle: '', reason: '' });

  const loadPendingEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getPendingEvents();
      setPendingEvents(data);
    } catch (err) {
      showToast(err.message || 'Failed to fetch pending events.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingEvents();
  }, []);

  const handleApprove = async (eventId, title) => {
    try {
      setActionLoading(true);
      await eventService.approveEvent(eventId);
      showToast(`Event "${title}" has been approved and published to the campus.`, 'success');
      loadPendingEvents();
    } catch (err) {
      showToast(err.message || 'Failed to approve event.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenReject = (evt) => {
    setRejectDialog({ open: true, eventId: evt.id, eventTitle: evt.title, reason: '' });
  };

  const handleConfirmReject = async () => {
    if (!rejectDialog.reason.trim()) {
      showToast('Please specify a rejection reason.', 'warning');
      return;
    }

    try {
      setActionLoading(true);
      await eventService.rejectEvent(rejectDialog.eventId, rejectDialog.reason);
      showToast(`Event "${rejectDialog.eventTitle}" was rejected.`, 'info');
      setRejectDialog({ open: false, eventId: null, eventTitle: '', reason: '' });
      loadPendingEvents();
    } catch (err) {
      showToast(err.message || 'Failed to reject event.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingState message="Loading pending event proposals..." />;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard')} sx={{ mb: 2.5 }}>
        Back to Dashboard
      </Button>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
          Event Approval Desk
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review student and faculty proposals. Approved events immediately publish to the campus calendar.
        </Typography>
      </Box>

      {pendingEvents.length === 0 ? (
        <EmptyState
          title="No pending event proposals"
          message="All submitted event proposals have been reviewed and processed."
        />
      ) : (
        <Card>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Event Title</TableCell>
                  <TableCell>Organizer</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Venue</TableCell>
                  <TableCell>Capacity</TableCell>
                  <TableCell align="right">Decision Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingEvents.map((evt) => (
                  <TableRow key={evt.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {evt.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {evt.description?.substring(0, 70)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{evt.organizer?.fullName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {evt.organizer?.department}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={evt.category} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      {formatDate(evt.eventDate)}
                      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                        {evt.startTime} - {evt.endTime}
                      </Typography>
                    </TableCell>
                    <TableCell>{evt.venue}</TableCell>
                    <TableCell>{evt.maxParticipants} seats</TableCell>
                    <TableCell align="right">
                      <Stack direction="column" spacing={1} sx={{ minWidth: 105, ml: 'auto' }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          startIcon={<ApproveIcon />}
                          disabled={actionLoading}
                          onClick={() => handleApprove(evt.id, evt.title)}
                          sx={{ fontSize: '0.75rem', py: 0.5, width: '100%', fontWeight: 600 }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<RejectIcon />}
                          disabled={actionLoading}
                          onClick={() => handleOpenReject(evt)}
                          sx={{ fontSize: '0.75rem', py: 0.5, width: '100%', fontWeight: 600 }}
                        >
                          Reject
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Rejection Modal Dialog */}
      <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ ...rejectDialog, open: false })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Reject Event Proposal</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Provide constructive feedback to the organizer for rejecting "<strong>{rejectDialog.eventTitle}</strong>":
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Rejection Reason"
            value={rejectDialog.reason}
            onChange={(e) => setRejectDialog({ ...rejectDialog, reason: e.target.value })}
            placeholder="e.g. Venue double-booked or missing safety compliance. Please update venue."
            required
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRejectDialog({ ...rejectDialog, open: false })}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmReject}
            disabled={actionLoading}
          >
            Confirm Rejection
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
