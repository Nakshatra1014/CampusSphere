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
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { uploadService } from '../../services/aiService';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { EVENT_CATEGORIES } from '../../utils/constants';
import { LoadingState } from '../../components/common/LoadingState';

export default function EditEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
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

  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setInitialLoading(true);
        const event = await eventService.getEventById(id);
        if (!isAdmin && event.organizer?.id !== user?.id) {
          showToast('You do not have permission to edit this event.', 'error');
          navigate(`/events/${id}`);
          return;
        }

        // Format dates for input fields
        let deadlineFormatted = '';
        if (event.registrationDeadline) {
          deadlineFormatted = event.registrationDeadline.substring(0, 16);
        }

        setFormData({
          title: event.title || '',
          description: event.description || '',
          category: event.category || 'Workshop',
          eventDate: event.eventDate || '',
          startTime: event.startTime ? event.startTime.substring(0, 5) : '10:00',
          endTime: event.endTime ? event.endTime.substring(0, 5) : '14:00',
          venue: event.venue || '',
          eligibility: event.eligibility || 'All Students',
          maxParticipants: event.maxParticipants || 60,
          registrationDeadline: deadlineFormatted,
          imageUrl: event.imageUrl || '',
        });
      } catch (err) {
        showToast(err.message || 'Failed to load event details.', 'error');
        navigate('/events');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchEvent();
  }, [id, user]);

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const res = await uploadService.uploadFile(file, 'events');
      setFormData((prev) => ({ ...prev, imageUrl: res.url }));
      showToast('Event image uploaded successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Image upload failed.', 'error');
    } finally {
      setUploadingImage(false);
    }
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

      let deadline = formData.registrationDeadline;
      if (!deadline) {
        deadline = `${formData.eventDate}T${formattedStartTime}`;
      } else if (deadline.length === 16) {
        deadline = `${deadline}:00`;
      }

      await eventService.updateEvent(id, {
        ...formData,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        registrationDeadline: deadline,
      });

      showToast('Event updated successfully!', 'success');
      navigate(`/events/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to update event.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <LoadingState message="Loading event information for editing..." />;
  }

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/events/${id}`)} sx={{ mb: 2.5 }}>
        Back to Event Details
      </Button>

      <Card sx={{ maxWidth: 800, mx: 'auto' }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <EditIcon color="primary" sx={{ mr: 1.5, fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Edit Event Details
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Update event scheduling, venue logistics, seat capacity, or image banner.
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
                />
              </Grid>

              {/* Event Image Upload */}
              <Grid item xs={12}>
                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Event Banner Image
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    disabled={uploadingImage}
                    size="small"
                  >
                    {uploadingImage ? 'Uploading...' : 'Upload Image to Cloudinary'}
                    <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                  </Button>
                  <TextField
                    label="Or Image URL"
                    value={formData.imageUrl}
                    onChange={handleChange('imageUrl')}
                    size="small"
                    sx={{ flexGrow: 1 }}
                    placeholder="https://..."
                  />
                </Box>
                {formData.imageUrl && (
                  <Box sx={{ mt: 1.5 }}>
                    <img
                      src={formData.imageUrl}
                      alt="Banner Preview"
                      style={{ maxHeight: 140, borderRadius: 6, objectFit: 'cover' }}
                    />
                  </Box>
                )}
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Event Description & Agenda"
                  value={formData.description}
                  onChange={handleChange('description')}
                  required
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={() => navigate(`/events/${id}`)}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={loading} sx={{ px: 4, py: 1 }}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
