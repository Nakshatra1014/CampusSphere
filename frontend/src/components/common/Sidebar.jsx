import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Event as EventIcon,
  Work as WorkIcon,
  MenuBook as ResourceIcon,
  DirectionsCar as RideIcon,
  Groups as TeamIcon,
  Storefront as MarketplaceIcon,
  Search as LostFoundIcon,
  MeetingRoom as RoommateIcon,
  HelpOutline as CommunityIcon,
  Notifications as NotifIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  CheckCircleOutline as ApprovalIcon,
  ManageAccounts as UserManageIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DRAWER_WIDTH = 260;

export default function Sidebar({ open, onClose, isMobile }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isStudent, isFaculty, isAdmin } = useAuth();

  const handleNav = (path) => {
    navigate(path);
    if (isMobile) onClose();
  };

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const renderNavGroup = (title, items) => (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="caption"
        sx={{
          px: 3,
          py: 0.5,
          fontWeight: 700,
          color: '#94a3b8',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          display: 'block',
        }}
      >
        {title}
      </Typography>
      <List sx={{ px: 1.5, py: 0.5 }}>
        {items.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNav(item.path)}
                sx={{
                  borderRadius: 1.5,
                  py: 1,
                  px: 2,
                  bgcolor: active ? 'primary.light' : 'transparent',
                  color: active ? 'primary.dark' : 'text.primary',
                  fontWeight: active ? 600 : 500,
                  '&:hover': {
                    bgcolor: active ? 'primary.light' : '#f1f5f9',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: active ? 'primary.main' : '#64748b',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: active ? 600 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  const mainItems = [
    { title: 'Dashboard', path: '/dashboard', icon: <DashboardIcon fontSize="small" /> },
    { title: 'My Profile', path: '/profile', icon: <PersonIcon fontSize="small" /> },
  ];

  const academicItems = [
    { title: 'Notes & Resources', path: '/resources', icon: <ResourceIcon fontSize="small" /> },
    { title: 'Events', path: '/events', icon: <EventIcon fontSize="small" /> },
    { title: 'Internship Board', path: '/internships', icon: <WorkIcon fontSize="small" /> },
  ];

  const campusItems = [
    { title: 'Ride Sharing', path: '/rides', icon: <RideIcon fontSize="small" /> },
    { title: 'Team Finder', path: '/teams', icon: <TeamIcon fontSize="small" /> },
    { title: 'Marketplace', path: '/marketplace', icon: <MarketplaceIcon fontSize="small" /> },
    { title: 'Lost & Found', path: '/lost-found', icon: <LostFoundIcon fontSize="small" /> },
    { title: 'Roommate Finder', path: '/roommates', icon: <RoommateIcon fontSize="small" /> },
    { title: 'Help Center', path: '/community', icon: <CommunityIcon fontSize="small" /> },
  ];

  const adminItems = [
    { title: 'Event Approvals', path: '/admin/events', icon: <ApprovalIcon fontSize="small" /> },
    { title: 'User Management', path: '/admin/users', icon: <UserManageIcon fontSize="small" /> },
  ];

  const drawerContent = (
    <Box sx={{ overflowY: 'auto', py: 2, height: '100%' }}>
      {renderNavGroup('Overview', mainItems)}
      <Divider sx={{ my: 1.5, mx: 2 }} />
      {renderNavGroup('Academics & Career', academicItems)}
      <Divider sx={{ my: 1.5, mx: 2 }} />
      {renderNavGroup('Campus Life', campusItems)}

      {isAdmin && (
        <>
          <Divider sx={{ my: 1.5, mx: 2 }} />
          {renderNavGroup('Administration', adminItems)}
        </>
      )}
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          top: '64px',
          height: 'calc(100vh - 64px)',
          position: 'fixed',
          borderRight: '1px solid #e2e8f0',
        },
      }}
      open
    >
      {drawerContent}
    </Drawer>
  );
}
