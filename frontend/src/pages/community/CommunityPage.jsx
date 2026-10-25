import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  Breadcrumbs,
  Grid,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  HelpOutline as HelpIcon,
  ArrowBack as BackIcon,
  ArrowForward as ArrowIcon,
  MenuBook as ResourceIcon,
  Event as EventIcon,
  Work as WorkIcon,
  DirectionsCar as RideIcon,
  Groups as TeamIcon,
  Storefront as MarketplaceIcon,
  FindInPage as LostFoundIcon,
  MeetingRoom as RoommateIcon,
  Notifications as NotifIcon,
  AutoAwesome as AIIcon,
  InfoOutlined as InfoIcon,
  CheckCircleOutline as CheckIcon,
  WarningAmberOutlined as WarnIcon,
  NavigateNext as NavNextIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HELP_TASKS, HELP_CATEGORIES, ALL_ROLES, ROLE_STUDENT, ROLE_FACULTY, ROLE_ADMIN } from './helpCenterData';

// ─── Icon map per module ──────────────────────────────────────────────────────
const MODULE_ICONS = {
  'Notes & Resources':   <ResourceIcon />,
  'Events':              <EventIcon />,
  'Internship Board':    <WorkIcon />,
  'Ride Sharing':        <RideIcon />,
  'Team Finder':         <TeamIcon />,
  'Marketplace':         <MarketplaceIcon />,
  'Lost & Found':        <LostFoundIcon />,
  'Roommate Finder':     <RoommateIcon />,
  'Notifications':       <NotifIcon />,
  'AI Notes Optimizer':  <AIIcon />,
};

// Color accent per category
const CATEGORY_COLORS = {
  'Academics':               { bg: '#e3f2fd', text: '#0d47a1', border: '#90caf9' },
  'Events':                  { bg: '#f3e5f5', text: '#6a1b9a', border: '#ce93d8' },
  'Internships':             { bg: '#e8f5e9', text: '#1b5e20', border: '#a5d6a7' },
  'Campus Life':             { bg: '#fff8e1', text: '#e65100', border: '#ffcc80' },
  'Marketplace':             { bg: '#fce4ec', text: '#880e4f', border: '#f48fb1' },
  'Account & Notifications': { bg: '#e0f7fa', text: '#006064', border: '#80deea' },
};

// Role display labels
const ROLE_LABELS = {
  ROLE_STUDENT: 'Student',
  ROLE_FACULTY: 'Faculty',
  ROLE_ADMIN:   'Admin',
};

// ─── Local search utility ─────────────────────────────────────────────────────
function scoreTask(task, query) {
  if (!query) return 1;
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/).filter(Boolean);
  let score = 0;
  const titleLower  = task.title.toLowerCase();
  const descLower   = task.description.toLowerCase();
  const kwLower     = task.keywords.join(' ').toLowerCase();
  const moduleLower = task.module.toLowerCase();
  const catLower    = task.category.toLowerCase();
  for (const word of words) {
    if (titleLower.includes(word))  score += 10;
    if (kwLower.includes(word))     score += 6;
    if (descLower.includes(word))   score += 4;
    if (moduleLower.includes(word)) score += 3;
    if (catLower.includes(word))    score += 2;
  }
  return score;
}

