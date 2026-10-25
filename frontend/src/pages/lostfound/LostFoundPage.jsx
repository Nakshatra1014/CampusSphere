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
  TextField,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search as LostFoundIcon,
  Add as AddIcon,
  LocationOn as LocationIcon,
  CalendarToday as DateIcon,
  CheckCircle as ResolveIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { lostFoundService } from '../../services/lostFoundService';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { LOST_FOUND_CATEGORIES } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import SearchBar from '../../components/common/SearchBar';
import StatusChip from '../../components/common/StatusChip';
import { LoadingState, EmptyState } from '../../components/common/LoadingState';

export default function LostFoundPage() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { showToast } = useNotifications();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Claim dialog
  const [claimDialog, setClaimDialog] = useState({ open: false, item: null, claimNote: '', loading: false });

  const loadItems = async () => {
    try {
      setLoading(true);
      const typeParam = activeTab === 'ALL' ? null : activeTab;
      const catParam = selectedCategory === 'All' ? null : selectedCategory;
      const data = await lostFoundService.searchItems({
        type: typeParam,
        category: catParam,
        search: searchQuery || null,
      });
      setItems(data);
    } catch (err) {
      showToast(err.message || 'Failed to load lost & found items.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [activeTab, selectedCategory, searchQuery]);

  const handleOpenClaim = (item) => {
    setClaimDialog({
      open: true,
      item,
      claimNote: `Hi, I believe this is my item. I can verify ownership with unique identifying marks.`,
      loading: false,
    });
  };

  const handleConfirmClaim = async () => {
    const item = claimDialog.item;
    if (!item) return;

    try {
      setClaimDialog((prev) => ({ ...prev, loading: true }));
      await lostFoundService.claimItem(item.id, claimDialog.claimNote);
      showToast('Ownership claim submitted! The finder has been notified.', 'success');
      setClaimDialog({ open: false, item: null, claimNote: '', loading: false });
      loadItems();
    } catch (err) {
      showToast(err.message || 'Failed to submit claim.', 'error');
      setClaimDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleResolve = async (id, title) => {
    try {
      await lostFoundService.resolveItem(id);
      showToast(`Item "${title}" marked as Resolved!`, 'success');
      loadItems();
    } catch (err) {
      showToast(err.message || 'Failed to resolve item.', 'error');
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
            Lost & Found Desk
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Centralized campus lost and found repository. Report lost belongings or found articles.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/lost-found/report')}>
          Report an Item
        </Button>
      </Box>

      {/* Tabs for All, Lost, Found */}
      <Tabs
        value={activeTab}
        onChange={(e, val) => setActiveTab(val)}
        sx={{ mb: 3, borderBottom: '1px solid #e2e8f0' }}
      >
        <Tab label="All Items" value="ALL" />
        <Tab label="🔍 Lost Items" value="LOST" />
        <Tab label="📦 Found Items" value="FOUND" />
      </Tabs>

      {/* Filter Section */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by title, location, description..."
          sx={{ flexGrow: 1, minWidth: '240px' }}
        />

        <FormControl size="small" sx={{ minWidth: 180, bgcolor: '#ffffff' }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            label="Category"
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <MenuItem value="All">All Categories</MenuItem>
            {LOST_FOUND_CATEGORIES.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Items Grid */}
      {loading ? (
        <LoadingState message="Fetching campus lost & found records..." />
      ) : items.length === 0 ? (
        <EmptyState
          title="No items found"
          message="If you lost or found something on campus, report it to notify the university community."
          action={
            <Button variant="contained" onClick={() => navigate('/lost-found/report')}>
              Report Item
            </Button>
          }
        />
      ) : (
        <Grid container spacing={3}>
          {items.map((item) => {
            const isReporter = user && item.reportedBy?.id === user.id;

            return (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <CardMedia
                    component="img"
                    height="160"
                    image={
                      item.imageUrl ||
                      'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=500'
                    }
                    alt={item.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Chip
                        label={item.type === 'LOST' ? 'LOST' : 'FOUND'}
                        size="small"
                        color={item.type === 'LOST' ? 'error' : 'info'}
                        sx={{ fontWeight: 700 }}
                      />
                      <StatusChip status={item.status} />
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, lineHeight: 1.3 }}>
                      {item.title}
                    </Typography>

                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 0.5 }}>
                      <LocationIcon fontSize="inherit" sx={{ mr: 0.5, color: 'primary.main' }} />
                      {item.location}
                    </Typography>

                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 1.5 }}>
                      <DateIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                      {formatDate(item.incidentDate)}
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
                        Reported by: <strong>{item.reportedBy?.fullName}</strong> ({item.reportedBy?.department})
                      </Typography>
                    </Box>
                  </CardContent>

                  <Box sx={{ px: 2.5, pb: 2.5, pt: 1, borderTop: '1px solid #f1f5f9', display: 'flex', gap: 1 }}>
                    {(isReporter || isAdmin) && item.status !== 'RESOLVED' ? (
                      <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<ResolveIcon />}
                        onClick={() => handleResolve(item.id, item.title)}
                      >
                        Mark Resolved
                      </Button>
                    ) : item.status === 'RESOLVED' ? (
                      <Button fullWidth variant="outlined" disabled size="small">
                        Resolved & Returned
                      </Button>
                    ) : (
                      <Button
                        fullWidth
                        variant="contained"
                        size="small"
                        onClick={() => handleOpenClaim(item)}
                      >
                        Claim / Contact
                      </Button>
                    )}
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Claim Dialog */}
      <Dialog open={claimDialog.open} onClose={() => setClaimDialog({ ...claimDialog, open: false })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Claim Item: {claimDialog.item?.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Provide details verifying this item belongs to you so <strong>{claimDialog.item?.reportedBy?.fullName}</strong> can securely return it:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Verification Note / Identifying Details"
            value={claimDialog.claimNote}
            onChange={(e) => setClaimDialog({ ...claimDialog, claimNote: e.target.value })}
            placeholder="e.g. The backpack has a silver keychain and blue notebook inside..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setClaimDialog({ ...claimDialog, open: false })}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmClaim} disabled={claimDialog.loading}>
            {claimDialog.loading ? 'Submitting...' : 'Submit Claim'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
