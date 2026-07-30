import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, ArrowRight, Sparkles, Video, Loader2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { generateVideo, getJobStatus } from '../services/heygen';

const WATCHED_STORAGE_KEY = 'smartcare-intro-watched';
const JOB_STORAGE_KEY = 'smartcare-intro-video-job';
const URL_STORAGE_KEY = 'smartcare-intro-video-url';

const DEFAULT_VIDEO_SRC = 'https://www.w3schools.com/html/mov_bbb.mp4';

const VIDEO_SOURCES = {
  en: import.meta.env.VITE_INTRO_VIDEO_URL_EN || import.meta.env.VITE_INTRO_VIDEO_URL || DEFAULT_VIDEO_SRC,
  hi: import.meta.env.VITE_INTRO_VIDEO_URL_HI || import.meta.env.VITE_INTRO_VIDEO_URL || DEFAULT_VIDEO_SRC,
  mr: import.meta.env.VITE_INTRO_VIDEO_URL_MR || import.meta.env.VITE_INTRO_VIDEO_URL || DEFAULT_VIDEO_SRC,
};

const scripts = {
  en: 'Welcome to SmartCare Connect. This AI-powered hospital app helps you login, choose your role, book appointments, view reports, and get guided care support.',
  hi: 'SmartCare Connect में आपका स्वागत है। यह AI-पावर्ड अस्पताल ऐप आपको लॉगिन करने, अपनी भूमिका चुनने, अपॉइंटमेंट बुक करने, रिपोर्ट देखने और देखभाल मार्गदर्शन प्राप्त करने में मदद करता है।',
  mr: 'SmartCare Connect मध्ये तुमचे स्वागत आहे. हे AI-शक्तीकरण अॅप तुम्हाला लॉगिन करण्यास, तुमची भूमिका निवडण्यास, अपॉइंटमेंट बुक करण्यास, अहवाल पाहण्यास आणि इलाज मार्गदर्शन मिळविण्यास मदत करते.',
};

const avatarId = 'Daphne_public_1';
const voice = 'female';

const findHeygenUrl = (res) => {
  return res?.output_url
    || res?.result?.url
    || res?.data?.url
    || res?.files?.[0]?.url
    || res?.output?.[0]?.url
    || res?.outputs?.[0]?.url
    || res?.result?.outputs?.[0]?.url
    || res?.data?.outputs?.[0]?.url;
};