// ─── TaskCard component ───────────────────────────────────────────────────────
function TaskCard({ task, onSelect }) {
  const colors = CATEGORY_COLORS[task.category] || CATEGORY_COLORS['Academics'];
  const icon   = MODULE_ICONS[task.module] || <HelpIcon />;
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${colors.border}`,
        transition: 'box-shadow 0.18s, transform 0.18s',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(25,118,210,0.12)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              bgcolor: colors.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.text,
              flexShrink: 0,
            }}
          >
            {React.cloneElement(icon, { fontSize: 'small' })}
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.3 }}>
              {task.title}
            </Typography>
            <Chip
              label={task.module}
              size="small"
              sx={{
                mt: 0.5,
                bgcolor: colors.bg,
                color: colors.text,
                fontWeight: 600,
                fontSize: '0.68rem',
                height: 20,
                border: `1px solid ${colors.border}`,
              }}
            />
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
          {task.description}
        </Typography>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        <Button
          size="small"
          variant="outlined"
          endIcon={<ArrowIcon fontSize="small" />}
          onClick={() => onSelect(task)}
          id={`task-show-steps-${task.id}`}
          sx={{ fontSize: '0.78rem' }}
        >
          Show Steps
        </Button>
      </CardActions>
    </Card>
  );
}

// ─── TaskGuide panel ──────────────────────────────────────────────────────────
function TaskGuide({ task, onBack }) {
  const navigate = useNavigate();
  const colors   = CATEGORY_COLORS[task.category] || CATEGORY_COLORS['Academics'];
  const icon     = MODULE_ICONS[task.module] || <HelpIcon />;

  const roleLabels = !task.requiredRoles || task.requiredRoles === ALL_ROLES
    ? 'All authenticated users'
    : task.requiredRoles.map((r) => ROLE_LABELS[r] || r).join(', ');

  const handleGo = () => navigate(task.route);

  const breadcrumbParts = task.navigationPath.split('→').map((s) => s.trim());

  return (
    <Box>
      <Button
        startIcon={<BackIcon />}
        onClick={onBack}
        sx={{ mb: 2, color: 'text.secondary', pl: 0 }}
        id={`task-guide-back-${task.id}`}
      >
        Back to Help Center
      </Button>

      {/* Header panel */}
      <Paper
        variant="outlined"
        sx={{ p: 3, mb: 3, borderColor: colors.border, bgcolor: colors.bg }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: '#ffffff',
              border: `1px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.text,
            }}
          >
            {React.cloneElement(icon, { fontSize: 'medium' })}
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {task.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Module: <strong>{task.module}</strong>
            </Typography>
          </Box>
        </Box>

        {/* Navigation breadcrumb */}
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: colors.text, display: 'block', mb: 0.5 }}>
            Navigation Path
          </Typography>
          <Breadcrumbs
            separator={<NavNextIcon fontSize="inherit" sx={{ color: colors.text }} />}
            sx={{ '& .MuiBreadcrumbs-ol': { flexWrap: 'wrap' } }}
          >
            {breadcrumbParts.map((part, idx) => (
              <Typography
                key={idx}
                variant="caption"
                sx={{
                  fontWeight: idx === breadcrumbParts.length - 1 ? 700 : 500,
                  color: idx === breadcrumbParts.length - 1 ? colors.text : 'text.secondary',
                  bgcolor: idx === breadcrumbParts.length - 1 ? '#ffffff' : 'transparent',
                  px: idx === breadcrumbParts.length - 1 ? 0.75 : 0,
                  py: idx === breadcrumbParts.length - 1 ? 0.25 : 0,
                  borderRadius: 1,
                }}
              >
                {part}
              </Typography>
            ))}
          </Breadcrumbs>
        </Box>

        {/* Role */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="caption" color="text.secondary">Available to:</Typography>
          <Chip
            label={roleLabels}
            size="small"
            sx={{ bgcolor: '#ffffff', fontWeight: 600, fontSize: '0.7rem', border: `1px solid ${colors.border}` }}
          />
        </Box>
      </Paper>

      {/* Steps */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
        Step-by-Step Instructions
      </Typography>
      <Stepper orientation="vertical" nonLinear sx={{ mb: 3 }}>
        {task.steps.map((step, idx) => (
          <Step key={idx} active>
            <StepLabel>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Step {idx + 1}
              </Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" sx={{ color: 'text.secondary', pb: 1 }}>
                {step}
              </Typography>
            </StepContent>
          </Step>
        ))}
      </Stepper>

      {/* Expected result */}
      <Alert icon={<CheckIcon fontSize="inherit" />} severity="success" sx={{ mb: 2 }}>
        <strong>Expected Result: </strong>{task.expectedResult}
      </Alert>

      {/* Note */}
      {task.note && (
        <Alert icon={<InfoIcon fontSize="inherit" />} severity="info" sx={{ mb: 2 }}>
          {task.note}
        </Alert>
      )}

      {/* Common issues */}
      {task.commonIssues && task.commonIssues.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary' }}>
            Common Issues
          </Typography>
          {task.commonIssues.map((ci, idx) => (
            <Alert key={idx} icon={<WarnIcon fontSize="inherit" />} severity="warning" sx={{ mb: 1 }}>
              <strong>{ci.issue}: </strong>{ci.tip}
            </Alert>
          ))}
        </Box>
      )}

      {/* CTAs */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', pt: 1 }}>
        <Button
          variant="contained"
          size="large"
          endIcon={<ArrowIcon />}
          onClick={handleGo}
          id={`task-guide-go-${task.id}`}
        >
          {task.routeLabel}
        </Button>
        <Button
          variant="outlined"
          size="large"
          startIcon={<BackIcon />}
          onClick={onBack}
        >
          Back to Help Center
        </Button>
      </Box>
    </Box>
  );
}

