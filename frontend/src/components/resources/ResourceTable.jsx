import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as ViewIcon,
  DeleteOutline as DeleteIcon,
  InsertDriveFile as FileIcon,
  Edit as EditIcon,
  OpenInNew as OpenIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatDate, formatFileSize } from '../../utils/formatters';

export default function ResourceTable({
  resources = [],
  onDownload,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false,
}) {
  const navigate = useNavigate();
  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownload = async (resource) => {
    if (downloadingId) return;
    try {
      setDownloadingId(resource.id);
      await onDownload(resource);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: '1px solid #e2e8f0',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: '#ffffff',
      }}
    >
      <Table sx={{ minWidth: 750 }}>
        <TableHead sx={{ bgcolor: '#f8fafc' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, color: '#334155', py: 1.8 }}>Resource / Subject</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Department & Sem</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Type</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Uploaded By</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#334155' }}>File Info</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700, color: '#334155' }}>Downloads</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, color: '#334155' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {resources.map((res) => {
            const isDownloading = downloadingId === res.id;
            return (
              <TableRow
                key={res.id}
                hover
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  transition: 'background-color 0.15s ease',
                }}
              >
                {/* Title & Subject */}
                <TableCell sx={{ maxWidth: 260 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: 'primary.main',
                      textTransform: 'uppercase',
                      display: 'block',
                      mb: 0.25,
                    }}
                  >
                    {res.subject}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    onClick={() => navigate(`/resources/${res.id}`)}
                    sx={{
                      fontWeight: 600,
                      color: '#0f172a',
                      cursor: 'pointer',
                      '&:hover': { color: 'primary.main' },
                      lineHeight: 1.3,
                    }}
                  >
                    {res.title}
                  </Typography>
                  {res.tags && (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                      {res.tags.split(',').slice(0, 2).map((t, idx) => (
                        <Chip
                          key={idx}
                          label={`#${t.trim()}`}
                          size="small"
                          sx={{ fontSize: '0.65rem', height: 18, bgcolor: '#f1f5f9' }}
                        />
                      ))}
                    </Box>
                  )}
                </TableCell>

                {/* Department & Sem */}
                <TableCell sx={{ maxWidth: 180 }}>
                  <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500 }}>
                    {res.department}
                  </Typography>
                  <Chip
                    label={`Sem ${res.semester}`}
                    size="small"
                    sx={{
                      mt: 0.5,
                      bgcolor: '#eff6ff',
                      color: '#1e40af',
                      fontWeight: 600,
                      fontSize: '0.72rem',
                    }}
                  />
                </TableCell>

                {/* Type */}
                <TableCell>
                  <Chip
                    label={res.resourceType}
                    size="small"
                    variant="outlined"
                    sx={{ borderColor: '#cbd5e1', color: '#475569', fontWeight: 500 }}
                  />
                </TableCell>

                {/* Uploaded By */}
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                    {res.uploadedBy?.fullName || 'Faculty'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    {formatDate(res.createdAt)}
                  </Typography>
                </TableCell>

                {/* File Info */}
                <TableCell sx={{ maxWidth: 170 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <FileIcon sx={{ fontSize: 18, color: '#64748b' }} />
                    <Box sx={{ overflow: 'hidden' }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          color: '#334155',
                          display: 'block',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {res.fileName || 'Resource'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {formatFileSize(res.fileSize)}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                {/* Downloads */}
                <TableCell align="center">
                  <Chip
                    label={`${res.downloadCount || 0}`}
                    size="small"
                    sx={{
                      bgcolor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      fontWeight: 700,
                      color: '#1e40af',
                    }}
                  />
                </TableCell>

                {/* Actions */}
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, alignItems: 'center' }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={isDownloading ? <CircularProgress size={14} color="inherit" /> : <DownloadIcon />}
                      onClick={() => handleDownload(res)}
                      disabled={isDownloading}
                      sx={{
                        bgcolor: 'primary.main',
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        '&:hover': { bgcolor: 'primary.dark' },
                      }}
                    >
                      {isDownloading ? 'Downloading...' : 'Download'}
                    </Button>

                    {res.fileUrl && (
                      <Tooltip title="Preview / Open File">
                        <IconButton
                          size="small"
                          component="a"
                          href={res.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ color: '#64748b', '&:hover': { color: 'primary.main' } }}
                        >
                          <OpenIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/resources/${res.id}`)}
                        sx={{ color: '#64748b', '&:hover': { color: 'primary.main' } }}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {canEdit && (
                      <Tooltip title="Edit Resource Details">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => onEdit && onEdit(res)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    {canDelete && (
                      <Tooltip title="Delete Resource">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDelete && onDelete(res)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
