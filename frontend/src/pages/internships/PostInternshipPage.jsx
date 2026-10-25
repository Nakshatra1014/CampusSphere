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
import { ArrowBack as ArrowBackIcon, Work as WorkIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { internshipService } from '../../services/internshipService';
import { useNotifications } from '../../context/NotificationContext';
import { WORK_MODES } from '../../utils/constants';

export default function PostInternshipPage() {
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    description: '',
    location: '',
    workMode: 'REMOTE',
    stipend: '',
    duration: '',
    eligibility: 'Open to all departments',
    skillsRequired: '',
    applicationDeadline: '',
    applicationLink: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.companyName || !formData.description || !formData.location || !formData.applicationDeadline) {
      setError('Please fill out all required fields.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await internshipService.postInternship(formData);
      showToast('Internship opportunity posted successfully!', 'success');
      navigate('/internships');
    } catch (err) {
      setError(err.message || 'Failed to post internship.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/internships')} sx={{ mb: 2.5 }}>
        Back to Internships
      </Button>

      <Card sx={{ maxWidth: 800, mx: 'auto' }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <WorkIcon color="primary" sx={{ mr: 1.5, fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Post an Internship Opportunity
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Share verified internship, research assistant, or campus opportunities with students.
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
                  label="Role / Internship Title"
                  value={formData.title}
                  onChange={handleChange('title')}
                  size="small"
                  placeholder="e.g. Backend Software Engineer Intern"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company / Lab / Organization"
                  value={formData.companyName}
                  onChange={handleChange('companyName')}
                  size="small"
                  placeholder="e.g. Google Cloud / Robotics Research Lab"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Work Mode</InputLabel>
                  <Select
                    value={formData.workMode}
                    label="Work Mode"
                    onChange={handleChange('workMode')}
                  >
                    {WORK_MODES.map((mode) => (
                      <MenuItem key={mode.value} value={mode.value}>
                        {mode.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={formData.location}
                  onChange={handleChange('location')}
                  size="small"
                  placeholder="e.g. Seattle, WA / Campus Tech Park"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Stipend / Compensation"
                  value={formData.stipend}
                  onChange={handleChange('stipend')}
                  size="small"
                  placeholder="e.g. $1,200 / month or Unpaid"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Duration"
                  value={formData.duration}
                  onChange={handleChange('duration')}
                  size="small"
                  placeholder="e.g. 3 Months / Summer 2026"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Application Deadline"
                  type="date"
                  value={formData.applicationDeadline}
                  onChange={handleChange('applicationDeadline')}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Eligibility Criteria"
                  value={formData.eligibility}
                  onChange={handleChange('eligibility')}
                  size="small"
                  placeholder="e.g. 3rd/4th year, CGPA > 7.5"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Required Skills (comma-separated)"
                  value={formData.skillsRequired}
                  onChange={handleChange('skillsRequired')}
                  size="small"
                  placeholder="e.g. React, Java, Spring Boot, MySQL, Git"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="External Application Link (Optional)"
                  value={formData.applicationLink}
                  onChange={handleChange('applicationLink')}
                  size="small"
                  placeholder="https://careers.company.com/apply"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Detailed Role Description & Responsibilities"
                  value={formData.description}
                  onChange={handleChange('description')}
                  placeholder="Responsibilities, daily projects, mentors, and qualification requirements..."
                  required
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={() => navigate('/internships')}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={loading} sx={{ px: 4, py: 1 }}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Publish Internship'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
