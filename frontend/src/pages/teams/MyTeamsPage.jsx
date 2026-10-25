import React, { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Check as AcceptIcon,
  Close as RejectIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { teamService } from '../../services/teamService';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate } from '../../utils/formatters';
import StatusChip from '../../components/common/StatusChip';
import { LoadingState, EmptyState } from '../../components/common/LoadingState';

export default function MyTeamsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [myTeams, setMyTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const data = await teamService.getMyTeams();
      setMyTeams(data);
    } catch (err) {
      showToast(err.message || 'Failed to load your teams.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const handleRespond = async (teamId, requestId, accept) => {
    try {
      setActionLoading(true);
      await teamService.respondToRequest(teamId, requestId, accept);
      showToast(accept ? 'Applicant accepted into the team!' : 'Join request declined.', 'info');
      loadTeams();
    } catch (err) {
      showToast(err.message || 'Failed to process join request.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingState message="Loading your team memberships and requests..." />;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/teams')} sx={{ mb: 2.5 }}>
        Back to Teams
      </Button>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
          My Teams & Member Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage rosters and accept/reject applicant join requests for teams you lead.
        </Typography>
      </Box>

      {myTeams.length === 0 ? (
        <EmptyState
          title="You are not part of any teams yet"
          message="Browse available teams or create a new team for your next campus project!"
          action={
            <Button variant="contained" onClick={() => navigate('/teams/create')}>
              Create a Team
            </Button>
          }
        />
      ) : (
        <Grid container spacing={3}>
          {myTeams.map((team) => (
            <Grid item xs={12} key={team.id}>
              <Card sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {team.teamName}
                      </Typography>
                      {team.isUserLeader && <Chip label="Team Leader" size="small" color="primary" sx={{ fontWeight: 600 }} />}
                      <StatusChip status={team.status} />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Project: <strong>{team.projectName}</strong> • Category: {team.category} • Deadline: {formatDate(team.deadline)}
                    </Typography>
                  </Box>

                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Roster: {team.currentMembersCount} / {team.membersRequired + 1} members
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  {/* Members List */}
                  <Grid item xs={12} md={team.isUserLeader && team.joinRequests?.length > 0 ? 6 : 12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Team Members ({team.members?.length || 0})
                    </Typography>
                    <List sx={{ bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0', p: 1 }}>
                      {team.members?.map((m) => (
                        <ListItem key={m.id} divider sx={{ py: 1 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.8rem' }}>
                              {m.user?.fullName?.charAt(0)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{m.user?.fullName}</Typography>}
                            secondary={`${m.user?.department} • ${m.roleInTeam}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>

                  {/* Pending Join Requests for Leader */}
                  {team.isUserLeader && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Pending Applicant Requests ({team.joinRequests?.filter(r => r.status === 'PENDING').length || 0})
                      </Typography>
                      {(!team.joinRequests || team.joinRequests.filter(r => r.status === 'PENDING').length === 0) ? (
                        <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            No pending join requests right now.
                          </Typography>
                        </Box>
                      ) : (
                        <List sx={{ bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0', p: 1 }}>
                          {team.joinRequests.filter(r => r.status === 'PENDING').map((req) => (
                            <ListItem
                              key={req.id}
                              divider
                              sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 1.5 }}
                            >
                              <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {req.user?.fullName} ({req.user?.department})
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    startIcon={<AcceptIcon />}
                                    disabled={actionLoading || team.status === 'FULL'}
                                    onClick={() => handleRespond(team.id, req.id, true)}
                                    sx={{ fontSize: '0.75rem', py: 0.2 }}
                                  >
                                    Accept
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    startIcon={<RejectIcon />}
                                    disabled={actionLoading}
                                    onClick={() => handleRespond(team.id, req.id, false)}
                                    sx={{ fontSize: '0.75rem', py: 0.2 }}
                                  >
                                    Decline
                                  </Button>
                                </Box>
                              </Box>
                              {req.message && (
                                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                  "{req.message}"
                                </Typography>
                              )}
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </Grid>
                  )}
                </Grid>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
