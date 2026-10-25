import React from 'react';
import { useAuth } from '../../context/AuthContext';
import StudentDashboard from './StudentDashboard';
import FacultyDashboard from './FacultyDashboard';
import AdminDashboard from './AdminDashboard';
import { LoadingState } from '../../components/common/LoadingState';

export default function DashboardRouter() {
  const { user, loading, isStudent, isFaculty, isAdmin } = useAuth();

  if (loading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  if (isAdmin) {
    return <AdminDashboard />;
  }

  if (isFaculty) {
    return <FacultyDashboard />;
  }

  return <StudentDashboard />;
}
