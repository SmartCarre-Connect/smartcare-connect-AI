import React from 'react';
import { motion } from 'framer-motion';
import { UsersRound, CalendarDays, ClipboardCheck, BadgeCheck, Clock3, BellRing, Megaphone, Search, FileBarChart2, Settings } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';

const cards = [
  { title: 'Manage Trainees', description: 'Oversee trainee assignments and status', icon: UsersRound },
  { title: 'Manage Schedules', description: 'Create and adjust staffing schedules', icon: CalendarDays },
  { title: 'Attendance Reports', description: 'Monitor attendance and compliance', icon: ClipboardCheck },
  { title: 'Approve Leave', description: 'Review and approve leave requests', icon: BadgeCheck },
  { title: 'Create Schedule', description: 'Build new duty and shift schedules', icon: Clock3 },
  { title: 'Send Announcement', description: 'Notify staff of updates and events', icon: Megaphone },
  { title: 'Search Staff', description: 'Find staff members quickly', icon: Search },
  { title: 'Reports', description: 'Review weekly and monthly operations', icon: FileBarChart2 },
  { title: 'Notifications', description: 'Receive and dispatch HR activity', icon: BellRing },
  { title: 'Settings', description: 'Configure HR preferences and access', icon: Settings },
];

export default function HrDashboard() {
  return (
    <div className="pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-glass backdrop-blur-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">HR Command Center</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">People operations and scheduling</h1>
        <p className="mt-2 text-sm text-slate-600">The HR workspace is now organized around trainee management, attendance oversight, leave handling, and staff coordination.</p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <GlassCard key={card.title} className="!p-6">
              <div className="inline-flex rounded-2xl bg-blue-50 p-3 text-blue-600">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-900">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
