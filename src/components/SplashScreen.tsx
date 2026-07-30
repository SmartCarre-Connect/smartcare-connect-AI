import React, { useEffect } from 'react';
import { Sparkles, HeartPulse, ShieldCheck, Activity } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../data/translations';

interface SplashScreenProps {
  currentLanguage: Language;
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ currentLanguage, onFinish }) => {
  const t = translations[currentLanguage];

  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2400);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col items-center justify-between p-8 overflow-hidden">
      {/* Background glowing gradients */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div />

      {/* Main Logo Showcase */}
      <div className="flex flex-col items-center text-center space-y-6 relative z-10 my-auto animate-fade-in">
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-teal-500 via-emerald-400 to-cyan-400 p-1 shadow-2xl shadow-teal-500/30 flex items-center justify-center">
            <div className="w-full h-full rounded-[1.3rem] bg-slate-950 flex items-center justify-center">
              <HeartPulse className="w-12 h-12 text-teal-400 animate-pulse" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center shadow-lg">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            SmartCare <span className="text-teal-400">Connect AI</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-sm mx-auto font-medium">
            {t.appSubtitle}
          </p>
        </div>

        {/* Loading Spinner */}
        <div className="pt-6 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
            Initializing System...
          </span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center gap-6 text-xs text-slate-500 font-mono relative z-10 pb-4">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Multilingual AI Engine Active</span>
        </span>
        <span className="hidden sm:inline">•</span>
        <span className="hidden sm:flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-teal-400" />
          <span>v3.2 Enterprise</span>
        </span>
      </div>
    </div>
  );
};
