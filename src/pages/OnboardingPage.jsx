import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentLanguage } = useLanguage();
  const { selectedRole, selectRole } = useAuth();

  const params = new URLSearchParams(location.search);
  const roleFromQuery = params.get('role');
  const role = roleFromQuery || selectedRole || (typeof window !== 'undefined' && window.localStorage.getItem('SmartCare-Connect_selected_role')) || 'patient';

  const language = currentLanguage?.label || (typeof window !== 'undefined' && window.localStorage.getItem('selected_language')) || 'English';

  const handleContinue = () => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(`smartcare-onboarding-complete:${role}`, 'true');
        window.localStorage.setItem('SmartCare-Connect_selected_role', role);
      }
    } catch (e) {}

    try { selectRole(role); } catch (e) {}

    navigate(`/login?role=${role}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-slate-100">
      <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-slate-900/70 p-10 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col items-center gap-6 text-center">
          <img src="/assets/logo.svg" alt="SmartCare Connect" className="h-20 w-auto" onError={(e)=>{e.target.style.display='none'}} />
          <h2 className="text-2xl font-extrabold">Preparing your personalized AI guide...</h2>
          <p className="text-sm text-slate-300">Language: <span className="font-semibold text-white">{language}</span></p>
          <p className="text-sm text-slate-300">Role: <span className="font-semibold text-white">{role}</span></p>

          <div className="mt-4 flex items-center justify-center">
            <div className="h-24 w-24 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 p-1">
              <div className="h-full w-full animate-spin rounded-full bg-slate-900/80" />
            </div>
          </div>

          <p className="mt-2 text-sm text-slate-300">Preparing your workspace and saving your role preferences. You will be taken to login once your profile is ready.</p>

          <button
            onClick={handleContinue}
            className="mt-6 inline-flex items-center gap-3 rounded-3xl bg-gradient-to-r from-sky-500 to-cyan-400 px-7 py-3 text-sm font-semibold text-slate-950 shadow-xl shadow-sky-500/30"
          >
            Continue to Login
          </button>
        </div>
      </div>
    </div>
  );
}
