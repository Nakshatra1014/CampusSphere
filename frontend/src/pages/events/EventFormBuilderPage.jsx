import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  Divider,
  Paper,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
  DynamicForm as FormIcon,
  Visibility as PreviewIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { LoadingState, EmptyState } from '../../components/common/LoadingState';

const FIELD_TYPES = [
  { value: 'TEXT', label: 'Short Text' },
  { value: 'NUMBER', label: 'Number' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'PHONE', label: 'Phone Number' },
  { value: 'DROPDOWN', label: 'Dropdown Select' },
  { value: 'RADIO', label: 'Multiple Choice (Single Option)' },
  { value: 'CHECKBOX', label: 'Checkboxes (Multi-Option)' },
  { value: 'TEXTAREA', label: 'Long Paragraph' },
];

export default function EventFormBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { showToast } = useNotifications();

  const [event, setEvent] = useState(null);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);

  // Field Edit/Create Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [fieldForm, setFieldForm] = useState({
    fieldLabel: '',
    fieldType: 'TEXT',
    required: false,
    fieldOrder: 1,
    options: '',
  });

  // Preview Dialog
  const [previewOpen, setPreviewOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventData, formFields] = await Promise.all([
        eventService.getEventById(id),
        eventService.getEventFormFields(id),
      ]);

      if (!isAdmin && eventData.organizer?.id !== user?.id) {
        showToast('Only the event organizer can customize the registration form.', 'error');
        navigate(`/events/${id}`);
        return;
      }

      setEvent(eventData);
      setFields(formFields.sort((a, b) => a.fieldOrder - b.fieldOrder));
    } catch (err) {
      showToast(err.message || 'Failed to load form builder.', 'error');
      navigate(`/events/${id}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, user]);

  const handleOpenCreate = () => {
    setEditingFieldId(null);
    setFieldForm({
      fieldLabel: '',
      fieldType: 'TEXT',
      required: false,
      fieldOrder: fields.length + 1,
      options: '',
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (f) => {
    setEditingFieldId(f.id);
    setFieldForm({
      fieldLabel: f.fieldLabel,
      fieldType: f.fieldType,
      required: f.required,
      fieldOrder: f.fieldOrder,
      options: f.options || '',
    });
    setDialogOpen(true);
  };

  const handleSaveField = async () => {
    if (!fieldForm.fieldLabel.trim()) {
      showToast('Please enter a field label / question.', 'warning');
      return;
    }

    const needsOptions = ['DROPDOWN', 'RADIO', 'CHECKBOX'].includes(fieldForm.fieldType);
    if (needsOptions && !fieldForm.options.trim()) {
      showToast('Please provide comma-separated choices for this field type.', 'warning');
      return;
    }

    try {
      if (editingFieldId) {
        await eventService.updateFormField(id, editingFieldId, fieldForm);
        showToast('Form question updated successfully.', 'success');
      } else {
        await eventService.addFormField(id, fieldForm);
        showToast('Form question added successfully.', 'success');
      }
      setDialogOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to save question.', 'error');
    }
  };

  const handleDeleteField = async (fieldId) => {
    if (!window.confirm('Delete this registration question?')) return;
    try {
      await eventService.deleteFormField(id, fieldId);
      showToast('Question deleted.', 'info');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to delete question.', 'error');
    }
  };

  const handleMoveOrder = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= fields.length) return;

    const currentField = fields[index];
    const targetField = fields[targetIndex];

    try {
      await Promise.all([
        eventService.updateFormField(id, currentField.id, {
          ...currentField,
          fieldOrder: targetField.fieldOrder,
        }),
        eventService.updateFormField(id, targetField.id, {
          ...targetField,
          fieldOrder: currentField.fieldOrder,
        }),
      ]);
      loadData();
    } catch (err) {
      showToast('Failed to reorder fields.', 'error');
    }
  };

  if (loading) return <LoadingState message="Loading event registration form designer..." />;

  const isChoiceType = ['DROPDOWN', 'RADIO', 'CHECKBOX'].includes(fieldForm.fieldType);

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/events/${id}`)} sx={{ mb: 2 }}>
        Back to Event Details
      </Button>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <FormIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Registration Form Builder
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Customize applicant questions for <strong>{event?.title}</strong>
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {fields.length > 0 && (
            <Button variant="outlined" startIcon={<PreviewIcon />} onClick={() => setPreviewOpen(true)}>
              Preview Form
            </Button>
          )}
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            Add Question
          </Button>
        </Box>
      </Box>

      {/* Profile Reuse Notice */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Automatic CampusProfile Integration:</strong> Student Name, University Email, Department, and Academic Year are verified automatically on registration. You only need to create event-specific questions (e.g. T-Shirt Size, dietary preferences, portfolio links, team names).
      </Alert>

      {/* Fields List */}
      {fields.length === 0 ? (
        <EmptyState
          title="No custom questions created yet"
          message="By default, applicants register instantly using their verified campus profile. Click 'Add Question' to request additional details."
          action={
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
              Add First Question
            </Button>
          }
        />
      ) : (
        <Grid container spacing={2}>
          {fields.map((f, index) => (
            <Grid item xs={12} key={f.id}>
              <Card sx={{ border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <CardContent sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <IconButton
                        size="small"
                        disabled={index === 0}
                        onClick={() => handleMoveOrder(index, -1)}
                      >
                        <UpIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        disabled={index === fields.length - 1}
                        onClick={() => handleMoveOrder(index, 1)}
                      >
                        <DownIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {index + 1}. {f.fieldLabel}
                        </Typography>
                        {f.required ? (
                          <Chip label="Required" size="small" color="error" sx={{ height: 20, fontSize: '0.7rem' }} />
                        ) : (
                          <Chip label="Optional" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                        )}
                        <Chip
                          label={f.fieldType}
                          size="small"
                          sx={{ height: 20, fontSize: '0.7rem', bgcolor: '#e0f2fe', color: '#0369a1' }}
                        />
                      </Box>

                      {f.options && (
                        <Typography variant="caption" color="text.secondary">
                          Choices: {f.options}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenEdit(f)}
                    >
                      Edit
                    </Button>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteField(f.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Field Editor Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editingFieldId ? 'Edit Form Question' : 'Add New Form Question'}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Question / Field Label"
            value={fieldForm.fieldLabel}
            onChange={(e) => setFieldForm({ ...fieldForm, fieldLabel: e.target.value })}
            placeholder="e.g. What is your T-Shirt Size?"
            size="small"
            sx={{ mb: 2.5 }}
            required
          />

          <FormControl fullWidth size="small" sx={{ mb: 2.5 }}>
            <InputLabel>Answer Input Type</InputLabel>
            <Select
              value={fieldForm.fieldType}
              label="Answer Input Type"
              onChange={(e) => setFieldForm({ ...fieldForm, fieldType: e.target.value })}
            >
              {FIELD_TYPES.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label} ({t.value})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {isChoiceType && (
            <TextField
              fullWidth
              label="Choices / Options (comma-separated)"
              value={fieldForm.options}
              onChange={(e) => setFieldForm({ ...fieldForm, options: e.target.value })}
              placeholder="e.g. Small, Medium, Large, XL, XXL"
              size="small"
              helperText="Separate multiple choices with a comma (,)"
              sx={{ mb: 2.5 }}
              required
            />
          )}

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Display Order"
                value={fieldForm.fieldOrder}
                onChange={(e) => setFieldForm({ ...fieldForm, fieldOrder: parseInt(e.target.value, 10) || 0 })}
                size="small"
              />
            </Grid>
            <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={fieldForm.required}
                    onChange={(e) => setFieldForm({ ...fieldForm, required: e.target.checked })}
                    color="primary"
                  />
                }
                label="Required field"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveField}>
            {editingFieldId ? 'Update Question' : 'Add Question'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Participant Form Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          Preview: Participant Registration View
        </DialogTitle>
        <DialogContent dividers>
          <Paper sx={{ p: 2, bgcolor: '#f8fafc', mb: 2.5, border: '1px solid #e2e8f0' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Verified Profile Info (Auto-attached):
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Name: {user?.fullName || 'Aarav Sharma'}<br />
              • Email: {user?.email || 'student@campuspere.edu'}<br />
              • Department: {user?.department || 'Computer Science'}<br />
              • Year: {user?.academicYear || 'Year 3'}
            </Typography>
          </Paper>

          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
            Event Questions:
          </Typography>

          {fields.map((f, i) => (
            <Box key={f.id} sx={{ mb: 2.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                {i + 1}. {f.fieldLabel} {f.required && <span style={{ color: 'red' }}>*</span>}
              </Typography>
              {f.fieldType === 'DROPDOWN' ? (
                <FormControl fullWidth size="small">
                  <Select displayEmpty defaultValue="">
                    <MenuItem value="" disabled>Select an option...</MenuItem>
                    {f.options?.split(',').map((opt, idx) => (
                      <MenuItem key={idx} value={opt.trim()}>{opt.trim()}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : f.fieldType === 'TEXTAREA' ? (
                <TextField fullWidth multiline rows={3} size="small" placeholder="Enter your response..." />
              ) : (
                <TextField fullWidth size="small" placeholder={`Enter ${f.fieldLabel.toLowerCase()}...`} />
              )}
            </Box>
          ))}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPreviewOpen(false)}>Close Preview</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
