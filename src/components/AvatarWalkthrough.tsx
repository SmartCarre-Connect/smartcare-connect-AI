import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { walkthroughSteps } from '../data/mockData';
import { translations } from '../data/translations';
import {
  Volume2,
  VolumeX,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  X,
  CheckCircle2,
  Radio,
  Tv,
} from 'lucide-react';

interface AvatarWalkthroughProps {
  currentLanguage: Language;
  onComplete: () => void;
  isHelpCenterModal?: boolean;
  onCloseModal?: () => void;
}

export const AvatarWalkthrough: React.FC<AvatarWalkthroughProps> = ({
  currentLanguage,
  onComplete,
  isHelpCenterModal = false,
  onCloseModal,
}) => {
  const t = translations[currentLanguage];
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlayingVoice, setIsPlayingVoice] = useState(true);

  const step = walkthroughSteps[currentStepIdx];
  const totalSteps = walkthroughSteps.length;

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const speakStepScript = () => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    if (!isPlayingVoice) return;

    const scriptText = step.script[currentLanguage] || step.script.en;
    const utterance = new SpeechSynthesisUtterance(scriptText);

    if (currentLanguage === 'hi') {
      utterance.lang = 'hi-IN';
    } else if (currentLanguage === 'mr') {
      utterance.lang = 'mr-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  useEffect(() => {
    speakStepScript();
  }, [currentStepIdx, currentLanguage, isPlayingVoice]);

  const handleNext = () => {
    if (currentStepIdx < totalSteps - 1) {
      setCurrentStepIdx((prev) => prev + 1);
    } else {
      if (synthRef.current) synthRef.current.cancel();
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx((prev) => prev - 1);
    }
  };

  const toggleVoice = () => {
    if (isPlayingVoice) {
      if (synthRef.current) synthRef.current.cancel();
      setIsPlayingVoice(false);
    } else {
      setIsPlayingVoice(true);
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden ${isHelpCenterModal ? 'fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md overflow-y-auto' : ''}`}>
      {/* Container */}
      <div className="max-w-6xl w-full mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between my-auto">
        {/* Header bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white font-bold shadow-md shadow-sky-200">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span>{t.aiGuideTitle}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 text-xs font-mono font-bold border border-sky-200">
                  {t.chapter} {currentStepIdx + 1}/{totalSteps}
                </span>
              </h2>
              <p className="text-xs text-slate-500 hidden sm:block">{t.aiGuideSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleVoice}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                isPlayingVoice
                  ? 'bg-sky-50 border-sky-300 text-sky-700'
                  : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              {isPlayingVoice ? <Volume2 className="w-4 h-4 text-sky-600 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{isPlayingVoice ? t.pauseVoiceover : t.playVoiceover}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (synthRef.current) synthRef.current.cancel();
                if (isHelpCenterModal && onCloseModal) onCloseModal();
                else onComplete();
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>{t.skipWalkthrough}</span>
              {isHelpCenterModal ? <X className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Main Interactive Stage */}
        <div className="my-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Phone Frame with AI Avatar Host */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-xs rounded-[2.5rem] border-[6px] border-slate-800 bg-slate-900 shadow-xl p-3 overflow-hidden">
              {/* Phone Speaker Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-950 rounded-full z-20 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800 mr-2" />
                <div className="w-6 h-1 rounded-full bg-slate-800" />
              </div>

              <div className="relative aspect-[9/16] rounded-[2rem] overflow-hidden bg-slate-950 flex flex-col justify-between">
                <img
                  src={step.videoPlaceholderUrl}
                  alt="AI Healthcare Avatar Host"
                  className="absolute inset-0 w-full h-full object-cover opacity-90 transition-opacity duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                <div className="relative z-10 p-4 pt-8 flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white text-[10px] font-extrabold uppercase shadow-md">
                    <Radio className="w-3 h-3 animate-ping" />
                    <span>AI Presenter</span>
                  </div>
                  <div className="px-2.5 py-1 rounded-full bg-slate-900/80 text-sky-400 text-xs font-mono font-bold border border-sky-500/30">
                    {currentLanguage.toUpperCase()} Audio
                  </div>
                </div>

                {isPlayingVoice && (
                  <div className="relative z-10 my-auto flex items-center justify-center gap-1.5 px-6">
                    <div className="w-1.5 h-8 bg-sky-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <div className="w-1.5 h-12 bg-emerald-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <div className="w-1.5 h-16 bg-sky-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    <div className="w-1.5 h-10 bg-emerald-400 rounded-full animate-bounce [animation-delay:450ms]" />
                  </div>
                )}

                <div className="relative z-10 p-4 bg-slate-900/90 border-t border-slate-800 rounded-b-[1.8rem]">
                  <div className="flex items-center gap-1.5 mb-1 text-[11px] text-sky-400 font-bold">
                    <Tv className="w-3.5 h-3.5" />
                    <span>Live Captions ({currentLanguage.toUpperCase()})</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium line-clamp-3">
                    "{step.script[currentLanguage] || step.script.en}"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Step Explanation & Navigation */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest font-mono">
                Smartcare AI Feature Demonstration • Module {currentStepIdx + 1} of {totalSteps}
              </span>
              <h3 className="text-2xl font-bold text-slate-800">
                {t[step.titleKey as keyof typeof t] || step.titleKey}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
                {t[step.descriptionKey as keyof typeof t] || step.descriptionKey}
              </p>
            </div>

            {/* Chapters Checklist */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Walkthrough Modules
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {walkthroughSteps.map((s, idx) => {
                  const isActive = idx === currentStepIdx;
                  const isPassed = idx < currentStepIdx;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setCurrentStepIdx(idx)}
                      className={`text-left p-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between cursor-pointer ${
                        isActive
                          ? 'bg-sky-50 border-sky-500 text-sky-700 shadow-xs'
                          : isPassed
                          ? 'bg-slate-50 border-slate-200 text-slate-600'
                          : 'bg-white border-slate-200 text-slate-400'
                      }`}
                    >
                      <span className="truncate pr-2">
                        {idx + 1}. {t[s.titleKey as keyof typeof t] || s.titleKey}
                      </span>
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : isActive ? (
                        <div className="w-2 h-2 rounded-full bg-sky-600 animate-ping shrink-0" />
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">Ch.{idx + 1}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Action Navigation */}
            <div className="pt-4 flex items-center justify-between gap-4 border-t border-slate-200">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStepIdx === 0}
                className={`px-5 py-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentStepIdx === 0
                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t.back}</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="flex-1 py-3.5 px-6 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-sky-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>
                  {currentStepIdx === totalSteps - 1 ? t.continue : `${t.continue} (Ch.${currentStepIdx + 2})`}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
