import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as ViewIcon,
  DeleteOutline as DeleteIcon,
  InsertDriveFile as FileIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Edit as EditIcon,
  OpenInNew as OpenIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatDate, formatFileSize } from '../../utils/formatters';

export default function ResourceCard({
  resource,
  onDownload,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false,
}) {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);

  const handleDownloadClick = async (e) => {
    e.stopPropagation();
    if (downloading) return;
    try {
      setDownloading(true);
      await onDownload(resource);
    } finally {
      setDownloading(false);
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(resource);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(resource);
    }
  };

  const handleDetailsClick = () => {
    navigate(`/resources/${resource.id}`);
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        bgcolor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 2,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: '0 4px 12px rgba(30, 58, 138, 0.08)',
        },
      }}
    >
      <CardContent sx={{ p: 2.5, pb: 1.5, flexGrow: 1 }}>
        {/* Top Badges */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, gap: 1 }}>
          <Chip
            label={`Semester ${resource.semester}`}
            size="small"
            sx={{
              bgcolor: '#eff6ff',
              color: '#1e40af',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
          <Chip
            label={resource.resourceType}
            size="small"
            variant="outlined"
            sx={{
              borderColor: '#cbd5e1',
              color: '#475569',
              fontWeight: 500,
              fontSize: '0.75rem',
            }}
          />
        </Box>

        {/* Subject */}
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: 'primary.main',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            display: 'block',
            mb: 0.5,
          }}
        >
          {resource.subject}
        </Typography>

        {/* Title */}
        <Typography
          variant="h6"
          onClick={handleDetailsClick}
          sx={{
            fontWeight: 700,
            fontSize: '1.05rem',
            lineHeight: 1.35,
            color: '#0f172a',
            mb: 1,
            cursor: 'pointer',
            '&:hover': { color: 'primary.main' },
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {resource.title}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            color: '#64748b',
            mb: 2,
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '40px',
          }}
        >
          {resource.description || 'No additional summary provided for this resource.'}
        </Typography>

        {/* Metadata info panel */}
        <Box
          sx={{
            bgcolor: '#f8fafc',
            border: '1px solid #f1f5f9',
            borderRadius: 1.5,
            p: 1.25,
            mb: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <PersonIcon sx={{ fontSize: 16, color: '#64748b' }} />
            <Typography variant="caption" sx={{ color: '#334155' }}>
              Uploaded by: <strong>{resource.uploadedBy?.fullName || 'Faculty'}</strong>
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <FileIcon sx={{ fontSize: 15, color: '#64748b' }} />
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                {resource.fileName || 'Document'} ({formatFileSize(resource.fileSize)})
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#1e40af', fontWeight: 600 }}>
              📥 {resource.downloadCount || 0} downloads
            </Typography>
          </Box>
        </Box>

        {/* Tags */}
        {resource.tags && (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
            {resource.tags.split(',').slice(0, 3).map((tag, idx) => (
              <Chip
                key={idx}
                label={`#${tag.trim()}`}
                size="small"
                sx={{
                  fontSize: '0.68rem',
                  height: 20,
                  bgcolor: '#f1f5f9',
                  color: '#475569',
                }}
              />
            ))}
          </Box>
        )}
      </CardContent>

      {/* Action Footer */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          borderTop: '1px solid #f1f5f9',
          bgcolor: '#ffffff',
          display: 'flex',
          gap: 1,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={downloading ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
            onClick={handleDownloadClick}
            disabled={downloading}
            sx={{
              bgcolor: 'primary.main',
              fontWeight: 600,
              textTransform: 'none',
              px: 2,
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            {downloading ? 'Downloading...' : 'Download'}
          </Button>

          <Button
            variant="outlined"
            size="small"
            startIcon={<ViewIcon />}
            onClick={handleDetailsClick}
            sx={{
              borderColor: '#cbd5e1',
              color: '#334155',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': { borderColor: 'primary.main', bgcolor: '#f8fafc' },
            }}
          >
            Details
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          {resource.fileUrl && (
            <Tooltip title="Preview / Open File">
              <IconButton
                size="small"
                component="a"
                href={resource.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                sx={{ color: '#64748b', '&:hover': { color: 'primary.main' } }}
              >
                <OpenIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {canEdit && (
            <Tooltip title="Edit Resource Details">
              <IconButton size="small" color="primary" onClick={handleEditClick}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {canDelete && (
            <Tooltip title="Delete Resource">
              <IconButton size="small" color="error" onClick={handleDeleteClick}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Card>
  );
}
