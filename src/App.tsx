import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/providers/auth-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RoleGuard from '@/components/auth/RoleGuard';
import RoleBasedRedirect from '@/components/auth/RoleBasedRedirect';

// Auth pages
import LoginPage from '@/pages/auth/LoginPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';

// Dashboard pages
import DashboardLayout from '@/pages/dashboard/DashboardLayout';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import TherapistsPage from '@/pages/dashboard/TherapistsPage';
import TherapistDetailPage from '@/pages/dashboard/TherapistDetailPage';
import NewTherapistPage from '@/pages/dashboard/NewTherapistPage';
import SessionsPage from '@/pages/dashboard/SessionsPage';
import SessionDetailPage from '@/pages/dashboard/SessionDetailPage';
import NewSessionPage from '@/pages/dashboard/NewSessionPage';
import ImpactPage from '@/pages/dashboard/ImpactPage';
import AdministrationPage from '@/pages/dashboard/AdministrationPage';
import EntitiesPage from '@/pages/dashboard/EntitiesPage';
import EntityDetailPage from '@/pages/dashboard/EntityDetailPage';
import NewEntityPage from '@/pages/dashboard/NewEntityPage';
import UsersPage from '@/pages/dashboard/UsersPage';
import UserDetailPage from '@/pages/dashboard/UserDetailPage';
import NewUserPage from '@/pages/dashboard/NewUserPage';
import ProjectsPage from '@/pages/dashboard/ProjectsPage';
import ProjectDetailPage from '@/pages/dashboard/ProjectDetailPage';
import NewProjectPage from '@/pages/dashboard/NewProjectPage';
import MySessionsPage from '@/pages/dashboard/MySessionsPage';
import MyReportsPage from '@/pages/dashboard/MyReportsPage';
import MyProfilePage from '@/pages/dashboard/MyProfilePage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<RoleBasedRedirect />} />

            {/* Admin/Coordinator only routes */}
            <Route path="dashboard" element={
              <RoleGuard allowedRoles={['admin', 'coordinator']}>
                <DashboardPage />
              </RoleGuard>
            } />
            <Route path="entities" element={
              <RoleGuard allowedRoles={['admin', 'coordinator']}>
                <EntitiesPage />
              </RoleGuard>
            } />
            <Route path="entities/:id" element={
              <RoleGuard allowedRoles={['admin', 'coordinator']}>
                <EntityDetailPage />
              </RoleGuard>
            } />
            <Route path="entities/new" element={
              <RoleGuard allowedRoles={['admin', 'coordinator']}>
                <NewEntityPage />
              </RoleGuard>
            } />
            <Route path="staff" element={
              <RoleGuard allowedRoles={['admin', 'coordinator']}>
                <TherapistsPage />
              </RoleGuard>
            } />
            <Route path="staff/:id" element={
              <RoleGuard allowedRoles={['admin', 'coordinator']}>
                <TherapistDetailPage />
              </RoleGuard>
            } />
            <Route path="staff/new" element={
              <RoleGuard allowedRoles={['admin', 'coordinator']}>
                <NewTherapistPage />
              </RoleGuard>
            } />
            <Route path="sessions" element={
              <RoleGuard allowedRoles={['admin', 'coordinator']}>
                <SessionsPage />
              </RoleGuard>
            } />
            <Route path="sessions/:id" element={
              <RoleGuard allowedRoles={['admin', 'coordinator']}>
                <SessionDetailPage />
              </RoleGuard>
            } />
            <Route path="sessions/new" element={
              <RoleGuard allowedRoles={['admin', 'coordinator']}>
                <NewSessionPage />
              </RoleGuard>
            } />
            <Route path="impact" element={
              <RoleGuard allowedRoles={['admin', 'coordinator']}>
                <ImpactPage />
              </RoleGuard>
            } />
            <Route path="users" element={
              <RoleGuard allowedRoles={['admin', 'coordinator']}>
                <UsersPage />
              </RoleGuard>
            } />
            <Route path="users/:id" element={
              <RoleGuard allowedRoles={['admin', 'coordinator']}>
                <UserDetailPage />
              </RoleGuard>
            } />
            <Route path="users/new" element={
              <RoleGuard allowedRoles={['admin', 'coordinator']}>
                <NewUserPage />
              </RoleGuard>
            } />
            <Route path="projects" element={
              <RoleGuard allowedRoles={['admin', 'coordinator']}>
                <ProjectsPage />
              </RoleGuard>
            } />
            <Route path="projects/:id" element={
              <RoleGuard allowedRoles={['admin', 'coordinator']}>
                <ProjectDetailPage />
              </RoleGuard>
            } />
            <Route path="projects/new" element={
              <RoleGuard allowedRoles={['admin', 'coordinator']}>
                <NewProjectPage />
              </RoleGuard>
            } />
            <Route path="administration" element={
              <RoleGuard allowedRoles={['admin', 'coordinator']}>
                <AdministrationPage />
              </RoleGuard>
            } />

            {/* Therapist routes - accessible by all authenticated users */}
            <Route path="my-sessions" element={<MySessionsPage />} />
            <Route path="my-reports" element={<MyReportsPage />} />
            <Route path="my-profile" element={<MyProfilePage />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
