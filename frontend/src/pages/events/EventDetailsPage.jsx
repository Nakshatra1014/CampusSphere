import React, { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  FormLabel,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  CalendarToday as DateIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  DynamicForm as FormIcon,
  FormatListBulleted as ListIcon,
} from '@mui/icons-material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate, formatDateTime, formatIndianDateTime } from '../../utils/formatters';
import StatusChip from '../../components/common/StatusChip';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { LoadingState } from '../../components/common/LoadingState';

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const { showToast } = useNotifications();

  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [formFields, setFormFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Dynamic Registration Form Modal
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [formAnswers, setFormAnswers] = useState({});
  const [formErrors, setFormErrors] = useState({});

  // Dialog states
  const [cancelRegDialog, setCancelRegDialog] = useState(false);
  const [cancelEventDialog, setCancelEventDialog] = useState(false);

  const loadEventDetails = async () => {
    try {
      setLoading(true);
      const [data, fields] = await Promise.all([
        eventService.getEventById(id),
        eventService.getEventFormFields(id).catch(() => []),
      ]);
      setEvent(data);
      setFormFields(fields);

      // If user is organizer or admin, fetch participant roster
      if (user && (data.organizer?.id === user.id || isAdmin)) {
        try {
          const roster = await eventService.getEventParticipants(id);
          setParticipants(roster);
        } catch (e) {
          console.error('Participant roster access note:', e.message);
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to load event details.', 'error');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEventDetails();
  }, [id, user]);

  // Handle ?register=true in URL
  useEffect(() => {
    if (!loading && event && location.search.includes('register=true')) {
      handleOpenRegister();
    }
  }, [loading, event, location.search]);

  const handleOpenRegister = () => {
    // Reset answers and errors
    const initialAnswers = {};
    formFields.forEach((f) => {
      initialAnswers[f.id] = f.fieldType === 'CHECKBOX' ? [] : '';
    });
    setFormAnswers(initialAnswers);
    setFormErrors({});
    setFormDialogOpen(true);
  };

  const handleFieldChange = (fieldId, val) => {
    setFormAnswers((prev) => ({ ...prev, [fieldId]: val }));
    if (formErrors[fieldId]) {
      setFormErrors((prev) => {
        const copy = { ...prev };
        delete copy[fieldId];
        return copy;
      });
    }
  };

  const handleCheckboxToggle = (fieldId, opt) => {
    setFormAnswers((prev) => {
      const current = prev[fieldId] || [];
      const updated = current.includes(opt)
        ? current.filter((x) => x !== opt)
        : [...current, opt];
      return { ...prev, [fieldId]: updated };
    });
  };

  const handleRegisterSubmit = async () => {
    // Validate required fields
    const errors = {};
    formFields.forEach((f) => {
      if (f.required) {
        const val = formAnswers[f.id];
        if (
          val === undefined ||
          val === null ||
          (typeof val === 'string' && !val.trim()) ||
          (Array.isArray(val) && val.length === 0)
        ) {
          errors[f.id] = `"${f.fieldLabel}" is required.`;
        }
      }
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast('Please answer all required questions.', 'warning');
      return;
    }

    try {
      setActionLoading(true);
      // Format answers for backend (convert checkbox arrays to comma strings)
      const formattedResponses = {};
      Object.keys(formAnswers).forEach((k) => {
        const val = formAnswers[k];
        if (Array.isArray(val)) {
          formattedResponses[k] = val.join(', ');
        } else if (val !== undefined && val !== null) {
          formattedResponses[k] = String(val).trim();
        }
      });

      await eventService.registerForEvent(id, { responses: formattedResponses });
      showToast('Successfully registered using your CampusSphere profile!', 'success');
      setFormDialogOpen(false);
      loadEventDetails();
    } catch (err) {
      showToast(err.message || 'Registration failed.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRegistration = async () => {
    try {
      setActionLoading(true);
      await eventService.cancelRegistration(id);
      showToast('Registration cancelled.', 'info');
      setCancelRegDialog(false);
      loadEventDetails();
    } catch (err) {
      showToast(err.message || 'Failed to cancel registration.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelEvent = async () => {
    try {
      setActionLoading(true);
      await eventService.cancelEvent(id);
      showToast('Event has been cancelled. All participants have been notified.', 'warning');
      setCancelEventDialog(false);
      loadEventDetails();
    } catch (err) {
      showToast(err.message || 'Failed to cancel event.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !event) return <LoadingState message="Loading event details..." />;

  const isOrganizer = user && event.organizer?.id === user.id;
  const isRegistered = event.isUserRegistered || event.userRegistered;
  const isApproved = event.status === 'APPROVED';
  const isCancelled = event.status === 'CANCELLED';
  const isCompleted = event.status === 'COMPLETED';

  const now = new Date();
  const deadlinePassed = event.isDeadlinePassed || (event.registrationDeadline && new Date(event.registrationDeadline) <= now);
  const eventStarted = event.isStarted || (event.eventDate && event.startTime && new Date(`${event.eventDate}T${event.startTime}`) <= now);
  const isFull = event.availableSeats === 0 || event.isFull;

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/events')}
        sx={{ mb: 2.5 }}
      >
        Back to Events
      </Button>

      <Grid container spacing={3}>
        {/* Left Column: Image & Details */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardMedia
              component="img"
              height="280"
              image={
                event.imageUrl ||
                'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'
              }
              alt={event.title}
            />
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                <StatusChip status={event.status} />
                <Typography variant="body2" color="text.secondary">
                  Category: <strong>{event.category}</strong>
                </Typography>
              </Box>

              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                {event.title}
              </Typography>

              <Typography variant="body1" sx={{ whiteSpace: 'pre-line', color: '#334155', lineHeight: 1.7, mb: 3 }}>
                {event.description}
              </Typography>

              <Divider sx={{ my: 2.5 }} />

              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Event Logistics & Rules
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <DateIcon color="primary" sx={{ mr: 1.5 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Date & Time
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatDate(event.eventDate)} ({event.startTime} - {event.endTime})
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <LocationIcon color="primary" sx={{ mr: 1.5 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Venue / Location
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {event.venue}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <PeopleIcon color="primary" sx={{ mr: 1.5 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Eligibility
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {event.eligibility || 'Open to all enrolled students'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <ScheduleIcon color="primary" sx={{ mr: 1.5 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Registration Deadline
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatDateTime(event.registrationDeadline)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Organizer & Admin Participant Roster View */}
          {(isOrganizer || isAdmin) && (
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Registered Participants Roster ({participants.length})
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Confidential organizer participant access.
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ListIcon />}
                    onClick={() => navigate(`/events/${id}/participants`)}
                  >
                    View Full Roster & Export CSV
                  </Button>
                </Box>

                {participants.length === 0 ? (
                  <Alert severity="info">No students have registered for this event yet.</Alert>
                ) : (
                  <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0' }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                          <TableCell>Participant Name</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Department</TableCell>
                          <TableCell>Year</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Registered At</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {participants.slice(0, 5).map((p) => (
                          <TableRow key={p.id} hover>
                            <TableCell sx={{ fontWeight: 600 }}>{p.participant?.fullName}</TableCell>
                            <TableCell>{p.participant?.email}</TableCell>
                            <TableCell>{p.participant?.department}</TableCell>
                            <TableCell>{p.participant?.academicYear}</TableCell>
                            <TableCell>
                              <StatusChip status={p.status} />
                            </TableCell>
                            <TableCell>{formatDateTime(p.registeredAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Right Column: Registration Card & Controls */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Registration Status
            </Typography>

            <Box sx={{ mb: 2.5, p: 2, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Capacity:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {event.maxParticipants} Seats
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Registered:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {event.registeredCount} Students
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Remaining:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: event.availableSeats > 0 ? 'success.main' : 'error.main' }}>
                  {event.availableSeats} Seats {event.availableSeats === 0 ? '(Fully Booked)' : ''}
                </Typography>
              </Box>
              {event.registrationDeadline && (
                <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid #e2e8f0' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Registration Deadline:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: deadlinePassed ? 'error.main' : 'primary.main',
                    }}
                  >
                    {deadlinePassed ? (
                      <span>Registration Closed • {formatIndianDateTime(event.registrationDeadline)}</span>
                    ) : (
                      <span>Registration closes: {formatIndianDateTime(event.registrationDeadline)}</span>
                    )}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Action Buttons with Strict Business Logic */}
            {isRegistered ? (
              <Box>
                <Alert severity="success" sx={{ mb: 2 }}>
                  You are confirmed for this event!
                </Alert>
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => setCancelRegDialog(true)}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Cancel My Registration
                </Button>
              </Box>
            ) : isCancelled ? (
              <Button fullWidth variant="contained" disabled sx={{ bgcolor: '#fee2e2', color: '#991b1b', textTransform: 'none', fontWeight: 600 }}>
                Cancelled
              </Button>
            ) : isCompleted || eventStarted ? (
              <Button fullWidth variant="contained" disabled sx={{ bgcolor: '#e2e8f0', color: '#64748b', textTransform: 'none', fontWeight: 600 }}>
                Event Started / Completed
              </Button>
            ) : deadlinePassed ? (
              <Button fullWidth variant="contained" disabled sx={{ bgcolor: '#e2e8f0', color: '#64748b', textTransform: 'none', fontWeight: 600 }}>
                Registration Closed
              </Button>
            ) : isFull ? (
              <Button fullWidth variant="contained" disabled sx={{ bgcolor: '#fed7aa', color: '#c2410c', textTransform: 'none', fontWeight: 600 }}>
                Event Full
              </Button>
            ) : isApproved ? (
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleOpenRegister}
                sx={{ py: 1.3, fontWeight: 600, textTransform: 'none' }}
              >
                Register Now
              </Button>
            ) : (
              <Alert severity="warning">Event is currently {event.status}. Registration unavailable.</Alert>
            )}

            {/* Organizer Controls */}
            {(isOrganizer || isAdmin) && (
              <Box sx={{ mt: 3, pt: 2.5, borderTop: '1px solid #e2e8f0' }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, fontWeight: 600 }}>
                  Organizer Management:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/events/${id}/edit`)}
                  >
                    Edit Event Details
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    startIcon={<FormIcon />}
                    onClick={() => navigate(`/events/${id}/form-builder`)}
                  >
                    Custom Form Builder ({formFields.length} fields)
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    startIcon={<ListIcon />}
                    onClick={() => navigate(`/events/${id}/participants`)}
                  >
                    Manage Participants
                  </Button>

                  {event.status === 'APPROVED' && (
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<CancelIcon />}
                      onClick={() => setCancelEventDialog(true)}
                    >
                      Cancel This Event
                    </Button>
                  )}
                </Box>
              </Box>
            )}
          </Card>

          {/* Organizer Bio Card */}
          <Card sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
              Organized By
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {event.organizer?.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              {event.organizer?.department}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Contact: {event.organizer?.email}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Dynamic Event Registration Form Dialog */}
      <Dialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Register for {event.title}
        </DialogTitle>
        <DialogContent dividers>
          {/* Verified Campus Profile summary */}
          <Paper sx={{ p: 2, bgcolor: '#f8fafc', mb: 2.5, border: '1px solid #e2e8f0' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
              Verified Campus Profile (Auto-attached):
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {user?.fullName} ({user?.email})
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.department} • {user?.academicYear || 'Student'}
            </Typography>
          </Paper>

          {/* Custom form fields if configured by organizer */}
          {formFields.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                Organizer Required Questions:
              </Typography>

              {formFields.map((f) => {
                const error = formErrors[f.id];
                const value = formAnswers[f.id] || '';

                if (f.fieldType === 'DROPDOWN') {
                  const options = f.options ? f.options.split(',').map((o) => o.trim()).filter(Boolean) : [];
                  return (
                    <FormControl fullWidth size="small" sx={{ mb: 2 }} key={f.id} error={Boolean(error)}>
                      <InputLabel>{f.fieldLabel} {f.required && '*'}</InputLabel>
                      <Select
                        value={value}
                        label={`${f.fieldLabel} ${f.required ? '*' : ''}`}
                        onChange={(e) => handleFieldChange(f.id, e.target.value)}
                      >
                        {options.map((opt, i) => (
                          <MenuItem key={i} value={opt}>{opt}</MenuItem>
                        ))}
                      </Select>
                      {error && <Typography variant="caption" color="error">{error}</Typography>}
                    </FormControl>
                  );
                }

                if (f.fieldType === 'RADIO') {
                  const options = f.options ? f.options.split(',').map((o) => o.trim()).filter(Boolean) : [];
                  return (
                    <FormControl component="fieldset" sx={{ mb: 2, display: 'block' }} key={f.id} error={Boolean(error)}>
                      <FormLabel component="legend" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                        {f.fieldLabel} {f.required && <span style={{ color: 'red' }}>*</span>}
                      </FormLabel>
                      <RadioGroup
                        value={value}
                        onChange={(e) => handleFieldChange(f.id, e.target.value)}
                        row
                      >
                        {options.map((opt, i) => (
                          <FormControlLabel key={i} value={opt} control={<Radio size="small" />} label={opt} />
                        ))}
                      </RadioGroup>
                      {error && <Typography variant="caption" color="error">{error}</Typography>}
                    </FormControl>
                  );
                }

                if (f.fieldType === 'CHECKBOX') {
                  const options = f.options ? f.options.split(',').map((o) => o.trim()).filter(Boolean) : [];
                  const selectedOpts = Array.isArray(value) ? value : [];
                  return (
                    <FormControl component="fieldset" sx={{ mb: 2, display: 'block' }} key={f.id} error={Boolean(error)}>
                      <FormLabel component="legend" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                        {f.fieldLabel} {f.required && <span style={{ color: 'red' }}>*</span>}
                      </FormLabel>
                      <FormGroup row>
                        {options.map((opt, i) => (
                          <FormControlLabel
                            key={i}
                            control={
                              <Checkbox
                                size="small"
                                checked={selectedOpts.includes(opt)}
                                onChange={() => handleCheckboxToggle(f.id, opt)}
                              />
                            }
                            label={opt}
                          />
                        ))}
                      </FormGroup>
                      {error && <Typography variant="caption" color="error">{error}</Typography>}
                    </FormControl>
                  );
                }

                if (f.fieldType === 'TEXTAREA') {
                  return (
                    <TextField
                      key={f.id}
                      fullWidth
                      multiline
                      rows={3}
                      label={`${f.fieldLabel} ${f.required ? '*' : ''}`}
                      value={value}
                      onChange={(e) => handleFieldChange(f.id, e.target.value)}
                      error={Boolean(error)}
                      helperText={error}
                      size="small"
                      sx={{ mb: 2 }}
                    />
                  );
                }

                return (
                  <TextField
                    key={f.id}
                    fullWidth
                    type={f.fieldType === 'NUMBER' ? 'number' : f.fieldType === 'EMAIL' ? 'email' : 'text'}
                    label={`${f.fieldLabel} ${f.required ? '*' : ''}`}
                    value={value}
                    onChange={(e) => handleFieldChange(f.id, e.target.value)}
                    error={Boolean(error)}
                    helperText={error}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                );
              })}
            </Box>
          )}

          <Typography variant="caption" color="text.secondary">
            By confirming registration, you agree to attend on {formatDate(event.eventDate)} at {event.venue}.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setFormDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleRegisterSubmit}
            disabled={actionLoading}
            sx={{ px: 3 }}
          >
            {actionLoading ? 'Registering...' : 'Confirm Registration'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={cancelRegDialog}
        title="Cancel Event Registration"
        message={`Are you sure you want to cancel your seat for "${event.title}"? Your seat will be restored to the available pool.`}
        confirmText="Yes, Cancel Registration"
        confirmColor="error"
        loading={actionLoading}
        onConfirm={handleCancelRegistration}
        onCancel={() => setCancelRegDialog(false)}
      />

      <ConfirmationDialog
        open={cancelEventDialog}
        title="Cancel Event"
        message={`Are you sure you want to administratively cancel "${event.title}"? All registered participants will receive cancellation notifications immediately.`}
        confirmText="Confirm Event Cancellation"
        confirmColor="error"
        loading={actionLoading}
        onConfirm={handleCancelEvent}
        onCancel={() => setCancelEventDialog(false)}
      />
    </Box>
  );
}
