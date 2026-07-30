import React from 'react';

// Placeholder avatar component.
// Replace implementation with HeyGen (or other provider) integration later.

export default function AvatarProviderPlaceholder({ language = 'en', voice = 'female', speaking = false, script = '' }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-slate-800 to-slate-600 overflow-hidden shadow-lg flex items-center justify-center">
        {/* Placeholder face */}
        <div className="h-12 w-12 rounded-full bg-white/90" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold">AI Healthcare Guide</div>
        <div className="text-xs text-slate-500">{language.toUpperCase()} • {voice}</div>
        {speaking && <div className="mt-2 text-xs text-slate-600">{script}</div>}
      </div>
    </div>
  );
}
