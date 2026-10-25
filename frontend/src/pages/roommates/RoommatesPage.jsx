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
  Divider,
} from '@mui/material';
import {
  MeetingRoom as RoommateIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  LocationCity as CityIcon,
  Nightlight as SleepIcon,
  CleaningServices as CleanIcon,
  Restaurant as DietIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { roommateService } from '../../services/roommateService';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatCurrency } from '../../utils/formatters';
import { LoadingState, EmptyState } from '../../components/common/LoadingState';

export default function RoommatesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genderFilter, setGenderFilter] = useState('All');
  const [sleepFilter, setSleepFilter] = useState('All');

  // View modal
  const [viewDialog, setViewDialog] = useState({ open: false, profile: null });

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const g = genderFilter === 'All' ? null : genderFilter;
      const s = sleepFilter === 'All' ? null : sleepFilter;
      const data = await roommateService.searchProfiles({
        genderPref: g,
        sleepHabit: s,
      });
      setProfiles(data);
    } catch (err) {
      showToast(err.message || 'Failed to load roommate profiles.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, [genderFilter, sleepFilter]);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
            Roommate & Housing Finder
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Discover compatible roommates by non-sensitive lifestyle, cleanliness, budget, and study habits.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<PersonIcon />} onClick={() => navigate('/roommates/profile')}>
          My Roommate Profile
        </Button>
      </Box>

      {/* Filter Section */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 180, bgcolor: '#ffffff' }}>
          <InputLabel>Gender Preference</InputLabel>
          <Select
            value={genderFilter}
            label="Gender Preference"
            onChange={(e) => setGenderFilter(e.target.value)}
          >
            <MenuItem value="All">Any Gender</MenuItem>
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Any">No Preference</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180, bgcolor: '#ffffff' }}>
          <InputLabel>Sleep / Study Schedule</InputLabel>
          <Select
            value={sleepFilter}
            label="Sleep / Study Schedule"
            onChange={(e) => setSleepFilter(e.target.value)}
          >
            <MenuItem value="All">All Schedules</MenuItem>
            <MenuItem value="EARLY_BIRD">Early Bird (Morning)</MenuItem>
            <MenuItem value="NIGHT_OWL">Night Owl (Late Night)</MenuItem>
            <MenuItem value="FLEXIBLE">Flexible</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Profiles Grid */}
      {loading ? (
        <LoadingState message="Fetching active roommate profiles..." />
      ) : profiles.length === 0 ? (
        <EmptyState
          title="No roommate profiles found"
          message="Set up your profile to let prospective roommates discover and contact you!"
          action={
            <Button variant="contained" onClick={() => navigate('/roommates/profile')}>
              Create My Profile
            </Button>
          }
        />
      ) : (
        <Grid container spacing={3}>
          {profiles.map((p) => (
            <Grid item xs={12} sm={6} md={4} key={p.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {p.user?.fullName}
                    </Typography>
                    <Chip label={p.academicYear || 'Student'} size="small" variant="outlined" />
                  </Box>

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    {p.user?.department}
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f8fafc', p: 1, borderRadius: 1 }}>
                      <MoneyIcon fontSize="small" sx={{ mr: 1, color: 'success.main' }} />
                      <Typography variant="caption" color="text.secondary">
                        Target Budget: <strong>{formatCurrency(p.budgetMin)} - {formatCurrency(p.budgetMax)}/mo</strong>
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f8fafc', p: 1, borderRadius: 1 }}>
                      <CityIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="caption" color="text.secondary">
                        Location: <strong>{p.preferredLocation || 'Campus Vicinity'}</strong>
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f8fafc', p: 1, borderRadius: 1 }}>
                      <SleepIcon fontSize="small" sx={{ mr: 1, color: 'info.main' }} />
                      <Typography variant="caption" color="text.secondary">
                        Schedule: <strong>{p.sleepHabits?.replace('_', ' ')}</strong>
                      </Typography>
                    </Box>
                  </Box>

                  {p.lifestyleNotes && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        height: '40px',
                      }}
                    >
                      "{p.lifestyleNotes}"
                    </Typography>
                  )}
                </CardContent>

                <Box sx={{ px: 2.5, pb: 2.5, pt: 1, borderTop: '1px solid #f1f5f9' }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="small"
                    onClick={() => setViewDialog({ open: true, profile: p })}
                  >
                    View Lifestyle Profile & Contact
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Profile Details Dialog */}
      <Dialog open={viewDialog.open} onClose={() => setViewDialog({ open: false, profile: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          Roommate Profile: {viewDialog.profile?.user?.fullName}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0', mt: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Academic Info
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {viewDialog.profile?.user?.department} • {viewDialog.profile?.academicYear}
            </Typography>

            <Divider sx={{ my: 1.5 }} />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Budget Range</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatCurrency(viewDialog.profile?.budgetMin)} - {formatCurrency(viewDialog.profile?.budgetMax)} / month
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Preferred Location</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {viewDialog.profile?.preferredLocation}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Cleanliness Level</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {viewDialog.profile?.cleanliness}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Sleep / Study Habits</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {viewDialog.profile?.sleepHabits?.replace('_', ' ')}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Dietary Preference</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {viewDialog.profile?.dietaryPreference || 'No preference'}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Occupancy Preference</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {viewDialog.profile?.occupancyType || 'Single / Shared'}
                </Typography>
              </Grid>
            </Grid>

            {viewDialog.profile?.lifestyleNotes && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">Personal Notes & Study Routine</Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  "{viewDialog.profile?.lifestyleNotes}"
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Contact University Member
            </Typography>
            <Typography variant="body2">
              Email: <strong>{viewDialog.profile?.user?.email}</strong>
            </Typography>
            {viewDialog.profile?.contactPhone && (
              <Typography variant="body2">
                Phone: <strong>{viewDialog.profile?.contactPhone}</strong>
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setViewDialog({ open: false, profile: null })}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
