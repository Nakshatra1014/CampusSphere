import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
  Box,
} from '@mui/material';
import { WarningAmber as WarningIcon } from '@mui/icons-material';

export default function DeleteResourceDialog({
  open = false,
  resource = null,
  onClose,
  onConfirm,
  loading = false,
}) {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, p: 1 },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <WarningIcon color="error" />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Delete Resource
        </Typography>
      </DialogTitle>

      <DialogContent>
        <DialogContentText sx={{ color: '#475569', mb: 1.5 }}>
          Are you sure you want to delete this resource?
        </DialogContentText>
        {resource && (
          <Box
            sx={{
              p: 1.5,
              bgcolor: '#fef2f2',
              border: '1px solid #fee2e2',
              borderRadius: 1.5,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#991b1b' }}>
              {resource.title}
            </Typography>
            <Typography variant="caption" sx={{ color: '#b91c1c' }}>
              {resource.subject} • {resource.fileName}
            </Typography>
          </Box>
        )}
        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 1.5 }}>
          This action will permanently remove the file from cloud storage and the database.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{ color: '#64748b', textTransform: 'none' }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={loading}
          startIcon={loading && <CircularProgress size={16} color="inherit" />}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          {loading ? 'Deleting...' : 'Confirm Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
