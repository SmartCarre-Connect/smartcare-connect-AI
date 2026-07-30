import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { OnboardingProvider } from './onboarding/OnboardingContext';
import RoleShell from './components/layouts/RoleShell';
import { roleHome } from './utils/rbac';
import RoleRoute from './routes/RoleRoute';

import WelcomePage from './pages/WelcomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import RoleSelectionPage from './pages/RoleSelectionPage';
import LanguageSelectionPage from './pages/LanguageSelectionPage';
import SplashScreen from './pages/SplashScreen';
import Dashboard from './pages/Dashboard';
import MedicalReports from './pages/MedicalReports';
import RAGChat from './pages/RAGChat';
import Prescriptions from './pages/Prescriptions';
import Reminders from './pages/Reminders';
import HealthSummaryPage from './pages/HealthSummaryPage';
import MedicalImages from './pages/MedicalImages';
import ChatHistoryPage from './pages/ChatHistoryPage';
import DoctorCopilotPage from './pages/DoctorCopilotPage';
import TimelinePage from './pages/TimelinePage';
import WellnessPage from './pages/WellnessPage';
import EmergencyCardPage from './pages/EmergencyCardPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import HeartRateMonitor from './pages/HeartRateMonitor';
import NotificationsPage from './pages/NotificationsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import DoctorFinderPage from './pages/DoctorFinderPage';
import VitalsTrackerPage from './pages/VitalsTrackerPage';
import AttendancePage from './pages/AttendancePage';
import HospitalMapPage from './pages/HospitalMapPage';
import HelpCenter from './pages/HelpCenter';
import AIVirtualPresenter from './pages/AIVirtualPresenter';
import PresentationManager from './pages/PresentationManager';
import PatientDashboard from './pages/roleDashboards/PatientDashboard';
import DoctorDashboard from './pages/roleDashboards/DoctorDashboard';
import TraineeDashboard from './pages/roleDashboards/TraineeDashboard';
import HrDashboard from './pages/roleDashboards/HrDashboard';
import AdminDashboardPage from './pages/roleDashboards/AdminDashboard';
import IntroVideoPage from './pages/IntroVideoPage';

function InitialRouteRedirect() {
  const { user, selectedRole, loading } = useAuth();
    const languageSelected = typeof window !== 'undefined' && window.localStorage.getItem('selected_language');
  const introWatched = typeof window !== 'undefined' && window.localStorage.getItem('smartcare-intro-watched') === 'true';
  const role = user?.role || selectedRole || (typeof window !== 'undefined' && window.localStorage.getItem('SmartCare-Connect_selected_role')) || 'patient';
  const onboardingCompleted = typeof window !== 'undefined' && window.localStorage.getItem(`smartcare-onboarding-complete:${role}`) === 'true';

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to={roleHome(role)} replace />;
  }

  if (!languageSelected) {
    return <Navigate to="/language-selection" replace />;
  }

  if (!introWatched) {
    return <Navigate to="/intro-video" replace />;
  }

  return <Navigate to="/splash" replace />;
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <OnboardingProvider>
          <Router>
            <Routes>
              <Route path="/" element={<InitialRouteRedirect />} />
              <Route path="/language-selection" element={<LanguageSelectionPage />} />
              <Route path="/intro-video" element={<IntroVideoPage />} />
              <Route path="/splash" element={<SplashScreen />} />
              <Route path="/welcome" element={<WelcomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/role-selection" element={<RoleSelectionPage />} />
              <Route path="/presenter" element={<AIVirtualPresenter />} />
              <Route path="/presenter-manager" element={<RoleRoute allowedRoles={["admin"]}><PresentationManager /></RoleRoute>} />

            <Route element={<RoleShell />}>
              <Route index element={<Dashboard />} />
              <Route path="/patient" element={<RoleRoute allowedRoles={['patient']}><PatientDashboard /></RoleRoute>} />
              <Route path="/doctor" element={<RoleRoute allowedRoles={['doctor']}><DoctorDashboard /></RoleRoute>} />
              <Route path="/trainee" element={<RoleRoute allowedRoles={['trainee']}><TraineeDashboard /></RoleRoute>} />
              <Route path="/hr" element={<RoleRoute allowedRoles={['hr']}><HrDashboard /></RoleRoute>} />
              <Route path="/admin" element={<RoleRoute allowedRoles={['admin']}><AdminDashboardPage /></RoleRoute>} />

              <Route element={<RoleRoute allowedRoles={['patient', 'doctor', 'trainee', 'hr', 'admin']} />}> 
                <Route path="/reports" element={<MedicalReports />} />
                <Route path="/chat" element={<RAGChat />} />
                <Route path="/prescriptions" element={<Prescriptions />} />
                <Route path="/reminders" element={<Reminders />} />
                <Route path="/summary" element={<HealthSummaryPage />} />
                <Route path="/medical-images" element={<MedicalImages />} />
                <Route path="/chat-history" element={<ChatHistoryPage />} />
                <Route path="/doctor-copilot" element={<DoctorCopilotPage />} />
                <Route path="/timeline" element={<TimelinePage />} />
                <Route path="/wellness" element={<WellnessPage />} />
                <Route path="/emergency" element={<EmergencyCardPage />} />
                <Route path="/heart-rate" element={<HeartRateMonitor />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/appointments" element={<AppointmentsPage />} />
                <Route path="/doctors" element={<DoctorFinderPage />} />
                <Route path="/vitals" element={<VitalsTrackerPage />} />
                <Route path="/attendance" element={<AttendancePage />} />
                <Route path="/hospital-map" element={<HospitalMapPage />} />
                <Route path="/help-center" element={<HelpCenter />} />
              </Route>
            </Route>

              <Route path="*" element={<InitialRouteRedirect />} />
            </Routes>
          </Router>
          </OnboardingProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
