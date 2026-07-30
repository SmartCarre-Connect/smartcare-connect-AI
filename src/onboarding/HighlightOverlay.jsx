import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Renders visual highlights and a cursor animation for onboarding steps.
// Expects entries: { id, selectorOrRect, meta }

export default function HighlightOverlay({ entries = [] }) {
  const [rects, setRects] = useState([]);

  useEffect(() => {
    const compute = () => {
      const next = entries.map((e) => {
        if (!e.selectorOrRect) return null;
        if (typeof e.selectorOrRect === 'string') {
          const el = document.querySelector(e.selectorOrRect);
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { id: e.id, rect: r, meta: e.meta };
        }
        if (e.selectorOrRect && e.selectorOrRect.top !== undefined) {
          return { id: e.id, rect: e.selectorOrRect, meta: e.meta };
        }
        return null;
      }).filter(Boolean);
      setRects(next);
    };
    compute();
    const ro = new ResizeObserver(compute);
    rects.forEach((r) => {
      try { const el = document.elementFromPoint(r.rect.left + 1, r.rect.top + 1); if (el) ro.observe(el); } catch {}
    });
    window.addEventListener('resize', compute);
    window.addEventListener('scroll', compute, true);
    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute, true);
      try { ro.disconnect(); } catch {}
    };
  }, [entries]);

  if (rects.length === 0) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-40">
      {rects.map((r) => (
        <div key={r.id} style={{ position: 'absolute', left: r.rect.left - 8, top: r.rect.top - 8, width: r.rect.width + 16, height: r.rect.height + 16 }}>
          <div className="absolute inset-0 rounded-xl border-2 border-yellow-400/90 shadow-xl" style={{ boxShadow: '0 12px 30px rgba(255,200,50,0.08)' }} />
          <div className="absolute -top-8 left-0 bg-yellow-400 text-xs text-black px-2 py-1 rounded">{r.meta?.label || ''}</div>
          {/* animated cursor */}
          <div style={{ position: 'absolute', right: -28, bottom: -28 }}>
            <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow cursor-pointer animate-pulse"> </div>
          </div>
        </div>
      ))}
    </div>, document.body
  );
}
