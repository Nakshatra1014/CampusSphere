import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Divider,
  ListItemIcon,
  ListItemText,
  Chip,
  List,
  ListItem,
  ListItemButton,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Logout as LogoutIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  School as SchoolIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatDateTime } from '../../utils/formatters';

export default function Navbar({ onDrawerToggle }) {
  const navigate = useNavigate();
  const { user, logout, isStudent, isFaculty, isAdmin } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [profileAnchor, setProfileAnchor] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);

  const handleProfileOpen = (event) => setProfileAnchor(event.currentTarget);
  const handleProfileClose = () => setProfileAnchor(null);

  const handleNotifOpen = (event) => setNotifAnchor(event.currentTarget);
  const handleNotifClose = () => setNotifAnchor(null);

  const handleLogout = () => {
    handleProfileClose();
    logout();
    navigate('/login');
  };

  const getRoleLabel = () => {
    if (isAdmin) return 'Administrator';
    if (isFaculty) return 'Faculty';
    return 'Student';
  };

  const getRoleChipColor = () => {
    if (isAdmin) return 'error';
    if (isFaculty) return 'primary';
    return 'default';
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        width: '100%',
        bgcolor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
      }}
    >
      <Toolbar sx={{ minHeight: '64px', px: { xs: 2, sm: 3 } }}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onDrawerToggle}
          sx={{ mr: 2, display: { md: 'none' }, color: '#334155' }}
        >
          <MenuIcon />
        </IconButton>

        {/* Brand Logo & Name */}
        <Box
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => navigate('/dashboard')}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 1,
              bgcolor: 'primary.main',
              color: '#ffffff',
              mr: 1.5,
            }}
          >
            <SchoolIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.dark', lineHeight: 1.1, letterSpacing: '0.02em' }}>
              CampusSphere
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
              Smart College Platform
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* User Role Badge */}
        {user && (
          <Chip
            label={getRoleLabel()}
            size="small"
            color={getRoleChipColor()}
            variant="outlined"
            sx={{ mr: 2, display: { xs: 'none', sm: 'inline-flex' }, fontWeight: 600, fontSize: '0.75rem' }}
          />
        )}

        {/* Notification Bell with Badge */}
        <IconButton color="inherit" onClick={handleNotifOpen} sx={{ mr: 1 }}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon sx={{ color: '#475569' }} />
          </Badge>
        </IconButton>

        {/* Notifications Popover Menu */}
        <Menu
          anchorEl={notifAnchor}
          open={Boolean(notifAnchor)}
          onClose={handleNotifClose}
          PaperProps={{
            sx: { width: 340, maxHeight: 420, borderRadius: 2, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Notifications ({unreadCount} unread)
            </Typography>
            {unreadCount > 0 && (
              <Typography
                variant="caption"
                sx={{ color: 'primary.main', cursor: 'pointer', fontWeight: 500 }}
                onClick={() => {
                  markAllAsRead();
                }}
              >
                Mark all read
              </Typography>
            )}
          </Box>
          <Divider />
          <List sx={{ p: 0, maxHeight: 300, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No notifications yet.
                </Typography>
              </Box>
            ) : (
              notifications.slice(0, 5).map((n) => (
                <ListItem key={n.id} disablePadding divider>
                  <ListItemButton
                    onClick={() => {
                      if (!n.isRead) markAsRead(n.id);
                      handleNotifClose();
                      if (n.targetEntityType === 'RIDE' || n.type === 'RIDE_BOOKED' || n.type === 'RIDE_CANCELLED') {
                        navigate('/rides/my');
                      } else if (n.targetEntityType === 'EVENT') {
                        navigate(n.targetEntityId ? `/events/${n.targetEntityId}` : '/events');
                      } else if (n.targetEntityType === 'INTERNSHIP') {
                        navigate(n.targetEntityId ? `/internships/${n.targetEntityId}` : '/internships');
                      } else if (n.targetEntityType === 'RESOURCE') {
                        navigate(n.targetEntityId ? `/resources/${n.targetEntityId}` : '/resources');
                      } else {
                        navigate('/notifications');
                      }
                    }}
                    sx={{
                      backgroundColor: n.isRead ? 'transparent' : '#f0f7ff',
                      alignItems: 'flex-start',
                      py: 1.5,
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: n.isRead ? 400 : 600 }}>
                          {n.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                            {n.message}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', mt: 0.5 }}>
                            {formatDateTime(n.createdAt)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))
            )}
          </List>
          <Divider />
          <Box sx={{ p: 1, textAlign: 'center' }}>
            <Typography
              variant="caption"
              sx={{ color: 'primary.main', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => {
                handleNotifClose();
                navigate('/notifications');
              }}
            >
              View all notifications
            </Typography>
          </Box>
        </Menu>

        {/* Profile Avatar / Menu */}
        <Box
          onClick={handleProfileOpen}
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            p: 0.5,
            borderRadius: 2,
            '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
          }}
        >
          <Avatar
            src={user?.profileImageUrl}
            sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: '0.875rem' }}
          >
            {user?.fullName?.charAt(0) || 'U'}
          </Avatar>
          <Box sx={{ ml: 1, display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2, color: 'text.primary' }}>
              {user?.fullName}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {user?.email}
            </Typography>
          </Box>
        </Box>

        {/* Profile Dropdown Menu */}
        <Menu
          anchorEl={profileAnchor}
          open={Boolean(profileAnchor)}
          onClose={handleProfileClose}
          PaperProps={{
            sx: { width: 220, borderRadius: 2, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {user?.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.department || user?.email}
            </Typography>
          </Box>
          <Divider />
          <MenuItem
            onClick={() => {
              handleProfileClose();
              navigate('/profile');
            }}
          >
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="My Profile" />
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleProfileClose();
              navigate('/dashboard');
            }}
          >
            <ListItemIcon>
              <DashboardIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <ListItemIcon sx={{ color: 'error.main' }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
