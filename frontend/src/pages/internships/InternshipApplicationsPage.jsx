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
  MenuItem,
  Select,
  FormControl,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Description as ResumeIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { internshipService } from '../../services/internshipService';
import { useNotifications } from '../../context/NotificationContext';
import { formatDateTime } from '../../utils/formatters';
import StatusChip from '../../components/common/StatusChip';
import { LoadingState, EmptyState } from '../../components/common/LoadingState';

export default function InternshipApplicationsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const [internship, setInternship] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [internshipData, apps] = await Promise.all([
        internshipService.getInternshipById(id),
        internshipService.getApplicationsForInternship(id),
      ]);
      setInternship(internshipData);
      setApplications(apps);
    } catch (err) {
      showToast(err.message || 'Failed to load applications.', 'error');
      navigate('/internships');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      setUpdatingId(appId);
      await internshipService.updateApplicationStatus(id, appId, newStatus);
      showToast(`Application status updated to ${newStatus}. Applicant notified.`, 'success');
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      showToast(err.message || 'Failed to update application status.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/internships/my-applications')}
        sx={{ mb: 2 }}
      >
        Back to My Internships
      </Button>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
          Candidate Applications
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {internship ? `Review applicants for "${internship.title}" at ${internship.companyName}` : 'Applicant Review'}
        </Typography>
      </Box>

      {loading ? (
        <LoadingState message="Loading candidate applications..." />
      ) : applications.length === 0 ? (
        <EmptyState
          title="No candidates have applied yet"
          message="Applications submitted by campus students will appear here for review."
        />
      ) : (
        <Card>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Applicant Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Email & Dept</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Cover Note</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Resume</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Applied On</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Current Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Update Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{app.applicant?.fullName || 'Candidate'}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{app.applicant?.email}</Typography>
                      <Typography variant="caption" color="text.secondary">{app.applicant?.department || 'Department'}</Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography variant="body2" noWrap title={app.coverNote || ''}>
                        {app.coverNote || 'No cover note'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {app.resumeUrl ? (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ResumeIcon />}
                          onClick={() => window.open(app.resumeUrl, '_blank')}
                        >
                          View Resume
                        </Button>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Profile only
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{formatDateTime(app.appliedAt)}</TableCell>
                    <TableCell>
                      <StatusChip status={app.status} />
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 140 }}>
                        <Select
                          value={app.status}
                          disabled={updatingId === app.id}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        >
                          <MenuItem value="APPLIED">APPLIED</MenuItem>
                          <MenuItem value="UNDER_REVIEW">UNDER_REVIEW</MenuItem>
                          <MenuItem value="SELECTED">SELECTED</MenuItem>
                          <MenuItem value="REJECTED">REJECTED</MenuItem>
                          <MenuItem value="WITHDRAWN">WITHDRAWN</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
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
