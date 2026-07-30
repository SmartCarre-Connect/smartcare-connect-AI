import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, ShieldCheck, UserRound, ArrowRight, Sparkles, Stethoscope } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { GlassCard } from '../components/ui/GlassCard';

export default function RoleSelectionPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('trainee');
  const { user, selectRole } = useAuth();
  const { t } = useLanguage();

  const roles = [
    {
      id: 'patient',
      title: t('roles.patientTitle', 'Patient'),
      description: t('roles.patientBody', 'Access appointments, reports, prescriptions and your personal care plan.'),
      icon: UserRound,
      accent: 'from-blue-600 to-cyan-500',
    }, {
      id: 'trainee',
      title: t('roles.traineeTitle', 'Trainee'),
      description: t('roles.traineeBody', 'Join the hospital training workflow and record attendance from the campus zone.'),
      icon: GraduationCap,
      accent: 'from-emerald-500 to-teal-500',
    },
    {
      id: 'hr',
      title: t('roles.hrTitle', 'HR'),
      description: t('roles.hrBody', 'Coordinate employee onboarding, attendance and operational visibility.'),
      icon: Briefcase,
      accent: 'from-blue-600 to-cyan-500',
    },
    {
      id: 'doctor',
      title: t('roles.doctorTitle', 'Doctor'),
      description: t('roles.doctorBody', 'Access hospital resources, appointments, and support tools instantly.'),
      icon: Stethoscope,
      accent: 'from-violet-600 to-fuchsia-500',
    },
  ];

  const handleContinue = () => {
    selectRole(selectedRole);
    if (user) {
      navigate(roleHome(selectedRole));
      return;
    }
    navigate(`/login?role=${selectedRole}`);
  };

  return (
    <div className="min-h-screen bg-surface px-4 py-10 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-glass backdrop-blur-xl"
        >
          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-brand-600">
            <Sparkles className="h-4 w-4" />
            <span>SmartCare Experience Hub</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{t('roles.title', 'Choose your role')}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            {t('roles.subtitle', 'Select the role that best matches your workflow so the app can guide you to the right journey, attendance experience, and hospital tools.')}
          </p>
        </motion.div>

        <div className="grid gap-4 lg:grid-cols-2">
          {roles.map((role) => {
            const Icon = role.icon;
            const active = selectedRole === role.id;
            return (
              <motion.button
                key={role.id}
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRole(role.id)}
                className={`rounded-3xl border p-6 text-left transition-all ${active ? 'border-brand-400 bg-brand-50 shadow-sm' : 'border-slate-200 bg-white/80 hover:border-slate-300'}`}
              >
                <div className={`inline-flex rounded-2xl bg-gradient-to-br ${role.accent} p-3 text-white`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-slate-900">{role.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{role.description}</p>
              </motion.button>
            );
          })}
        </div>

        <GlassCard className="!p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{t('roles.selectedRole', 'Selected role')}</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{roles.find((role) => role.id === selectedRole)?.title}</p>
            </div>
            <button
              onClick={handleContinue}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:opacity-90"
            >
              {t('roles.continue', 'Continue securely')}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
