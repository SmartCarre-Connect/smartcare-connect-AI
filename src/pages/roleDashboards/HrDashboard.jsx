import React from 'react';
import { motion } from 'framer-motion';
import { UsersRound, CalendarDays, ClipboardCheck, BadgeCheck, Clock3, BellRing, Megaphone, Search, FileBarChart2, Settings, Building2 } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { useNavigate } from 'react-router-dom';

const cards = [
  { title: 'Manage Trainees', description: 'Oversee trainee assignments, departments, and status.', icon: UsersRound, path: '/attendance' },
  { title: 'Manage Schedules', description: 'Create and adjust staff duty schedules.', icon: CalendarDays, path: '/appointments' },
  { title: 'Attendance Reports', description: 'Monitor attendance trends and compliance.', icon: ClipboardCheck, path: '/vitals' },
  { title: 'Approve Leave', description: 'Review and approve leave requests quickly.', icon: BadgeCheck, path: '/profile' },
  { title: 'Create Schedule', description: 'Build new duty and shift schedules.', icon: Clock3, path: '/appointments' },
  { title: 'Send Announcement', description: 'Notify staff of updates and events.', icon: Megaphone, path: '/notifications' },
  { title: 'Search Staff', description: 'Find staff members quickly.', icon: Search, path: '/doctors' },
  { title: 'Reports', description: 'Review weekly and monthly operations.', icon: FileBarChart2, path: '/vitals' },
  { title: 'Notifications', description: 'Receive and dispatch HR activity.', icon: BellRing, path: '/notifications' },
  { title: 'Settings', description: 'Configure HR preferences and access.', icon: Settings, path: '/profile' },
];

const requests = [
  { name: 'Dr. Sameer Joshi', type: 'Medical Conference Leave', status: 'Pending' },
  { name: 'Pooja Naik', type: 'Emergency Leave Request', status: 'Pending' },
];

export default function HrDashboard() {
  const navigate = useNavigate();
  const go = (p) => { if (p) navigate(p); };

  return (
    <div className="pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-glass backdrop-blur-xl">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
          <Building2 className="h-4 w-4" />
          <span>HR Command Center</span>
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">People operations and scheduling</h1>
        <p className="mt-2 text-sm text-slate-600">Coordinate trainees, staff attendance, leave approvals, and department staffing from one portal.</p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="cursor-pointer" onClick={() => go(card.path)}>
              <GlassCard className="!p-6">
                <div className="inline-flex rounded-2xl bg-blue-50 p-3 text-blue-600">
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
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Pending Requests</p>
          <div className="mt-4 space-y-3">
            {requests.map((request) => (
              <div key={request.name} className="rounded-2xl border border-slate-200 bg-white/70 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{request.name}</p>
                    <p className="text-sm text-slate-600">{request.type}</p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">{request.status}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="!p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Shift Overview</p>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">Morning OPD shift • 18 doctors active</div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">Emergency Night shift • 6 on-call staff</div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">Trainee rotation status • 12 assignments live</div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
