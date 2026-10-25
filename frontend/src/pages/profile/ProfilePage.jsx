import React, { useState, useEffect, useRef } from 'react';
import {
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  LinearProgress,
  Chip,
  Breadcrumbs,
  Link,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Person as PersonIcon,
  Save as SaveIcon,
  PhotoCamera as CameraIcon,
  NavigateNext as NavigateNextIcon,
  School as SchoolIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { DEPARTMENTS, ACADEMIC_YEARS } from '../../utils/constants';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile, uploadProfilePhoto } = useAuth();
  const { showToast } = useNotifications();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '',
    department: 'Computer Science & Engineering',
    academicYear: 'Year 1',
    college: '',
    phone: '',
    bio: '',
    skills: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Photo upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        department: user.department || 'Computer Science & Engineering',
        academicYear: user.academicYear || 'Year 1',
        college: user.college || 'CampusSphere University',
        phone: user.phone || '',
        bio: user.bio || '',
        skills: user.skills || '',
      });
    }
  }, [user]);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      showToast('Image size exceeds 5MB limit. Please choose a smaller photo.', 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate format
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      showToast('Unsupported format. Please select a JPG, PNG, or WebP image.', 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setPhotoDialogOpen(true);
  };

  const handleCancelPhotoDialog = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setPhotoDialogOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUploadPhoto = async () => {
    if (!selectedFile) return;

    try {
      setUploadingPhoto(true);
      setUploadProgress(10);

      await uploadProfilePhoto(selectedFile, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(Math.min(95, percent));
        }
      });

      setUploadProgress(100);
      showToast('Profile photo updated successfully!', 'success');
      handleCancelPhotoDialog();
    } catch (err) {
      showToast(err.message || 'Failed to upload profile photo to Cloudinary.', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSaving(true);
      await updateProfile(formData);
      showToast('Profile details updated successfully!', 'success');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const getRoleLabel = () => {
    if (user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN') return 'Administrator';
    if (user?.role === 'ROLE_FACULTY' || user?.role === 'FACULTY') return 'Faculty Member';
    return 'Student';
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', pb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 2 }}
      >
        <Link
          underline="hover"
          color="inherit"
          href="/dashboard"
          onClick={(e) => {
            e.preventDefault();
            navigate('/dashboard');
          }}
          sx={{ cursor: 'pointer', fontSize: '0.875rem' }}
        >
          Dashboard
        </Link>
        <Typography color="text.primary" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
          My Profile
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
          My Profile
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your personal information, campus affiliation, and avatar photo.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Profile Photo Card */}
      <Card sx={{ mb: 3, p: 3, border: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={user?.profileImageUrl}
                sx={{
                  width: 88,
                  height: 88,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: '3px solid #ffffff',
                }}
              >
                {user?.fullName?.charAt(0) || 'U'}
              </Avatar>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {user?.fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <EmailIcon sx={{ fontSize: 16, mr: 0.7, color: '#64748b' }} />
                {user?.email}
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={getRoleLabel()}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                />
                <Chip
                  label={user?.department || 'Department'}
                  size="small"
                  sx={{ bgcolor: '#f1f5f9', fontWeight: 500, fontSize: '0.75rem' }}
                />
              </Box>
            </Box>
          </Box>

          {/* Photo Actions */}
          <Box>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp,image/jpg"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
            <Button
              variant="outlined"
              startIcon={<CameraIcon />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Change Photo
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.8, textAlign: { sm: 'right', xs: 'left' } }}>
              JPG, PNG, or WebP (max 5MB)
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Edit Profile Details Card */}
      <Card sx={{ p: { xs: 2.5, sm: 3.5 }, border: '1px solid #e2e8f0' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
          Personal & Academic Information
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
          CampusSphere uses these details across events, team finders, internships, and ride sharing.
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.fullName}
                onChange={handleChange('fullName')}
                size="small"
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address"
                value={user?.email || ''}
                size="small"
                disabled
                helperText="Email is bound to your account and cannot be modified."
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="College / University"
                value={formData.college}
                onChange={handleChange('college')}
                size="small"
                placeholder="e.g. CampusSphere Institute of Technology"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
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

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Academic Year</InputLabel>
                <Select
                  value={formData.academicYear}
                  label="Academic Year"
                  onChange={handleChange('academicYear')}
                >
                  {ACADEMIC_YEARS.map((y) => (
                    <MenuItem key={y} value={y}>
                      {y}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Phone"
                value={formData.phone}
                onChange={handleChange('phone')}
                size="small"
                placeholder="+1 (555) 000-0000"
                helperText="Used for ride-sharing & project collaboration coordination."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Skills & Areas of Interest"
                value={formData.skills}
                onChange={handleChange('skills')}
                size="small"
                placeholder="e.g. Java, Spring Boot, React, Python, Machine Learning, UI Design"
                helperText="Separate multiple skills with commas."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Bio & Academic Background"
                value={formData.bio}
                onChange={handleChange('bio')}
                placeholder="Tell peers and faculty about yourself, research projects, or extracurricular passions..."
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={saving}
              sx={{ px: 4, py: 1.2, fontWeight: 600, textTransform: 'none' }}
            >
              {saving ? <CircularProgress size={24} color="inherit" /> : 'Save Profile Details'}
            </Button>
          </Box>
        </Box>
      </Card>

      {/* Photo Preview & Cloudinary Upload Dialog */}
      <Dialog
        open={photoDialogOpen}
        onClose={uploadingPhoto ? undefined : handleCancelPhotoDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Update Profile Photo
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
            {previewUrl && (
              <Avatar
                src={previewUrl}
                sx={{
                  width: 140,
                  height: 140,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  border: '3px solid #3b82f6',
                  mb: 2.5,
                }}
              />
            )}
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {selectedFile?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {(selectedFile?.size / 1024).toFixed(1)} KB • Dedicated Cloudinary storage
            </Typography>

            {uploadingPhoto && (
              <Box sx={{ width: '100%', mt: 2.5 }}>
                <LinearProgress variant="determinate" value={uploadProgress} sx={{ height: 8, borderRadius: 4 }} />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                  Uploading to Cloudinary... {uploadProgress}%
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCancelPhotoDialog} disabled={uploadingPhoto}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUploadPhoto}
            disabled={uploadingPhoto}
            startIcon={uploadingPhoto ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            sx={{ fontWeight: 600, textTransform: 'none' }}
          >
            {uploadingPhoto ? 'Saving...' : 'Confirm & Save Photo'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
