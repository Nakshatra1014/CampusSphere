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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { LoadingState, EmptyState } from '../../components/common/LoadingState';

export default function EventParticipantsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [formFields, setFormFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [eventData, roster, fields] = await Promise.all([
          eventService.getEventById(id),
          eventService.getEventParticipants(id),
          eventService.getFormFields(id).catch(() => []),
        ]);
        setEvent(eventData);
        setParticipants(roster);
        setFormFields(fields || []);
      } catch (err) {
        showToast(err.message || 'Failed to load participants.', 'error');
        navigate(`/events/${id}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const exportCSV = () => {
    if (!participants.length) return;

    // Collect all field labels
    const customHeaders = formFields.map(f => f.fieldLabel);
    const headers = [
      'Participant Name',
      'Email',
      'Phone',
      'Department',
      'Academic Year',
      'Registered At',
      'Status',
      ...customHeaders
    ];

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      return `"${String(str).replace(/"/g, '""')}"`;
    };

    const headerLine = headers.map(escapeCsv).join(',');

    const rows = participants.map((p) => {
      const respMap = {};
      (p.formResponses || []).forEach(r => {
        respMap[r.fieldId] = r.responseValue;
        respMap[r.fieldLabel] = r.responseValue;
      });

      const baseCols = [
        p.participant?.fullName || '',
        p.participant?.email || '',
        p.participant?.phone || 'N/A',
        p.participant?.department || '',
        p.participant?.academicYear || '',
        p.registeredAt || '',
        p.status || ''
      ];

      const customCols = formFields.map(f => respMap[f.id] || respMap[f.fieldLabel] || '');
      return [...baseCols, ...customCols].map(escapeCsv).join(',');
    });

    const csvContent = [headerLine, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `participants_event_${id}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/events/${id}`)} sx={{ mb: 2 }}>
        Back to Event Details
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
            Participant Roster
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {event?.title ? `Registered attendees for "${event.title}"` : 'Event Attendees'}
          </Typography>
        </Box>
        {participants.length > 0 && (
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={exportCSV}>
            Export CSV
          </Button>
        )}
      </Box>

      {loading ? (
        <LoadingState message="Loading participant roster..." />
      ) : participants.length === 0 ? (
        <EmptyState
          title="No registrations yet"
          message="No participants have registered for this event yet."
        />
      ) : (
        <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Participant Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Department & Year</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Registered Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Custom Answers</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {participants.map((p, index) => (
                  <TableRow key={p.id || index} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{p.participant?.fullName || 'Student'}</TableCell>
                    <TableCell>{p.participant?.email || 'N/A'}</TableCell>
                    <TableCell>{p.participant?.phone || '—'}</TableCell>
                    <TableCell>
                      {p.participant?.department || 'General'}
                      {p.participant?.academicYear ? ` (${p.participant.academicYear})` : ''}
                    </TableCell>
                    <TableCell>{formatDateTime(p.registeredAt)}</TableCell>
                    <TableCell>
                      <Chip label={p.status} size="small" color={p.status === 'REGISTERED' ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell align="center">
                      {p.formResponses && p.formResponses.length > 0 ? (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          onClick={() => setSelectedParticipant(p)}
                        >
                          View ({p.formResponses.length})
                        </Button>
                      ) : (
                        <Typography variant="caption" color="text.secondary">None</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Answers Dialog */}
      <Dialog
        open={Boolean(selectedParticipant)}
        onClose={() => setSelectedParticipant(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Registration Form Responses
          <Typography variant="body2" color="text.secondary">
            {selectedParticipant?.participant?.fullName} ({selectedParticipant?.participant?.email})
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <List disablePadding>
            {selectedParticipant?.formResponses && selectedParticipant.formResponses.length > 0 ? (
              selectedParticipant.formResponses.map((resp, idx) => (
                <React.Fragment key={resp.fieldId || idx}>
                  <ListItem sx={{ py: 1.5, px: 0 }}>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                          {resp.fieldLabel || `Field #${resp.fieldId}`}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ color: '#475569', mt: 0.5, whiteSpace: 'pre-wrap' }}>
                          {resp.responseValue || '—'}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {idx < selectedParticipant.formResponses.length - 1 && <Divider />}
                </React.Fragment>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">No responses submitted.</Typography>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedParticipant(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}