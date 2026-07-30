import React, { useState, useEffect } from 'react';
import { Language, UserRole, UserProfile } from './types';
import { translations } from './data/translations';
import { SplashScreen } from './components/SplashScreen';
import { LanguageSelect } from './components/LanguageSelect';
import { RoleSelect } from './components/RoleSelect';
import { AuthModal } from './components/AuthModal';
import { AvatarWalkthrough } from './components/AvatarWalkthrough';
import { Header } from './components/Header';
import { OpdRegistration } from './components/OpdRegistration';
import { DoctorAvailability } from './components/DoctorAvailability';
import { MedicineAvailability } from './components/MedicineAvailability';
import { HelpCenter } from './components/HelpCenter';
import { Settings } from './components/Settings';
import { DoctorWorkspace, HrWorkspace, TraineeWorkspace } from './components/RoleDashboards';
import { AiCallingAgent } from './components/AiCallingAgent';
import {
  FileText,
  Stethoscope,
  Pill,
  HelpCircle,
  Settings as SettingsIcon,
  PhoneCall,
  User,
  Building2,
  GraduationCap,
  Sparkles,
  Activity,
  ShieldCheck,
} from 'lucide-react';

export function App() {
  // Step 1: Application Flow Control States
  const [showSplash, setShowSplash] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [showAiCallAgent, setShowAiCallAgent] = useState(false);

  // Step 2: Dashboard Active Tab State
  const [activeTab, setActiveTab] = useState<'opd' | 'doctors' | 'pharmacy' | 'workspace' | 'help' | 'settings'>('opd');

  // Load persisted user & language preferences from localStorage if available
  useEffect(() => {
    const savedLang = localStorage.getItem('smartcare_lang') as Language;
    if (savedLang) {
      setSelectedLanguage(savedLang);
    }

    const savedUserJson = localStorage.getItem('smartcare_user');
    if (savedUserJson) {
      try {
        const u = JSON.parse(savedUserJson);
        setCurrentUser(u);
        if (u.role) setSelectedRole(u.role);
      } catch (err) {
        console.error('Failed to parse stored user:', err);
      }
    }
  }, []);

  const handleLanguageSelect = (lang: Language) => {
    setSelectedLanguage(lang);
    localStorage.setItem('smartcare_lang', lang);
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    // Check if first time login
    const storedCompleted = localStorage.getItem(`onboarding_${user.id}`);
    const isFirstTime = !user.hasCompletedOnboarding && !storedCompleted;

    const updatedUser = {
      ...user,
      hasCompletedOnboarding: !isFirstTime,
    };

    setCurrentUser(updatedUser);
    localStorage.setItem('smartcare_user', JSON.stringify(updatedUser));

    if (isFirstTime) {
      setShowWalkthrough(true);
    }
  };

  const handleWalkthroughComplete = () => {
    setShowWalkthrough(false);
    if (currentUser) {
      const updatedUser = { ...currentUser, hasCompletedOnboarding: true };
      setCurrentUser(updatedUser);
      localStorage.setItem('smartcare_user', JSON.stringify(updatedUser));
      localStorage.setItem(`onboarding_${currentUser.id}`, 'true');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedRole(null);
    localStorage.removeItem('smartcare_user');
  };

  const currentLang = selectedLanguage || 'en';
  const t = translations[currentLang];

  // 1. SPLASH SCREEN STAGE
  if (showSplash) {
    return (
      <SplashScreen
        currentLanguage={currentLang}
        onFinish={() => setShowSplash(false)}
      />
    );
  }

  // 2. LANGUAGE SELECTION STAGE
  if (!selectedLanguage) {
    return (
      <LanguageSelect
        currentLanguage="en"
        onSelectLanguage={handleLanguageSelect}
      />
    );
  }

  // 3. ROLE SELECTION STAGE
  if (!selectedRole) {
    return (
      <RoleSelect
        currentLanguage={currentLang}
        onSelectRole={handleRoleSelect}
        onBackToLanguage={() => setSelectedLanguage(null)}
      />
    );
  }

  // 4. AUTHENTICATION / REGISTRATION STAGE
  if (!currentUser) {
    return (
      <AuthModal
        currentLanguage={currentLang}
        selectedRole={selectedRole}
        onLoginSuccess={handleLoginSuccess}
        onBackToRoles={() => setSelectedRole(null)}
      />
    );
  }

  // 5. FIRST TIME LOGIN AI GUIDED VIDEO ONBOARDING OVERLAY / STAGE
  if (showWalkthrough) {
    return (
      <AvatarWalkthrough
        currentLanguage={currentLang}
        currentUser={currentUser}
        onComplete={handleWalkthroughComplete}
      />
    );
  }

  // 6. MAIN DASHBOARD PORTAL
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950">
      {/* Top Header Nav */}
      <Header
        currentLanguage={currentLang}
        onLanguageChange={handleLanguageSelect}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAiGuide={() => setShowWalkthrough(true)}
        onOpenAiCallAgent={() => setShowAiCallAgent(true)}
      />

      {/* Primary Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto p-1.5 rounded-2xl bg-slate-900 border border-slate-800 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('opd')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'opd'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{t.onlineOpdNav}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('doctors')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'doctors'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>{t.doctorAvailNav}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pharmacy')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'pharmacy'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>{t.medicineAvailNav}</span>
          </button>

          {/* Role Specific Portal Workspace Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('workspace')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'workspace'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {currentUser.role === 'doctor' && <Stethoscope className="w-4 h-4" />}
            {currentUser.role === 'hr' && <Building2 className="w-4 h-4" />}
            {currentUser.role === 'trainee' && <GraduationCap className="w-4 h-4" />}
            {currentUser.role === 'patient' && <User className="w-4 h-4" />}
            <span className="capitalize">{currentUser.role} Portal</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('help')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'help'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>{t.helpCenterNav}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>{t.settingsNav}</span>
          </button>
        </div>

        {/* Dynamic Tab Content Views */}
        {activeTab === 'opd' && (
          <OpdRegistration
            currentLanguage={currentLang}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'doctors' && (
          <DoctorAvailability
            currentLanguage={currentLang}
            onBookDoctor={() => setActiveTab('opd')}
          />
        )}

        {activeTab === 'pharmacy' && (
          <MedicineAvailability
            currentLanguage={currentLang}
          />
        )}

        {activeTab === 'workspace' && (
          <>
            {currentUser.role === 'doctor' && (
              <DoctorWorkspace currentLanguage={currentLang} currentUser={currentUser} />
            )}
            {currentUser.role === 'hr' && (
              <HrWorkspace currentLanguage={currentLang} currentUser={currentUser} />
            )}
            {currentUser.role === 'trainee' && (
              <TraineeWorkspace currentLanguage={currentLang} currentUser={currentUser} />
            )}
            {currentUser.role === 'patient' && (
              <OpdRegistration currentLanguage={currentLang} currentUser={currentUser} />
            )}
          </>
        )}

        {activeTab === 'help' && (
          <HelpCenter
            currentLanguage={currentLang}
            currentUser={currentUser}
            onOpenWalkthrough={() => setShowWalkthrough(true)}
            onOpenAiCallAgent={() => setShowAiCallAgent(true)}
          />
        )}

        {activeTab === 'settings' && (
          <Settings
            currentLanguage={currentLang}
            onLanguageChange={handleLanguageSelect}
            currentUser={currentUser}
            onReplayOnboarding={() => setShowWalkthrough(true)}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Floating AI Call Receptionist Launcher */}
      {!showAiCallAgent && (
        <button
          type="button"
          onClick={() => setShowAiCallAgent(true)}
          className="fixed bottom-6 right-6 z-40 px-5 py-3.5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-extrabold text-xs sm:text-sm shadow-2xl shadow-teal-500/40 flex items-center gap-2.5 hover:scale-105 active:scale-95 cursor-pointer transition-all border border-teal-300/40"
        >
          <PhoneCall className="w-5 h-5 animate-pulse" />
          <span>{t.callAiAgent}</span>
        </button>
      )}

      {/* AI Voice Calling Agent Modal Overlay */}
      {showAiCallAgent && (
        <AiCallingAgent
          currentLanguage={currentLang}
          currentUser={currentUser}
          onClose={() => setShowAiCallAgent(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>SmartCare Connect AI • Multilingual Healthcare Operating Platform</span>
          </div>
          <div className="flex items-center gap-4 font-mono">
            <span>Server: Optimal</span>
            <span>•</span>
            <span>Language: {currentLang.toUpperCase()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
