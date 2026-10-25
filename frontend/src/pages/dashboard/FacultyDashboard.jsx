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
} from '@mui/material';
import {
  Event as EventIcon,
  UploadFile as UploadIcon,
  Work as WorkIcon,
  People as PeopleIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { eventService } from '../../services/eventService';
import { resourceService } from '../../services/resourceService';
import { formatDate } from '../../utils/formatters';
import StatusChip from '../../components/common/StatusChip';
import { LoadingState } from '../../components/common/LoadingState';

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [myEvents, setMyEvents] = useState([]);
  const [myResources, setMyResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFacultyData = async () => {
      try {
        setLoading(true);
        const [eventsData, resourcesData] = await Promise.all([
          eventService.getMyOrganizedEvents(),
          resourceService.getMyUploads(),
        ]);
        setMyEvents(eventsData);
        setMyResources(resourcesData.slice(0, 4));
      } catch (err) {
        console.error('Failed to load faculty dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFacultyData();
  }, []);

  if (loading) return <LoadingState message="Loading your faculty workspace..." />;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
            Faculty Workspace: {user?.fullName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.department} • Academic & Departmental Management
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/events/create')}
          >
            Create Event Request
          </Button>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => navigate('/resources/upload')}
          >
            Upload Notes / Resource
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center' }}>
              <Box sx={{ p: 1.5, bgcolor: '#e3f2fd', color: 'primary.main', borderRadius: 2, mr: 2 }}>
                <EventIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {myEvents.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Organized Events
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center' }}>
              <Box sx={{ p: 1.5, bgcolor: '#edf7ed', color: 'success.main', borderRadius: 2, mr: 2 }}>
                <UploadIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {myResources.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Uploaded Notes & Materials
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center' }}>
              <Box sx={{ p: 1.5, bgcolor: '#f1f5f9', color: '#475569', borderRadius: 2, mr: 2 }}>
                <PeopleIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {myEvents.reduce((acc, curr) => acc + (curr.registeredCount || 0), 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Student Participants
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Events Organized by Faculty */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              My Departmental Events & Approval Status
            </Typography>
            <Button size="small" onClick={() => navigate('/events/create')}>
              + New Event Request
            </Button>
          </Box>

          {myEvents.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
              You haven't submitted any event requests yet.
            </Typography>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Event Title</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Venue</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Participants</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {myEvents.map((evt) => (
                    <TableRow key={evt.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{evt.title}</TableCell>
                      <TableCell>{evt.category}</TableCell>
                      <TableCell>{formatDate(evt.eventDate)}</TableCell>
                      <TableCell>{evt.venue}</TableCell>
                      <TableCell>
                        <StatusChip status={evt.status} />
                      </TableCell>
                      <TableCell>
                        {evt.registeredCount} / {evt.maxParticipants}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => navigate(`/events/${evt.id}`)}
                          sx={{ fontSize: '0.75rem', py: 0.4 }}
                        >
                          View Details & Roster
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

      {/* Academic Resources Uploaded */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Recent Academic Resource Uploads
            </Typography>
            <Button size="small" onClick={() => navigate('/resources/upload')}>
              Upload New
            </Button>
          </Box>

          {myResources.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
              No notes or resources uploaded yet.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {myResources.map((res) => (
                <Grid item xs={12} sm={6} key={res.id}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Chip label={`Sem ${res.semester}`} size="small" variant="outlined" />
                      <Typography variant="caption" color="text.secondary">
                        📥 {res.downloadCount} downloads
                      </Typography>
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {res.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                      📚 {res.subject} • {res.resourceType}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      component="a"
                      href={res.fileUrl}
                      target="_blank"
                      fullWidth
                    >
                      Download / View File
                    </Button>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
