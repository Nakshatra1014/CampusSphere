import React, { useState } from 'react';
import {
  Typography,
  Card,
  Button,
  Box,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  Notifications as NotifIcon,
  CheckCircleOutline as ReadIcon,
  Check as CheckAllIcon,
  DeleteOutline as DeleteIcon,
  DeleteSweep as ClearAllIcon,
  Event as EventIcon,
  Work as WorkIcon,
  MenuBook as ResourceIcon,
  DirectionsCar as RideIcon,
  Groups as TeamIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { formatDateTime } from '../../utils/formatters';
import { LoadingState, EmptyState } from '../../components/common/LoadingState';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    fetchError,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications();

  const [filterTab, setFilterTab] = useState('ALL');
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const filteredList =
    filterTab === 'UNREAD' ? notifications.filter((n) => !n.isRead) : notifications;

  const handleNotificationClick = (n) => {
    if (!n.isRead) {
      markAsRead(n.id);
    }
    if (n.targetEntityType === 'RIDE' || n.type === 'RIDE_BOOKED' || n.type === 'RIDE_CANCELLED') {
      navigate('/rides/my');
    } else if (n.targetEntityType === 'EVENT') {
      navigate(n.targetEntityId ? `/events/${n.targetEntityId}` : '/events');
    } else if (n.targetEntityType === 'INTERNSHIP') {
      navigate(n.targetEntityId ? `/internships/${n.targetEntityId}` : '/internships');
    } else if (n.targetEntityType === 'RESOURCE') {
      navigate(n.targetEntityId ? `/resources/${n.targetEntityId}` : '/resources');
    }
  };

  const handleDeleteItem = async (e, id) => {
    e.stopPropagation();
    try {
      setDeletingId(id);
      await deleteNotification(id);
    } catch {
      // Handled in context toast
    } finally {
      setDeletingId(null);
    }
  };

  const handleConfirmClear = async () => {
    try {
      setClearing(true);
      await clearAllNotifications();
      setConfirmClearOpen(false);
    } catch {
      // Handled in context toast
    } finally {
      setClearing(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'EVENT_APPROVED':
      case 'EVENT_REGISTRATION':
        return <EventIcon fontSize="small" />;
      case 'INTERNSHIP_APPLICATION':
        return <WorkIcon fontSize="small" />;
      case 'RESOURCE_UPLOAD':
        return <ResourceIcon fontSize="small" />;
      case 'RIDE_BOOKED':
        return <RideIcon fontSize="small" />;
      case 'TEAM_REQUEST':
        return <TeamIcon fontSize="small" />;
      default:
        return <NotifIcon fontSize="small" />;
    }
  };

  if (loading && notifications.length === 0) {
    return <LoadingState message="Loading your system notifications..." />;
  }

  if (fetchError && notifications.length === 0) {
    return (
      <Box sx={{ maxWidth: 850, mx: 'auto', mt: 4 }}>
        <Card sx={{ p: 4, textAlign: 'center', bgcolor: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 2 }}>
          <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 600, mb: 1 }}>
            Failed to Load Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {fetchError}
          </Typography>
          <Button variant="outlined" color="primary" onClick={fetchNotifications}>
            Retry
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 850, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
            Activity & System Alerts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Stay updated with event approvals, ride bookings, team requests, and application statuses.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {unreadCount > 0 && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<CheckAllIcon />}
              onClick={markAllAsRead}
            >
              Mark All Read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<ClearAllIcon />}
              onClick={() => setConfirmClearOpen(true)}
            >
              Clear All
            </Button>
          )}
        </Box>
      </Box>

      <Tabs
        value={filterTab}
        onChange={(e, val) => setFilterTab(val)}
        sx={{ mb: 3, borderBottom: '1px solid #e2e8f0' }}
      >
        <Tab label={`All Alerts (${notifications.length})`} value="ALL" />
        <Tab label={`Unread (${unreadCount})`} value="UNREAD" />
      </Tabs>

      {filteredList.length === 0 ? (
        <EmptyState
          title={filterTab === 'UNREAD' ? 'No unread alerts' : 'No alerts found'}
          message={filterTab === 'UNREAD' ? 'You have read all your notifications!' : 'Your notification box is currently empty.'}
        />
      ) : (
        <Card>
          <List sx={{ p: 0 }}>
            {filteredList.map((n) => (
              <ListItem
                key={n.id}
                divider
                onClick={() => handleNotificationClick(n)}
                sx={{
                  bgcolor: n.isRead ? 'transparent' : '#f0f7ff',
                  p: 2.5,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  '&:hover': { bgcolor: '#f8fafc' },
                }}
                secondaryAction={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {!n.isRead && (
                      <Tooltip title="Mark as Read">
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(n.id);
                          }}
                        >
                          <ReadIcon fontSize="small" color="primary" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Delete notification">
                      <IconButton
                        edge="end"
                        size="small"
                        disabled={deletingId === n.id}
                        onClick={(e) => handleDeleteItem(e, n.id)}
                        sx={{ color: '#94a3b8', '&:hover': { color: 'error.main' } }}
                      >
                        {deletingId === n.id ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <DeleteIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: n.isRead ? '#f1f5f9' : 'primary.light', color: n.isRead ? '#64748b' : 'primary.main' }}>
                    {getNotificationIcon(n.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" sx={{ fontWeight: n.isRead ? 500 : 700 }}>
                      {n.title}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        {n.message}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                        {formatDateTime(n.createdAt)}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Card>
      )}

      {/* Confirmation Dialog for Clearing All Notifications */}
      <Dialog
        open={confirmClearOpen}
        onClose={() => !clearing && setConfirmClearOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Clear All Notifications?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete all {notifications.length} notification(s)? This will remove them permanently from your account.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setConfirmClearOpen(false)}
            disabled={clearing}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmClear}
            color="error"
            variant="contained"
            disabled={clearing}
            startIcon={clearing ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
          >
            {clearing ? 'Clearing...' : 'Clear All'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
