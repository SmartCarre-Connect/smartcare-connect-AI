import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import {
  HelpCircle,
  PhoneCall,
  Video,
  ChevronDown,
  Sparkles,
  Ambulance,
  Bed,
  ShieldCheck,
} from 'lucide-react';

interface HelpCenterProps {
  currentLanguage: Language;
  onOpenAiCallAgent: () => void;
  onOpenAiGuide: () => void;
}

export const HelpCenter: React.FC<HelpCenterProps> = ({
  currentLanguage,
  onOpenAiCallAgent,
  onOpenAiGuide,
}) => {
  const t = translations[currentLanguage];
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  const faqs: { q: string; a: string }[] = [
    {
      q:
        currentLanguage === 'mr'
          ? 'ऑनलाइन ओपीडी पावती कशी बुक करावी?'
          : currentLanguage === 'hi'
          ? 'ऑनलाइन ओपीडी पर्ची कैसे बुक करें?'
          : 'How to book an Online OPD Token Slip?',
      a:
        currentLanguage === 'mr'
          ? 'ॲपमधील "ऑनलाइन ओपीडी पावती" टॅबवर जा, तुमचा विभाग, डॉक्टर आणि वेळेचा स्लॉट निवडा, आणि त्वरित QR कोड पावती तयार करा.'
          : currentLanguage === 'hi'
          ? 'ऐप में "ऑनलाइन ओपीडी पर्ची" टैब पर जाएं, अपना विभाग, डॉक्टर और समय चुनें और तुरंत क्यूआर कोड पर्ची बनाएं।'
          : 'Go to the "Online OPD Slip" tab, choose your department, preferred doctor, and time slot to instantly generate a QR code OPD ticket.',
    },
    {
      q:
        currentLanguage === 'mr'
          ? 'माझ्या आयुष्मान भारत किंवा MJPJAY कार्डचा वापर कसा करावा?'
          : currentLanguage === 'hi'
          ? 'आयुष्मान भारत या MJPJAY कार्ड का उपयोग कैसे करें?'
          : 'How to use Ayushman Bharat or MJPJAY Health Cards?',
      a:
        currentLanguage === 'mr'
          ? 'ओपीडी पावती नोंदणी करताना शासकीय आरोग्य विमा पर्यायात "आयुष्मान भारत" किंवा "MJPJAY" निवडा. रुग्णालयाच्या काउंटर १ वर कार्ड दाखवा.'
          : currentLanguage === 'hi'
          ? 'ओपीडी पंजीकरण करते समय सरकारी स्वास्थ्य बीमा विकल्प में "आयुष्मान भारत" या "MJPJAY" चुनें। काउंटर #1 पर कार्ड दिखाएं।'
          : 'Select Ayushman Bharat or MJPJAY under Health Schemes during OPD registration. Present your card at Counter #1 for cashless care.',
    },
    {
      q:
        currentLanguage === 'mr'
          ? 'रुग्णालयात आपत्कालीन आणि रुग्णवाहिका क्रमांक कोणता आहे?'
          : currentLanguage === 'hi'
          ? 'अस्पताल का आपातकालीन और एम्बुलेंस नंबर क्या है?'
          : 'What is the 24/7 Hospital Emergency & Ambulance Helpline?',
      a:
        currentLanguage === 'mr'
          ? '२४/७ आपत्कालीन रुग्णवाहिका हेल्पलाइन: +91 1800-200-9999. आमचे आपत्कालीन कक्ष तळमजल्यावर उपलब्ध आहे.'
          : currentLanguage === 'hi'
          ? '24/7 आपातकालीन एम्बुलेंस हेल्पलाइन: +91 1800-200-9999। हमारा आपातकालीन कक्ष भूतल पर उपलब्ध है।'
          : 'Call +91 1800-200-9999 for 24/7 Emergency Ambulance service. Casualty & ICU support are located on the Ground Floor.',
    },
    {
      q:
        currentLanguage === 'mr'
          ? 'फार्मसीमधून औषधे कशी आरक्षित (Reserve) करावीत?'
          : currentLanguage === 'hi'
          ? 'फार्मेसी से दवाएं कैसे बुक करें?'
          : 'How to reserve medicines from the Hospital Pharmacy?',
      a:
        currentLanguage === 'mr'
          ? '"औषध साठा" टॅबमध्ये औषध शोधा आणि "Reserve Medicine" बटणावर क्लिक करा. काउंटर क्र. ३ वर बुकिंग आयडी दाखवून औषध घ्या.'
          : currentLanguage === 'hi'
          ? '"दवा स्टॉक" टैब में दवा खोजें और "Reserve Medicine" बटन पर क्लिक करें। काउंटर नंबर 3 पर बुकिंग आईडी दिखाएं।'
          : 'Search medicines under "Medicine Availability" and click "Reserve Medicine". Show your reservation ID at Pharmacy Counter #3.',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold mb-3 border border-sky-200">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>24/7 Smartcare Support Desk</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
            {t.helpTitle}
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            {t.helpSubtitle}
          </p>
        </div>
      </div>

      {/* AI Voice Agent & Video Guide Launcher Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Launch Voice Agent */}
        <div className="bg-sky-50/70 border border-sky-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-200">
              <PhoneCall className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">AI Voice Calling Agent</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Speak directly with our realistic AI Voice Assistant in Marathi, Hindi, or English for instant hospital guidance.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenAiCallAgent}
            className="w-full py-3.5 px-5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-sky-200 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <PhoneCall className="w-4 h-4" />
            <span>{t.startVoiceCall}</span>
          </button>
        </div>

        {/* Launch Video Walkthrough */}
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-xs">
              <Video className="w-6 h-6 text-sky-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">{t.howToUseTitle}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Watch the interactive AI Avatar video walkthrough again anytime to learn all app features and OPD booking steps.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenAiGuide}
            className="w-full py-3.5 px-5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Video className="w-4 h-4 text-sky-400" />
            <span>{t.replayWalkthrough}</span>
          </button>
        </div>
      </div>

      {/* Emergency Contacts Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-6 rounded-3xl border border-slate-200 text-xs shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
            <Ambulance className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] block">24/7 Ambulance</span>
            <span className="font-bold text-slate-800 text-sm">+91 1800-200-9999</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <Bed className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] block">ICU Bed Status</span>
            <span className="font-bold text-emerald-700">12 Beds Available</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Ayushman Desk</span>
            <span className="font-bold text-slate-800">Counter #1 (Ground Floor)</span>
          </div>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-200">
          <HelpCircle className="w-5 h-5 text-sky-600" />
          <span>Frequently Asked Questions</span>
        </h3>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                  className="w-full p-4 text-left font-bold text-sm text-slate-800 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-sky-600 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
