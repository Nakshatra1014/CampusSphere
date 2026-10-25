import React from 'react';
import { Chip } from '@mui/material';

const statusConfig = {
  // Event & General Statuses
  APPROVED: { label: 'Approved', color: 'success', bg: '#edf7ed', text: '#2e7d32' },
  PENDING: { label: 'Pending Review', color: 'info', bg: '#e3f2fd', text: '#1976d2' },
  REJECTED: { label: 'Rejected', color: 'error', bg: '#fdeded', text: '#d32f2f' },
  CANCELLED: { label: 'Cancelled', color: 'default', bg: '#f1f5f9', text: '#64748b' },
  COMPLETED: { label: 'Completed', color: 'success', bg: '#edf7ed', text: '#2e7d32' },
  REGISTERED: { label: 'Registered', color: 'success', bg: '#edf7ed', text: '#2e7d32' },

  // Activity Statuses
  ACTIVE: { label: 'Active', color: 'success', bg: '#edf7ed', text: '#2e7d32' },
  FULL: { label: 'Full', color: 'warning', bg: '#fff4e5', text: '#ed6c02' },
  CLOSED: { label: 'Closed', color: 'default', bg: '#f1f5f9', text: '#64748b' },
  RECRUITING: { label: 'Recruiting', color: 'primary', bg: '#e3f2fd', text: '#1976d2' },
  AVAILABLE: { label: 'Available', color: 'success', bg: '#edf7ed', text: '#2e7d32' },
  SOLD: { label: 'Sold', color: 'default', bg: '#f1f5f9', text: '#64748b' },
  CLAIMED: { label: 'Claimed', color: 'warning', bg: '#fff4e5', text: '#ed6c02' },
  RESOLVED: { label: 'Resolved', color: 'success', bg: '#edf7ed', text: '#2e7d32' },
  LOST: { label: 'Lost Item', color: 'error', bg: '#fdeded', text: '#d32f2f' },
  FOUND: { label: 'Found Item', color: 'info', bg: '#e1f5fe', text: '#0288d1' },
  CONFIRMED: { label: 'Confirmed', color: 'success', bg: '#edf7ed', text: '#2e7d32' },
  ACCEPTED: { label: 'Accepted', color: 'success', bg: '#edf7ed', text: '#2e7d32' },
  APPLIED: { label: 'Applied', color: 'info', bg: '#e3f2fd', text: '#1976d2' },
};

export default function StatusChip({ status, size = 'small' }) {
  if (!status) return null;
  const config = statusConfig[status] || {
    label: status,
    color: 'default',
    bg: '#f1f5f9',
    text: '#475569',
  };

  return (
    <Chip
      label={config.label}
      size={size}
      sx={{
        backgroundColor: config.bg,
        color: config.text,
        fontWeight: 600,
        fontSize: size === 'small' ? '0.75rem' : '0.8125rem',
        border: '1px solid rgba(0,0,0,0.06)',
      }}
    />
  );
}
