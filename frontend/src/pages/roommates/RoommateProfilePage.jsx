import React, { useState, useEffect } from 'react';
import {
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Person as PersonIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { roommateService } from '../../services/roommateService';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export default function RoommateProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [formData, setFormData] = useState({
    academicYear: user?.academicYear || 'Year 2',
    budgetMin: 400,
    budgetMax: 800,
    preferredLocation: 'Near Campus / North Side',
    genderPreference: 'Any',
    cleanliness: 'Moderate',
    sleepHabits: 'EARLY_BIRD',
    dietaryPreference: 'No specific restrictions',
    occupancyType: 'Double Occupancy (2 sharing)',
    lifestyleNotes: '',
    contactPhone: user?.phone || '',
    isActive: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMyProfile = async () => {
      try {
        setLoading(true);
        const data = await roommateService.getMyProfile();
        if (data) {
          setFormData({
            academicYear: data.academicYear || user?.academicYear || 'Year 2',
            budgetMin: data.budgetMin || 400,
            budgetMax: data.budgetMax || 800,
            preferredLocation: data.preferredLocation || 'Near Campus',
            genderPreference: data.genderPreference || 'Any',
            cleanliness: data.cleanliness || 'Moderate',
            sleepHabits: data.sleepHabits || 'EARLY_BIRD',
            dietaryPreference: data.dietaryPreference || 'No specific restrictions',
            occupancyType: data.occupancyType || 'Double Occupancy',
            lifestyleNotes: data.lifestyleNotes || '',
            contactPhone: data.contactPhone || user?.phone || '',
            isActive: data.isActive !== undefined ? data.isActive : true,
          });
        }
      } catch (err) {
        console.log('No existing roommate profile, initializing default form.');
      } finally {
        setLoading(false);
      }
    };

    loadMyProfile();
  }, [user]);

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSaving(true);
      await roommateService.saveProfile({
      preferredLocation: formData.preferredLocation,
      budgetRange: `${Number(formData.budgetMin)} - ${Number(formData.budgetMax)}`,
      occupancyPreference: formData.occupancyType,
      lifestyle: formData.cleanliness,
      studyHabits: formData.sleepHabits,
      foodPreference: formData.dietaryPreference,
      sleepSchedule: formData.sleepHabits,
      interests: formData.lifestyleNotes,
      bio: formData.lifestyleNotes,
    });
      showToast('Roommate preferences saved and active!', 'success');
      navigate('/roommates');
    } catch (err) {
      setError(err.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <CircularProgress sx={{ display: 'block', mx: 'auto', my: 8 }} />;
  }

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/roommates')} sx={{ mb: 2.5 }}>
        Back to Roommates
      </Button>

      <Card sx={{ maxWidth: 750, mx: 'auto' }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PersonIcon color="primary" sx={{ mr: 1.5, fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              My Roommate & Housing Preferences
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Share non-sensitive lifestyle habits and budget to connect with compatible roommates.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Minimum Monthly Budget ($)"
                  type="number"
                  value={formData.budgetMin}
                  onChange={handleChange('budgetMin')}
                  size="small"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Maximum Monthly Budget ($)"
                  type="number"
                  value={formData.budgetMax}
                  onChange={handleChange('budgetMax')}
                  size="small"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Preferred Area / Housing Location"
                  value={formData.preferredLocation}
                  onChange={handleChange('preferredLocation')}
                  size="small"
                  placeholder="e.g. North Gate / Off-Campus Apartments"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Gender Preference</InputLabel>
                  <Select
                    value={formData.genderPreference}
                    label="Gender Preference"
                    onChange={handleChange('genderPreference')}
                  >
                    <MenuItem value="Any">No Preference</MenuItem>
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Cleanliness Routine</InputLabel>
                  <Select
                    value={formData.cleanliness}
                    label="Cleanliness Routine"
                    onChange={handleChange('cleanliness')}
                  >
                    <MenuItem value="Very Clean & Organized">Very Clean & Organized</MenuItem>
                    <MenuItem value="Moderate">Moderate / Regular</MenuItem>
                    <MenuItem value="Relaxed">Relaxed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sleep & Study Schedule</InputLabel>
                  <Select
                    value={formData.sleepHabits}
                    label="Sleep & Study Schedule"
                    onChange={handleChange('sleepHabits')}
                  >
                    <MenuItem value="EARLY_BIRD">Early Bird (Sleeps before 11 PM)</MenuItem>
                    <MenuItem value="NIGHT_OWL">Night Owl (Studies late into night)</MenuItem>
                    <MenuItem value="FLEXIBLE">Flexible / Varies with Exams</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Dietary / Cooking Preference"
                  value={formData.dietaryPreference}
                  onChange={handleChange('dietaryPreference')}
                  size="small"
                  placeholder="e.g. Vegetarian, Cooking daily, Meal plan"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Occupancy Type"
                  value={formData.occupancyType}
                  onChange={handleChange('occupancyType')}
                  size="small"
                  placeholder="e.g. Single room in 2BHK / Shared room"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Contact Phone (Shown to verified students)"
                  value={formData.contactPhone}
                  onChange={handleChange('contactPhone')}
                  size="small"
                  placeholder="+1 (555) 000-0000"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Lifestyle Notes & Hobbies"
                  value={formData.lifestyleNotes}
                  onChange={handleChange('lifestyleNotes')}
                  placeholder="Describe your quiet hours, study habits, music preferences, or sports..."
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="List my profile as actively looking for roommates"
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={() => navigate('/roommates')}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={saving} sx={{ px: 4, py: 1 }}>
                {saving ? <CircularProgress size={24} color="inherit" /> : 'Save Roommate Profile'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
