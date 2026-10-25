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
  UploadFile as UploadIcon,
  TableRows as TableIcon,
  GridView as GridIcon,
  FolderSpecial as MyResourcesIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { resourceService } from '../../services/resourceService';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import ResourceFilters from '../../components/resources/ResourceFilters';
import ResourceCard from '../../components/resources/ResourceCard';
import ResourceTable from '../../components/resources/ResourceTable';
import DeleteResourceDialog from '../../components/resources/DeleteResourceDialog';
import EditResourceDialog from '../../components/resources/EditResourceDialog';
import { LoadingState, EmptyState } from '../../components/common/LoadingState';

export default function ResourceList() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isFaculty, isAdmin } = useAuth();
  const { showToast } = useNotifications();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  // Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Edit Dialog State
  const [editTarget, setEditTarget] = useState(null);
  const [editing, setEditing] = useState(false);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const data = await resourceService.searchResources({
        search: searchQuery.trim() || undefined,
        department: selectedDept === 'All' ? undefined : selectedDept,
        semester: selectedSemester === 'All' ? undefined : Number(selectedSemester),
        resourceType: selectedType === 'All' ? undefined : selectedType,
      });
      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message || 'Failed to fetch academic resources.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [searchQuery, selectedDept, selectedSemester, selectedType]);

  const handleDownload = async (resource) => {
    try {
      await resourceService.downloadResourceFile(resource.id, resource.fileName);
      showToast(`Downloaded ${resource.fileName || 'file'} successfully.`, 'success');
      // Update local download count
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

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDept('All');
    setSelectedSemester('All');
    setSelectedType('All');
  };

  const effectiveView = isMobile ? 'cards' : viewMode;

  return (
    <Box>
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
            Academic Resources & Notes
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Central repository for verified course notes, question papers, syllabus, and lab manuals.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          {(isFaculty || isAdmin) && (
            <>
              <Button
                variant="outlined"
                startIcon={<MyResourcesIcon />}
                onClick={() => navigate('/resources/my')}
                sx={{
                  borderColor: '#cbd5e1',
                  color: '#334155',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': { borderColor: 'primary.main', bgcolor: '#f8fafc' },
                }}
              >
                My Uploads
              </Button>
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
                Upload Resource
              </Button>
            </>
          )}

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

      {/* Filters */}
      <ResourceFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        department={selectedDept}
        onDepartmentChange={setSelectedDept}
        semester={selectedSemester}
        onSemesterChange={setSelectedSemester}
        resourceType={selectedType}
        onResourceTypeChange={setSelectedType}
        onReset={handleResetFilters}
      />

      {/* Main Content Area */}
      {loading ? (
        <LoadingState message="Fetching academic resources..." />
      ) : resources.length === 0 ? (
        <EmptyState
          title="No academic resources found"
          message="No resources matched your current search and filter criteria. Try resetting filters."
          actionLabel={isFaculty || isAdmin ? 'Upload New Resource' : 'Reset Filters'}
          onAction={isFaculty || isAdmin ? () => navigate('/resources/upload') : handleResetFilters}
        />
      ) : effectiveView === 'table' ? (
        <ResourceTable
          resources={resources}
          onDownload={handleDownload}
          onEdit={(res) => setEditTarget(res)}
          onDelete={(res) => setDeleteTarget(res)}
          canEdit={isFaculty || isAdmin}
          canDelete={isAdmin}
        />
      ) : (
        <Grid container spacing={2.5}>
          {resources.map((res) => {
            const canManageThis = isAdmin || (isFaculty && res.uploadedBy?.id === user?.id);
            return (
              <Grid item xs={12} sm={6} md={4} key={res.id}>
                <ResourceCard
                  resource={res}
                  onDownload={handleDownload}
                  onEdit={(r) => setEditTarget(r)}
                  onDelete={(r) => setDeleteTarget(r)}
                  canEdit={canManageThis}
                  canDelete={canManageThis}
                />
              </Grid>
            );
          })}
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
