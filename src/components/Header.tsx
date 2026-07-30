import React from 'react';
import { Language, UserProfile } from '../types';
import { translations } from '../data/translations';
import {
  Sparkles,
  Globe,
  PhoneCall,
  Video,
  LogOut,
  User,
  Stethoscope,
  Building2,
  GraduationCap,
} from 'lucide-react';

interface HeaderProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  currentUser: UserProfile;
  onLogout: () => void;
  onOpenAiGuide: () => void;
  onOpenAiCallAgent: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  currentUser,
  onLogout,
  onOpenAiGuide,
  onOpenAiCallAgent,
}) => {
  const t = translations[currentLanguage];

  const roleIcons = {
    patient: User,
    doctor: Stethoscope,
    hr: Building2,
    trainee: GraduationCap,
  };

  const RoleIcon = roleIcons[currentUser.role] || User;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white font-black shadow-md shadow-sky-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                Smartcare <span className="text-sky-600">Connect AI</span>
              </h1>
              <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-[10px] font-mono font-bold text-sky-700">
                PRO v3.2
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden lg:block">{t.appSubtitle}</p>
          </div>
        </div>

        {/* Action Controls & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Avatar Walkthrough Launcher */}
          <button
            type="button"
            onClick={onOpenAiGuide}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title={t.watchAiGuide}
          >
            <Video className="w-4 h-4 text-sky-600" />
            <span className="hidden sm:inline">{t.watchAiGuide}</span>
          </button>

          {/* AI Voice Calling Agent Launcher */}
          <button
            type="button"
            onClick={onOpenAiCallAgent}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-200 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <PhoneCall className="w-4 h-4" />
            <span className="hidden sm:inline">{t.callAiAgent}</span>
          </button>

          {/* Language Switcher Dropdown */}
          <div className="relative flex items-center bg-slate-100 border border-slate-200 rounded-full px-3 py-1.5">
            <Globe className="w-3.5 h-3.5 text-sky-600 mr-1.5 shrink-0" />
            <select
              value={currentLanguage}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer uppercase pr-1"
            >
              <option value="en" className="bg-white text-slate-800">English</option>
              <option value="hi" className="bg-white text-slate-800">हिंदी</option>
              <option value="mr" className="bg-white text-slate-800">मराठी</option>
            </select>
          </div>

          {/* User Profile Badge */}
          <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
              <RoleIcon className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider font-mono">
                {currentUser.role}
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={onLogout}
            className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
            title={t.logout}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
