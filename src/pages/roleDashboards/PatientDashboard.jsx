import React from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Stethoscope, Pill, FileText, MapPin, Bot, Bell, ShieldAlert } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';

const cards = [
  { title: 'My Appointments', description: 'Upcoming visits and doctor bookings', icon: CalendarDays },
  { title: 'Doctor Availability', description: 'View available specialists and schedules', icon: Stethoscope },
  { title: 'Medicine Availability', description: 'Check medication stock and availability', icon: Pill },
  { title: 'Medical Reports', description: 'Access your recent lab and scan reports', icon: FileText },
  { title: 'Hospital Navigation', description: 'Locate departments and service areas', icon: MapPin },
  { title: 'AI Assistant', description: 'Ask questions about care and next steps', icon: Bot },
  { title: 'Emergency', description: 'Quick emergency support access', icon: ShieldAlert },
  { title: 'Notifications', description: 'Stay updated on reminders and alerts', icon: Bell },
];

export default function PatientDashboard() {
  return (
    <div className="pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-glass backdrop-blur-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Patient Portal</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Welcome to your care workspace</h1>
        <p className="mt-2 text-sm text-slate-600">Your dashboard is now focused on patient services, appointments, reports, navigation, and support.</p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <GlassCard key={card.title} className="!p-6">
              <div className="inline-flex rounded-2xl bg-brand-50 p-3 text-brand-600">
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
