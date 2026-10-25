import React, { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
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
} from '@mui/material';
import {
  Storefront as StoreIcon,
  Add as AddIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Sell as SellIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { marketplaceService } from '../../services/marketplaceService';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { MARKETPLACE_CATEGORIES, ITEM_CONDITIONS } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import SearchBar from '../../components/common/SearchBar';
import StatusChip from '../../components/common/StatusChip';
import { LoadingState, EmptyState } from '../../components/common/LoadingState';

export default function MarketplacePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');

  // Contact seller modal
  const [contactDialog, setContactDialog] = useState({ open: false, item: null });

  const loadItems = async () => {
    try {
      setLoading(true);
      const cat = selectedCategory === 'All' ? null : selectedCategory;
      const cond = selectedCondition === 'All' ? null : selectedCondition;
      const data = await marketplaceService.searchItems({
        category: cat,
        condition: cond,
        search: searchQuery || null,
      });
      setItems(data);
    } catch (err) {
      showToast(err.message || 'Failed to load marketplace items.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [searchQuery, selectedCategory, selectedCondition]);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
            Campus Marketplace
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Buy and sell academic textbooks, calculators, electronics, lab supplies, and college essentials.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" onClick={() => navigate('/marketplace/my-listings')}>
            My Listings
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/marketplace/create')}>
            Create Listing
          </Button>
        </Box>
      </Box>

      {/* Filter Section */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search items by title, description..."
          sx={{ flexGrow: 1, minWidth: '240px' }}
        />

        <FormControl size="small" sx={{ minWidth: 170, bgcolor: '#ffffff' }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            label="Category"
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <MenuItem value="All">All Categories</MenuItem>
            {MARKETPLACE_CATEGORIES.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160, bgcolor: '#ffffff' }}>
          <InputLabel>Condition</InputLabel>
          <Select
            value={selectedCondition}
            label="Condition"
            onChange={(e) => setSelectedCondition(e.target.value)}
          >
            <MenuItem value="All">All Conditions</MenuItem>
            {ITEM_CONDITIONS.map((cond) => (
              <MenuItem key={cond.value} value={cond.value}>
                {cond.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Items Grid */}
      {loading ? (
        <LoadingState message="Fetching marketplace listings..." />
      ) : items.length === 0 ? (
        <EmptyState
          title="No marketplace listings found"
          message="Try adjusting your search criteria or create a new listing!"
          action={
            <Button variant="contained" onClick={() => navigate('/marketplace/create')}>
              Post an Item for Sale
            </Button>
          }
        />
      ) : (
        <Grid container spacing={3}>
          {items.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <CardMedia
                  component="img"
                  height="180"
                  image={
                    item.imageUrl ||
                    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500'
                  }
                  alt={item.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Chip label={item.category} size="small" sx={{ bgcolor: '#e3f2fd', color: 'primary.dark', fontWeight: 600 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {formatCurrency(item.price)}
                    </Typography>
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, lineHeight: 1.3 }}>
                    {item.title}
                  </Typography>

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Condition: <strong>{item.itemCondition?.replace('_', ' ')}</strong>
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      height: '40px',
                    }}
                  >
                    {item.description}
                  </Typography>

                  <Box sx={{ bgcolor: '#f8fafc', p: 1.2, borderRadius: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Seller: <strong>{item.seller?.fullName}</strong> ({item.seller?.department})
                    </Typography>
                  </Box>
                </CardContent>

                <Box sx={{ px: 2.5, pb: 2.5, pt: 1, borderTop: '1px solid #f1f5f9' }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="small"
                    startIcon={<PhoneIcon />}
                    onClick={() => setContactDialog({ open: true, item })}
                  >
                    Contact Seller
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Contact Seller Modal */}
      <Dialog open={contactDialog.open} onClose={() => setContactDialog({ open: false, item: null })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Seller Contact Information</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0', mt: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
              {contactDialog.item?.seller?.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              {contactDialog.item?.seller?.department} • {contactDialog.item?.seller?.academicYear}
            </Typography>

            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EmailIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
              {contactDialog.item?.seller?.email}
            </Typography>

            {contactDialog.item?.contactPhone && (
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'success.main' }} />
                {contactDialog.item?.contactPhone}
              </Typography>
            )}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
            Coordinate safe handover on campus grounds. No online payment required.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setContactDialog({ open: false, item: null })}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
