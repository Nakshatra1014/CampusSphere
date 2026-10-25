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
import { ArrowBack as ArrowBackIcon, Storefront as StoreIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { marketplaceService } from '../../services/marketplaceService';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { MARKETPLACE_CATEGORIES, ITEM_CONDITIONS } from '../../utils/constants';

export default function CreateListingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Books',
    price: '',
    itemCondition: 'LIKE_NEW',
    imageUrl: '',
    contactPhone: user?.phone || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.price) {
      setError('Please fill out all required fields.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await marketplaceService.createListing({
        ...formData,
        price: Number(formData.price),
      });
      showToast('Marketplace listing published successfully!', 'success');
      navigate('/marketplace');
    } catch (err) {
      setError(err.message || 'Failed to create listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/marketplace')} sx={{ mb: 2.5 }}>
        Back to Marketplace
      </Button>

      <Card sx={{ maxWidth: 700, mx: 'auto' }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <StoreIcon color="primary" sx={{ mr: 1.5, fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Sell an Educational Item
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Post textbooks, lab gear, calculators, stationery, and electronics for sale.
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
                  label="Item Title"
                  value={formData.title}
                  onChange={handleChange('title')}
                  size="small"
                  placeholder="e.g. Introduction to Algorithms (CLRS 4th Edition)"
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
                    {MARKETPLACE_CATEGORIES.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Condition</InputLabel>
                  <Select
                    value={formData.itemCondition}
                    label="Condition"
                    onChange={handleChange('itemCondition')}
                  >
                    {ITEM_CONDITIONS.map((cond) => (
                      <MenuItem key={cond.value} value={cond.value}>
                        {cond.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price ($ USD)"
                  type="number"
                  value={formData.price}
                  onChange={handleChange('price')}
                  size="small"
                  inputProps={{ min: 0, step: '0.50' }}
                  placeholder="e.g. 45.00"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Phone (Optional)"
                  value={formData.contactPhone}
                  onChange={handleChange('contactPhone')}
                  size="small"
                  placeholder="+1 (555) 000-0000"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Image URL"
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
                  label="Description & Pickup Details"
                  value={formData.description}
                  onChange={handleChange('description')}
                  placeholder="Describe book edition, included accessories, physical condition, and preferred campus pickup spots..."
                  required
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={() => navigate('/marketplace')}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={loading} sx={{ px: 4, py: 1 }}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Publish Listing'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
