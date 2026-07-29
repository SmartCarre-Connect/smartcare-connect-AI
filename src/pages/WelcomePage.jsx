import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Activity, HeartPulse } from 'lucide-react';

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-surface px-4 py-10 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-glass backdrop-blur-xl">
          <div className="flex items-center gap-3 text-sm font-semibold text-brand-600">
            <Sparkles className="h-4 w-4" />
            <span>AI Powered Smart Hospital Operating System</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">SmartCare Connect</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">A secure, role based hospital experience designed for patients, doctors, trainees, HR, and administrators.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/role-selection" className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-500/20">Login</Link>
            <Link to="/register" className="rounded-2xl border border-slate-300 px-5 py-3 font-semibold text-slate-700">Register</Link>
            <a href="#about" className="rounded-2xl border border-slate-300 px-5 py-3 font-semibold text-slate-700">About Hospital</a>
            <a href="#contact" className="rounded-2xl border border-slate-300 px-5 py-3 font-semibold text-slate-700">Contact</a>
          </div>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-glass">
            <ShieldCheck className="h-6 w-6 text-brand-600" />
            <h2 className="mt-3 text-lg font-semibold text-slate-900">Secure access</h2>
            <p className="mt-2 text-sm text-slate-600">Every workflow is protected with role-aware routing and permissions.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-glass">
            <HeartPulse className="h-6 w-6 text-brand-600" />
            <h2 className="mt-3 text-lg font-semibold text-slate-900">Clinical operations</h2>
            <p className="mt-2 text-sm text-slate-600">Appointments, prescriptions, attendance, and notices all stay role-specific.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-glass">
            <Activity className="h-6 w-6 text-brand-600" />
            <h2 className="mt-3 text-lg font-semibold text-slate-900">Enterprise workflow</h2>
            <p className="mt-2 text-sm text-slate-600">Designed to look and behave like a modern hospital management platform.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
