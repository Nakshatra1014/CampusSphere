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
  Divider,
} from '@mui/material';
import {
  Event as EventIcon,
  Work as WorkIcon,
  MenuBook as ResourceIcon,
  DirectionsCar as RideIcon,
  Groups as TeamIcon,
  Storefront as StoreIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { eventService } from '../../services/eventService';
import { internshipService } from '../../services/internshipService';
import { formatDate } from '../../utils/formatters';
import StatusChip from '../../components/common/StatusChip';
import { LoadingState } from '../../components/common/LoadingState';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [internships, setInternships] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [eventsData, internshipsData, registrationsData] = await Promise.all([
          eventService.getApprovedEvents({}),
          internshipService.getInternships({ activeOnly: true }),
          eventService.getMyRegistrations(),
        ]);
        setUpcomingEvents(eventsData.slice(0, 4));
        setInternships(internshipsData.slice(0, 3));
        setMyRegistrations(registrationsData.slice(0, 3));
      } catch (err) {
        console.error('Error loading student dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const quickActions = [
    { label: 'Browse Events', icon: <EventIcon />, path: '/events', color: 'primary' },
    { label: 'Find Internships', icon: <WorkIcon />, path: '/internships', color: 'primary' },
    { label: 'Academic Notes', icon: <ResourceIcon />, path: '/resources', color: 'primary' },
    { label: 'Find Rides', icon: <RideIcon />, path: '/rides', color: 'primary' },
    { label: 'Join Teams', icon: <TeamIcon />, path: '/teams', color: 'primary' },
  ];

  if (loading) return <LoadingState message="Loading your student workspace..." />;

  return (
    <Box>
      {/* Welcome Banner */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
          Welcome back, {user?.fullName}! 👋
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.department} • {user?.academicYear} | Student Central Portal
        </Typography>
      </Box>

      {/* Quick Action Shortcuts */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {quickActions.map((action, idx) => (
          <Grid item xs={6} sm={4} md={2} key={idx}>
            <Card
              onClick={() => navigate(action.path)}
              sx={{
                cursor: 'pointer',
                textAlign: 'center',
                p: 1.5,
                border: '1px solid #e2e8f0',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: '#f0f7ff',
                },
              }}
            >
              <Box sx={{ color: `${action.color}.main`, mb: 0.5 }}>{action.icon}</Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary', display: 'block' }}>
                {action.label}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Upcoming Campus Events */}
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Upcoming Campus Events
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/events')}
                >
                  View All
                </Button>
              </Box>

              {upcomingEvents.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                  No upcoming events scheduled right now.
                </Typography>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Event</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Venue</TableCell>
                        <TableCell align="right">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {upcomingEvents.map((evt) => (
                        <TableRow key={evt.id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{evt.title}</TableCell>
                          <TableCell>{formatDate(evt.eventDate)}</TableCell>
                          <TableCell>{evt.venue}</TableCell>
                          <TableCell align="right">
                            <Button
                              size="small"
                              variant={evt.isUserRegistered ? 'outlined' : 'contained'}
                              color={evt.isUserRegistered ? 'success' : 'primary'}
                              onClick={() => navigate(`/events/${evt.id}`)}
                              sx={{ fontSize: '0.75rem', py: 0.4 }}
                            >
                              {evt.isUserRegistered ? 'Registered' : 'View & Register'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* My Registered Events */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  My Registrations
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/events/my-registrations')}
                >
                  Manage
                </Button>
              </Box>

              {myRegistrations.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                  You haven't registered for any events yet.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {myRegistrations.map((reg) => (
                    <Box
                      key={reg.id}
                      sx={{
                        p: 2,
                        borderRadius: 1.5,
                        border: '1px solid #e2e8f0',
                        bgcolor: '#f8fafc',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {reg.eventTitle}
                        </Typography>
                        <StatusChip status={reg.status} />
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        📅 {reg.eventDate} | 📍 {reg.eventVenue}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Latest Internship Opportunities */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Latest Internship Opportunities
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/internships')}
                >
                  Explore Board
                </Button>
              </Box>

              <Grid container spacing={2}>
                {internships.map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <Card variant="outlined" sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>
                            {item.companyName}
                          </Typography>
                          <Chip label={item.workMode} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                        </Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, lineHeight: 1.3 }}>
                          {item.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                          📍 {item.location} • 💰 {item.stipend || 'Unpaid / Certificate'}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/internships`)}
                        fullWidth
                      >
                        {item.isUserApplied ? 'Applied ✓' : 'View Details'}
                      </Button>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
