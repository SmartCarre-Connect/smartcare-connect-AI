import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, ShieldCheck, UserRound, ArrowRight, Sparkles, Stethoscope } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { GlassCard } from '../components/ui/GlassCard';
import { roleHome } from '../utils/rbac';

export default function RoleSelectionPage() {
  const navigate = useNavigate();
  const { user, selectRole, selectedRole: currentRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState(currentRole || 'patient');
  const { t } = useLanguage();

  const roles = [
    {
      id: 'patient',
      title: t('roles.patientTitle', 'Patient'),
      description: t('roles.patientBody', 'Access appointments, reports, prescriptions and your personal care plan.'),
      icon: UserRound,
      accent: 'from-blue-600 to-cyan-500',
      highlight: 'Personal health, appointments, reports, navigation',
    },
    {
      id: 'doctor',
      title: t('roles.doctorTitle', 'Doctor'),
      description: t('roles.doctorBody', 'Access hospital resources, appointments, and support tools instantly.'),
      icon: Stethoscope,
      accent: 'from-violet-600 to-fuchsia-500',
      highlight: 'Clinical workflows, consultations, patient records',
    },
    {
      id: 'trainee',
      title: t('roles.traineeTitle', 'Trainee'),
      description: t('roles.traineeBody', 'Join the hospital training workflow and record attendance from the campus zone.'),
      icon: GraduationCap,
      accent: 'from-emerald-500 to-teal-500',
      highlight: 'Training schedule, attendance, learning path',
    },
    {
      id: 'hr',
      title: t('roles.hrTitle', 'HR'),
      description: t('roles.hrBody', 'Coordinate employee onboarding, attendance and operational visibility.'),
      icon: Briefcase,
      accent: 'from-sky-600 to-blue-500',
      highlight: 'Workforce operations, attendance, approvals',
    },
  ];

  const selectedRoleData = roles.find((role) => role.id === selectedRole) || roles[0];

  const handleContinue = () => {
    selectRole(selectedRole);
    try { if (typeof window !== 'undefined') window.localStorage.setItem('selected_role', selectedRole); } catch (e) {}

    const completed = typeof window !== 'undefined' && window.localStorage.getItem(`guide_completed_${selectedRole}`) === 'true';

    if (!completed) {
      navigate(`/onboarding?role=${selectedRole}`);
      return;
    }

    if (user) {
      navigate(roleHome(selectedRole));
      return;
    }

    navigate(`/login?role=${selectedRole}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-10 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 px-8 py-10 shadow-2xl shadow-slate-900/40 backdrop-blur-xl"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.18),_transparent_40%),radial-gradient(circle_at_bottom_left,_rgba(168,85,247,0.16),_transparent_35%)]" />
          <div className="relative z-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-sky-300 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-sky-200" />
                {t('roles.accessLabel', 'Access Portal')}
              </div>
              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                {t('roles.title', 'Choose the role that fits you')}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                {t(
                  'roles.subtitle',
                  'Pick your portal to unlock personalized dashboards, tools, and hospital workflows tailored to your role.'
                )}
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-lg shadow-slate-950/40">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-800/90 text-sky-300 shadow-inner shadow-slate-900/40">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{t('roles.quickStart', 'Quick start')}</p>
                  <p className="mt-2 text-lg font-semibold text-white">{selectedRoleData.title}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-300">{selectedRoleData.description}</p>
              <div className="mt-6 rounded-3xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-300">
                <span className="font-semibold text-white">{t('roles.focus', 'Focus')}:</span> {selectedRoleData.highlight}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-4">
          {roles.map((role) => {
            const Icon = role.icon;
            const active = selectedRole === role.id;
            return (
              <motion.button
                key={role.id}
                whileHover={{ y: -6 }}
                onClick={() => setSelectedRole(role.id)}
                className={`group relative overflow-hidden rounded-[1.75rem] border p-6 text-left transition-all duration-300 ${
                  active
                    ? 'border-sky-300/40 bg-slate-900/90 shadow-[0_30px_80px_-45px_rgba(56,189,248,0.8)]'
                    : 'border-white/10 bg-slate-950/70 hover:border-slate-200/40 hover:bg-slate-900/80'
                }`}
              >
                <div className={`inline-flex items-center justify-center rounded-3xl p-4 text-white shadow-lg ${active ? 'bg-sky-500' : 'bg-slate-800/80'}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-white">{role.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">{role.description}</p>
                <div className="mt-5 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-slate-500">
                  <span>{t('roles.portal', 'Portal')}</span>
                  <span className={`rounded-full px-3 py-1 font-semibold ${active ? 'bg-sky-500/15 text-sky-200' : 'bg-white/5 text-slate-300'}`}>Select</span>
                </div>
                <span
                  className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${role.accent} opacity-0 transition-opacity duration-300 ${active ? 'opacity-100' : 'group-hover:opacity-70'}`}
                />
              </motion.button>
            );
          })}
        </div>

        <GlassCard className="!p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                {t('roles.selectedRole', 'Selected role')}
              </p>
              <p className="mt-2 text-3xl font-extrabold text-white">{selectedRoleData.title}</p>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{selectedRoleData.description}</p>
            </div>

            <button
              onClick={handleContinue}
              className="inline-flex items-center justify-center gap-3 rounded-3xl bg-gradient-to-r from-sky-500 to-cyan-400 px-7 py-3 text-sm font-semibold text-slate-950 shadow-xl shadow-sky-500/30 transition hover:-translate-y-0.5"
            >
              {user ? t('roles.continue', 'Continue securely') : t('roles.loginContinue', 'Continue to login')}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}