export default function IntroVideoPage() {
  const navigate = useNavigate();
  const { t, currentLanguage } = useLanguage();
  const [jobId, setJobId] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const lang = currentLanguage.code || 'en';
  const script = scripts[lang] || scripts.en;
  const storageJobKey = `${JOB_STORAGE_KEY}-${lang}`;
  const storageUrlKey = `${URL_STORAGE_KEY}-${lang}`;
  const fallbackVideo = VIDEO_SOURCES[lang] || DEFAULT_VIDEO_SRC;

  const videoSrc = videoUrl || fallbackVideo;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.localStorage.getItem(WATCHED_STORAGE_KEY) === 'true') {
      navigate('/login', { replace: true });
      return;
    }

    const savedUrl = window.localStorage.getItem(storageUrlKey);
    const savedJobId = window.localStorage.getItem(storageJobKey);
    if (savedUrl) {
      setVideoUrl(savedUrl);
      setStatus('ready');
      return;
    }
    if (savedJobId) {
      setJobId(savedJobId);
      setStatus('polling');
      return;
    }
    void startGeneration();
  }, [navigate, storageJobKey, storageUrlKey]);

  useEffect(() => {
    if (!jobId) return;
    let mounted = true;
    const poll = async () => {
      if (!mounted) return;
      try {
        const res = await getJobStatus(jobId);
        const url = findHeygenUrl(res);
        const statusValue = res?.status || res?.state || res?.result?.status || res?.data?.status || 'pending';
        setStatus(statusValue);
        if (url) {
          setVideoUrl(url);
          window.localStorage.setItem(storageUrlKey, url);
          setStatus('ready');
          return;
        }
        if (statusValue && ['failed', 'error', 'cancelled'].includes(statusValue.toString().toLowerCase())) {
          setError(t('intro.generationFailed', 'AI video generation failed. Showing fallback video.'));
          setStatus('failed');
          return;
        }
        setTimeout(poll, 3000);
      } catch (err) {
        setError(t('intro.generationFailed', 'AI video generation failed. Showing fallback video.'));
        setStatus('failed');
      }
    };
    poll();
    return () => { mounted = false; };
  }, [jobId, storageUrlKey, t]);

  const startGeneration = async () => {
    setError('');
    setStatus('creating');
    try {
      const result = await generateVideo(avatarId, script, lang, voice, `smartcare-intro-${lang}`);
      const id = result?.id || result?.job_id || result?.data?.id || result?.data?.job_id;
      if (!id) {
        throw new Error('Missing HeyGen job id');
      }
      window.localStorage.setItem(storageJobKey, id);
      setJobId(id);
      setStatus('polling');
    } catch (err) {
      console.error('HeyGen generation error', err);
      setError(t('intro.generationFailed', 'AI video generation failed. Showing fallback video.'));
      setStatus('failed');
    }
  };

  const handleComplete = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(WATCHED_STORAGE_KEY, 'true');
    }
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-surface px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_0.8fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-[32px] border border-slate-200/70 bg-white/90 p-8 shadow-glass backdrop-blur-xl"
        >
          <div className="inline-flex items-center gap-3 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
            <Sparkles className="h-4 w-4" />
            {t('intro.badge', 'App Tour')}
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {t('intro.title', 'Learn how SmartCare Connect works')}
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
            {t('intro.subtitle', 'Watch a quick walkthrough video in your selected language, then continue to login and choose your role.')}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{t('intro.stepOne', 'Step 1')}</p>
              <p className="mt-3 text-lg font-semibold text-slate-900">{t('intro.selectLanguage', 'Language selection')}</p>
              <p className="mt-2 text-sm text-slate-600">{t('intro.selectLanguageBody', 'Your experience will be localized to English, Hindi or Marathi.')}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{t('intro.stepTwo', 'Step 2')}</p>
              <p className="mt-3 text-lg font-semibold text-slate-900">{t('intro.watchVideo', 'Watch the app walkthrough')}</p>
              <p className="mt-2 text-sm text-slate-600">{t('intro.watchVideoBody', 'This video plays only once on your first login to introduce the app.')}</p>
            </div>
          </div>

          <div className="mt-8 rounded-[28px] border border-slate-200/70 bg-slate-950 p-4 shadow-lg shadow-slate-900/5">
            <div className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-200">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-cyan-400" />
                <span>{t('intro.currentLanguage', 'Current language')}:</span>
                <span className="font-semibold text-white">{currentLanguage.nativeLabel}</span>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-slate-300">
                {t('intro.onceOnly', 'One time only')}
              </span>
            </div>

            <div className="mt-4 relative overflow-hidden rounded-[24px] bg-black shadow-inner">
              <video
                key={currentLanguage.code}
                src={videoSrc}
                controls
                autoPlay
                muted
                playsInline
                className="h-full w-full min-h-[260px] bg-slate-900 object-cover"
              />
              {(status === 'creating' || status === 'polling') && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 p-6 text-center text-white">
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300 shadow-lg shadow-cyan-500/20">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                  <p className="text-base font-semibold text-white">
                    {t('intro.generating', 'Generating AI preview...')}
                  </p>
                  <p className="mt-2 max-w-xs text-sm text-slate-300">
                    {t('intro.generatingDetail', 'Please wait while we create your walkthrough in the selected language.')}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-400">
              <div>
                {status === 'creating' || status === 'polling' ? (
                  <div className="inline-flex items-center gap-2 text-cyan-300">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('intro.generating', 'Generating AI preview...')}
                  </div>
                ) : status === 'ready' ? (
                  <div className="text-slate-300">{t('intro.readyMessage', 'AI video is ready — watch it above.')}</div>
                ) : status === 'failed' ? (
                  <div className="inline-flex items-center gap-2 text-amber-300">
                    <AlertTriangle className="h-4 w-4" />
                    {t('intro.fallbackMessage', 'Using fallback video while AI preview is unavailable.')}
                  </div>
                ) : (
                  <div className="text-slate-300">{t('intro.videoCaption', 'A preview of how to login, choose a role, and navigate the main app features.')}</div>
                )}
              </div>
              {error ? <div className="text-sm text-rose-300">{error}</div> : null}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-500">
              {t('intro.note', 'The video will only appear the first time you open the app.')} 
              {t('intro.afterWatch', 'After watching, you will continue to the login screen.')}
            </div>
            <button
              onClick={handleComplete}
              className="inline-flex items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:opacity-95"
            >
              <Play className="h-4 w-4" />
              {t('intro.continue', 'Continue to Login')}
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-[32px] border border-slate-200/70 bg-white/80 p-8 shadow-glass backdrop-blur-xl"
        >
          <div className="flex flex-col gap-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.23em] text-slate-500">{t('intro.featuresTitle', 'What you will learn')}</div>
              <h2 className="mt-3 text-2xl font-bold text-slate-900">{t('intro.featuresSubtitle', 'Getting started faster')}</h2>
            </div>

            <div className="space-y-4">
              {[
                t('intro.featureLogin', 'How to login securely'),
                t('intro.featureRole', 'How to pick your role after login'),
                t('intro.featureDashboard', 'How to access appointments, reports, and AI tools'),
                t('intro.featureSupport', 'How to use help center and presenter guide'),
              ].map((item) => (
                <div key={item} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-slate-900">{item}</div>
                    <ArrowRight className="h-4 w-4 text-brand-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
