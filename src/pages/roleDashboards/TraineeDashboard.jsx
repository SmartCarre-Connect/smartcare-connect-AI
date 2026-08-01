import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Building2, UserCircle2, BedDouble, Users, Clock3, CheckCircle2, BellRing, Megaphone, FileText, TrendingUp, Settings, GraduationCap } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { useNavigate } from 'react-router-dom';

const cards = [
  { title: "Today's Duty", description: 'View your current ward assignment and schedule.', icon: ClipboardList, path: '/attendance' },
  { title: 'Current Department', description: 'See the unit you are assigned to for the day.', icon: Building2, path: '/hospital-map' },
  { title: 'Supervisor', description: 'Contact your assigned supervising doctor.', icon: UserCircle2, path: '/doctors' },
  { title: 'Ward Rotation', description: 'Stay aligned with ward activities and patient rounds.', icon: BedDouble, path: '/appointments' },
  { title: "Today's Patients", description: 'Monitor the patients assigned to your rotation.', icon: Users, path: '/doctors' },
  { title: 'Attendance Status', description: 'Track current check-in and shift compliance.', icon: CheckCircle2, path: '/attendance' },
  { title: 'Working Hours', description: 'Monitor active and completed hours.', icon: Clock3, path: '/attendance' },
  { title: 'Announcements', description: 'Read updates shared by the department or HR.', icon: Megaphone, path: '/notifications' },
  { title: 'Leave Request', description: 'Request time-off or emergency leave quickly.', icon: FileText, path: '/profile' },
  { title: 'Performance', description: 'Review progress and evaluation milestones.', icon: TrendingUp, path: '/vitals' },
  { title: 'Notifications', description: 'Receive duty and attendance alerts.', icon: BellRing, path: '/notifications' },
  { title: 'Settings', description: 'Update preferences and contact details.', icon: Settings, path: '/profile' },
];

export default function TraineeDashboard() {
  const navigate = useNavigate();
  const go = (p) => { if (p) navigate(p); };

  return (
    <div className="pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-glass backdrop-blur-xl">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
          <GraduationCap className="h-4 w-4" />
          <span>Trainee Operations</span>
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Your daily hospital duty center</h1>
        <p className="mt-2 text-sm text-slate-600">Track your learning rotation, attendance, and daily responsibilities from one place.</p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="cursor-pointer" onClick={() => go(card.path)}>
              <GlassCard className="!p-6">
                <div className="inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-slate-900">{card.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
              </GlassCard>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <GlassCard className="!p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Today’s Rotation</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">Cardiology OPD and ECG rounds</h2>
          <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
            Supervisor: Dr. Anjali Deshmukh • 09:00 AM to 01:00 PM • Ward 3
          </div>
          <div className="mt-3 rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-600">
            Expect to observe admissions, assist with documentation, and complete supervised patient check-ins.
          </div>
        </GlassCard>

        <GlassCard className="!p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Quick Actions</p>
            <div className="mt-4 space-y-3">
            <button onClick={() => go('/attendance')} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700">Mark Attendance</button>
            <button onClick={() => go('/profile')} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700">Submit Leave Request</button>
            <button onClick={() => go('/notifications')} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700">View Feedback</button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
