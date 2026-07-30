import React, { useEffect, useState } from 'react';
import { generateVideo, getJobStatus } from '../services/heygen';

export default function AvatarProviderHeygen({ role = 'patient', language = 'en', sectionId = 'welcome', script = '', avatarId = 'Daphne_public_1' }) {
  const [videoUrl, setVideoUrl] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    // Check localStorage for an existing media mapping first
    try {
      const library = JSON.parse(window.localStorage.getItem('smartcare-presenter-media') || '{}');
      const roleKey = `${role}_tour_${language}`;
      if (library[roleKey] && library[roleKey].url) {
        setVideoUrl(library[roleKey].url);
        return;
      }
      // If a job was previously created, pick up the job id and start polling
      if (library[roleKey] && library[roleKey].jobId) {
        setJobId(library[roleKey].jobId);
        setStatus(library[roleKey].status || 'created');
        return;
      }
    } catch {}
  }, [role, language]);

  useEffect(() => {
    if (!jobId) return;
    let mounted = true;
    const poll = async () => {
      try {
        const res = await getJobStatus(jobId);
        const statusValue = res.status || res.state || res.result?.status || res.data?.status || 'unknown';
        setStatus(statusValue);
        const url = res.output_url
          || res.result?.url
          || res.data?.url
          || res.files?.[0]?.url
          || res.output?.[0]?.url
          || res.outputs?.[0]?.url
          || res.result?.outputs?.[0]?.url
          || res.data?.outputs?.[0]?.url
          || res.data?.result?.outputs?.[0]?.url;
        if (url && mounted) {
          setVideoUrl(url);
          try {
            const lib = JSON.parse(window.localStorage.getItem('smartcare-presenter-media') || '{}');
            lib[`${role}_tour_${language}`] = { url, status: statusValue };
            window.localStorage.setItem('smartcare-presenter-media', JSON.stringify(lib));
          } catch {}
        } else if (mounted) {
          setTimeout(poll, 3000);
        }
      } catch (e) {
        if (mounted) setTimeout(poll, 5000);
      }
    };
    poll();
    return () => { mounted = false; };
  }, [jobId, role, language]);

  // TTS fallback: if no videoUrl, speak the script using browser SpeechSynthesis
  useEffect(() => {
    if (videoUrl) return;
    if (!script || typeof window === 'undefined') return;
    // auto-play TTS once on mount for onboarding flows
    const speak = async () => {
      try {
        const synth = window.speechSynthesis;
        if (!synth) return;
        // pick a voice matching language if available
        const utter = new SpeechSynthesisUtterance(script);
        utter.lang = language || 'en-US';
        utter.onstart = () => setPlaying(true);
        utter.onend = () => setPlaying(false);
        // attempt to select a matching voice
        const voices = synth.getVoices();
        const match = voices.find((v) => (v.lang || '').toLowerCase().startsWith((language || 'en').slice(0,2)));
        if (match) utter.voice = match;
        synth.cancel();
        synth.speak(utter);
      } catch (e) {
        // ignore TTS errors
      }
    };
    // small delay to allow voices to load
    const id = setTimeout(speak, 300);
    return () => clearTimeout(id);
  }, [videoUrl, script, language]);

  const handleGenerate = async () => {
    try {
      const payload = await generateVideo(avatarId, script, language, 'female', `${role}-tour-${language}`);
      const id = payload.id || payload.job_id || payload.data?.id || payload.data?.job_id;
      if (id) {
        setJobId(id);
        try {
          const lib = JSON.parse(window.localStorage.getItem('smartcare-presenter-media') || '{}');
          lib[`${role}_tour_${language}`] = { jobId: id, status: 'created' };
          window.localStorage.setItem('smartcare-presenter-media', JSON.stringify(lib));
        } catch {}
      }
    } catch (e) {
      console.error('HeyGen generate error', e);
    }
  };

  if (videoUrl) {
    return (
      <div>
        {videoUrl.endsWith('.mp3') || videoUrl.includes('.wav') || videoUrl.includes('audio') ? (
          <audio src={videoUrl} autoPlay controls style={{ width: 160 }} />
        ) : (
          <video src={videoUrl} autoPlay muted playsInline controls style={{ width: 160, height: 'auto', borderRadius: 12 }} />
        )}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-slate-800 to-slate-600 overflow-hidden shadow-lg flex items-center justify-center">
        <div className="h-8 w-8 rounded-full bg-white/90" />
      </div>
      <div className="flex flex-col">
        <div className="text-sm font-semibold">AI Healthcare Guide</div>
        <div className="text-xs text-slate-500">{language.toUpperCase()}</div>
        <div className="mt-2 flex items-center gap-2">
          <button onClick={handleGenerate} className="rounded-lg px-3 py-1 bg-brand-600 text-white text-xs">Generate</button>
          {jobId && <div className="text-xs text-slate-500">Job: {jobId} • {status || 'pending'}</div>}
          <button onClick={() => {
            // allow replaying TTS if present
            try {
              const synth = window.speechSynthesis;
              synth.cancel();
              const utter = new SpeechSynthesisUtterance(script);
              utter.lang = language || 'en-US';
              synth.speak(utter);
            } catch (e) {}
          }} className="rounded-lg px-2 py-1 bg-slate-100 text-slate-700 text-xs">Play TTS</button>
          <div className="text-xs text-slate-500">{playing ? 'Speaking…' : 'TTS fallback'}</div>
        </div>
      </div>
    </div>
  );
}
