import React from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

export default function SearchBar({ value, onChange, placeholder = 'Search...', onClear, sx }) {
  return (
    <TextField
      size="small"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" sx={{ color: '#94a3b8' }} />
          </InputAdornment>
        ),
        endAdornment: value && (
          <InputAdornment position="end">
            <IconButton size="small" onClick={onClear || (() => onChange(''))}>
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={{
        bgcolor: '#ffffff',
        borderRadius: 1.5,
        '& .MuiOutlinedInput-root': {
          '& fieldset': { borderColor: '#cbd5e1' },
          '&:hover fieldset': { borderColor: '#94a3b8' },
        },
        ...sx,
      }}
    />
  );
}
