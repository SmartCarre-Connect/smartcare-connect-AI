import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

// Onboarding framework context — orchestrates multi-role, multi-language journeys.
// This file intentionally implements framework primitives and placeholders only.

const OnboardingContext = createContext(null);

const STORAGE_PREFIX = 'smartcare-onboarding-';

const defaultStepsByRole = {
  patient: [],
  doctor: [],
  trainee: [],
  hr: [],
  admin: [],
};

export function OnboardingProvider({ children }) {
  const [active, setActive] = useState(false);
  const [role, setRole] = useState(null);
  const [language, setLanguage] = useState(() => (typeof window !== 'undefined' ? (window.localStorage.getItem('selected_language') || 'en') : 'en'));
  const [steps, setSteps] = useState(defaultStepsByRole);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [highlights, setHighlights] = useState([]); // {id, selector, rect, meta}
  const [publishedVersions, setPublishedVersions] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem(`${STORAGE_PREFIX}versions`) || '[]');
    } catch { return []; }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(`${STORAGE_PREFIX}language`, language);
    }
  }, [language]);

  const start = ({ role: r, language: lang }) => {
    setRole(r || role);
    if (lang) setLanguage(lang);
    // load published media/scripts for role from localStorage (admin uploads)
    try {
      const library = JSON.parse(window.localStorage.getItem('smartcare-presenter-media') || '{}');
      // build steps from media library if present; otherwise keep default placeholders
      const roleSteps = (library && library.steps) || defaultStepsByRole[r] || [];
      setSteps((prev) => ({ ...prev, [r]: roleSteps }));
    } catch (e) {
      // ignore
    }
    setCurrentStepIndex(0);
    setActive(true);
  };

  const stop = () => {
    setActive(false);
    // persist completion flag per role
    try { window.localStorage.setItem(`smartcare-onboarding-complete:${role}`, 'true'); } catch (e) {}
  };

  const next = () => {
    setCurrentStepIndex((i) => Math.min(i + 1, getStepsForRole().length - 1));
  };

  const prev = () => {
    setCurrentStepIndex((i) => Math.max(i - 1, 0));
  };

  const goto = (index) => {
    setCurrentStepIndex(Math.max(0, Math.min(index, getStepsForRole().length - 1)));
  };

  const getStepsForRole = (r = role) => steps[r] || [];

  const registerHighlight = (id, selectorOrRect, meta = {}) => {
    setHighlights((prev) => [...prev.filter((h) => h.id !== id), { id, selectorOrRect, meta }]);
  };

  const clearHighlights = () => setHighlights([]);

  // Admin API: publish a version (stores scripts/media in localStorage)
  const publishVersion = ({ role: r, versionName, payload }) => {
    const next = { id: Date.now(), role: r, name: versionName, payload };
    const updated = [...publishedVersions, next];
    setPublishedVersions(updated);
    try { window.localStorage.setItem(`${STORAGE_PREFIX}versions`, JSON.stringify(updated)); } catch (e) {}
    return next;
  };

  const value = useMemo(() => ({
    active,
    role,
    language,
    setLanguage,
    steps,
    currentStepIndex,
    start,
    stop,
    next,
    prev,
    goto,
    registerHighlight,
    clearHighlights,
    highlights,
    publishVersion,
    publishedVersions,
    getStepsForRole,
  }), [active, role, language, steps, currentStepIndex, highlights, publishedVersions]);

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export const useOnboarding = () => useContext(OnboardingContext);

export default OnboardingContext;
