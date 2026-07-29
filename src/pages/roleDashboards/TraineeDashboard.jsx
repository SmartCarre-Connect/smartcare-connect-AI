import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Building2, UserCircle2, BedDouble, Users, Clock3, CheckCircle2, CalendarRange, BellRing, Megaphone, FileText, TrendingUp, Settings } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';

const cards = [
  { title: "Today's Duty", description: 'View the current duty assignment', icon: ClipboardList },
  { title: 'Current Department', description: 'See assigned ward and department', icon: Building2 },
  { title: 'Supervisor', description: 'Contact the assigned supervisor', icon: UserCircle2 },
  { title: 'Ward', description: 'Stay aligned with ward activities', icon: BedDouble },
  { title: "Today's Patients", description: 'Monitor assigned patients', icon: Users },
  { title: 'Attendance Status', description: 'Track current check-in and hours', icon: CheckCircle2 },
  { title: 'Working Hours', description: 'Monitor active and completed hours', icon: Clock3 },
  { title: 'Announcements', description: 'Read hospital updates from HR', icon: Megaphone },
  { title: 'Leave Request', description: 'Request time-off quickly', icon: FileText },
  { title: 'Performance', description: 'Review progress and milestones', icon: TrendingUp },
  { title: 'Notifications', description: 'Receive duty and attendance alerts', icon: BellRing },
  { title: 'Settings', description: 'Personal preferences and profile updates', icon: Settings },
];

export default function TraineeDashboard() {
  return (
    <div className="pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-glass backdrop-blur-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Trainee Operations</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Your daily hospital duty center</h1>
        <p className="mt-2 text-sm text-slate-600">The trainee experience is now focused on duty visibility, attendance, communication, and performance.</p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <GlassCard key={card.title} className="!p-6">
              <div className="inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-600">
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
