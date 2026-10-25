import React, { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
} from '@mui/material';
import {
  Groups as TeamIcon,
  Add as AddIcon,
  CalendarToday as DateIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { teamService } from '../../services/teamService';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate } from '../../utils/formatters';
import StatusChip from '../../components/common/StatusChip';
import SearchBar from '../../components/common/SearchBar';
import { LoadingState, EmptyState } from '../../components/common/LoadingState';

export default function TeamsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Join request dialog
  const [joinDialog, setJoinDialog] = useState({ open: false, team: null, message: '', loading: false });

  const loadTeams = async () => {
    try {
      setLoading(true);
      const categoryParam = selectedCategory === 'All' ? null : selectedCategory;
      const data = await teamService.searchTeams({
        category: categoryParam,
        search: searchQuery || null,
      });
      setTeams(data);
    } catch (err) {
      showToast(err.message || 'Failed to load teams.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, [searchQuery, selectedCategory]);

  const handleOpenJoin = (team) => {
    setJoinDialog({
      open: true,
      team,
      message: `Hi ${team.leader?.fullName}, I would love to contribute to ${team.teamName}!`,
      loading: false,
    });
  };

  const handleConfirmJoin = async () => {
    const team = joinDialog.team;
    if (!team) return;

    try {
      setJoinDialog((prev) => ({ ...prev, loading: true }));
      await teamService.requestToJoin(team.id, joinDialog.message);
      showToast('Join request sent to the team leader!', 'success');
      setJoinDialog({ open: false, team: null, message: '', loading: false });
      loadTeams();
    } catch (err) {
      showToast(err.message || 'Failed to send request.', 'error');
      setJoinDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
            Team Finder & Collaborations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Form or join project teams for hackathons, academic capstones, research, and coding competitions.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" onClick={() => navigate('/teams/my-teams')}>
            My Teams & Requests
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/teams/create')}>
            Create a Team
          </Button>
        </Box>
      </Box>

      {/* Filter Section */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by team name, project, skills..."
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
            <MenuItem value="Hackathon">Hackathon</MenuItem>
            <MenuItem value="Academic Project">Academic Project</MenuItem>
            <MenuItem value="Research">Research & Papers</MenuItem>
            <MenuItem value="Competition">Competitions</MenuItem>
            <MenuItem value="Startup">Startup / Prototype</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Teams Grid */}
      {loading ? (
        <LoadingState message="Fetching open collaborative teams..." />
      ) : teams.length === 0 ? (
        <EmptyState
          title="No teams match your search"
          message="Start your own project team and recruit talented campus peers!"
          action={
            <Button variant="contained" onClick={() => navigate('/teams/create')}>
              Create a Team
            </Button>
          }
        />
      ) : (
        <Grid container spacing={3}>
          {teams.map((team) => (
            <Grid item xs={12} md={6} key={team.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', textTransform: 'uppercase' }}>
                        {team.category}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, mt: 0.2 }}>
                        {team.teamName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Project: {team.projectName}
                      </Typography>
                    </Box>
                    <StatusChip status={team.status} />
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      my: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {team.description}
                  </Typography>

                  {/* Skills */}
                  {team.requiredSkills && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Required Skills / Tech Stack:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {team.requiredSkills.split(',').map((skill, idx) => (
                          <Chip key={idx} label={skill.trim()} size="small" sx={{ bgcolor: '#e3f2fd', color: 'primary.dark', fontSize: '0.7rem' }} />
                        ))}
                      </Box>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc', p: 1.5, borderRadius: 1.5 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Team Leader
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {team.leader?.fullName} ({team.leader?.department})
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Roster
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {team.currentMembersCount} / {team.membersRequired + 1} members
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>

                <Box sx={{ px: 3, pb: 3, pt: 1, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <DateIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                    Deadline: {formatDate(team.deadline)}
                  </Typography>

                  {team.isUserLeader ? (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate('/teams/my-teams')}
                    >
                      Manage Team
                    </Button>
                  ) : team.isUserMember ? (
                    <Button variant="outlined" color="success" size="small" startIcon={<CheckCircleIcon />} disabled>
                      Joined Member
                    </Button>
                  ) : team.hasUserRequested ? (
                    <Button variant="outlined" color="info" size="small" disabled>
                      Request Pending
                    </Button>
                  ) : team.status === 'FULL' ? (
                    <Button variant="contained" disabled size="small">
                      Team Full
                    </Button>
                  ) : (
                    <Button variant="contained" size="small" onClick={() => handleOpenJoin(team)}>
                      Request to Join
                    </Button>
                  )}
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Join Request Dialog */}
      <Dialog open={joinDialog.open} onClose={() => setJoinDialog({ ...joinDialog, open: false })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          Request to Join {joinDialog.team?.teamName}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Introduce your skill set and why you would like to collaborate with <strong>{joinDialog.team?.leader?.fullName}</strong>.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Introductory Note & Skills"
            value={joinDialog.message}
            onChange={(e) => setJoinDialog({ ...joinDialog, message: e.target.value })}
            placeholder="e.g. I have experience with React and UI design, and would like to build the frontend..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setJoinDialog({ ...joinDialog, open: false })}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmJoin} disabled={joinDialog.loading}>
            {joinDialog.loading ? 'Sending...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
