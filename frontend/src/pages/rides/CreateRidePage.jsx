import React, { useState } from 'react';
import {
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, DirectionsCar as RideIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { rideService } from '../../services/rideService';
import { useNotifications } from '../../context/NotificationContext';

export default function CreateRidePage() {
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const [formData, setFormData] = useState({
    startLocation: '',
    destination: '',
    rideDate: '',
    rideTime: '17:30',
    totalSeats: 3,
    vehicleInfo: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.startLocation || !formData.destination || !formData.rideDate || !formData.rideTime) {
      setError('Please fill out all required fields.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await rideService.createRide({
        ...formData,
        totalSeats: Number(formData.totalSeats),
      });
      showToast('Ride offer published successfully!', 'success');
      navigate('/rides');
    } catch (err) {
      setError(err.message || 'Failed to create ride offer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/rides')} sx={{ mb: 2.5 }}>
        Back to Rides
      </Button>

      <Card sx={{ maxWidth: 700, mx: 'auto' }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <RideIcon color="primary" sx={{ mr: 1.5, fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Offer a Campus Ride
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Share your vehicle journey with fellow campus peers.
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
                  label="Starting Location"
                  value={formData.startLocation}
                  onChange={handleChange('startLocation')}
                  size="small"
                  placeholder="e.g. North Campus Gate"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Destination"
                  value={formData.destination}
                  onChange={handleChange('destination')}
                  size="small"
                  placeholder="e.g. Downtown Metro Station"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={formData.rideDate}
                  onChange={handleChange('rideDate')}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Departure Time"
                  type="time"
                  value={formData.rideTime}
                  onChange={handleChange('rideTime')}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Available Seats"
                  type="number"
                  value={formData.totalSeats}
                  onChange={handleChange('totalSeats')}
                  size="small"
                  inputProps={{ min: 1, max: 8 }}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Vehicle Model & License Plate"
                  value={formData.vehicleInfo}
                  onChange={handleChange('vehicleInfo')}
                  size="small"
                  placeholder="e.g. White Toyota Corolla (Plate: XYZ-1234)"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Commute Notes & Highway Split"
                  value={formData.notes}
                  onChange={handleChange('notes')}
                  placeholder="e.g. Leaving right after lab at 5:15 PM, splitting bridge toll."
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={() => navigate('/rides')}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={loading} sx={{ px: 4, py: 1 }}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Post Ride Offer'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
