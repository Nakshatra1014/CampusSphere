import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  InputAdornment,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  RestartAlt as ResetIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { DEPARTMENTS, RESOURCE_TYPES } from '../../utils/constants';

export default function ResourceFilters({
  searchQuery = '',
  onSearchChange,
  department = 'All',
  onDepartmentChange,
  semester = 'All',
  onSemesterChange,
  resourceType = 'All',
  onResourceTypeChange,
  onReset,
}) {
  const isFiltered =
    searchQuery.trim() !== '' ||
    department !== 'All' ||
    semester !== 'All' ||
    resourceType !== 'All';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        bgcolor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {/* Search input */}
        <TextField
          size="small"
          placeholder="Search by title, subject, tags, topics..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{
            flexGrow: 1,
            minWidth: { xs: '100%', sm: '240px' },
            '& .MuiOutlinedInput-root': {
              bgcolor: '#f8fafc',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#94a3b8' }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Department Filter */}
        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 180 }, bgcolor: '#ffffff' }}>
          <InputLabel>Department</InputLabel>
          <Select
            value={department}
            label="Department"
            onChange={(e) => onDepartmentChange(e.target.value)}
          >
            <MenuItem value="All">All Departments</MenuItem>
            {DEPARTMENTS.map((dept) => (
              <MenuItem key={dept} value={dept}>
                {dept}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Semester Filter */}
        <FormControl size="small" sx={{ minWidth: { xs: '48%', sm: 130 }, bgcolor: '#ffffff' }}>
          <InputLabel>Semester</InputLabel>
          <Select
            value={semester}
            label="Semester"
            onChange={(e) => onSemesterChange(e.target.value)}
          >
            <MenuItem value="All">All Semesters</MenuItem>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <MenuItem key={sem} value={sem}>
                Semester {sem}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Resource Type Filter */}
        <FormControl size="small" sx={{ minWidth: { xs: '48%', sm: 170 }, bgcolor: '#ffffff' }}>
          <InputLabel>Resource Type</InputLabel>
          <Select
            value={resourceType}
            label="Resource Type"
            onChange={(e) => onResourceTypeChange(e.target.value)}
          >
            <MenuItem value="All">All Types</MenuItem>
            {RESOURCE_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Reset button */}
        {isFiltered && (
          <Button
            size="small"
            startIcon={<ResetIcon />}
            onClick={onReset}
            sx={{
              color: '#64748b',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { color: 'primary.main', bgcolor: '#f1f5f9' },
            }}
          >
            Reset
          </Button>
        )}
      </Box>
    </Paper>
  );
}
