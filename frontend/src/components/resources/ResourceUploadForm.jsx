import React, { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  IconButton,
} from '@mui/material';
import {
  UploadFile as UploadIcon,
  AttachFile as AttachFileIcon,
  Close as ClearIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';
import { DEPARTMENTS, RESOURCE_TYPES } from '../../utils/constants';
import { formatFileSize } from '../../utils/formatters';

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'jpg', 'jpeg', 'png'];
const FORBIDDEN_EXTENSIONS = ['exe', 'bat', 'sh', 'msi', 'cmd', 'ps1', 'vbs', 'dll', 'jar', 'bin', 'js', 'py'];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function ResourceUploadForm({ onSubmit, loading = false, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    department: 'Computer Science & Engineering',
    semester: 5,
    resourceType: 'Lecture Notes',
    tags: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [formError, setFormError] = useState('');

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (formError) setFormError('');
  };

  const handleFileSelection = (file) => {
    if (!file) return;

    // Check extension
    const extension = file.name.includes('.') ? file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase() : '';
    if (FORBIDDEN_EXTENSIONS.includes(extension) || !ALLOWED_EXTENSIONS.includes(extension)) {
      setFileError('File type is not supported. Please select PDF, Word, PowerPoint, Excel, TXT, or Image files.');
      setSelectedFile(null);
      return;
    }

    // Check size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError(`File size exceeds the allowed limit (${MAX_FILE_SIZE_MB} MB).`);
      setSelectedFile(null);
      return;
    }

    setFileError('');
    setSelectedFile(file);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setFormError('Title is required.');
      return;
    }
    if (!formData.subject.trim()) {
      setFormError('Subject is required.');
      return;
    }
    if (!formData.department) {
      setFormError('Department is required.');
      return;
    }
    if (!formData.semester) {
      setFormError('Semester is required.');
      return;
    }
    if (!formData.resourceType) {
      setFormError('Resource Type is required.');
      return;
    }
    if (!selectedFile) {
      setFormError('Please select a file to upload.');
      return;
    }

    setFormError('');

    const uploadPayload = new FormData();
    uploadPayload.append('file', selectedFile);
    uploadPayload.append('title', formData.title.trim());
    uploadPayload.append('description', formData.description ? formData.description.trim() : '');
    uploadPayload.append('subject', formData.subject.trim());
    uploadPayload.append('department', formData.department);
    uploadPayload.append('semester', Number(formData.semester));
    uploadPayload.append('resourceType', formData.resourceType);
    if (formData.tags) {
      uploadPayload.append('tags', formData.tags.trim());
    }

    onSubmit(uploadPayload);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {formError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {formError}
        </Alert>
      )}

      {fileError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {fileError}
        </Alert>
      )}

      <Grid container spacing={2.5}>
        {/* Title */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Resource Title"
            value={formData.title}
            onChange={handleChange('title')}
            placeholder="e.g. Data Structures Unit 1 Notes"
            required
            size="small"
          />
        </Grid>

        {/* Subject */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Subject"
            value={formData.subject}
            onChange={handleChange('subject')}
            placeholder="e.g. Data Structures"
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
            placeholder="e.g. DSA, Trees, Graphs"
            size="small"
          />
        </Grid>

        {/* File Upload Drop Area */}
        <Grid item xs={12}>
          <Paper
            variant="outlined"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            sx={{
              p: 3,
              textAlign: 'center',
              borderStyle: 'dashed',
              borderWidth: 2,
              borderColor: selectedFile ? 'primary.main' : '#cbd5e1',
              bgcolor: selectedFile ? '#f0fdf4' : '#f8fafc',
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: '#f1f5f9',
              },
            }}
          >
            <input
              type="file"
              id="resource-upload-input"
              style={{ display: 'none' }}
              onChange={handleFileInputChange}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
            />
            <label htmlFor="resource-upload-input" style={{ cursor: 'pointer', width: '100%', display: 'block' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <UploadIcon sx={{ fontSize: 40, color: selectedFile ? 'success.main' : 'primary.main' }} />

                {selectedFile ? (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                      File selected: {selectedFile.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      File size: {formatFileSize(selectedFile.size)}
                    </Typography>
                    <Button
                      size="small"
                      variant="text"
                      color="primary"
                      sx={{ mt: 1, textTransform: 'none' }}
                      component="span"
                    >
                      Change File
                    </Button>
                  </Box>
                ) : (
                  <>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0f172a' }}>
                      Click to browse or drag and drop your file here
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      Supported formats: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, PNG, JPG (Max: {MAX_FILE_SIZE_MB} MB)
                    </Typography>
                  </>
                )}
              </Box>
            </label>
          </Paper>
        </Grid>

        {/* Description */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            value={formData.description}
            onChange={handleChange('description')}
            placeholder="Complete notes for Unit 1..."
          />
        </Grid>
      </Grid>

      {/* Form Action Buttons */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        {onCancel && (
          <Button onClick={onCancel} disabled={loading} sx={{ textTransform: 'none', color: '#64748b' }}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <UploadIcon />}
          sx={{
            px: 4,
            py: 1,
            fontWeight: 600,
            textTransform: 'none',
            bgcolor: 'primary.main',
            '&:hover': { bgcolor: 'primary.dark' },
          }}
        >
          {loading ? 'Uploading...' : 'Upload Resource'}
        </Button>
      </Box>
    </Box>
  );
}
