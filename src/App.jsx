import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import RoleShell from './components/layouts/RoleShell';
import RoleRoute from './routes/RoleRoute';

import WelcomePage from './pages/WelcomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import RoleSelectionPage from './pages/RoleSelectionPage';
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
import PatientDashboard from './pages/roleDashboards/PatientDashboard';
import DoctorDashboard from './pages/roleDashboards/DoctorDashboard';
import TraineeDashboard from './pages/roleDashboards/TraineeDashboard';
import HrDashboard from './pages/roleDashboards/HrDashboard';
import AdminDashboardPage from './pages/roleDashboards/AdminDashboard';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/welcome" element={<WelcomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/role-selection" element={<RoleSelectionPage />} />

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
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/welcome" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
