import React from 'react';
import { useOnboarding } from './OnboardingContext';
import AvatarProviderPlaceholder from './AvatarProviderPlaceholder';
import AvatarProviderHeygen from './AvatarProviderHeygen';
import HighlightOverlay from './HighlightOverlay';
import { Play, Pause, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function OnboardingUI() {
  const onboarding = useOnboarding();
  if (!onboarding) return null;

  const steps = onboarding.getStepsForRole() || [];
  const current = steps[onboarding.currentStepIndex] || { id: 'welcome', meta: {}, script: 'Welcome to SmartCare Connect.' };

  return (
    <>
      {/* Overlay highlights */}
      <HighlightOverlay entries={onboarding.highlights} />

      {/* Floating assistant */}
      <div className="fixed bottom-6 left-6 z-50">
        <div className="w-64 rounded-2xl bg-white/95 border border-slate-200 p-3 shadow-xl">
          <div className="flex items-start gap-3">
            {/* Prefer HeyGen provider when a role-level tour has been generated; fallback to placeholder */}
            <AvatarProviderHeygen role={onboarding.role || 'patient'} language={onboarding.language} sectionId={current.id} script={current.script} avatarId={'Daphne_public_1'} />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button onClick={onboarding.prev} className="rounded-lg p-2 bg-slate-50"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={onboarding.next} className="rounded-lg p-2 bg-slate-50"><ChevronRight className="w-4 h-4" /></button>
            <div className="ml-auto text-xs text-slate-500">{onboarding.currentStepIndex + 1}/{Math.max(1, steps.length)}</div>
            <button onClick={onboarding.stop} className="ml-2 rounded-lg px-3 py-1 bg-red-50 text-red-600 text-sm">End</button>
          </div>
        </div>
      </div>
    </>
  );
}
