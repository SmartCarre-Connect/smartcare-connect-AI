import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, PlayCircle, Stethoscope, Microscope, Ambulance, Pill, Users, Video, UserCheck, MessageSquare, CalendarDays, ShieldCheck, Film, UserCircle2 } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';

const TUTORIAL_VIDEOS = {
  en: {
    label: 'English',
    title: 'AI Guide: Use the SmartCare app',
    subtitle: 'Step-by-step multilingual walkthrough for login, navigation, map directions, chatbot, appointments, and emergency support.',
    videoUrl: 'https://www.youtube.com/embed/YP6x_NGk5Eg?cc_lang_pref=en&hl=en',
    videoNote: 'This English AI avatar walkthrough shows how to login, move through the hospital map, use the AI help center, and open appointments or emergency support.',
    features: [
      { title: 'Login & Role Selection', description: 'Open the app, login with your credentials, and select your role to unlock patient, doctor, HR, or admin tools.' },
      { title: 'Hospital Navigation', description: 'Use the map view to find emergency, diagnostics, pharmacy and admin departments quickly.' },
      { title: 'AI Help Center', description: 'Ask the chatbot for help in plain language and get instructions for every app feature.' },
      { title: 'Appointments & Reports', description: 'Book visits, upload reports, and manage reminders with simple guided steps.' },
    ],
  },
  hi: {
    label: 'Hindi',
    title: 'AI मार्गदर्शक: SmartCare ऐप कैसे उपयोग करें',
    subtitle: 'लॉगिन, नक्शा, चैटबोट, अपॉइमेंट और आपातकालीन सहायता के लिए पूर्ण हिंदी मार्गदर्शिका।',
    videoUrl: 'https://www.youtube.com/embed/YP6x_NGk5Eg?cc_lang_pref=hi&hl=hi',
    videoNote: 'यह हिंदी AI वीडियो बताएगा कि कैसे login करें, hospital map देखें, AI हेल्प सेंटर इस्तेमाल करें और emergency सपोर्ट प्राप्त करें।',
    features: [
      { title: 'लॉगिन और भूमिका', description: 'ऐप खोलें, अपने क्रेडेंशियल से लॉगिन करें और मरीज, डॉक्टर, HR या एडमिन के लिए भूमिका चुनें।' },
      { title: 'नक्शा नेविगेशन', description: 'आपातकालीन, निदान, फार्मेसी और प्रशासन विभाग आसानी से ढूंढें।' },
      { title: 'AI हेल्प सेंटर', description: 'साधारण भाषा में पूछें और ऐप की हर सुविधा के लिए मार्गदर्शन पाएं।' },
      { title: 'अपॉइंटमेंट और रिपोर्ट', description: 'अपॉइंटमेंट बुक करें, रिपोर्ट अपलोड करें और रिमाइंडर प्रबंधित करें।' },
    ],
  },
  mr: {
    label: 'Marathi',
    title: 'AI मार्गदर्शन: SmartCare अॅप कसे वापरावे',
    subtitle: 'लॉगिन, नकाशा, चॅटबॉट, अॅपॉइंटमेंट आणि आपत्कालीन मदत यासाठी मराठी मार्गदर्शन.',
    videoUrl: 'https://www.youtube.com/embed/YP6x_NGk5Eg?cc_lang_pref=mr&hl=mr',
    videoNote: 'हा AI अवतार मार्गदर्शक दाखवतो की कसे लॉगिन करावे, रुग्णालयाचा नकाशा वापरावा, AI हेल्प सेंटर वापरावा आणि अपॉइंटमेंट किंवा आपत्कालीन सहाय्य मिळवावे.',
    features: [
      { title: 'लॉगिन आणि भूमिका', description: 'अॅप उघडा, तुमच्या क्रेडेन्शियलने लॉगिन करा आणि रूग्ण, डॉक्टर, HR किंवा अॅडमिन भूमिका निवडा.' },
      { title: 'नकाशा मार्गदर्शन', description: 'आगीचा, निदान, औषधालय आणि प्रशासन विभाग सहज शोधा.' },
      { title: 'AI हेल्प सेंटर', description: 'सोप्या भाषेत प्रश्न विचारा आणि अॅपच्या प्रत्येक वैशिष्ट्यासाठी मार्गदर्शन मिळवा.' },
      { title: 'अॅपॉइंटमेंट आणि रिपोर्ट', description: 'अॅपॉइंटमेंट बुक करा, रिपोर्ट अपलोड करा आणि स्मरणपत्रे व्यवस्थापित करा.' },
    ],
  },
};

