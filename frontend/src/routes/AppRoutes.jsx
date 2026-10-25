import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { ROLES } from '../utils/constants';

// Layouts
import DashboardLayout from '../components/layouts/DashboardLayout';
import AuthLayout from '../components/layouts/AuthLayout';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Dashboard Router
import DashboardRouter from '../pages/dashboard/DashboardRouter';

// Module Pages
import EventsPage from '../pages/events/EventsPage';
import EventDetailsPage from '../pages/events/EventDetailsPage';
import CreateEventPage from '../pages/events/CreateEventPage';
import EditEventPage from '../pages/events/EditEventPage';
import EventFormBuilderPage from '../pages/events/EventFormBuilderPage';
import MyEventsPage from '../pages/events/MyEventsPage';
import MyRegistrationsPage from '../pages/events/MyRegistrationsPage';
import EventParticipantsPage from '../pages/events/EventParticipantsPage';
import AdminEventApprovalPage from '../pages/events/AdminEventApprovalPage';

import InternshipsPage from '../pages/internships/InternshipsPage';
import InternshipDetailsPage from '../pages/internships/InternshipDetailsPage';
import PostInternshipPage from '../pages/internships/PostInternshipPage';
import MyApplicationsPage from '../pages/internships/MyApplicationsPage';
import InternshipApplicationsPage from '../pages/internships/InternshipApplicationsPage';

import ResourcesPage from '../pages/resources/ResourcesPage';
import UploadResourcePage from '../pages/resources/UploadResourcePage';
import MyResourcesPage from '../pages/resources/MyResourcesPage';
import ResourceDetails from '../pages/resources/ResourceDetails';

import RidesPage from '../pages/rides/RidesPage';
import CreateRidePage from '../pages/rides/CreateRidePage';
import MyRidesPage from '../pages/rides/MyRidesPage';

import TeamsPage from '../pages/teams/TeamsPage';
import CreateTeamPage from '../pages/teams/CreateTeamPage';
import MyTeamsPage from '../pages/teams/MyTeamsPage';

import MarketplacePage from '../pages/marketplace/MarketplacePage';
import CreateListingPage from '../pages/marketplace/CreateListingPage';
import MyListingsPage from '../pages/marketplace/MyListingsPage';

import LostFoundPage from '../pages/lostfound/LostFoundPage';
import ReportItemPage from '../pages/lostfound/ReportItemPage';

import RoommatesPage from '../pages/roommates/RoommatesPage';
import RoommateProfilePage from '../pages/roommates/RoommateProfilePage';

import CommunityPage from '../pages/community/CommunityPage';
import NotificationsPage from '../pages/notifications/NotificationsPage';
import ProfilePage from '../pages/profile/ProfilePage';

// Admin Pages
import UserManagementPage from '../pages/admin/UserManagementPage';
import AuditLogsPage from '../pages/admin/AuditLogsPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected Campus Portal Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardRouter />} />

          {/* Module 1: Notes & Academic Resources */}
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/resources/:id" element={<ResourceDetails />} />
          <Route path="/resources/my" element={<MyResourcesPage />} />
          <Route
            path="/resources/upload"
            element={
              <ProtectedRoute allowedRoles={[ROLES.FACULTY, ROLES.ADMIN]} />
            }
          >
            <Route index element={<UploadResourcePage />} />
          </Route>


          {/* Module 4: Event Management */}
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/create" element={<CreateEventPage />} />
          <Route path="/events/my" element={<MyEventsPage />} />
          <Route path="/events/my-registrations" element={<MyEventsPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />
          <Route path="/events/:id/edit" element={<EditEventPage />} />
          <Route path="/events/:id/form-builder" element={<EventFormBuilderPage />} />
          <Route path="/events/:id/participants" element={<EventParticipantsPage />} />

          {/* Module 5: Internship Board */}
          <Route path="/internships" element={<InternshipsPage />} />
          <Route path="/internships/create" element={<PostInternshipPage />} />
          <Route path="/internships/post" element={<PostInternshipPage />} />
          <Route path="/internships/my" element={<MyApplicationsPage />} />
          <Route path="/internships/my-applications" element={<MyApplicationsPage />} />
          <Route path="/my-internship-applications" element={<MyApplicationsPage />} />
          <Route path="/internships/:id" element={<InternshipDetailsPage />} />
          <Route path="/internships/:id/applications" element={<InternshipApplicationsPage />} />

          {/* Module 2: Ride Sharing */}
          <Route path="/rides" element={<RidesPage />} />
          <Route path="/rides/create" element={<CreateRidePage />} />
          <Route path="/rides/my" element={<MyRidesPage />} />
          <Route path="/rides/my-bookings" element={<MyRidesPage initialTab={1} />} />

          {/* Module 3: Team Finder */}
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/teams/create" element={<CreateTeamPage />} />
          <Route path="/teams/my-teams" element={<MyTeamsPage />} />

          {/* Module 3: Marketplace */}
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/marketplace/sell" element={<CreateListingPage />} />
          <Route path="/marketplace/create" element={<CreateListingPage />} />
          <Route path="/marketplace/my" element={<MyListingsPage />} />
          <Route path="/marketplace/my-listings" element={<MyListingsPage />} />

          {/* Lost & Found */}
          <Route path="/lost-found" element={<LostFoundPage />} />
          <Route path="/lost-found/report" element={<ReportItemPage />} />

          {/* Roommate Finder */}
          <Route path="/roommates" element={<RoommatesPage />} />
          <Route path="/roommates/profile" element={<RoommateProfilePage />} />

          {/* Student Community */}
          <Route path="/community" element={<CommunityPage />} />

          {/* Notification Center */}
          <Route path="/notifications" element={<NotificationsPage />} />

          {/* User Profile */}
          <Route path="/profile" element={<ProfilePage />} />

          {/* Administration Desk */}
          <Route
            element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}
          >
            <Route path="/admin/events" element={<AdminEventApprovalPage />} />
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback Redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
