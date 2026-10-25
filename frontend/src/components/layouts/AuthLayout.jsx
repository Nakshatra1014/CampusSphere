import React from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';
import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        py: 6,
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        {/* Brand Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: 'primary.main',
              color: '#ffffff',
              mb: 1.5,
              boxShadow: '0 4px 6px -1px rgba(25, 118, 210, 0.2)',
            }}
          >
            <SchoolIcon fontSize="medium" />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.dark', letterSpacing: '-0.02em' }}>
            CampusSphere
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Smart College Campus Management Platform
          </Typography>
        </Box>

        {/* Form Container */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            bgcolor: '#ffffff',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
          }}
        >
          <Outlet />
        </Paper>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Official University Campus Management Portal &copy; 2026. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
