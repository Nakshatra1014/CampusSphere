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
import { ArrowBack as ArrowBackIcon, Search as LostFoundIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { lostFoundService } from '../../services/lostFoundService';
import { useNotifications } from '../../context/NotificationContext';
import { LOST_FOUND_CATEGORIES } from '../../utils/constants';

export default function ReportItemPage() {
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'ID Cards',
    type: 'LOST',
    location: '',
    incidentDate: new Date().toISOString().split('T')[0],
    imageUrl: '',
    contactInfo: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.location || !formData.incidentDate) {
      setError('Please fill out all required fields.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await lostFoundService.reportItem({
      ...formData,
      itemType: formData.type,
      type: undefined,
      }); catch (err) {
      setError(err.message || 'Failed to submit report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/lost-found')} sx={{ mb: 2.5 }}>
        Back to Lost & Found
      </Button>

      <Card sx={{ maxWidth: 700, mx: 'auto' }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LostFoundIcon color="primary" sx={{ mr: 1.5, fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Report Lost or Found Article
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Help recover missing items or return discovered property to campus members.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Report Type</InputLabel>
                  <Select
                    value={formData.type}
                    label="Report Type"
                    onChange={handleChange('type')}
                  >
                    <MenuItem value="LOST">🔴 I Lost An Item</MenuItem>
                    <MenuItem value="FOUND">🔵 I Found An Item</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    label="Category"
                    onChange={handleChange('category')}
                  >
                    {LOST_FOUND_CATEGORIES.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Item Name / Title"
                  value={formData.title}
                  onChange={handleChange('title')}
                  size="small"
                  placeholder="e.g. Blue Hydro Flask / Student ID Badge"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Campus Location (Lost or Found At)"
                  value={formData.location}
                  onChange={handleChange('location')}
                  size="small"
                  placeholder="e.g. 2nd Floor Library / Main Cafeteria"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Incident"
                  type="date"
                  value={formData.incidentDate}
                  onChange={handleChange('incidentDate')}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Image URL (Optional)"
                  value={formData.imageUrl}
                  onChange={handleChange('imageUrl')}
                  size="small"
                  placeholder="https://... photo of the item"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Detailed Description & Distinguishing Features"
                  value={formData.description}
                  onChange={handleChange('description')}
                  placeholder="Color, brand, stickers, scratches, or contents..."
                  required
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={() => navigate('/lost-found')}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={loading} sx={{ px: 4, py: 1 }}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Publish Report'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
