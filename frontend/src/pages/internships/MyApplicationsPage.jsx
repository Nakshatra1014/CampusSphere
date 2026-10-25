import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { internshipService } from '../../services/internshipService';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate, formatDateTime } from '../../utils/formatters';
import StatusChip from '../../components/common/StatusChip';
import { LoadingState, EmptyState } from '../../components/common/LoadingState';

export default function MyApplicationsPage() {
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const [activeTab, setActiveTab] = useState(0);
  const [myApplications, setMyApplications] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const [apps, posts] = await Promise.all([
        internshipService.getMyApplications(),
        internshipService.getMyPosts(),
      ]);
      setMyApplications(Array.isArray(apps) ? apps : (Array.isArray(apps?.data) ? apps.data : []));
      setMyPosts(Array.isArray(posts) ? posts : (Array.isArray(posts?.data) ? posts.data : []));
    } catch (err) {
      const msg = err.message || 'Failed to load internship activity.';
      setFetchError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const [withdrawingId, setWithdrawingId] = useState(null);

  const handleWithdraw = async (applicationId, internshipTitle) => {
    if (!window.confirm(`Are you sure you want to withdraw your application for "${internshipTitle}"?`)) {
      return;
    }
    try {
      setWithdrawingId(applicationId);
      await internshipService.withdrawApplication(applicationId);
      showToast('Application withdrawn successfully.', 'success');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to withdraw application.', 'error');
    } finally {
      setWithdrawingId(null);
    }
  };

  const handleRemoveSelfReport = async (internshipId, internshipTitle) => {
    if (!window.confirm(`Remove self-reported application status for "${internshipTitle}"?`)) {
      return;
    }
    try {
      await internshipService.unmarkSelfReportApplied(internshipId);
      showToast('Self-reported application status removed.', 'info');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to remove self-reported status.', 'error');
    }
  };

  if (loading) return <LoadingState message="Loading your internship activity..." />;

  if (fetchError) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/internships')} sx={{ mb: 2.5 }}>
          Back to Internships
        </Button>
        <Card sx={{ p: 4, textAlign: 'center', bgcolor: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 2, maxWidth: 650, mx: 'auto', my: 4 }}>
          <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 600, mb: 1 }}>
            Failed to Load Applications
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {fetchError}
          </Typography>
          <Button variant="outlined" color="primary" onClick={loadData}>
            Retry
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/internships')} sx={{ mb: 2.5 }}>
        Back to Internships
      </Button>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
          My Internship Activity
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track submitted applications and manage opportunities you have posted.
        </Typography>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(e, val) => setActiveTab(val)}
        sx={{ mb: 3, borderBottom: '1px solid #e2e8f0' }}
      >
        <Tab label={`My Submitted Applications (${myApplications.length})`} />
        <Tab label={`My Posted Internships (${myPosts.length})`} />
      </Tabs>

      {activeTab === 0 ? (
        myApplications.length === 0 ? (
          <EmptyState
            title="No applications submitted yet"
            message="Browse the internship board and apply with your CampusSphere profile!"
            action={
              <Button variant="contained" onClick={() => navigate('/internships')}>
                Explore Internships
              </Button>
            }
          />
        ) : (
          <Card>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Role / Title</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Company</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Resume / Notes</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Applied Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {myApplications.map((app) => (
                    <TableRow key={app.id} hover>
                      <TableCell
                        sx={{ fontWeight: 600, color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                        onClick={() => navigate(`/internships/${app.internshipId}`)}
                      >
                        {app.internshipTitle}
                      </TableCell>
                      <TableCell>{app.companyName}</TableCell>
                      <TableCell>
                        {app.isSelfReported ? (
                          <Chip
                            label="Self-Reported"
                            size="small"
                            color="info"
                            variant="filled"
                            sx={{ fontWeight: 600 }}
                          />
                        ) : (
                          <StatusChip status={app.status} />
                        )}
                      </TableCell>
                      <TableCell>
                        {app.isSelfReported ? (
                          <Typography variant="caption" color="text.secondary">
                            Direct on Internshala (No file attached)
                          </Typography>
                        ) : app.resumeUrl ? (
                          <Button size="small" component="a" href={app.resumeUrl} target="_blank" rel="noopener noreferrer">
                            View Resume
                          </Button>
                        ) : (
                          'CampusSphere Profile'
                        )}
                      </TableCell>
                      <TableCell>{formatDateTime(app.appliedAt)}</TableCell>
                      <TableCell align="right">
                        {app.isSelfReported ? (
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            onClick={() => handleRemoveSelfReport(app.internshipId, app.internshipTitle)}
                          >
                            Remove Tracking
                          </Button>
                        ) : (app.status === 'APPLIED' || app.status === 'UNDER_REVIEW') && (
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            disabled={withdrawingId === app.id}
                            onClick={() => handleWithdraw(app.id, app.internshipTitle)}
                          >
                            {withdrawingId === app.id ? 'Withdrawing...' : 'Withdraw'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )
      ) : (
        myPosts.length === 0 ? (
          <EmptyState
            title="No internships posted yet"
            message="Share an open internship, research, or project opening with campus students."
            action={
              <Button variant="contained" onClick={() => navigate('/internships/post')}>
                Post Internship
              </Button>
            }
          />
        ) : (
          <Card>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Company</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Mode</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Deadline</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Total Applicants</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Manage</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {myPosts.map((post) => (
                    <TableRow key={post.id} hover>
                      <TableCell
                        sx={{ fontWeight: 600, color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                        onClick={() => navigate(`/internships/${post.id}`)}
                      >
                        {post.title}
                      </TableCell>
                      <TableCell>{post.companyName}</TableCell>
                      <TableCell>
                        <Chip label={post.workMode} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{formatDate(post.applicationDeadline)}</TableCell>
                      <TableCell>
                        <strong>{post.totalApplications}</strong> applicants
                      </TableCell>
                      <TableCell>
                        <StatusChip status={post.status} />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => navigate(`/internships/${post.id}/applications`)}
                        >
                          Review Applicants
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )
      )}
    </Box>
  );
}
