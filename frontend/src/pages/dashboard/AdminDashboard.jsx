import React, { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
} from '@mui/material';
import {
  Check as ApproveIcon,
  Close as RejectIcon,
  AdminPanelSettings as AdminIcon,
  People as PeopleIcon,
  Event as EventIcon,
  Work as WorkIcon,
  MenuBook as ResourceIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/aiService';
import { eventService } from '../../services/eventService';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate } from '../../utils/formatters';
import { LoadingState } from '../../components/common/LoadingState';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const [stats, setStats] = useState(null);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reject dialog state
  const [rejectDialog, setRejectDialog] = useState({ open: false, eventId: null, eventTitle: '', reason: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsData, pendingData] = await Promise.all([
        adminService.getStats(),
        eventService.getPendingEvents(),
      ]);
      setStats(statsData);
      setPendingEvents(pendingData);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleApprove = async (eventId, title) => {
    try {
      setActionLoading(true);
      await eventService.approveEvent(eventId);
      showToast(`Event "${title}" has been approved and published!`, 'success');
      loadAdminData();
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
      showToast('Please provide a reason for rejection.', 'warning');
      return;
    }
    try {
      setActionLoading(true);
      await eventService.rejectEvent(rejectDialog.eventId, rejectDialog.reason);
      showToast(`Event "${rejectDialog.eventTitle}" was rejected.`, 'info');
      setRejectDialog({ open: false, eventId: null, eventTitle: '', reason: '' });
      loadAdminData();
    } catch (err) {
      showToast(err.message || 'Failed to reject event.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingState message="Loading platform administrative overview..." />;

  const statCards = [
    { label: 'Pending Event Approvals', value: stats?.pendingEvents || 0, color: 'error', icon: <EventIcon /> },
    { label: 'Published Events', value: stats?.approvedEvents || 0, color: 'primary', icon: <EventIcon /> },
    { label: 'Registered Students', value: stats?.totalStudents || 0, color: 'info', icon: <PeopleIcon /> },
    { label: 'Faculty Members', value: stats?.totalFaculty || 0, color: 'secondary', icon: <PeopleIcon /> },
    { label: 'Active Internships', value: stats?.totalInternships || 0, color: 'success', icon: <WorkIcon /> },
    { label: 'Academic Resources', value: stats?.totalResources || 0, color: 'primary', icon: <ResourceIcon /> },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
          University Central Administration 🛡️
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Platform-wide moderation, approval queues, user management, and system metrics.
        </Typography>
      </Box>

      {/* Metric Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {statCards.map((c, i) => (
          <Grid item xs={6} sm={4} md={2} key={i}>
            <Card sx={{ border: '1px solid #e2e8f0' }}>
              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: `${c.color}.main`, mb: 0.5 }}>
                  {c.value}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block' }}>
                  {c.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pending Event Approvals Queue */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Pending Event Requests ({pendingEvents.length})
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Submitted by students & faculty. Events only appear to campus users once approved.
              </Typography>
            </Box>
            <Button size="small" onClick={() => navigate('/admin/events')}>
              Manage Approvals Page
            </Button>
          </Box>

          {pendingEvents.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary">
                🎉 All event requests have been reviewed! No pending approvals.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0' }}>
              <Table size="small">
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
                      <TableCell sx={{ fontWeight: 600 }}>{evt.title}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {evt.organizer?.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {evt.organizer?.department}
                        </Typography>
                      </TableCell>
                      <TableCell>{evt.category}</TableCell>
                      <TableCell>
                        {formatDate(evt.eventDate)} ({evt.startTime})
                      </TableCell>
                      <TableCell>{evt.venue}</TableCell>
                      <TableCell>{evt.maxParticipants} seats</TableCell>
                      <TableCell align="right">
                        <Stack direction="column" spacing={0.8} sx={{ minWidth: 95, ml: 'auto' }}>
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            startIcon={<ApproveIcon />}
                            disabled={actionLoading}
                            onClick={() => handleApprove(evt.id, evt.title)}
                            sx={{ fontSize: '0.75rem', py: 0.4, width: '100%' }}
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
                            sx={{ fontSize: '0.75rem', py: 0.4, width: '100%' }}
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
          )}
        </CardContent>
      </Card>

      {/* Quick Administrative Management Links */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card
            onClick={() => navigate('/admin/users')}
            sx={{ cursor: 'pointer', p: 1, '&:hover': { borderColor: 'primary.main', bgcolor: '#f0f7ff' } }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ p: 2, bgcolor: '#e3f2fd', color: 'primary.main', borderRadius: 2, mr: 2 }}>
                <PeopleIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  User Management Desk
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage student and faculty accounts, edit roles, and toggle access status.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Rejection Modal Dialog */}
      <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ ...rejectDialog, open: false })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Reject Event Request</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Provide a clear feedback reason for rejecting "<strong>{rejectDialog.eventTitle}</strong>". The organizer will receive an immediate notification with this reason.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Rejection Reason"
            value={rejectDialog.reason}
            onChange={(e) => setRejectDialog({ ...rejectDialog, reason: e.target.value })}
            placeholder="e.g. Venue is reserved for University Exam. Please reschedule date or venue."
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
