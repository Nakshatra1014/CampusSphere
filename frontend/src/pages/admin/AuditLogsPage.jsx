import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/aiService';
import { useNotifications } from '../../context/NotificationContext';
import { formatDateTime } from '../../utils/formatters';
import { LoadingState, EmptyState } from '../../components/common/LoadingState';

export default function AuditLogsPage() {
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAuditLogs();
      setLogs(data);
    } catch (err) {
      showToast(err.message || 'Failed to load audit logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  if (loading) return <LoadingState message="Loading administrative audit trail..." />;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard')} sx={{ mb: 2.5 }}>
        Back to Dashboard
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
            Security & System Audit Trail
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Chronological record of administrative approvals, registrations, role changes, and moderation actions.
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadLogs}>
          Refresh Trail
        </Button>
      </Box>

      {logs.length === 0 ? (
        <EmptyState title="No audit logs recorded yet" message="Administrative actions will appear here." />
      ) : (
        <Card>
          <TableContainer component={Paper} elevation={0}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Actor</TableCell>
                  <TableCell>Target Entity</TableCell>
                  <TableCell>Details / Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                      {formatDateTime(log.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Chip label={log.action} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.72rem' }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {log.actor?.fullName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {log.actor?.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {log.entityType} #{log.entityId}
                    </TableCell>
                    <TableCell sx={{ color: '#334155' }}>{log.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
}
