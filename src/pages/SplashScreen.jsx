import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { roleHome } from '../utils/rbac';
import { useLanguage } from '../context/LanguageContext';

export default function SplashScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const languageSelected = typeof window !== 'undefined' && !!window.localStorage.getItem('selected_language');
      const selectedRole = typeof window !== 'undefined' && (window.localStorage.getItem('SmartCare-Connect_selected_role') || window.localStorage.getItem('selected_role'));

      if (!languageSelected) {
        navigate('/language-selection', { replace: true });
        return;
      }

      if (user) {
        navigate(roleHome(user.role || selectedRole || 'patient'), { replace: true });
        return;
      }

      navigate('/role-selection', { replace: true });
    }, 1400);

    return () => window.clearTimeout(timer);
  }, [navigate, user]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        className="w-full max-w-md rounded-[32px] border border-slate-200/70 bg-white/80 p-8 text-center shadow-glass backdrop-blur-xl"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/20">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">{t('splash.title', 'SmartCare Connect')}</h1>
        <p className="mt-2 text-sm text-slate-600">{t('splash.subtitle', 'Preparing your secure care experience')}</p>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-200">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
          />
        </div>
      </motion.div>
    </div>
  );
}
