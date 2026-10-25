import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Paper,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  InsertDriveFile as FileIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  CalendarToday as DateIcon,
  DeleteOutline as DeleteIcon,
  FolderZip as FolderIcon,
  Edit as EditIcon,
  Visibility as PreviewIcon,
  CloudDone as CloudIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { resourceService } from '../../services/resourceService';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate, formatDateTime, formatFileSize } from '../../utils/formatters';
import DeleteResourceDialog from '../../components/resources/DeleteResourceDialog';
import EditResourceDialog from '../../components/resources/EditResourceDialog';
import { LoadingState } from '../../components/common/LoadingState';

export default function ResourceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isFaculty, isAdmin } = useAuth();
  const { showToast } = useNotifications();

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Delete State
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit State
  const [editOpen, setEditOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchResourceDetails = async () => {
    try {
      setLoading(true);
      const data = await resourceService.getResourceById(id);
      setResource(data);
    } catch (err) {
      showToast(err.message || 'Resource not found.', 'error');
      navigate('/resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResourceDetails();
  }, [id]);

  const handleDownload = async () => {
    if (!resource || downloading) return;
    try {
      setDownloading(true);
      await resourceService.downloadResourceFile(resource.id, resource.fileName);
      showToast(`Downloaded ${resource.fileName || 'file'} successfully.`, 'success');
      // Increment local count
      setResource((prev) => ({ ...prev, downloadCount: (prev.downloadCount || 0) + 1 }));
    } catch (err) {
      showToast(err.message || 'Failed to download file.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await resourceService.deleteResource(resource.id);
      showToast('Resource deleted successfully.', 'success');
      navigate('/resources');
    } catch (err) {
      showToast(err.message || 'Failed to delete resource.', 'error');
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  const handleEditSave = async (updatedData) => {
    try {
      setUpdating(true);
      const updated = await resourceService.updateResource(resource.id, updatedData);
      setResource(updated);
      showToast('Resource metadata updated successfully. Cloudinary file preserved.', 'success');
      setEditOpen(false);
    } catch (err) {
      showToast(err.message || 'Failed to update resource.', 'error');
    } finally {
      setUpdating(false);
    }
  };


  if (loading) {
    return <LoadingState message="Loading resource details..." />;
  }

  if (!resource) {
    return null;
  }

  const canDelete = isAdmin || (isFaculty && resource.uploadedBy?.id === user?.id);
  const canEdit = isAdmin || (isFaculty && resource.uploadedBy?.id === user?.id);

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', pb: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/resources')}
        sx={{ mb: 2.5, color: '#64748b', textTransform: 'none', fontWeight: 600 }}
      >
        Back to Resources
      </Button>

      {/* Main Card */}
      <Card
        sx={{
          bgcolor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 2.5,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          overflow: 'hidden',
        }}
      >
        {/* Top Banner / Subject Header */}
        <Box
          sx={{
            p: 3,
            bgcolor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
              <Chip
                label={`Semester ${resource.semester}`}
                size="small"
                sx={{
                  bgcolor: '#eff6ff',
                  color: '#1e40af',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                }}
              />
              <Chip
                label={resource.resourceType}
                size="small"
                variant="outlined"
                sx={{ borderColor: '#cbd5e1', color: '#334155', fontWeight: 600 }}
              />
              <Chip
                label={resource.department}
                size="small"
                sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 500 }}
              />
            </Box>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'block',
              }}
            >
              {resource.subject}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
              {resource.title}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            {canEdit && (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<EditIcon />}
                onClick={() => setEditOpen(true)}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Edit Resource
              </Button>
            )}

            {canDelete && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteOpen(true)}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Delete
              </Button>
            )}
          </Box>
        </Box>

        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Grid container spacing={3.5}>
            {/* Left Col: Overview & Description */}
            <Grid item xs={12} md={7}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
                Resource Overview & Topics
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#334155',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-line',
                  mb: 3,
                }}
              >
                {resource.description || 'No detailed overview provided for this academic resource.'}
              </Typography>

              {/* Tags */}
              {resource.tags && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#64748b', mb: 1 }}>
                    Topic Tags
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {resource.tags.split(',').map((tag, idx) => (
                      <Chip
                        key={idx}
                        label={`#${tag.trim()}`}
                        size="small"
                        sx={{ bgcolor: '#f1f5f9', color: '#334155', fontWeight: 500 }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Uploader info card */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: '#f8fafc',
                  borderColor: '#e2e8f0',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    bgcolor: '#eff6ff',
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PersonIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    {resource.uploadedBy?.fullName || 'Faculty Member'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                    {resource.uploadedBy?.department || resource.department} • {resource.uploadedBy?.email}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Right Col: File Details & Download Box */}
            <Grid item xs={12} md={5}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  bgcolor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 2,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', mb: 2 }}>
                  Document File
                </Typography>

                <Box
                  sx={{
                    p: 2,
                    bgcolor: '#f8fafc',
                    borderRadius: 1.5,
                    border: '1px solid #f1f5f9',
                    mb: 2.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <FileIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                    <Box sx={{ overflow: 'hidden' }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          color: '#0f172a',
                          wordBreak: 'break-all',
                        }}
                      >
                        {resource.fileName || 'Document File'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {formatFileSize(resource.fileSize)}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      Downloads
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      📥 {resource.downloadCount || 0} times
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      Published Date
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#334155', fontWeight: 600 }}>
                      {formatDate(resource.createdAt)}
                    </Typography>
                  </Box>
                </Box>

                {/* Primary Download Action Button */}
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={downloading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                  onClick={handleDownload}
                  disabled={downloading}
                  sx={{
                    py: 1.5,
                    bgcolor: 'primary.main',
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '1rem',
                    boxShadow: '0 4px 12px rgba(30, 58, 138, 0.15)',
                    '&:hover': { bgcolor: 'primary.dark' },
                  }}
                >
                  {downloading ? 'Downloading File...' : 'Download Resource'}
                </Button>

                {/* Direct Cloudinary Preview Button */}
                {resource.fileUrl && (
                  <Button
                    variant="outlined"
                    fullWidth
                    size="medium"
                    startIcon={<PreviewIcon />}
                    component="a"
                    href={resource.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      mt: 1.5,
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: '#cbd5e1',
                      color: '#1e293b',
                      '&:hover': { borderColor: 'primary.main', bgcolor: '#f8fafc' },
                    }}
                  >
                    Preview / View File
                  </Button>
                )}

                <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: '#94a3b8', mt: 1 }}>
                  Original file format preserved in Cloudinary storage (.pdf, .docx, etc.)
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <EditResourceDialog
        open={editOpen}
        resource={resource}
        onClose={() => setEditOpen(false)}
        onSave={handleEditSave}
        loading={updating}
      />

      {/* Delete Dialog */}
      <DeleteResourceDialog
        open={deleteOpen}
        resource={resource}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
      />
    </Box>
  );
}
