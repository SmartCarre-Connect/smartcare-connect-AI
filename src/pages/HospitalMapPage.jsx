import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, PlayCircle, Stethoscope, Microscope, Ambulance, Pill, Users } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';

const sections = [
  { name: 'Emergency', icon: Ambulance, color: 'from-rose-500 to-orange-500', description: '24/7 emergency intake and trauma response.' },
  { name: 'Diagnostics', icon: Microscope, color: 'from-sky-500 to-cyan-500', description: 'Lab testing, imaging, and diagnostics support.' },
  { name: 'Outpatient', icon: Stethoscope, color: 'from-violet-500 to-fuchsia-500', description: 'Consultation rooms and physician clinics.' },
  { name: 'Pharmacy', icon: Pill, color: 'from-emerald-500 to-teal-500', description: 'Medication pickup and pharmacy services.' },
  { name: 'Admin Desk', icon: Users, color: 'from-amber-500 to-yellow-500', description: 'Visitor support, registration, and staff help.' },
];

export default function HospitalMapPage() {
  return (
    <div className="min-h-screen bg-surface px-4 py-10 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-glass backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Hospital Map</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Navigate every section of the hospital</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">Use this guided map to reach emergency care, diagnostics, pharmacies, and administration quickly and confidently.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">
              <Navigation className="h-4 w-4" />
              Directions ready
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <GlassCard className="!p-8">
            <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <MapPin className="h-4 w-4 text-brand-500" />
                SmartCare Central Hospital layout
              </div>
              <div className="mt-6 grid gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                    <span>Reception & Welcome</span>
                    <span className="text-slate-500">Main Entrance</span>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                    <div className="text-sm font-semibold text-slate-900">North Wing</div>
                    <p className="mt-1 text-sm text-slate-600">Outpatient clinics and consultation rooms.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                    <div className="text-sm font-semibold text-slate-900">South Wing</div>
                    <p className="mt-1 text-sm text-slate-600">Emergency, imaging and diagnostics services.</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                    <span>Pharmacy & Dispensary</span>
                    <span className="text-slate-500">West Corridor</span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="!p-8">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              <PlayCircle className="h-4 w-4" />
              Guided video walkthrough
            </div>
            <h3 className="mt-3 text-xl font-semibold text-slate-900">How to use the app and the map</h3>
            <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-slate-900">
              <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-slate-800 to-slate-700 text-center text-sm font-medium text-slate-200">
                Demo video placeholder — add your hospital orientation video here.
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">You can replace this placeholder with an embedded MP4, YouTube, or Loom walkthrough to help visitors learn the route and app usage.</p>
          </GlassCard>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <GlassCard key={section.name} className="!p-6">
                <div className={`inline-flex rounded-2xl bg-gradient-to-br ${section.color} p-3 text-white`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{section.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{section.description}</p>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