const sections = [
  { name: 'Emergency', icon: Ambulance, color: 'from-rose-500 to-orange-500', description: '24/7 emergency intake and trauma response.' },
  { name: 'Diagnostics', icon: Microscope, color: 'from-sky-500 to-cyan-500', description: 'Lab testing, imaging, and diagnostics support.' },
  { name: 'Outpatient', icon: Stethoscope, color: 'from-violet-500 to-fuchsia-500', description: 'Consultation rooms and physician clinics.' },
  { name: 'Pharmacy', icon: Pill, color: 'from-emerald-500 to-teal-500', description: 'Medication pickup and pharmacy services.' },
  { name: 'Admin Desk', icon: Users, color: 'from-amber-500 to-yellow-500', description: 'Visitor support, registration, and staff help.' },
];

const STEP_GUIDES = {
  en: [
    {
      title: 'Login with your role',
      description: 'Sign in using your hospital credentials, choose patient, doctor, HR or admin, and arrive at the dashboard built for your job.',
      icon: UserCheck,
    },
    {
      title: 'Follow the hospital map',
      description: 'Tap sections like Emergency, Pharmacy, Diagnostics or Admin to see where each department is located inside the hospital.',
      icon: Navigation,
    },
    {
      title: 'Use AI Help Center',
      description: 'Ask the chatbot questions in simple language and get instant guidance for appointments, reports, and navigation.',
      icon: MessageSquare,
    },
    {
      title: 'Book appointments & reports',
      description: 'Choose doctors, schedule visits, upload medical reports, and set reminders with guided steps.',
      icon: CalendarDays,
    },
    {
      title: 'Emergency support when needed',
      description: 'Reach emergency services fast, view urgent department directions, and follow the AI assistant for next steps.',
      icon: ShieldCheck,
    },
  ],
  hi: [
    {
      title: 'लॉगिन और भूमिका',
      description: 'अपने अस्पताल क्रेडेंशियल का उपयोग करके साइन इन करें, मरीज, डॉक्टर, HR या एडमिन चुनें और अपनी भूमिका के अनुसार डैशबोर्ड खोलें।',
      icon: UserCheck,
    },
    {
      title: 'नक्शे का पालन करें',
      description: 'एमर्जेंसी, फार्मेसी, डायग्नोस्टिक्स या एडमिन सेक्शन पर टैप करके अस्पताल में स्थान देखें।',
      icon: Navigation,
    },
    {
      title: 'AI हेल्प सेंटर का उपयोग करें',
      description: 'सरल भाषा में सवाल पूछें और अपॉइंटमेंट, रिपोर्ट और नेविगेशन के लिए मार्गदर्शन पाएं।',
      icon: MessageSquare,
    },
    {
      title: 'अपॉइंटमेंट और रिपोर्ट बुक करें',
      description: 'डॉक्टर चुनें, विज़िट शेड्यूल करें, रिपोर्ट अपलोड करें और रिमाइंडर सेट करें।',
      icon: CalendarDays,
    },
    {
      title: 'आपातकालीन सहायता',
      description: 'आपातकालीन सेवाओं तक जल्दी पहुंचें, विभाग निर्देश देखें और अगले कदम के लिए AI सहायक का पालन करें।',
      icon: ShieldCheck,
    },
  ],
  mr: [
    {
      title: 'लॉगिन आणि भूमिका',
      description: 'तुमच्या हॉस्पिटल क्रेडेन्शियलने साइन इन करा, रूग्ण, डॉक्टर, HR किंवा अॅडमिन निवडा आणि तुमच्या भूमिकेसाठी डॅशबोर्ड उघडा.',
      icon: UserCheck,
    },
    {
      title: 'नकाशाचा वापर करा',
      description: 'एमर्जन्सी, फार्मसी, डायग्नोस्टिक्स किंवा अॅडमिन विभागावर टॅप करून रुग्णालयातील ठिकाण पहा.',
      icon: Navigation,
    },
    {
      title: 'AI हेल्प सेंटर वापरा',
      description: 'सोप्या भाषेत प्रश्न विचारा आणि अपॉइंटमेंट, रिपोर्ट आणि मार्गदर्शन मिळवा.',
      icon: MessageSquare,
    },
    {
      title: 'अपॉइंटमेंट आणि रिपोर्ट',
      description: 'डॉक्टर निवडा, भेट वेळ ठरवा, रिपोर्ट अपलोड करा आणि स्मरणपत्रे सेट करा.',
      icon: CalendarDays,
    },
    {
      title: 'आपत्कालीन मदत',
      description: 'आपत्कालीन सेवा लवकर शोधा, विभाग निर्देश पहा आणि पुढील पावलांसाठी AI सहायकाचे अनुसरण करा.',
      icon: ShieldCheck,
    },
  ],
};

