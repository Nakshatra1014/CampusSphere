import React, { useState } from 'react';
import {
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  UploadFile as UploadIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { resourceService } from '../../services/resourceService';
import { useNotifications } from '../../context/NotificationContext';
import ResourceUploadForm from '../../components/resources/ResourceUploadForm';

export default function UploadResource() {
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUploadSubmit = async (formData) => {
    try {
      setError('');
      setLoading(true);
      await resourceService.uploadResource(formData);
      showToast('Resource uploaded successfully.', 'success');
      navigate('/resources/my');
    } catch (err) {
      setError(err.message || 'Failed to upload resource. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 840, mx: 'auto', pb: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/resources')}
        sx={{ mb: 2, color: '#64748b', textTransform: 'none', fontWeight: 600 }}
      >
        Back to Resources
      </Button>

      <Card
        sx={{
          bgcolor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 2.5,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 1.5,
                bgcolor: '#eff6ff',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UploadIcon fontSize="medium" />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Upload Academic Resource
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Publish lecture notes, question papers, syllabus, or lab manuals to Cloudinary.
              </Typography>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ my: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mt: 3 }}>
            <ResourceUploadForm
              onSubmit={handleUploadSubmit}
              loading={loading}
              onCancel={() => navigate('/resources')}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
