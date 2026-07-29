import React from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, UserRound, Building2, Pill, Microscope, BarChart3, ShieldCheck, BellRing, Database, Settings2 } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';

const cards = [
  { title: 'Hospital Overview', description: 'Monitor the overall operating picture', icon: BarChart3 },
  { title: 'Manage Users', description: 'Control user and account access', icon: Users },
  { title: 'Manage Doctors', description: 'Manage physician accounts and assignments', icon: Briefcase },
  { title: 'Manage Patients', description: 'Oversee patient records and access', icon: UserRound },
  { title: 'Manage HR', description: 'Coordinate HR and staff administration', icon: Users },
  { title: 'Manage Departments', description: 'Configure departments and wards', icon: Building2 },
  { title: 'Manage Pharmacy', description: 'Maintain pharmacy inventory controls', icon: Pill },
  { title: 'Manage Laboratory', description: 'Coordinate lab workflows and requests', icon: Microscope },
  { title: 'Attendance Analytics', description: 'Analyze workforce attendance insights', icon: BarChart3 },
  { title: 'System Logs', description: 'Review platform operational history', icon: Database },
  { title: 'Permissions', description: 'Control and review RBAC access', icon: ShieldCheck },
  { title: 'Application Settings', description: 'Tune platform-wide configuration', icon: Settings2 },
];

export default function AdminDashboard() {
  return (
    <div className="pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-glass backdrop-blur-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Admin Control Center</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Hospital administration and operations</h1>
        <p className="mt-2 text-sm text-slate-600">The admin experience remains comprehensive and centralized while preserving the existing premium UI.</p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <GlassCard key={card.title} className="!p-6">
              <div className="inline-flex rounded-2xl bg-amber-50 p-3 text-amber-600">
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
