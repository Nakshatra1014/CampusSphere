import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  InsertDriveFile as FileIcon,
  CloudDone as CloudIcon,
  Edit as EditIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { DEPARTMENTS, RESOURCE_TYPES } from '../../utils/constants';
import { formatFileSize } from '../../utils/formatters';

export default function EditResourceDialog({
  open,
  resource,
  onClose,
  onSave,
  loading = false,
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    department: 'Computer Science & Engineering',
    semester: 5,
    resourceType: 'Lecture Notes',
    tags: '',
  });

  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (resource) {
      setFormData({
        title: resource.title || '',
        description: resource.description || '',
        subject: resource.subject || '',
        department: resource.department || 'Computer Science & Engineering',
        semester: resource.semester || 1,
        resourceType: resource.resourceType || 'Lecture Notes',
        tags: resource.tags || '',
      });
      setFormError('');
    }
  }, [resource, open]);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (formError) setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError('Resource title is required.');
      return;
    }
    if (!formData.subject.trim()) {
      setFormError('Subject is required.');
      return;
    }

    // Submit only the metadata fields that are being updated.
    // Preserves existing Cloudinary file URL, public ID, fileName, and fileSize.
    onSave({
      title: formData.title.trim(),
      description: formData.description.trim(),
      subject: formData.subject.trim(),
      department: formData.department,
      semester: Number(formData.semester),
      resourceType: formData.resourceType,
      tags: formData.tags.trim(),
    });
  };

  if (!resource) return null;

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <EditIcon color="primary" />
        Edit Academic Resource
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogContent dividers>
          {formError && (
            <Alert severity="error" sx={{ mb: 2.5 }}>
              {formError}
            </Alert>
          )}

          {/* Persisted Cloudinary File Banner */}
          <Box
            sx={{
              p: 2,
              mb: 3,
              bgcolor: '#f0fdf4',
              borderRadius: 2,
              border: '1px solid #bbf7d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <FileIcon sx={{ color: '#16a34a', fontSize: 28 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#14532d' }}>
                  {resource.fileName || 'Attached Academic File'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#15803d', display: 'block' }}>
                  {formatFileSize(resource.fileSize)} • Storage: Persisted in Cloudinary
                </Typography>
              </Box>
            </Box>
            <Chip
              icon={<CloudIcon sx={{ fontSize: 16 }} />}
              label="File Preserved (Cloudinary)"
              size="small"
              sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 600, fontSize: '0.75rem' }}
            />
          </Box>

          <Grid container spacing={2}>
            {/* Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Resource Title"
                value={formData.title}
                onChange={handleChange('title')}
                placeholder="e.g. Operating Systems Architecture"
                required
                size="small"
                helperText="Updating the title will preserve your uploaded file and Cloudinary link."
              />
            </Grid>

            {/* Subject */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Subject"
                value={formData.subject}
                onChange={handleChange('subject')}
                placeholder="e.g. Operating Systems"
                required
                size="small"
              />
            </Grid>

            {/* Resource Type */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Resource Type</InputLabel>
                <Select
                  value={formData.resourceType}
                  label="Resource Type"
                  onChange={handleChange('resourceType')}
                >
                  {RESOURCE_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Department */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.department}
                  label="Department"
                  onChange={handleChange('department')}
                >
                  {DEPARTMENTS.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Semester */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Semester</InputLabel>
                <Select
                  value={formData.semester}
                  label="Semester"
                  onChange={handleChange('semester')}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <MenuItem key={sem} value={sem}>
                      Semester {sem}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Tags */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tags (comma-separated)"
                value={formData.tags}
                onChange={handleChange('tags')}
                placeholder="e.g. OS, Memory, Scheduling"
                size="small"
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description & Summary"
                value={formData.description}
                onChange={handleChange('description')}
                placeholder="Overview of the topics and notes included in this document..."
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={loading} sx={{ textTransform: 'none', color: '#64748b' }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <CheckIcon />}
            sx={{
              px: 3,
              fontWeight: 600,
              textTransform: 'none',
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
