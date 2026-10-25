import React, { useState } from 'react';
import {
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  MenuItem,
  Grid,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { DEPARTMENTS, ACADEMIC_YEARS, ROLES } from '../../utils/constants';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useNotifications();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: ROLES.STUDENT,
    department: 'Computer Science & Engineering',
    academicYear: 'Year 1',
    phone: '',
    skills: '',
    bio: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password) {
      setError('Please fill out all required fields.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await register(formData);
      showToast('Registration successful! Welcome to CampusSphere.', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
        Create an Account
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Create your personal campus profile to access all events, ride sharing, and opportunities.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 1.5 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Full Name"
            value={formData.fullName}
            onChange={handleChange('fullName')}
            size="small"
            placeholder="e.g. Aarav Sharma"
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            size="small"
            placeholder="Enter your email"
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleChange('password')}
            size="small"
            placeholder="Min 6 characters"
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel>Role</InputLabel>
            <Select value={formData.role} label="Role" onChange={handleChange('role')}>
              <MenuItem value={ROLES.STUDENT}>Student</MenuItem>
              <MenuItem value={ROLES.FACULTY}>Faculty Member</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel>Academic Year</InputLabel>
            <Select
              value={formData.academicYear}
              label="Academic Year"
              onChange={handleChange('academicYear')}
            >
              {ACADEMIC_YEARS.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth size="small">
            <InputLabel>Department</InputLabel>
            <Select
              value={formData.department}
              label="Department"
              onChange={handleChange('department')}
            >
              {DEPARTMENTS.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Phone Number"
            value={formData.phone}
            onChange={handleChange('phone')}
            size="small"
            placeholder="+1 (555) 000-0000"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Key Skills / Interests"
            value={formData.skills}
            onChange={handleChange('skills')}
            size="small"
            placeholder="e.g. React, Java, UI Design"
          />
        </Grid>
      </Grid>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading}
        sx={{ mt: 3, mb: 2, py: 1.2, fontWeight: 600 }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Complete Registration'}
      </Button>

      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Already registered?{' '}
          <Link to="/login" style={{ color: '#1976d2', fontWeight: 600, textDecoration: 'none' }}>
            Sign in here
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
