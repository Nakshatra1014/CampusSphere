import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  UploadFile as UploadIcon,
  TableRows as TableIcon,
  GridView as GridIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { resourceService } from '../../services/resourceService';
import { useNotifications } from '../../context/NotificationContext';
import ResourceCard from '../../components/resources/ResourceCard';
import ResourceTable from '../../components/resources/ResourceTable';
import DeleteResourceDialog from '../../components/resources/DeleteResourceDialog';
import EditResourceDialog from '../../components/resources/EditResourceDialog';
import { LoadingState, EmptyState } from '../../components/common/LoadingState';

export default function MyResources() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { showToast } = useNotifications();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Edit State
  const [editTarget, setEditTarget] = useState(null);
  const [editing, setEditing] = useState(false);

  const fetchMyResources = async () => {
    try {
      setLoading(true);
      const data = await resourceService.getMyUploadedResources();
      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message || 'Failed to fetch your uploaded resources.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyResources();
  }, []);

  const handleDownload = async (resource) => {
    try {
      await resourceService.downloadResourceFile(resource.id, resource.fileName);
      showToast(`Downloaded ${resource.fileName || 'file'} successfully.`, 'success');
      setResources((prev) =>
        prev.map((r) => (r.id === resource.id ? { ...r, downloadCount: (r.downloadCount || 0) + 1 } : r))
      );
    } catch (err) {
      showToast(err.message || 'Failed to download resource file.', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await resourceService.deleteResource(deleteTarget.id);
      showToast('Resource deleted successfully.', 'success');
      setResources((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      showToast(err.message || 'Failed to delete resource.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleEditSave = async (updatedData) => {
    if (!editTarget) return;
    try {
      setEditing(true);
      const updated = await resourceService.updateResource(editTarget.id, updatedData);
      setResources((prev) => prev.map((r) => (r.id === editTarget.id ? { ...r, ...updated } : r)));
      showToast('Resource metadata updated successfully. Cloudinary file preserved.', 'success');
      setEditTarget(null);
    } catch (err) {
      showToast(err.message || 'Failed to update resource.', 'error');
    } finally {
      setEditing(false);
    }
  };

  const effectiveView = isMobile ? 'cards' : viewMode;

  return (
    <Box>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/resources')}
        sx={{ mb: 2, color: '#64748b', textTransform: 'none', fontWeight: 600 }}
      >
        Back to Resources
      </Button>

      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
            My Uploaded Resources
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Manage your uploaded lecture notes, reference material, and track student download counts.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => navigate('/resources/upload')}
            sx={{
              bgcolor: 'primary.main',
              textTransform: 'none',
              fontWeight: 600,
              px: 2.5,
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            Upload New Resource
          </Button>

          {!isMobile && (
            <ToggleButtonGroup
              size="small"
              value={viewMode}
              exclusive
              onChange={(e, val) => val && setViewMode(val)}
              sx={{ bgcolor: '#ffffff', ml: 1 }}
            >
              <ToggleButton value="table" aria-label="table view">
                <TableIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="cards" aria-label="cards view">
                <GridIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          )}
        </Box>
      </Box>

      {/* Content */}
      {loading ? (
        <LoadingState message="Fetching your uploads..." />
      ) : resources.length === 0 ? (
        <EmptyState
          title="No uploaded resources yet"
          message="You haven't uploaded any academic resources. Share lecture notes with your students!"
          actionLabel="Upload First Resource"
          onAction={() => navigate('/resources/upload')}
        />
      ) : effectiveView === 'table' ? (
        <ResourceTable
          resources={resources}
          onDownload={handleDownload}
          onEdit={(res) => setEditTarget(res)}
          onDelete={(res) => setDeleteTarget(res)}
          canEdit={true}
          canDelete={true}
        />
      ) : (
        <Grid container spacing={2.5}>
          {resources.map((res) => (
            <Grid item xs={12} sm={6} md={4} key={res.id}>
              <ResourceCard
                resource={res}
                onDownload={handleDownload}
                onEdit={(r) => setEditTarget(r)}
                onDelete={(r) => setDeleteTarget(r)}
                canEdit={true}
                canDelete={true}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Edit Confirmation Dialog */}
      <EditResourceDialog
        open={Boolean(editTarget)}
        resource={editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleEditSave}
        loading={editing}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteResourceDialog
        open={Boolean(deleteTarget)}
        resource={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
      />
    </Box>
  );
}
