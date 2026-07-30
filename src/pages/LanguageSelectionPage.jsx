import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Globe2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const languageCards = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇺🇸', greeting: 'Hello' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', flag: '🇮🇳', greeting: 'नमस्ते' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी', flag: '🇮🇳', greeting: 'नमस्कार' },
];

export default function LanguageSelectionPage() {
  const navigate = useNavigate();
  const { language, setLanguage, currentLanguage } = useLanguage();

  const handleContinue = () => {
    const storedLanguage = window.localStorage.getItem('selected_language');
    if (storedLanguage) {
      navigate('/splash', { replace: true });
      return;
    }
    navigate('/splash', { replace: true });
  };

  return (
    <div className="min-h-screen bg-surface px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto flex max-w-6xl flex-col gap-6"
      >
        <div className="rounded-[32px] border border-slate-200/70 bg-white/80 p-6 shadow-glass backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="flex items-center gap-3 text-sm font-semibold text-brand-600">
            <Sparkles className="h-4 w-4" />
            <span>SmartCare Connect</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Welcome to SmartCare Connect</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">Choose your preferred language</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {languageCards.map((item, index) => {
            const active = language === item.code;
            return (
              <motion.button
                key={item.code}
                initial={{ opacity: 0, y: 18, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setLanguage(item.code)}
                className={`rounded-[28px] border p-6 text-left shadow-glass backdrop-blur-xl transition-all ${active ? 'border-brand-400 bg-brand-50 shadow-[0_18px_40px_rgba(37,99,235,0.16)]' : 'border-slate-200 bg-white/80 hover:border-slate-300'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-3xl">{item.flag}</div>
                    <p className="mt-3 text-xl font-semibold text-slate-900">{item.nativeLabel}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.label}</p>
                  </div>
                  <div className={`rounded-2xl p-2 ${active ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Globe2 className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-6 rounded-2xl border border-slate-200/70 bg-white/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Greeting</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{item.greeting}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      onClick={() => {
                        try {
                          const langCode = item.code === 'hi' ? 'hi-IN' : item.code === 'mr' ? 'mr-IN' : 'en-US';
                          const utter = new window.SpeechSynthesisUtterance(item.greeting);
                          utter.lang = langCode;
                          utter.rate = 1;
                          window.speechSynthesis.cancel();
                          window.speechSynthesis.speak(utter);
                        } catch (e) {
                          // ignore if speech not supported
                        }
                      }}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1 text-sm bg-white hover:bg-slate-50"
                    >
                      Preview Voice
                    </button>
                    <div className="text-xs text-slate-400">Voice preview</div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3 }}
          className="rounded-[28px] border border-slate-200/70 bg-white/80 p-5 shadow-glass backdrop-blur-xl sm:p-7"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Selected language</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{currentLanguage.nativeLabel}</p>
              <p className="mt-1 text-sm text-slate-600">Your preference will be saved and used on future launches.</p>
            </div>
            <button
              onClick={handleContinue}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:opacity-90"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
