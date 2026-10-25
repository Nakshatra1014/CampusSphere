import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export function LoadingState({ message = 'Loading campus data...' }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        width: '100%',
      }}
    >
      <CircularProgress size={36} sx={{ mb: 2, color: 'primary.main' }} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}

export function EmptyState({ title = 'No records found', message = 'Try adjusting your search or filters.', action }) {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 6,
        px: 2,
        bgcolor: '#ffffff',
        borderRadius: 2,
        border: '1px dashed #cbd5e1',
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: action ? 2 : 0 }}>
        {message}
      </Typography>
      {action && <Box sx={{ mt: 2 }}>{action}</Box>}
    </Box>
  );
}
