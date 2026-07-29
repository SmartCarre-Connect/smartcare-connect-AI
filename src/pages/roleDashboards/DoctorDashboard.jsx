import React from 'react';
import { motion } from 'framer-motion';
import { CalendarClock, Users, FileText, Pill, Microscope, Bot, Bell, Activity } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';

const cards = [
  { title: "Today's Appointments", description: 'Review the day’s scheduled consultations', icon: CalendarClock },
  { title: 'Patient List', description: 'Monitor active and upcoming patients', icon: Users },
  { title: 'Patient Medical Records', description: 'Access patient history and clinical notes', icon: FileText },
  { title: 'Digital Prescription', description: 'Create and review prescriptions', icon: Pill },
  { title: 'Lab Requests', description: 'Submit and review lab cases', icon: Microscope },
  { title: 'AI Assistant', description: 'Get support for clinical summaries', icon: Bot },
  { title: 'Notifications', description: 'Stay aligned with inpatient and staff updates', icon: Bell },
  { title: 'Availability Status', description: 'Manage your online availability', icon: Activity },
];

export default function DoctorDashboard() {
  return (
    <div className="pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-glass backdrop-blur-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Doctor Workspace</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Clinical operations dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">This workspace focuses on appointments, records, prescriptions, and care coordination.</p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <GlassCard key={card.title} className="!p-6">
              <div className="inline-flex rounded-2xl bg-violet-50 p-3 text-violet-600">
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
