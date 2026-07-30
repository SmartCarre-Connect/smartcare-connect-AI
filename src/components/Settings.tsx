import React, { useState } from 'react';
import { Language, UserProfile } from '../types';
import { translations } from '../data/translations';
import {
  Settings as SettingsIcon,
  Globe,
  Video,
  User,
  Bell,
  Shield,
  LogOut,
  CheckCircle2,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface SettingsProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  currentUser: UserProfile;
  onReplayOnboarding: () => void;
  onLogout: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  currentLanguage,
  onLanguageChange,
  currentUser,
  onReplayOnboarding,
  onLogout,
}) => {
  const t = translations[currentLanguage];

  const [smsAlerts, setSmsAlerts] = useState(true);
  const [opdNotifications, setOpdNotifications] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSettings = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900/60 via-slate-900 to-slate-900 border border-teal-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-mono mb-3 border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Preferences & Account Controls</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            {t.settingsTitle}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {t.settingsSubtitle}
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{t.settingsSaved}</span>
        </div>
      )}

      {/* Language Preference Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{t.languageSetting}</h3>
            <p className="text-xs text-slate-400">Select default interface and voice language</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { code: 'en', label: 'English', native: 'English' },
            { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
            { code: 'mr', label: 'Marathi', native: 'मराठी' },
          ].map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => onLanguageChange(lang.code as Language)}
              className={`p-4 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                currentLanguage === lang.code
                  ? 'bg-teal-500/15 border-teal-500 text-white font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div>
                <span className="text-sm block">{lang.native}</span>
                <span className="text-[10px] text-slate-500 font-mono uppercase">{lang.label}</span>
              </div>
              {currentLanguage === lang.code && <CheckCircle2 className="w-5 h-5 text-teal-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* AI Onboarding Video Tour Replay */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t.replayOnboarding}</h3>
              <p className="text-xs text-slate-400">Watch the video guide to learn the app flow and key features</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onReplayOnboarding}
            className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t.watchAppTour}</span>
          </button>
        </div>
      </div>

      {/* User Profile Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{t.profile} Management</h3>
            <p className="text-xs text-slate-400">Logged in as {currentUser.role.toUpperCase()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-slate-400 block font-mono">Full Name</span>
            <span className="text-sm font-bold text-white mt-1 block">{currentUser.name}</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-slate-400 block font-mono">Email Address</span>
            <span className="text-sm font-bold text-white mt-1 block font-mono">{currentUser.email}</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-slate-400 block font-mono">Mobile Number</span>
            <span className="text-sm font-bold text-teal-300 mt-1 block font-mono">+91 {currentUser.phone}</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-slate-400 block font-mono">User Role</span>
            <span className="text-sm font-bold text-emerald-400 uppercase mt-1 block font-mono">
              {currentUser.role}
            </span>
          </div>
        </div>
      </div>

      {/* Notifications Preferences */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Notifications & Alerts</h3>
            <p className="text-xs text-slate-400">Manage real-time OPD token and SMS dispatch alerts</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800 cursor-pointer">
            <div>
              <span className="font-bold text-white block">SMS Queue Alerts</span>
              <span className="text-slate-400">Get SMS updates when your OPD token position is coming up</span>
            </div>
            <input
              type="checkbox"
              checked={smsAlerts}
              onChange={(e) => setSmsAlerts(e.target.checked)}
              className="w-5 h-5 accent-teal-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800 cursor-pointer">
            <div>
              <span className="font-bold text-white block">OPD Slip Digital Push</span>
              <span className="text-slate-400">Receive digital copy of OPD tickets directly in app dashboard</span>
            </div>
            <input
              type="checkbox"
              checked={opdNotifications}
              onChange={(e) => setOpdNotifications(e.target.checked)}
              className="w-5 h-5 accent-teal-500 cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Save Settings & Logout Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={handleSaveSettings}
          className="w-full sm:w-auto px-8 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-sm rounded-2xl shadow-lg shadow-teal-500/20 cursor-pointer transition-colors"
        >
          {t.saveSettings}
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="w-full sm:w-auto px-6 py-3.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold rounded-2xl cursor-pointer transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>{t.logout}</span>
        </button>
      </div>
    </div>
  );
};
