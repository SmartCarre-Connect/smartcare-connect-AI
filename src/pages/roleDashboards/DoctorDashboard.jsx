import React from 'react';
import { motion } from 'framer-motion';
import { CalendarClock, Users, FileText, Pill, Microscope, Bot, Bell, Activity, Stethoscope } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { useNavigate } from 'react-router-dom';

const cards = [
  { title: "Today's Appointments", description: 'Review scheduled consultations and follow-up visits.', icon: CalendarClock, path: '/appointments' },
  { title: 'Patient Queue', description: 'Monitor active and upcoming patients in the OPD.', icon: Users, path: '/doctors' },
  { title: 'Medical Records', description: 'Access patient history, diagnoses, and clinical notes.', icon: FileText, path: '/reports' },
  { title: 'Digital Prescription', description: 'Create and send e-prescriptions to pharmacy instantly.', icon: Pill, path: '/prescriptions' },
  { title: 'Lab Requests', description: 'Review lab tests, imaging cases, and case notes.', icon: Microscope, path: '/medical-images' },
  { title: 'AI Clinical Assistant', description: 'Summarize symptoms and support care planning.', icon: Bot, path: '/doctor-copilot' },
  { title: 'Notifications', description: 'Stay aligned with ward updates and urgent alerts.', icon: Bell, path: '/notifications' },
  { title: 'Availability Status', description: 'Manage your online presence and consultation mode.', icon: Activity, path: '/profile' },
];

const queue = [
  { name: 'Rahul Sharma', time: '09:30 AM', concern: 'Chest discomfort' },
  { name: 'Priya Deshmukh', time: '10:15 AM', concern: 'Routine cardiac follow-up' },
  { name: 'Sanjay Kulkarni', time: '11:00 AM', concern: 'Hypertension review' },
];

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const go = (p) => { if (p) navigate(p); };

  return (
    <div className="pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-glass backdrop-blur-xl">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
          <Stethoscope className="h-4 w-4" />
          <span>Doctor Workspace</span>
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Clinical operations dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">Track consultations, manage patient flow, and coordinate care from a single workspace.</p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="cursor-pointer" onClick={() => go(card.path)}>
              <GlassCard className="!p-6">
                <div className="inline-flex rounded-2xl bg-violet-50 p-3 text-violet-600">
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
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Today's OPD Flow</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Patient queue and consultation status</h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">3 active</span>
          </div>
          <div className="mt-5 space-y-3">
            {queue.map((patient) => (
              <div key={patient.name} className="rounded-2xl border border-slate-200 bg-white/70 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{patient.name}</p>
                    <p className="text-sm text-slate-600">{patient.concern}</p>
                  </div>
                  <span className="text-sm font-semibold text-brand-600">{patient.time}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="!p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Quick Actions</p>
            <div className="mt-4 space-y-3">
            <button onClick={() => go('/reports')} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700">Review Lab Reports</button>
            <button onClick={() => go('/prescriptions')} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700">Create Prescription</button>
            <button onClick={() => go('/chat')} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700">Send Care Note</button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
