import React, { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../layout/Sidebar';
import FloatingAssistant from '../../components/ui/FloatingAssistant';
import { useLanguage } from '../../context/LanguageContext';

export default function RoleShell() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { language } = useLanguage();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center text-xs text-slate-600 font-medium">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          Initializing SmartCare-Connect...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/welcome" replace />;
  }


  return (
    <div className="min-h-screen bg-surface flex overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        <div className="lg:hidden h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center px-4 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl bg-slate-100 text-slate-900 hover:bg-brand-50 hover:text-brand-600 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <span className="ml-4 font-bold text-slate-900 tracking-tight">SmartCare-Connect</span>
        </div>

        <main className="flex-1 overflow-x-hidden overflow-y-auto w-full">
          <div className="max-w-7xl mx-auto w-full p-4 lg:p-8 lg:pt-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
          </main>
            <FloatingAssistant />
        </div>
    </div>
  );
}
