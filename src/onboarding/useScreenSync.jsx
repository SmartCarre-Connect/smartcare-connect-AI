import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Safe screen-sync hook: scrolls/focuses elements, optionally triggers a click, and navigates if requested.
export function useScreenSync() {
  const navigate = useNavigate();

  const findElement = useCallback((selector, timeout = 2000) => new Promise((resolve) => {
    if (!selector || typeof document === 'undefined') return resolve(null);
    const start = Date.now();
    const tryFind = () => {
      const el = document.querySelector(selector);
      if (el) return resolve(el);
      if (Date.now() - start > timeout) return resolve(null);
      requestAnimationFrame(tryFind);
    };
    tryFind();
  }), []);

  const scrollAndFocus = useCallback((el) => {
    try {
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      if (typeof el.focus === 'function') el.focus({ preventScroll: true });
    } catch (e) {}
  }, []);

  const syncToStep = useCallback(async (step = {}, options = {}) => {
    if (!step) return;
    const { navPath, selector, action } = step;
    const { allowClick = false, elementTimeout = 2000 } = options;

    if (navPath) {
      try { navigate(navPath); } catch (e) {}
      // small delay to allow route to render
      await new Promise((r) => setTimeout(r, 300));
    }

    if (selector) {
      const el = await findElement(selector, elementTimeout);
      if (!el) return;
      scrollAndFocus(el);
      if (allowClick && action === 'click') {
        try { el.click(); } catch (e) {}
      }
    }
  }, [navigate, findElement, scrollAndFocus]);

  return { syncToStep };
}

export default useScreenSync;
