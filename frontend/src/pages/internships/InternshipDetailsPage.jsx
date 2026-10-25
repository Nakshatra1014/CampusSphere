import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Divider,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  CloudUpload as CloudUploadIcon,
  Launch as LaunchIcon,
  Group as GroupIcon,
  Public as PublicIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { internshipService } from '../../services/internshipService';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate } from '../../utils/formatters';
import { LoadingState } from '../../components/common/LoadingState';
import { isValidInternshalaUrl, getSafeInternshalaUrl } from '../../utils/urlValidator';

export default function InternshipDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Apply dialog state
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUrl, setResumeUrl] = useState('');
  const [coverNote, setCoverNote] = useState('');
  const [uploadProgress, setUploadProgress] = useState(false);

  const fetchInternship = async () => {
    try {
      setLoading(true);
      const data = await internshipService.getInternshipById(id);
      setInternship(data);
    } catch (err) {
      showToast(err.message || 'Failed to load internship details.', 'error');
      navigate('/internships');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternship();
  }, [id]);

  if (loading) return <LoadingState message="Loading internship details..." />;
  if (!internship) return null;

  const isPoster = user?.id === internship.postedBy?.id;
  const isAdmin = user?.role === 'ADMIN';
  const canManage = isPoster || isAdmin;

  const isExternal = Boolean(internship.isExternal) || internship.sourcePlatform === 'INTERNSHALA';
  const isApplied = Boolean(internship.isUserApplied ?? internship.userApplied);
  const isClosed = Boolean(internship.isExpired ?? internship.expired ?? (internship.applicationStatus === 'CLOSED'));

  const handleApplyOnInternshala = () => {
    const rawUrl = internship.externalUrl || internship.applicationLink;
    if (!isValidInternshalaUrl(rawUrl)) {
      showToast('The external listing URL is not a recognized secure Internshala destination.', 'error');
      return;
    }
    const safeUrl = getSafeInternshalaUrl(rawUrl);
    window.open(safeUrl, '_blank', 'noopener,noreferrer');
    showToast('Verified Internshala listing opened in a new browser tab. Applications must be completed directly on Internshala.', 'info');
  };

  const handleToggleSelfReport = async () => {
    try {
      setActionLoading(true);
      if (isApplied) {
        await internshipService.unmarkSelfReportApplied(id);
        showToast('Self-reported status removed.', 'info');
      } else {
        await internshipService.selfReportApplied(id);
        showToast('Marked as Applied (Self-Reported). Recorded only for your personal tracking.', 'success');
      }
      fetchInternship();
    } catch (err) {
      showToast(err.message || 'Failed to update self-reported status.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenApply = () => {
    if (isExternal) return; // External listings must not open the internal apply dialog
    setResumeFile(null);
    setResumeUrl('');
    setCoverNote('');
    setApplyDialogOpen(true);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile && !resumeUrl.trim()) {
      showToast('Please upload a resume (PDF, DOC, DOCX) or provide a resume link.', 'warning');
      return;
    }

    try {
      setUploadProgress(true);
      const formData = new FormData();
      if (resumeFile) {
        formData.append('file', resumeFile);
      }
      if (coverNote.trim()) {
        formData.append('coverNote', coverNote.trim());
      }
      if (resumeUrl.trim()) {
        formData.append('resumeUrl', resumeUrl.trim());
      }

      await internshipService.applyWithFile(id, formData);
      showToast('Application submitted successfully!', 'success');
      setApplyDialogOpen(false);
      fetchInternship();
    } catch (err) {
      showToast(err.message || 'Failed to submit application.', 'error');
    } finally {
      setUploadProgress(false);
    }
  };

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/internships')}
        sx={{ mb: 2 }}
      >
        Back to Internships
      </Button>

      {/* Main Internship Card */}
      <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden', mb: 3 }}>
        <Box sx={{ p: 3, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="overline" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: 1 }}>
                {internship.companyName}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mt: 0.5 }}>
                {internship.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {internship.isExternal ? 'Aggregated via Internshala' : `Posted by ${internship.postedBy?.fullName || 'Campus Member'} (${internship.postedBy?.department || 'University'})`}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              {internship.isExternal || internship.sourcePlatform === 'INTERNSHALA' ? (
                <Chip
                  label="Internshala"
                  icon={<PublicIcon sx={{ fontSize: '0.85rem !important' }} />}
                  sx={{
                    fontWeight: 700,
                    bgcolor: '#008bdc',
                    color: '#ffffff',
                    '& .MuiChip-icon': { color: '#ffffff' },
                  }}
                />
              ) : (
                <Chip
                  label="Campus Direct"
                  variant="outlined"
                  color="primary"
                  sx={{ fontWeight: 600 }}
                />
              )}
              <Chip
                label={internship.workMode}
                color="default"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
              {isClosed ? (
                <Chip label="APPLICATION CLOSED" color="default" sx={{ fontWeight: 600, bgcolor: '#e2e8f0' }} />
              ) : (
                <Chip label="ACCEPTING APPLICATIONS" color="success" sx={{ fontWeight: 600 }} />
              )}
            </Box>
          </Box>
        </Box>

        <CardContent sx={{ p: 4 }}>
          {/* Quick Stats Grid */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <LocationIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Location</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{internship.location || 'On Campus'}</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <MoneyIcon color="success" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Stipend</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{internship.stipend || 'Unpaid / Experience'}</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <TimeIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Duration</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{internship.duration || 'Flexible'}</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CalendarIcon color="warning" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Application Deadline</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatDate(internship.applicationDeadline)}</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Description */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: '#1e293b' }}>
              Role Description
            </Typography>
            <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {internship.description}
            </Typography>
          </Box>

          {/* Eligibility */}
          {internship.eligibility && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#1e293b' }}>
                Eligibility Requirements
              </Typography>
              <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.7 }}>
                {internship.eligibility}
              </Typography>
            </Box>
          )}

          {/* Required Skills */}
          {internship.skillsRequired && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: '#1e293b' }}>
                Skills & Technologies
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {internship.skillsRequired.split(',').map((skill, idx) => (
                  <Chip
                    key={idx}
                    label={skill.trim()}
                    sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 600 }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* External Link if available */}
          {internship.externalLink && (
            <Box sx={{ mb: 4 }}>
              <Button
                variant="outlined"
                endIcon={<LaunchIcon />}
                href={internship.externalLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                External Application Portal
              </Button>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Call to Action Bar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ maxWidth: 650 }}>
              {isExternal ? (
                <Alert severity="info" icon={<PublicIcon />} sx={{ py: 1, px: 2 }}>
                  This opportunity is hosted on <strong>Internshala</strong>. Applications must be completed directly on the Internshala website.
                  CampusSphere does not submit your resume, cover note, or student profile to external platforms.
                </Alert>
              ) : isApplied ? (
                <Alert severity="success" icon={<CheckCircleIcon />} sx={{ py: 0.5, px: 2 }}>
                  You have applied for this opportunity. Track status in{' '}
                  <strong style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/my-internship-applications')}>
                    My Applications
                  </strong>.
                </Alert>
              ) : isClosed ? (
                <Alert severity="warning" sx={{ py: 0.5, px: 2 }}>
                  Application deadline has passed. Applications are closed.
                </Alert>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Applications are open until end of day {formatDate(internship.applicationDeadline)}.
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              {!isExternal && canManage && (
                <Button
                  variant="outlined"
                  startIcon={<GroupIcon />}
                  onClick={() => navigate(`/internships/${internship.id}/applications`)}
                >
                  Review Applicants ({internship.totalApplications || 0})
                </Button>
              )}

              {isExternal ? (
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<LaunchIcon />}
                    onClick={handleApplyOnInternshala}
                    sx={{ bgcolor: '#008bdc', '&:hover': { bgcolor: '#0077bd' }, px: 3.5, fontWeight: 700 }}
                  >
                    Apply on Internshala
                  </Button>
                  {isApplied ? (
                    <Button
                      variant="outlined"
                      color="info"
                      size="large"
                      disabled={actionLoading}
                      startIcon={<CheckCircleIcon />}
                      onClick={handleToggleSelfReport}
                      sx={{ fontWeight: 600 }}
                    >
                      Applied (Self-Reported) • Click to Unmark
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      color="primary"
                      size="large"
                      disabled={actionLoading}
                      onClick={handleToggleSelfReport}
                      sx={{ fontWeight: 600 }}
                    >
                      Mark as Applied (Self-Reported)
                    </Button>
                  )}
                </Box>
              ) : isApplied ? (
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => navigate('/my-internship-applications')}
                >
                  View My Application
                </Button>
              ) : isClosed ? (
                <Button variant="contained" disabled sx={{ px: 4 }}>
                  APPLICATION CLOSED
                </Button>
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleOpenApply}
                  sx={{ px: 4, fontWeight: 700 }}
                >
                  APPLY NOW
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Internal CampusSphere Apply Modal Dialog - Only rendered for CampusSphere listings */}
      {!isExternal && (
      <Dialog
        open={applyDialogOpen}
        onClose={() => !uploadProgress && setApplyDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleApplySubmit}>
          <DialogTitle sx={{ fontWeight: 700 }}>
            Apply for {internship.title}
            <Typography variant="body2" color="text.secondary">
              {internship.companyName}
            </Typography>
          </DialogTitle>
          <DialogContent dividers>
            <Alert severity="info" sx={{ mb: 2.5 }}>
              Applying as <strong>{user?.fullName}</strong> ({user?.email} • {user?.department || 'Student'}).
            </Alert>

            {/* Resume Upload Box */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Upload Resume (PDF, DOC, DOCX) *
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  textAlign: 'center',
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  borderColor: resumeFile ? '#16a34a' : '#cbd5e1',
                  bgcolor: resumeFile ? '#f0fdf4' : '#fafafa',
                  borderRadius: 2,
                  cursor: 'pointer',
                }}
                component="label"
              >
                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setResumeFile(file);
                    }
                  }}
                />
                <CloudUploadIcon sx={{ fontSize: 36, color: resumeFile ? '#16a34a' : '#94a3b8', mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                  {resumeFile ? resumeFile.name : 'Click to select resume file from device'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {resumeFile ? `${(resumeFile.size / 1024 / 1024).toFixed(2)} MB • Ready to upload` : 'PDF, DOC, or DOCX up to 10MB'}
                </Typography>
              </Paper>
            </Box>

            {/* Or Resume URL */}
            <TextField
              fullWidth
              size="small"
              label="Or Link to Online Resume / Portfolio"
              placeholder="https://drive.google.com/... or https://..."
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              sx={{ mb: 2.5 }}
            />

            {/* Cover Note */}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Cover Note (Optional)"
              placeholder="Highlight relevant coursework, projects, or why you're a great fit..."
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setApplyDialogOpen(false)} disabled={uploadProgress}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={uploadProgress || (!resumeFile && !resumeUrl.trim())}
              startIcon={uploadProgress ? <CircularProgress size={18} color="inherit" /> : null}
            >
              {uploadProgress ? 'Uploading & Applying...' : 'Submit Application'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      )}
    </Box>
  );
}