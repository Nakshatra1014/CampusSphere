import React, { useState } from 'react';
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
  Alert,
  CircularProgress,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Groups as TeamIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { teamService } from '../../services/teamService';
import { useNotifications } from '../../context/NotificationContext';

export default function CreateTeamPage() {
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const [formData, setFormData] = useState({
    teamName: '',
    projectName: '',
    description: '',
    requiredSkills: '',
    membersRequired: 3,
    deadline: '',
    category: 'Hackathon',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.teamName || !formData.projectName || !formData.description || !formData.requiredSkills || !formData.deadline) {
      setError('Please fill out all required fields.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await teamService.createTeam({
        ...formData,
        membersRequired: Number(formData.membersRequired),
      });
      showToast('Team created successfully! You are set as Team Leader.', 'success');
      navigate('/teams');
    } catch (err) {
      setError(err.message || 'Failed to create team.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/teams')} sx={{ mb: 2.5 }}>
        Back to Teams
      </Button>

      <Card sx={{ maxWidth: 750, mx: 'auto' }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TeamIcon color="primary" sx={{ mr: 1.5, fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Form a New Project / Hackathon Team
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Specify project goals, deadline, and target skill requirements to recruit team members.
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
                  label="Team Name"
                  value={formData.teamName}
                  onChange={handleChange('teamName')}
                  size="small"
                  placeholder="e.g. NeuroSphere AI Team"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Project or Competition Name"
                  value={formData.projectName}
                  onChange={handleChange('projectName')}
                  size="small"
                  placeholder="e.g. Smart Campus Automation"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    label="Category"
                    onChange={handleChange('category')}
                  >
                    <MenuItem value="Hackathon">Hackathon</MenuItem>
                    <MenuItem value="Academic Project">Academic Project</MenuItem>
                    <MenuItem value="Research">Research & Papers</MenuItem>
                    <MenuItem value="Competition">Competitions</MenuItem>
                    <MenuItem value="Startup">Startup / Prototype</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Members Needed"
                  type="number"
                  value={formData.membersRequired}
                  onChange={handleChange('membersRequired')}
                  size="small"
                  inputProps={{ min: 1, max: 10 }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Join Deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={handleChange('deadline')}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Required Skills / Roles (comma-separated)"
                  value={formData.requiredSkills}
                  onChange={handleChange('requiredSkills')}
                  size="small"
                  placeholder="e.g. React Frontend, Python FastAPI, UI/UX Designer, ML Engineer"
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Project Scope & Vision"
                  value={formData.description}
                  onChange={handleChange('description')}
                  placeholder="Explain what your team will build, expected time commitment, meeting schedules, and tech stack..."
                  required
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={() => navigate('/teams')}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={loading} sx={{ px: 4, py: 1 }}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Team & Open Recruitment'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
