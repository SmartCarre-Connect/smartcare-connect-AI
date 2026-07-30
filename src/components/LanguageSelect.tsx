import React from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { Globe, Check, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface LanguageSelectProps {
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  onContinue: () => void;
}

export const LanguageSelect: React.FC<LanguageSelectProps> = ({
  currentLanguage,
  onSelectLanguage,
  onContinue,
}) => {
  const t = translations[currentLanguage];

  const languages: { id: Language; name: string; nativeName: string; subtext: string; flag: string }[] = [
    {
      id: 'mr',
      name: 'Marathi',
      nativeName: 'मराठी',
      subtext: 'आरोग्य सुविधा व मार्गदर्शक मराठीत पाहा',
      flag: '🚩',
    },
    {
      id: 'hi',
      name: 'Hindi',
      nativeName: 'हिंदी',
      subtext: 'अस्पताल सेवाएं और सहायता हिंदी में देखें',
      flag: '🇮🇳',
    },
    {
      id: 'en',
      name: 'English',
      nativeName: 'English',
      subtext: 'Healthcare services & guidance in English',
      flag: '🌐',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      <div className="max-w-xl w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold mb-4">
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span>Smartcare Connect AI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 mb-2">
            {t.selectLanguage}
          </h1>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            {t.selectLanguageDesc}
          </p>
        </div>

        {/* Language Options Cards */}
        <div className="space-y-3.5 mb-8">
          {languages.map((lang) => {
            const isSelected = currentLanguage === lang.id;
            return (
              <button
                key={lang.id}
                type="button"
                onClick={() => onSelectLanguage(lang.id)}
                className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex items-center justify-between group cursor-pointer ${
                  isSelected
                    ? 'bg-sky-50/80 border-sky-500 shadow-sm'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                    isSelected ? 'bg-sky-100 text-sky-700' : 'bg-slate-200/70 text-slate-700'
                  }`}>
                    {lang.flag}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-slate-800">{lang.nativeName}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-200/80 text-slate-600 font-mono font-semibold uppercase">
                        {lang.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{lang.subtext}</p>
                  </div>
                </div>

                <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                  isSelected
                    ? 'bg-sky-600 border-sky-500 text-white'
                    : 'border-slate-300 group-hover:border-slate-400'
                }`}>
                  {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onContinue}
          className="w-full py-4 px-6 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-sky-200 uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>{t.continue}</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Multilingual Voice & AI Assistance Enabled</span>
        </div>
      </div>
    </div>
  );
};
