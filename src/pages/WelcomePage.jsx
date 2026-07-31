import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Activity, HeartPulse } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function WelcomePage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-surface px-4 py-10 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-glass backdrop-blur-xl">
          <div className="flex items-center gap-3 text-sm font-semibold text-brand-600">
            <Sparkles className="h-4 w-4" />
            <span>{t('welcome.badge', 'AI Powered Smart Hospital Operating System')}</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{t('welcome.title', 'SmartCare Connect')}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{t('welcome.subtitle', 'A secure, role based hospital experience designed for patients, doctors, trainees, HR, and administrators.')}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/role-selection" className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-500/20">{t('welcome.login', 'Login')}</Link>
            <Link to="/register" className="rounded-2xl border border-slate-300 px-5 py-3 font-semibold text-slate-700">{t('welcome.register', 'Register')}</Link>
            <Link to="/presenter" className="rounded-2xl border border-slate-300 px-5 py-3 font-semibold text-slate-700">{t('welcome.guide', 'Watch App Tour')}</Link>
            <Link to="/hospital-map" className="rounded-2xl border border-slate-300 px-5 py-3 font-semibold text-slate-700">{t('welcome.guideMap', 'Watch AI Guide')}</Link>
            <a href="#about" className="rounded-2xl border border-slate-300 px-5 py-3 font-semibold text-slate-700">{t('welcome.about', 'About Hospital')}</a>
            <a href="#contact" className="rounded-2xl border border-slate-300 px-5 py-3 font-semibold text-slate-700">{t('welcome.contact', 'Contact')}</a>
          </div>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-glass">
            <ShieldCheck className="h-6 w-6 text-brand-600" />
            <h2 className="mt-3 text-lg font-semibold text-slate-900">{t('welcome.secureTitle', 'Secure access')}</h2>
            <p className="mt-2 text-sm text-slate-600">{t('welcome.secureBody', 'Every workflow is protected with role-aware routing and permissions.')}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-glass">
            <HeartPulse className="h-6 w-6 text-brand-600" />
            <h2 className="mt-3 text-lg font-semibold text-slate-900">{t('welcome.clinicalTitle', 'Clinical operations')}</h2>
            <p className="mt-2 text-sm text-slate-600">{t('welcome.clinicalBody', 'Appointments, prescriptions, attendance, and notices all stay role-specific.')}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-glass">
            <Activity className="h-6 w-6 text-brand-600" />
            <h2 className="mt-3 text-lg font-semibold text-slate-900">{t('welcome.workflowTitle', 'Enterprise workflow')}</h2>
            <p className="mt-2 text-sm text-slate-600">{t('welcome.workflowBody', 'Designed to look and behave like a modern hospital management platform.')}</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section id="about" className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-glass">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">About SmartCare</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">A modern hospital experience for patients and staff</h2>
            <p className="mt-3 text-sm text-slate-600">
              SmartCare Connect combines booking, navigation, AI assistance, care reminders, and role-aware dashboards in one guided experience.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>• Fast digital OPD registration and slip generation</li>
              <li>• Indoor hospital mapping and multilingual guidance</li>
              <li>• Secure dashboards for patients, doctors, HR, and admins</li>
            </ul>
          </section>

          <section id="contact" className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-slate-100 shadow-glass">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Contact</p>
            <h2 className="mt-2 text-xl font-semibold">Need help or want a hospital tour?</h2>
            <p className="mt-3 text-sm text-slate-300">Call our care support desk or open the AI guide to explore the platform instantly.</p>
            <div className="mt-4 space-y-2 text-sm">
              <div>📞 +91 1800-200-9999</div>
              <div>✉️ support@smartcareconnect.org</div>
              <div>🕘 Open 24/7 for emergencies and patient support</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
