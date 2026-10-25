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
import { ArrowBack as ArrowBackIcon, Event as EventIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { useNotifications } from '../../context/NotificationContext';
import { EVENT_CATEGORIES } from '../../utils/constants';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Workshop',
    eventDate: '',
    startTime: '10:00',
    endTime: '14:00',
    venue: '',
    eligibility: 'All Students',
    maxParticipants: 60,
    registrationDeadline: '',
    imageUrl: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.eventDate || !formData.venue || !formData.startTime || !formData.endTime) {
      setError('Please fill out all required fields.');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      setError('Event end time must be after start time.');
      return;
    }

    try {
      setError('');
      setLoading(true);

      const formattedStartTime = formData.startTime.length === 5 ? `${formData.startTime}:00` : formData.startTime;
      const formattedEndTime = formData.endTime.length === 5 ? `${formData.endTime}:00` : formData.endTime;

      // Ensure deadline format is ISO datetime with seconds
      let deadline = formData.registrationDeadline;
      if (!deadline) {
        deadline = `${formData.eventDate}T${formattedStartTime}`;
      } else if (deadline.length === 16) {
        deadline = `${deadline}:00`;
      }

      await eventService.createEventRequest({
        ...formData,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        registrationDeadline: deadline,
      });

      showToast('Event request submitted! It is now pending administrative approval.', 'success');
      navigate('/events');
    } catch (err) {
      setError(err.message || 'Failed to submit event request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/events')} sx={{ mb: 2.5 }}>
        Back to Events
      </Button>

      <Card sx={{ maxWidth: 800, mx: 'auto' }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <EventIcon color="primary" sx={{ mr: 1.5, fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Submit Campus Event Proposal
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            All event proposals enter a <strong>PENDING</strong> status and are reviewed by University Administration before public listing.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Event Title"
                  value={formData.title}
                  onChange={handleChange('title')}
                  size="small"
                  placeholder="e.g. AI & Cloud Developer Summit 2026"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Event Category</InputLabel>
                  <Select
                    value={formData.category}
                    label="Event Category"
                    onChange={handleChange('category')}
                  >
                    {EVENT_CATEGORIES.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Venue / Room"
                  value={formData.venue}
                  onChange={handleChange('venue')}
                  size="small"
                  placeholder="e.g. CS Lab 2 / Main Auditorium"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Event Date"
                  type="date"
                  value={formData.eventDate}
                  onChange={handleChange('eventDate')}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Start Time"
                  type="time"
                  value={formData.startTime}
                  onChange={handleChange('startTime')}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="End Time"
                  type="time"
                  value={formData.endTime}
                  onChange={handleChange('endTime')}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Maximum Seat Capacity"
                  type="number"
                  value={formData.maxParticipants}
                  onChange={handleChange('maxParticipants')}
                  size="small"
                  inputProps={{ min: 1 }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Registration Deadline"
                  type="datetime-local"
                  value={formData.registrationDeadline}
                  onChange={handleChange('registrationDeadline')}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Eligibility Criteria"
                  value={formData.eligibility}
                  onChange={handleChange('eligibility')}
                  size="small"
                  placeholder="e.g. Open to all students, or 3rd/4th Year CSE"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Event Image URL"
                  value={formData.imageUrl}
                  onChange={handleChange('imageUrl')}
                  size="small"
                  placeholder="https://... image banner URL"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Event Description & Agenda"
                  value={formData.description}
                  onChange={handleChange('description')}
                  placeholder="Detailed breakdown of the event schedule, guest speakers, prerequisites, and learning outcomes..."
                  required
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={() => navigate('/events')}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={loading} sx={{ px: 4, py: 1 }}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Proposal for Approval'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
