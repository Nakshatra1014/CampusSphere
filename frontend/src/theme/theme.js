import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',      // Official academic blue
      dark: '#0d47a1',      // Deep navy blue
      light: '#e3f2fd',     // Subtle blue background accent
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#334155',      // Slate gray
      light: '#f1f5f9',
      dark: '#0f172a',
    },
    background: {
      default: '#f8fafc',   // Clean light portal background
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',   // Dark navy text
      secondary: '#475569', // Muted slate text
    },
    success: {
      main: '#2e7d32',
      light: '#edf7ed',
    },
    error: {
      main: '#d32f2f',
      light: '#fdeded',
    },
    warning: {
      main: '#ed6c02',
      light: '#fff4e5',
    },
    info: {
      main: '#0288d1',
      light: '#e1f5fe',
    },
    divider: '#e2e8f0',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: '1.875rem',
      fontWeight: 700,
      color: '#0f172a',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#0f172a',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#0f172a',
    },
    h4: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: '#0f172a',
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#0f172a',
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 600,
      color: '#0f172a',
    },
    body1: {
      fontSize: '0.9375rem',
      lineHeight: 1.5,
      color: '#334155',
    },
    body2: {
      fontSize: '0.84375rem',
      lineHeight: 1.45,
      color: '#64748b',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          boxShadow: 'none',
          padding: '6px 16px',
          fontWeight: 500,
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: '#1976d2',
          '&:hover': {
            backgroundColor: '#1565c0',
          },
        },
        outlinedPrimary: {
          borderColor: '#1976d2',
          '&:hover': {
            backgroundColor: '#f0f7ff',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
          backgroundColor: '#ffffff',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        outlined: {
          borderColor: '#e2e8f0',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#0f172a',
          boxShadow: 'none',
          borderBottom: '1px solid #e2e8f0',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 6,
          fontSize: '0.75rem',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: '#f8fafc',
          color: '#334155',
          borderBottom: '1px solid #e2e8f0',
        },
        root: {
          borderColor: '#e2e8f0',
          padding: '12px 16px',
        },
      },
    },
  },
});

export default theme;
