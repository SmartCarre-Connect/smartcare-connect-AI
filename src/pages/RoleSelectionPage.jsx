import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase,
  ShieldCheck,
  UserRound,
  ArrowRight,
  Sparkles,
  Stethoscope,
  BookOpen, 
  FileText,
  MapPin,
  Clipboard,
  Calendar,
  Users,
  Database,
  Megaphone,
  Building2,
  Check,
} from 'lucide-react';
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
      title: 'Patient',
      subtitle: 'Book appointments • View reports • AI Health Assistant • Hospital navigation',
      features: ['Book appointments', 'View reports', 'AI Health Assistant', 'Hospital navigation'],
      icon: UserRound,
      accent: 'from-blue-600 to-cyan-500',
    },
    {
      id: 'doctor',
      title: 'Doctor',
      subtitle: 'Manage appointments • View patients • Prescriptions • Medical reports',
      features: ['Manage appointments', 'View patients', 'Prescriptions', 'Medical reports'],
      icon: Stethoscope,
      accent: 'from-violet-600 to-fuchsia-500',
    },
    {
      id: 'hr',
      title: 'HR',
      subtitle: 'Staff management • Recruitment • Attendance • Employee records',
      features: ['Staff management', 'Recruitment', 'Attendance', 'Employee records'],
      icon: Briefcase,
      accent: 'from-emerald-500 to-teal-500',
    },
    {
      id: 'admin',
      title: 'Admin',
      subtitle: 'Dashboard • Analytics • Departments • Hospital management • Announcements',
      features: ['Dashboard', 'Analytics', 'Departments', 'Hospital management', 'Users', 'Announcements'],
      icon: Building2,
      accent: 'from-sky-600 to-blue-500',
    },
  ];

  const selectAndProceed = (roleId) => {
    selectRole(roleId);

    const completed = typeof window !== 'undefined' && (
      window.localStorage.getItem(`smartcare-onboarding-complete:${roleId}`) === 'true' ||
      window.localStorage.getItem(`guide_completed_${roleId}`) === 'true'
    );

    if (!completed) {
      navigate(`/onboarding?role=${roleId}`);
      return;
    }

    if (user) {
      navigate(roleHome(roleId));
      return;
    }

    navigate(`/login?role=${roleId}`);
  };

  const handleContinue = () => selectAndProceed(selectedRole);

  const container = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { staggerChildren: 0.08 } },
  };

  const card = {
    hidden: { opacity: 0, y: 12, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 22 } },
    hover: { scale: 1.02 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-12 text-slate-100">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="rounded-[20px] border border-white/6 bg-slate-900/60 p-8 shadow-glass backdrop-blur-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 shadow-md">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="white" fillOpacity="0.08" />
                    <path d="M7 12h10M12 7v10" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-300">SmartCare Connect AI</div>
                  <div className="mt-1 text-2xl font-extrabold text-white tracking-tight">Choose your workspace to continue</div>
                  <div className="mt-2 text-sm text-slate-400 max-w-2xl">Secure AI-powered healthcare platform for Patients, Doctors, HR, and Administrators.</div>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/4 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-sky-200">
                  <Sparkles className="h-4 w-4 text-sky-200" /> Secure Workspace
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ROLE CARDS */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {roles.map((r) => {
            const Active = selectedRole === r.id;
            const Icon = r.icon;
            return (
              <motion.button
                key={r.id}
                onClick={() => { setSelectedRole(r.id); }}
                variants={card}
                whileHover={{ translateY: -6 }}
                className={`group relative flex h-full w-full flex-col items-stretch overflow-hidden rounded-[20px] border p-6 text-left transition-all duration-300 focus:outline-none ${
                  Active
                    ? 'border-sky-400/40 bg-gradient-to-br from-slate-900/80 to-slate-800/60 shadow-[0_30px_80px_-30px_rgba(56,189,248,0.14)]'
                    : 'border-white/6 bg-slate-950/60 hover:border-sky-400/30 hover:shadow-lg'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`inline-flex h-16 w-16 items-center justify-center rounded-xl p-3 shadow-md text-white`} style={{ background: Active ? undefined : undefined }}>
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${r.accent}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-xs font-semibold ${Active ? 'bg-sky-500/15 text-sky-200' : 'bg-white/4 text-slate-300'}`}>{r.title}</div>
                </div>

                <h3 className="mt-4 text-lg font-semibold text-white">{r.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{r.subtitle}</p>

                <ul className="mt-4 space-y-2 text-sm text-slate-300 flex-1">
                  {r.features.slice(0, 6).map((f) => (
                    <li key={f} className="flex items-center gap-3">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/6 text-sky-300">
                        <Check className="h-4 w-4" />
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex items-center justify-between">
                  <button
                    onClick={(e) => { e.stopPropagation(); selectAndProceed(r.id); }}
                    className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                      Active ? 'bg-sky-500 text-white border-transparent shadow' : 'bg-white/4 text-white border-white/6 hover:bg-sky-500 hover:border-transparent'
                    }`}
                  >
                    Continue as {r.title}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <div className="text-xs text-slate-400">{r.features.length} features</div>
                </div>

                <span className={`absolute -inset-x-0 bottom-0 h-1 bg-gradient-to-r ${r.accent} opacity-0 transition-opacity duration-300 ${Active ? 'opacity-100' : 'group-hover:opacity-60'}`} />
              </motion.button>
            );
          })}
        </motion.div>

        {/* BOTTOM CARD */}
        <GlassCard className="!p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-slate-900/50">
              <ShieldCheck className="h-5 w-5 text-sky-300" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Your data is protected</div>
              <div className="text-sm text-slate-400">Your data is protected with enterprise-grade security.</div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4">
            <div className="text-xs text-slate-400">Need help?</div>
            <button onClick={handleContinue} className="rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm">
              Continue
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
