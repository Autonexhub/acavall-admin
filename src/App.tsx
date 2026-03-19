import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/providers/auth-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

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
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="entities" element={<EntitiesPage />} />
            <Route path="entities/:id" element={<EntityDetailPage />} />
            <Route path="entities/new" element={<NewEntityPage />} />
            <Route path="staff" element={<TherapistsPage />} />
            <Route path="staff/:id" element={<TherapistDetailPage />} />
            <Route path="staff/new" element={<NewTherapistPage />} />
            <Route path="sessions" element={<SessionsPage />} />
            <Route path="sessions/:id" element={<SessionDetailPage />} />
            <Route path="sessions/new" element={<NewSessionPage />} />
            <Route path="impact" element={<ImpactPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="users/:id" element={<UserDetailPage />} />
            <Route path="users/new" element={<NewUserPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/:id" element={<ProjectDetailPage />} />
            <Route path="projects/new" element={<NewProjectPage />} />
            <Route path="my-sessions" element={<MySessionsPage />} />
            <Route path="my-profile" element={<MyProfilePage />} />
            <Route path="administration" element={<AdministrationPage />} />
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