export default function HospitalMapPage() {
  const [language, setLanguage] = useState('en');
  const tutorial = TUTORIAL_VIDEOS[language];
  const stepGuides = STEP_GUIDES[language];

  return (
    <div className="min-h-screen bg-surface px-4 py-10 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-glass backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Hospital Map</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Navigate every section of the hospital</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">Use this guided map to reach emergency care, diagnostics, pharmacies, and administration quickly and confidently.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">
              <Navigation className="h-4 w-4" />
              Directions ready
            </div>
            <div className="mt-6 inline-flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <Film className="h-4 w-4 text-brand-500" />
              <UserCircle2 className="h-4 w-4 text-brand-500" />
              AI avatar walkthrough available in English, Hindi, and Marathi
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <GlassCard className="!p-8">
            <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <MapPin className="h-4 w-4 text-brand-500" />
                SmartCare Central Hospital layout
              </div>
              <div className="mt-6 grid gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                    <span>Reception & Welcome</span>
                    <span className="text-slate-500">Main Entrance</span>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                    <div className="text-sm font-semibold text-slate-900">North Wing</div>
                    <p className="mt-1 text-sm text-slate-600">Outpatient clinics and consultation rooms.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                    <div className="text-sm font-semibold text-slate-900">South Wing</div>
                    <p className="mt-1 text-sm text-slate-600">Emergency, imaging and diagnostics services.</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                    <span>Pharmacy & Dispensary</span>
                    <span className="text-slate-500">West Corridor</span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="!p-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  <PlayCircle className="h-4 w-4" />
                  Guided video walkthrough
                </div>
                <div className="flex gap-2 rounded-3xl bg-slate-100 p-2">
                  {Object.entries(TUTORIAL_VIDEOS).map(([key, video]) => (
                    <button
                      key={key}
                      onClick={() => setLanguage(key)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${language === key ? 'bg-brand-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-200'}`}
                    >
                      {video.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-900">{tutorial.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{tutorial.subtitle}</p>
              </div>

              <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-slate-900">
                <iframe
                  title={`SmartCare App AI Walkthrough ${tutorial.label}`}
                  src={tutorial.videoUrl}
                  className="w-full aspect-video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <p className="mt-3 text-sm text-slate-400">{tutorial.videoNote}</p>

              <div className="grid gap-3 sm:grid-cols-2 mt-4">
                {tutorial.features.map((feature) => (
                  <div key={feature.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-700 mb-2">
                      <Video className="h-3.5 w-3.5" />
                      {feature.title}
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-3xl bg-brand-600/10 p-3 text-brand-700">
                    <UserCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">AI Avatar Walkthrough</h4>
                    <p className="mt-2 text-sm text-slate-600">Our guided avatar video explains every step in your selected language, from login to emergency support.</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2">
                      <UserCheck className="h-4 w-4 text-brand-500" />
                      Login support
                    </div>
                    <p className="text-sm text-slate-600">How to sign in, choose your role, and open the right dashboard.</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2">
                      <Navigation className="h-4 w-4 text-brand-500" />
                      Map navigation
                    </div>
                    <p className="text-sm text-slate-600">Locate emergency, pharmacy, diagnostics, and admin zones quickly.</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2">
                      <MessageSquare className="h-4 w-4 text-brand-500" />
                      AI help center
                    </div>
                    <p className="text-sm text-slate-600">Ask the chatbot any question about the app and the hospital.</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2">
                      <ShieldCheck className="h-4 w-4 text-brand-500" />
                      Emergency guidance
                    </div>
                    <p className="text-sm text-slate-600">See what to do when urgent support is needed and where to go.</p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        <GlassCard className="!p-8">
          <div className="mb-6 flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-700">
              <Video className="h-4 w-4" />
              Feature walkthrough
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">{language === 'en' ? 'How to use every part of SmartCare' : language === 'hi' ? 'SmartCare का हर भाग कैसे उपयोग करें' : 'SmartCare चा प्रत्येक भाग कसा वापरावा'}</h2>
              <p className="mt-2 text-sm text-slate-600">
                {language === 'en'
                  ? 'Follow the step-by-step visual guide to login, navigate the hospital map, use the AI chatbot, and manage appointments or emergencies.'
                  : language === 'hi'
                  ? 'लॉगिन, अस्पताल का नक्शा, AI चैटबोट और अपॉइंटमेंट या आपातकालीन सहायता की निर्देशों के लिए यह चरण-दर-चरण मार्गदर्शिका देखें।'
                  : 'लॉगिन, रुग्णालयाचा नकाशा, AI चॅटबॉट आणि अपॉइंटमेंट किंवा आपत्कालीन मदतीसाठी ही पायरी-दर-पायरी मार्गदर्शिका पहा.'}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {stepGuides.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="flex gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-brand-50 text-brand-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{step.title}</div>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <GlassCard key={section.name} className="!p-6">
                <div className={`inline-flex rounded-2xl bg-gradient-to-br ${section.color} p-3 text-white`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{section.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{section.description}</p>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
