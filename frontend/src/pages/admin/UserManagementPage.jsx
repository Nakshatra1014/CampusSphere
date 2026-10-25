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
  Select,
  MenuItem,
  Chip,
  Switch,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/aiService';
import { useNotifications } from '../../context/NotificationContext';
import { ROLES } from '../../utils/constants';
import SearchBar from '../../components/common/SearchBar';
import { LoadingState } from '../../components/common/LoadingState';

export default function UserManagementPage() {
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers(searchQuery || null);
      setUsers(data);
    } catch (err) {
      showToast(err.message || 'Failed to load users.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [searchQuery]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      showToast('User role updated successfully.', 'success');
      loadUsers();
    } catch (err) {
      showToast(err.message || 'Failed to update user role.', 'error');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await adminService.toggleUserStatus(userId);
      showToast('User account status updated.', 'info');
      loadUsers();
    } catch (err) {
      showToast(err.message || 'Failed to toggle account status.', 'error');
    }
  };

  if (loading) return <LoadingState message="Loading university user directory..." />;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard')} sx={{ mb: 2.5 }}>
        Back to Dashboard
      </Button>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
          User Account Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage student and faculty accounts, escalate permissions, and moderate user access.
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, email, department..."
        />
      </Box>

      <Card>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Academic Year</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Account Status</TableCell>
                <TableCell align="right">Active Toggle</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {u.fullName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {u.email}
                    </Typography>
                  </TableCell>
                  <TableCell>{u.department || '—'}</TableCell>
                  <TableCell>{u.academicYear || '—'}</TableCell>
                  <TableCell>
                    <Select
                      size="small"
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      sx={{ fontSize: '0.8rem', height: 32 }}
                    >
                      <MenuItem value={ROLES.STUDENT}>STUDENT</MenuItem>
                      <MenuItem value={ROLES.FACULTY}>FACULTY</MenuItem>
                      <MenuItem value={ROLES.ADMIN}>ADMIN</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={u.active ? 'Active' : 'Deactivated'}
                      size="small"
                      color={u.active ? 'success' : 'error'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Switch
                      checked={u.active}
                      onChange={() => handleToggleStatus(u.id)}
                      color="primary"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
