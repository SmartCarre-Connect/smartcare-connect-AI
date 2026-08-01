import React, { useEffect, useState, Suspense } from 'react';
import { MessageCircle } from 'lucide-react';
import AIVirtualPresenter from '../../pages/AIVirtualPresenter';

export default function FloatingAssistant() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    try {
      const token = window.localStorage.getItem('SmartCare-Connect_token');
      // show assistant only if onboarding complete for any role
      const roles = ['patient','doctor','trainee','hr','admin'];
      const found = roles.find((r) => window.localStorage.getItem(`smartcare-onboarding-complete:${r}`) === 'true');
      setVisible(Boolean(found));
      const storedRole = window.localStorage.getItem('SmartCare-Connect_selected_role') || window.localStorage.getItem('selected_role') || 'patient';
      setRole(storedRole?.toLowerCase?.() || 'patient');
    } catch (e) {
      // ignore
    }
  }, []);

  if (!visible) return null;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setOpen(true)}
          title="SmartCare AI Guide"
          className="flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-lg border border-slate-200 text-slate-900"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-3xl rounded-2xl bg-white/95 p-4 shadow-2xl">
            <div className="flex items-center justify-end">
              <button onClick={() => setOpen(false)} className="px-3 py-1 rounded-lg text-sm text-slate-600">Close</button>
            </div>
            <div className="mt-2">
              <Suspense fallback={<div>Loading presenter…</div>}>
                <AIVirtualPresenter embedded roleOverride={role} />
              </Suspense>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