// ─── Main HelpCenterPage ──────────────────────────────────────────────────────
export default function CommunityPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery]       = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTask, setSelectedTask]     = useState(null);

  const userRole = user?.role;

  // Role filter
  const roleFilteredTasks = useMemo(() => {
    return HELP_TASKS.filter((task) => {
      if (!task.requiredRoles) return true;
      if (!userRole) return true;
      return task.requiredRoles.includes(userRole);
    });
  }, [userRole]);

  // Search + category filter
  const filteredTasks = useMemo(() => {
    let tasks = roleFilteredTasks;
    if (selectedCategory !== 'All') {
      tasks = tasks.filter((t) => t.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      tasks = tasks
        .map((t) => ({ task: t, score: scoreTask(t, searchQuery) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ task }) => task);
    }
    return tasks;
  }, [roleFilteredTasks, selectedCategory, searchQuery]);

  // Popular tasks — one per category
  const popularTasks = useMemo(() => {
    if (searchQuery.trim()) return [];
    const seen = new Set();
    const popular = [];
    for (const cat of ['Academics', 'Events', 'Internships', 'Campus Life', 'Marketplace', 'Account & Notifications']) {
      const match = roleFilteredTasks.find((t) => t.category === cat && !seen.has(t.id));
      if (match) {
        seen.add(match.id);
        popular.push(match);
      }
    }
    return popular;
  }, [roleFilteredTasks, searchQuery]);

  const handleSelectTask = useCallback((task) => {
    setSelectedTask(task);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleBack = useCallback(() => {
    setSelectedTask(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Guide view
  if (selectedTask) {
    return <TaskGuide task={selectedTask} onBack={handleBack} />;
  }

  const isSearchActive = searchQuery.trim().length > 0;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75 }}>
          <HelpIcon sx={{ color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
            CampusSphere Help Center
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Find the right module and follow simple steps to complete your task.
        </Typography>
        {user && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Showing guides for your role: <strong>{ROLE_LABELS[userRole] || userRole}</strong>
          </Typography>
        )}
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          id="help-center-search"
          placeholder="What do you want to do? e.g. Download notes, Register for an event, Apply for an internship, Find a ride"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchQuery('')} id="help-center-search-clear">
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#ffffff',
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
            },
          }}
        />
      </Box>

      {/* Category filters */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4 }}>
        <Chip
          label="All Topics"
          clickable
          id="category-filter-all"
          onClick={() => setSelectedCategory('All')}
          variant={selectedCategory === 'All' ? 'filled' : 'outlined'}
          color={selectedCategory === 'All' ? 'primary' : 'default'}
          sx={{ fontWeight: 600 }}
        />
        {HELP_CATEGORIES.map((cat) => {
          const colors = CATEGORY_COLORS[cat] || {};
          const isActive = selectedCategory === cat;
          return (
            <Chip
              key={cat}
              label={cat}
              clickable
              id={`category-filter-${cat.replace(/\s+/g, '-').replace(/&/g, 'and').toLowerCase()}`}
              onClick={() => setSelectedCategory(isActive ? 'All' : cat)}
              sx={{
                fontWeight: 600,
                bgcolor: isActive ? colors.bg : 'transparent',
                color: isActive ? colors.text : 'text.secondary',
                border: `1px solid ${isActive ? colors.border : '#e2e8f0'}`,
                '&:hover': { bgcolor: colors.bg || '#f1f5f9', color: colors.text || 'text.primary' },
              }}
            />
          );
        })}
      </Box>

      {/* Popular tasks (no search, no category filter) */}
      {!isSearchActive && selectedCategory === 'All' && popularTasks.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
            Popular Tasks
          </Typography>
          <Grid container spacing={2}>
            {popularTasks.map((task) => (
              <Grid item xs={12} sm={6} md={4} key={task.id}>
                <TaskCard task={task} onSelect={handleSelectTask} />
              </Grid>
            ))}
          </Grid>
          <Divider sx={{ mt: 4, mb: 3 }} />
        </Box>
      )}

      {/* Results */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {isSearchActive
              ? `Results for "${searchQuery}"`
              : selectedCategory !== 'All'
              ? `${selectedCategory} Tasks`
              : 'All Tasks'}
          </Typography>
          {filteredTasks.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} found
            </Typography>
          )}
        </Box>

        {filteredTasks.length === 0 ? (
          <Paper
            variant="outlined"
            sx={{ py: 6, px: 3, textAlign: 'center', borderStyle: 'dashed', borderColor: '#cbd5e1', bgcolor: '#f8fafc' }}
          >
            <HelpIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 2 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
              No tasks found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {isSearchActive
                ? `No guide matches "${searchQuery}". Try different keywords such as: download notes, register event, apply internship, find ride.`
                : 'No tasks available for the selected category with your role.'}
            </Typography>
            {isSearchActive && (
              <Button variant="outlined" size="small" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            )}
            {selectedCategory !== 'All' && !isSearchActive && (
              <Button variant="outlined" size="small" onClick={() => setSelectedCategory('All')}>
                Show All Tasks
              </Button>
            )}
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {filteredTasks.map((task) => (
              <Grid item xs={12} sm={6} md={4} key={task.id}>
                <TaskCard task={task} onSelect={handleSelectTask} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ mt: 5, pt: 3, borderTop: '1px solid #e2e8f0' }}>
        <Typography variant="caption" color="text.secondary">
          <strong>CampusSphere Help Center</strong> — A navigation guide only. No AI, LLMs, or external APIs are used.
          All guides are based on the actual CampusSphere modules available to your role.
        </Typography>
      </Box>
    </Box>
  );
}
