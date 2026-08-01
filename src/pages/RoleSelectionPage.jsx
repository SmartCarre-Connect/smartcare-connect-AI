import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase,
  GraduationCap,
  ShieldCheck,
  UserRound,
  ArrowRight,
  Sparkles,
  Stethoscope,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { GlassCard } from '../components/ui/GlassCard';
import { roleHome } from '../utils/rbac';
import RoleGuideDialog from '../onboarding/RoleGuideDialog';

export default function RoleSelectionPage() {
  const navigate = useNavigate();

  const { user, selectRole, selectedRole: currentRole } = useAuth();

  const { t } = useLanguage();

  const [selectedRole, setSelectedRole] = useState(
    currentRole || 'patient'
  );

  const [showGuide, setShowGuide] = useState(false);

  const roles = [
    {
      id: 'patient',
      title: t('roles.patientTitle', 'Patient'),
      description: t(
        'roles.patientBody',
        'Access appointments, reports, prescriptions and your personal care plan.'
      ),
      icon: UserRound,
      accent: 'from-blue-600 to-cyan-500',
      highlight:
        'Appointments • AI Chat • Reports • Navigation',
    },
    {
      id: 'doctor',
      title: t('roles.doctorTitle', 'Doctor'),
      description: t(
        'roles.doctorBody',
        'Manage patients, prescriptions and appointments.'
      ),
      icon: Stethoscope,
      accent: 'from-violet-600 to-fuchsia-500',
      highlight:
        'Patients • Prescriptions • Reports',
    },
    {
      id: 'trainee',
      title: t('roles.traineeTitle', 'Trainee'),
      description: t(
        'roles.traineeBody',
        'GPS Attendance and Training Schedule.'
      ),
      icon: GraduationCap,
      accent: 'from-emerald-500 to-teal-500',
      highlight:
        'GPS Attendance • Schedule',
    },
    {
      id: 'hr',
      title: t('roles.hrTitle', 'HR'),
      description: t(
        'roles.hrBody',
        'Manage staff scheduling and attendance.'
      ),
      icon: Briefcase,
      accent: 'from-sky-600 to-blue-500',
      highlight:
        'Schedules • Attendance • Notifications',
    },
  ];

  const selectedRoleData =
    roles.find((r) => r.id === selectedRole) || roles[0];

  const handleContinue = () => {
    selectRole(selectedRole);

    localStorage.setItem(
      'SmartCare-Connect_selected_role',
      selectedRole
    );

    const watched = localStorage.getItem(
      `guide_${selectedRole}`
    );

    if (!watched) {
      setShowGuide(true);
      return;
    }

    if (user) {
      navigate(roleHome(selectedRole));
      return;
    }

    navigate(`/login?role=${selectedRole}`);
  };

  const handleSkip = () => {
    setShowGuide(false);

    localStorage.setItem(
      `guide_${selectedRole}`,
      'skipped'
    );

    navigate(`/login?role=${selectedRole}`);
  };

  const handleWatch = () => {
    setShowGuide(false);

    navigate(
      `/intro-video?role=${selectedRole}`
    );
  };