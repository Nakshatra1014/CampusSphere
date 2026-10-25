import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, CheckCircle as SoldIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { marketplaceService } from '../../services/marketplaceService';
import { useNotifications } from '../../context/NotificationContext';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import StatusChip from '../../components/common/StatusChip';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { LoadingState, EmptyState } from '../../components/common/LoadingState';

export default function MyListingsPage() {
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [soldDialog, setSoldDialog] = useState({ open: false, item: null, loading: false });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null, loading: false });

  const loadListings = async () => {
    try {
      setLoading(true);
      const data = await marketplaceService.getMyListings();
      setListings(data);
    } catch (err) {
      showToast(err.message || 'Failed to load listings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const handleConfirmSold = async () => {
    const item = soldDialog.item;
    if (!item) return;

    try {
      setSoldDialog((prev) => ({ ...prev, loading: true }));
      await marketplaceService.markAsSold(item.id);
      showToast(`"${item.title}" marked as Sold!`, 'success');
      setSoldDialog({ open: false, item: null, loading: false });
      loadListings();
    } catch (err) {
      showToast(err.message || 'Failed to update listing.', 'error');
      setSoldDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleConfirmDelete = async () => {
    const item = deleteDialog.item;
    if (!item) return;

    try {
      setDeleteDialog((prev) => ({ ...prev, loading: true }));
      await marketplaceService.deleteListing(item.id);
      showToast('Listing removed.', 'info');
      setDeleteDialog({ open: false, item: null, loading: false });
      loadListings();
    } catch (err) {
      showToast(err.message || 'Failed to delete listing.', 'error');
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  if (loading) return <LoadingState message="Loading your marketplace listings..." />;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/marketplace')} sx={{ mb: 2.5 }}>
        Back to Marketplace
      </Button>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
          My Marketplace Listings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track sales and manage items you have listed.
        </Typography>
      </Box>

      {listings.length === 0 ? (
        <EmptyState
          title="No items listed for sale"
          message="Declutter your desk and sell used books or electronics to classmates!"
          action={
            <Button variant="contained" onClick={() => navigate('/marketplace/create')}>
              Post an Item for Sale
            </Button>
          }
        />
      ) : (
        <Card>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item Title</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Condition</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Posted On</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {listings.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{item.title}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {formatCurrency(item.price)}
                    </TableCell>
                    <TableCell>{item.itemCondition}</TableCell>
                    <TableCell>
                      <StatusChip status={item.status} />
                    </TableCell>
                    <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                    <TableCell align="right">
                      {item.status === 'AVAILABLE' && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="success"
                          startIcon={<SoldIcon />}
                          onClick={() => setSoldDialog({ open: true, item, loading: false })}
                          sx={{ mr: 1, fontSize: '0.75rem' }}
                        >
                          Mark Sold
                        </Button>
                      )}
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => setDeleteDialog({ open: true, item, loading: false })}
                        sx={{ fontSize: '0.75rem' }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Mark Sold Confirmation */}
      <ConfirmationDialog
        open={soldDialog.open}
        title="Mark Item as Sold"
        message={`Mark "${soldDialog.item?.title}" as Sold? It will be archived and no longer show in active search.`}
        confirmText="Confirm Sold"
        confirmColor="success"
        loading={soldDialog.loading}
        onConfirm={handleConfirmSold}
        onCancel={() => setSoldDialog({ open: false, item: null, loading: false })}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={deleteDialog.open}
        title="Delete Listing"
        message={`Are you sure you want to permanently delete "${deleteDialog.item?.title}"?`}
        confirmText="Delete Listing"
        confirmColor="error"
        loading={deleteDialog.loading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialog({ open: false, item: null, loading: false })}
      />
    </Box>
  );
}
