import React, { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Work as WorkIcon,
  Add as AddIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckCircleIcon,
  Sync as SyncIcon,
  Launch as LaunchIcon,
  Public as PublicIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { internshipService } from '../../services/internshipService';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { WORK_MODES } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import SearchBar from '../../components/common/SearchBar';
import { uploadService } from '../../services/aiService';
import { LoadingState, EmptyState } from '../../components/common/LoadingState';
import { isValidInternshalaUrl, getSafeInternshalaUrl } from '../../utils/urlValidator';

export default function InternshipsPage() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { showToast } = useNotifications();

  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [workModeFilter, setWorkModeFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncInfo, setSyncInfo] = useState(null);

  const isUserAdmin = Boolean(isAdmin || user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN');

  // Application dialog for direct CampusSphere listings
  const [applyDialog, setApplyDialog] = useState({
    open: false,
    item: null,
    resumeUrl: '',
    coverNote: '',
    loading: false,
  });

  // External application guidance & self-report dialog
  const [externalDialog, setExternalDialog] = useState({
    open: false,
    item: null,
    validUrl: '',
    loading: false,
  });

  const isExternalInternship = (item) => {
    return Boolean(item?.isExternal) || item?.sourcePlatform === 'INTERNSHALA';
  };

  const handleApplyOnInternshala = (item) => {
    const rawUrl = item.externalUrl || item.applicationLink;
    if (!isValidInternshalaUrl(rawUrl)) {
      showToast('The external listing URL is not a recognized secure Internshala destination.', 'error');
      return;
    }

    const safeUrl = getSafeInternshalaUrl(rawUrl);
    window.open(safeUrl, '_blank', 'noopener,noreferrer');

    setExternalDialog({
      open: true,
      item,
      validUrl: safeUrl,
      loading: false,
    });
  };

  const handleToggleSelfReport = async (item) => {
    try {
      const isCurrentlyApplied = Boolean(item.isUserApplied ?? item.userApplied);
      if (isCurrentlyApplied) {
        await internshipService.unmarkSelfReportApplied(item.id);
        showToast('Self-reported status removed.', 'info');
      } else {
        await internshipService.selfReportApplied(item.id);
        showToast('Marked as Applied (Self-Reported). Recorded only for your personal tracking.', 'success');
      }
      loadInternships();
      if (externalDialog.open && externalDialog.item?.id === item.id) {
        setExternalDialog((prev) => ({
          ...prev,
          item: {
            ...prev.item,
            isUserApplied: !isCurrentlyApplied,
            userApplied: !isCurrentlyApplied,
            isSelfReported: !isCurrentlyApplied,
          },
        }));
      }
    } catch (err) {
      showToast(err.message || 'Failed to update self-reported status.', 'error');
    }
  };

  const loadInternships = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const mode = workModeFilter === 'All' ? null : workModeFilter;
      const src = sourceFilter === 'All' ? null : sourceFilter;
      const data = await internshipService.getInternships({
        workMode: mode,
        source: src,
        search: searchQuery || null,
        activeOnly: true,
      });
      const safeList = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      setInternships(safeList);
    } catch (err) {
      setFetchError(err.message || 'Failed to load internships.');
      showToast(err.message || 'Failed to load internships.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSyncStatus = async () => {
    try {
      const res = await internshipService.getSyncStatus();
      setSyncInfo(res);
    } catch {
      // Ignored if network issue
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadInternships();
    }, 250);
    return () => clearTimeout(timer);
  }, [workModeFilter, sourceFilter, searchQuery]);

  useEffect(() => {
    fetchSyncStatus();
  }, [user]);

  const handleTriggerSync = async () => {
    try {
      setSyncing(true);
      const res = await internshipService.triggerSync();
      setSyncInfo(res);
      showToast(res.message || 'Internshala synchronization finished.', 'info');
      loadInternships();
    } catch (err) {
      showToast(err.message || 'Synchronization failed.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleOpenApply = (item) => {
    setApplyDialog({
      open: true,
      item,
      resumeUrl: '',
      coverNote: `I am interested in applying for the ${item.title} position at ${item.companyName}.`,
      loading: false,
    });
  };

  const handleConfirmApply = async () => {
    const item = applyDialog.item;
    if (!item) return;

    try {
      setApplyDialog((prev) => ({ ...prev, loading: true }));
      await internshipService.apply(item.id, {
        resumeUrl: applyDialog.resumeUrl,
        coverNote: applyDialog.coverNote,
      });
      showToast(`Application for ${item.title} submitted successfully!`, 'success');
      setApplyDialog({ open: false, item: null, resumeUrl: '', coverNote: '', loading: false });
      loadInternships();
    } catch (err) {
      showToast(err.message || 'Failed to submit application.', 'error');
      setApplyDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const renderEmptyState = () => {
    // 1. Specifically filtering by Internshala and no records exist in the database:
    if (sourceFilter === 'INTERNSHALA') {
      if (searchQuery || workModeFilter !== 'All') {
        return (
          <EmptyState
            title="No Internshala internships match your filters"
            message="Try clearing your search query or switching work mode to 'All Modes'."
            action={
              <Button
                variant="outlined"
                onClick={() => {
                  setSearchQuery('');
                  setWorkModeFilter('All');
                }}
              >
                Clear Filters
              </Button>
            }
          />
        );
      }

      // Check if API key is not configured
      if (!syncInfo?.isApiKeyConfigured || syncInfo?.status === 'UNCONFIGURED_API_KEY') {
        return (
          <Card
            sx={{
              p: 4,
              textAlign: 'center',
              bgcolor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: 2,
              maxWidth: 700,
              mx: 'auto',
              my: 3,
            }}
          >
            <Box sx={{ mb: 2 }}>
              <PublicIcon sx={{ fontSize: 48, color: '#008bdc' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
              Internshala Integration Awaiting API Key
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
              CampusSphere automatically aggregates verified listings from Internshala via the Upscrape API.
              The <strong>UPSCRAPE_API_KEY</strong> environment variable is currently not configured on the Spring Boot backend.
            </Typography>
            <Box
              sx={{
                bgcolor: '#ffffff',
                p: 2,
                borderRadius: 1.5,
                border: '1px dashed #94a3b8',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                textAlign: 'left',
                mb: 3,
                color: '#334155',
              }}
            >
              # Set in backend environment or .env:
              <br />
              <strong>UPSCRAPE_API_KEY</strong>=your_upscrape_api_key_here
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<SyncIcon />}
                onClick={() => {
                  fetchSyncStatus();
                  loadInternships();
                }}
              >
                Refresh Status
              </Button>
              {isUserAdmin && (
                <Button
                  variant="contained"
                  onClick={handleTriggerSync}
                  disabled={syncing}
                  sx={{ bgcolor: '#008bdc', '&:hover': { bgcolor: '#0077bd' } }}
                >
                  {syncing ? 'Syncing...' : 'Trigger Sync'}
                </Button>
              )}
            </Box>
          </Card>
        );
      }

      // Check if sync failed
      if (syncInfo?.status === 'FAILED') {
        return (
          <Card
            sx={{
              p: 4,
              textAlign: 'center',
              bgcolor: '#fff7ed',
              border: '1px solid #ffedd5',
              borderRadius: 2,
              maxWidth: 700,
              mx: 'auto',
              my: 3,
            }}
          >
            <Box sx={{ mb: 2 }}>
              <PublicIcon sx={{ fontSize: 48, color: '#ea580c' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#9a3412', mb: 1 }}>
              Internshala Synchronization Encountered an Issue
            </Typography>
            <Typography variant="body2" sx={{ color: '#7c2d12', mb: 3 }}>
              {syncInfo?.message || 'Failed to retrieve external listings from the Upscrape API.'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<SyncIcon />}
                onClick={() => {
                  fetchSyncStatus();
                  loadInternships();
                }}
              >
                Refresh Status
              </Button>
              {isUserAdmin && (
                <Button
                  variant="contained"
                  onClick={handleTriggerSync}
                  disabled={syncing}
                  sx={{ bgcolor: '#ea580c', '&:hover': { bgcolor: '#c2410c' } }}
                >
                  {syncing ? 'Syncing...' : 'Retry Synchronization'}
                </Button>
              )}
            </Box>
          </Card>
        );
      }

      // If sync completed with 0 or pending initial sync
      return (
        <Card
          sx={{
            p: 4,
            textAlign: 'center',
            bgcolor: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: 2,
            maxWidth: 700,
            mx: 'auto',
            my: 3,
          }}
        >
          <Box sx={{ mb: 2 }}>
            <PublicIcon sx={{ fontSize: 48, color: '#008bdc' }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
            No Internshala Listings Synchronized Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {syncInfo?.message || 'External internships will appear here once the scheduled sync runs or an administrator triggers a manual sync.'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<SyncIcon />}
              onClick={() => {
                fetchSyncStatus();
                loadInternships();
              }}
            >
              Refresh
            </Button>
            {isUserAdmin && (
              <Button
                variant="contained"
                onClick={handleTriggerSync}
                disabled={syncing}
                sx={{ bgcolor: '#008bdc', '&:hover': { bgcolor: '#0077bd' } }}
              >
                {syncing ? 'Syncing...' : 'Sync Internshala Listings Now'}
              </Button>
            )}
          </Box>
        </Card>
      );
    }

    // 2. Direct CampusSphere filter
    if (sourceFilter === 'CAMPUSSPHERE') {
      return (
        <EmptyState
          title="No Campus Direct internships found"
          message="No on-campus internships have been posted yet. Create an opportunity for your fellow students!"
          action={
            <Button variant="contained" onClick={() => navigate('/internships/post')}>
              Post an Internship
            </Button>
          }
        />
      );
    }

    // 3. All sources filter
    return (
      <EmptyState
        title="No internships match your filters"
        message="Check back soon or post a new opportunity for your fellow peers!"
        action={
          <Button variant="contained" onClick={() => navigate('/internships/post')}>
            Post an Internship
          </Button>
        }
      />
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
            Internship Opportunity Board
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Verified campus, research, and corporate openings — plus real-time aggregated Internshala opportunities.
          </Typography>
          {syncInfo?.lastSyncTime && (
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
              ⚡ Internshala Synced: {formatDate(syncInfo.lastSyncTime)} ({syncInfo.status})
            </Typography>
          )}
          {!syncInfo?.isApiKeyConfigured && syncInfo?.status === 'UNCONFIGURED_API_KEY' && (
            <Typography variant="caption" sx={{ color: '#d97706', display: 'block', mt: 0.5, fontWeight: 600 }}>
              ⚠️ Internshala Aggregator: UPSCRAPE_API_KEY not configured
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {isUserAdmin && (
            <Tooltip title="Synchronize latest Internshala listings via Upscrape API">
              <Button
                variant="outlined"
                color="primary"
                startIcon={syncing ? <CircularProgress size={16} color="inherit" /> : <SyncIcon />}
                onClick={handleTriggerSync}
                disabled={syncing}
                sx={{ borderColor: '#008bdc', color: '#008bdc', '&:hover': { borderColor: '#0077bd', bgcolor: '#f0f9ff' } }}
              >
                {syncing ? 'Syncing...' : 'Sync Internshala'}
              </Button>
            </Tooltip>
          )}
          <Button variant="outlined" onClick={() => navigate('/internships/my-applications')}>
            My Applications & Posts
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/internships/post')}>
            Post Internship
          </Button>
        </Box>
      </Box>

      {/* Filter Section */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by role, company, skills..."
          sx={{ flexGrow: 1, minWidth: '240px' }}
        />

        <FormControl size="small" sx={{ minWidth: 160, bgcolor: '#ffffff' }}>
          <InputLabel>Source</InputLabel>
          <Select
            value={sourceFilter}
            label="Source"
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <MenuItem value="All">All Sources</MenuItem>
            <MenuItem value="CAMPUSSPHERE">Campus Direct</MenuItem>
            <MenuItem value="INTERNSHALA">Internshala</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160, bgcolor: '#ffffff' }}>
          <InputLabel>Work Mode</InputLabel>
          <Select
            value={workModeFilter}
            label="Work Mode"
            onChange={(e) => setWorkModeFilter(e.target.value)}
          >
            <MenuItem value="All">All Modes</MenuItem>
            {WORK_MODES.map((mode) => (
              <MenuItem key={mode.value} value={mode.value}>
                {mode.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Internship Cards Grid */}
      {loading ? (
        <LoadingState message="Fetching active internship opportunities..." />
      ) : fetchError ? (
        <Card sx={{ p: 4, textAlign: 'center', bgcolor: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 2, maxWidth: 650, mx: 'auto', my: 3 }}>
          <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 600, mb: 1 }}>
            Failed to Load Internships
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {fetchError}
          </Typography>
          <Button variant="outlined" color="primary" onClick={loadInternships}>
            Retry
          </Button>
        </Card>
      ) : internships.length === 0 ? (
        renderEmptyState()
      ) : (
        <Grid container spacing={3}>
          {internships.map((item) => (
            <Grid item xs={12} md={6} key={item.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: item.isExternal ? '1px solid #bfdbfe' : '1px solid #e2e8f0' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', textTransform: 'uppercase' }}>
                        {item.companyName}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, mt: 0.2, cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                        onClick={() => navigate(`/internships/${item.id}`)}
                      >
                        {item.title}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center', flexWrap: 'wrap' }}>
                      {item.isExternal || item.sourcePlatform === 'INTERNSHALA' ? (
                        <Chip
                          label="Internshala"
                          size="small"
                          icon={<PublicIcon sx={{ fontSize: '0.85rem !important' }} />}
                          sx={{
                            fontWeight: 700,
                            bgcolor: '#008bdc',
                            color: '#ffffff',
                            '& .MuiChip-icon': { color: '#ffffff' },
                            fontSize: '0.72rem',
                            height: 24,
                          }}
                        />
                      ) : (
                        <Chip
                          label="Campus Direct"
                          size="small"
                          variant="outlined"
                          color="primary"
                          sx={{ fontWeight: 600, fontSize: '0.72rem', height: 24 }}
                        />
                      )}
                      <Chip label={item.workMode} size="small" variant="outlined" color="default" sx={{ fontWeight: 600, fontSize: '0.72rem', height: 24 }} />
                    </Box>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/internships/${item.id}`)}
                  >
                    {item.description}
                  </Typography>

                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                        <LocationIcon fontSize="inherit" sx={{ mr: 0.5, color: 'primary.main' }} />
                        {item.location}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                        <MoneyIcon fontSize="inherit" sx={{ mr: 0.5, color: 'success.main' }} />
                        {item.stipend || 'Unpaid / Experience'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                        <TimeIcon fontSize="inherit" sx={{ mr: 0.5, color: 'primary.main' }} />
                        Duration: {item.duration || 'Flexible'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        ⏳ Deadline: {formatDate(item.applicationDeadline)}
                      </Typography>
                    </Grid>
                  </Grid>

                  {Boolean(item.skillsRequired) && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Required Skills:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {(typeof item.skillsRequired === 'string'
                          ? item.skillsRequired.split(',')
                          : Array.isArray(item.skillsRequired)
                          ? item.skillsRequired
                          : []
                        ).map((skill, idx) => (
                          <Chip key={idx} label={String(skill).trim()} size="small" sx={{ fontSize: '0.7rem', bgcolor: '#f1f5f9' }} />
                        ))}
                      </Box>
                    </Box>
                  )}
                </CardContent>

                <Box sx={{ px: 3, pb: 3, pt: 1, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {isExternalInternship(item) ? 'Aggregated via Internshala' : `Posted by ${item.postedBy?.fullName || 'Campus Member'}`}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/internships/${item.id}`)}
                    >
                      Details
                    </Button>
                    {isExternalInternship(item) ? (
                      <>
                        <Button
                          variant="contained"
                          size="small"
                          endIcon={<LaunchIcon sx={{ fontSize: '0.9rem !important' }} />}
                          onClick={() => handleApplyOnInternshala(item)}
                          sx={{ bgcolor: '#008bdc', '&:hover': { bgcolor: '#0077bd' } }}
                        >
                          Apply on Internshala
                        </Button>
                        {(item.isUserApplied ?? item.userApplied) ? (
                          <Tooltip title="You marked this as applied on Internshala (Self-Reported). Click 'x' to remove tracking.">
                            <Chip
                              label="Applied (Self-Reported) ✓"
                              color="info"
                              size="small"
                              onDelete={() => handleToggleSelfReport(item)}
                              variant="filled"
                              sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                            />
                          </Tooltip>
                        ) : (
                          <Tooltip title="Mark as applied on Internshala for your personal CampusSphere tracking">
                            <Button
                              variant="text"
                              size="small"
                              sx={{ fontSize: '0.75rem', color: 'text.secondary' }}
                              onClick={() => handleToggleSelfReport(item)}
                            >
                              Mark Applied
                            </Button>
                          </Tooltip>
                        )}
                      </>
                    ) : (item.isUserApplied ?? item.userApplied) ? (
                      <Button variant="outlined" color="success" size="small" startIcon={<CheckCircleIcon />} onClick={() => navigate(`/internships/${item.id}`)}>
                        Applied
                      </Button>
                    ) : (item.isExpired ?? item.expired ?? (item.applicationStatus === 'CLOSED')) ? (
                      <Button variant="contained" disabled size="small">
                        Application Closed
                      </Button>
                    ) : (
                      <Button variant="contained" size="small" onClick={() => handleOpenApply(item)}>
                        Apply Now
                      </Button>
                    )}
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Internal CampusSphere Apply Modal Dialog */}
      <Dialog open={applyDialog.open} onClose={() => setApplyDialog({ ...applyDialog, open: false })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          Apply for {applyDialog.item?.title}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Applying to <strong>{applyDialog.item?.companyName}</strong> using your CampusSphere profile credentials ({user?.fullName} • {user?.email} • {user?.department}).
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
              Attach Resume (PDF)
            </Typography>
            <Button variant="outlined" component="label" size="small" sx={{ mb: 1 }}>
              {applyDialog.resumeUrl ? 'Change Resume PDF' : 'Upload Resume PDF'}
              <input
                type="file"
                hidden
                accept="application/pdf,.pdf"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  try {
                    const res = await uploadService.uploadFile(file, 'resumes');
                    setApplyDialog((prev) => ({ ...prev, resumeUrl: res.url }));
                    showToast('Resume uploaded to storage successfully.', 'success');
                  } catch (err) {
                    showToast('Resume upload failed. Please paste link below.', 'warning');
                  }
                }}
              />
            </Button>
            {applyDialog.resumeUrl && (
              <Typography variant="caption" color="success.main" sx={{ display: 'block', wordBreak: 'break-all' }}>
                ✓ Attached: {applyDialog.resumeUrl}
              </Typography>
            )}
          </Box>

          <TextField
            fullWidth
            label="Or Resume / Portfolio URL"
            value={applyDialog.resumeUrl}
            onChange={(e) => setApplyDialog({ ...applyDialog, resumeUrl: e.target.value })}
            size="small"
            placeholder="https://..."
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Brief Cover Note"
            value={applyDialog.coverNote}
            onChange={(e) => setApplyDialog({ ...applyDialog, coverNote: e.target.value })}
            placeholder="Highlight your relevant coursework, projects, or background..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setApplyDialog({ ...applyDialog, open: false })}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleConfirmApply}
            disabled={applyDialog.loading}
          >
            {applyDialog.loading ? 'Submitting...' : 'Submit Application'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* External Internshala Application Guidance Modal */}
      <Dialog
        open={externalDialog.open}
        onClose={() => setExternalDialog({ ...externalDialog, open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <PublicIcon sx={{ color: '#008bdc' }} />
          External Listing: {externalDialog.item?.title}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ p: 2, mb: 2, bgcolor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0369a1', mb: 0.5 }}>
              Original Internshala Page Opened in New Tab
            </Typography>
            <Typography variant="body2" sx={{ color: '#0c4a6e', fontSize: '0.85rem' }}>
              The listing for <strong>{externalDialog.item?.companyName}</strong> has been verified and opened in a secure browser tab.
              Please complete and submit your application directly on the Internshala website.
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            <strong>Important Notice:</strong> CampusSphere never submits your resume, cover note, or campus profile to external organizations.
            Opening the listing tab does not automatically submit an application.
          </Typography>

          <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px dashed #cbd5e1', textAlign: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Track Your Application Status
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
              Did you submit your application on Internshala? You can mark it here for your personal tracking inside CampusSphere.
            </Typography>
            {(externalDialog.item?.isUserApplied ?? externalDialog.item?.userApplied) ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, alignItems: 'center' }}>
                <Chip label="Marked as Applied (Self-Reported)" color="info" size="small" />
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleToggleSelfReport(externalDialog.item)}
                >
                  Remove Status
                </Button>
              </Box>
            ) : (
              <Button
                variant="outlined"
                size="small"
                color="info"
                startIcon={<CheckCircleIcon />}
                onClick={() => handleToggleSelfReport(externalDialog.item)}
              >
                Mark as Applied (Self-Reported)
              </Button>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="text"
            onClick={() => window.open(externalDialog.validUrl, '_blank', 'noopener,noreferrer')}
            endIcon={<LaunchIcon />}
          >
            Re-open Listing Tab
          </Button>
          <Button
            variant="contained"
            onClick={() => setExternalDialog({ ...externalDialog, open: false })}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
