import React, { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useOnboarding } from '../onboarding/OnboardingContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { mediaApi } from '../services/api';
import { Sparkles, Upload, Wand2, Eye, History } from 'lucide-react';

const STORAGE_KEY = 'smartcare-presenter-media';

export default function PresentationManager() {
  const { t } = useLanguage();
  const [mediaEntries, setMediaEntries] = useState([]);
  const [section, setSection] = useState('patient');
  const [type, setType] = useState('image');
  const [url, setUrl] = useState('');
  const [voice, setVoice] = useState('female');
  const [status, setStatus] = useState('Ready to publish');
  const [migrationResult, setMigrationResult] = useState(null);
  const [confirmMigration, setConfirmMigration] = useState(false);
  const [script, setScript] = useState('');
    // Steps editor
    const [stepsByRole, setStepsByRole] = useState({});
    const [newStep, setNewStep] = useState({ id: '', selector: '', duration: 8, scriptEn: '', scriptHi: '', scriptMr: '', mediaUrl: '', voice: 'female' });
  const onboarding = useOnboarding();
  const { language } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      // try loading from backend first
      (async () => {
        try {
          const res = await fetch('/api/v1/media');
          if (res.ok) {
            const list = await res.json();
            if (Array.isArray(list) && list.length > 0) {
              setMediaEntries(list.map((d) => ({ id: d.id, ...d })));
            } else {
              // fallback to localStorage if backend has none
              const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
              setMediaEntries(Object.entries(stored).map(([key, value]) => ({ id: key, ...value })));
            }
          } else {
            const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
            setMediaEntries(Object.entries(stored).map(([key, value]) => ({ id: key, ...value })));
          }
        } catch (e) {
          const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
          setMediaEntries(Object.entries(stored).map(([key, value]) => ({ id: key, ...value })));
        }
      })();
      // load steps mapping (stored in localStorage payload for now)
      const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
      const steps = stored.steps || {};
      setStepsByRole(steps);
    } catch {
      setMediaEntries([]);
    }
  }, []);

  const saveMedia = () => {
    if (typeof window === 'undefined') return;
    (async () => {
      try {
        const payload = { role: section, language: language || 'en', url, type, title: section };
        const res = await mediaApi.create(payload);
        if (res.status === 200 || res.status === 201) {
          const listRes = await mediaApi.list();
          setMediaEntries(listRes.data.map((d) => ({ id: d.id, ...d })));
          setStatus(t('presenterManager.saved', 'Presentation media saved and ready for preview.'));
          return;
        }
      } catch (e) {
        // fallback to localStorage
      }
      const existing = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
      const merged = { ...existing, [section]: { type, url, voice } };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      setMediaEntries(Object.entries(merged).map(([key, value]) => ({ id: key, ...value })));
      setStatus(t('presenterManager.saved', 'Presentation media saved and ready for preview.'));
    })();
  };

  const generatePatientVideos = async () => {
    // Generate Patient onboarding videos in EN/HI/MR by calling the backend HeyGen proxy
    setStatus('Enqueuing patient videos...');
    const scripts = {
      en: 'Welcome to SmartCare Connect. I am your concierge and will guide you through the app.',
      hi: 'SmartCare Connect में आपका स्वागत है। मैं आपका कंसर्ज हूँ और मैं आपको ऐप के माध्यम से मार्गदर्शन करूँगा।',
      mr: 'SmartCare Connect मध्ये तुमचे स्वागत आहे. मी तुमचा कन्सर्ज आहे आणि मी तुम्हाला अॅपद्वारे मार्गदर्शन करीन.'
    };
    const roleKeyBase = 'patient_tour_';
    try {
      for (const lang of ['en', 'hi', 'mr']) {
        const res = await fetch('/api/v1/heygen/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ avatar_id: 'Daphne_public_1', script: scripts[lang], language: lang, voice: 'female', title: `patient-tour-${lang}` }) });
        const payload = await res.json();
        const id = payload.id || payload.job_id || payload.data?.id || null;
        // persist the job id to storage so presenter can poll for result
        const existing = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
        existing[`${roleKeyBase}${lang}`] = { jobId: id, status: 'created' };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      }
      setStatus('Patient videos enqueued. Polling will pick them up when ready.');
      // refresh media entries view
      const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
      setMediaEntries(Object.entries(stored).map(([key, value]) => ({ id: key, ...value })));
    } catch (e) {
      setStatus('Failed to enqueue patient videos');
    }
  };

  const migrateLocalStorageToDB = async () => {
    if (typeof window === 'undefined') return;
    setStatus('Migrating localStorage media to DB...');
    setMigrationResult(null);
    try {
      const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
      const payload = Object.entries(stored).reduce((acc, [key, value]) => {
        if (key === 'steps') return acc;
        if (!value || typeof value !== 'object') return acc;
        if (!value.url && !value.script && !value.type) return acc;
        acc[key] = value;
        return acc;
      }, {});
      const res = await mediaApi.migrate(payload);
      if (res.status === 200) {
        const body = res.data;
        setMigrationResult({ success: true, message: `Migrated ${body.count} entries to DB.`, count: body.count, inserted: body.inserted });
        const listRes = await mediaApi.list();
        setMediaEntries(listRes.data.map((d) => ({ id: d.id, ...d })));
        setStatus('Migration complete.');
        setConfirmMigration(false);
        return;
      }
      setMigrationResult({ success: false, message: 'Migration failed.' });
      setStatus('Migration failed.');
      setConfirmMigration(false);
    } catch (e) {
      setMigrationResult({ success: false, message: 'Migration failed.' });
      setStatus('Migration failed.');
      setConfirmMigration(false);
    }
  };

  const saveStepsToStorage = (nextStepsByRole) => {
    const existing = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    const merged = { ...existing, steps: nextStepsByRole };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    setStepsByRole(nextStepsByRole);
  };

  const addStep = () => {
    if (!newStep.id) return setStatus('Step id required');
    const role = section;
    const next = { ...(stepsByRole || {}) };
    next[role] = next[role] || [];
    next[role].push({ id: newStep.id, selector: newStep.selector, duration: Number(newStep.duration || 8), script: { en: newStep.scriptEn, hi: newStep.scriptHi, mr: newStep.scriptMr }, mediaUrl: newStep.mediaUrl, voice: newStep.voice });
    saveStepsToStorage(next);
    setNewStep({ id: '', selector: '', duration: 8, scriptEn: '', scriptHi: '', scriptMr: '', mediaUrl: '', voice: 'female' });
    setStatus('Step added');
  };

  const removeStep = (role, idx) => {
    const next = { ...(stepsByRole || {}) };
    if (!next[role]) return;
    next[role] = next[role].filter((_, i) => i !== idx);
    saveStepsToStorage(next);
    setStatus('Step removed');
  };

  const previewRole = (role) => {
    try {
      onboarding.start({ role, language });
      // jump to first step
      onboarding.goto(0);
    } catch (e) {
      setStatus('Unable to preview role');
    }
  };

  const previewStep = (role, idx) => {
    try {
      onboarding.start({ role, language });
      onboarding.goto(idx);
    } catch (e) {
      setStatus('Unable to preview step');
    }
  };

  const publish = () => {
    (async () => {
      try {
        const payload = { media: Object.fromEntries(mediaEntries.map((m) => [m.id, m])), steps: stepsByRole };
        const res = await mediaApi.publish({ role: section, version_name: `${section}-${Date.now()}`, payload });
        if (res.status === 200 || res.status === 201) {
          setStatus(`Published version: ${res.data.version_name || res.data.id}`);
          return;
        }
      } catch (e) {
        // continue to local publish fallback
      }
      const version = onboarding.publishVersion({ role: section, versionName: `${section}-${Date.now()}`, payload: { media: Object.fromEntries(mediaEntries.map((m) => [m.id, m])), steps: stepsByRole } });
      setStatus(`Published version: ${version.name}`);
    })();
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-glass backdrop-blur-xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-700">
          <Sparkles className="h-3.5 w-3.5" />
          {t('presenterManager.badge', 'Admin Presentation Manager')}
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{t('presenterManager.title', 'Manage AI walkthrough content')}</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">{t('presenterManager.subtitle', 'Upload screenshots or videos, refine the script, choose the voice, and publish a polished virtual tour.')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Card padding="large" className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Upload className="h-4 w-4 text-brand-600" /> {t('presenterManager.uploadTitle', 'Upload and configure presentation media')}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">
              {t('presenterManager.section', 'Presentation section')}
              <select value={section} onChange={(e) => setSection(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm">
                <option value="welcome">Welcome</option>
                <option value="language">Choose Language</option>
                <option value="role">Choose Role</option>
                <option value="dashboard">Patient Dashboard</option>
                <option value="appointments">Appointments</option>
                <option value="navigation">Hospital Navigation</option>
                <option value="ai">AI Assistant</option>
                <option value="attendance">GPS Attendance</option>
                <option value="summary">Summary</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700">
              {t('presenterManager.type', 'Media type')}
              <select value={type} onChange={(e) => setType(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm">
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </label>
          </div>
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder={t('presenterManager.url', 'Paste a local URL, CDN URL, or public file URL')} />
          <textarea value={script} onChange={(e) => setScript(e.target.value)} rows={4} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900" placeholder={t('presenterManager.script', 'Edit the script for this section')} />
          <label className="text-sm font-semibold text-slate-700">
            {t('presenterManager.voice', 'Voice')}
            <select value={voice} onChange={(e) => setVoice(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm">
              <option value="female">Female Voice</option>
              <option value="male">Male Voice</option>
            </select>
          </label>
            <div className="flex flex-wrap gap-3">
            <Button onClick={saveMedia} icon={Wand2} variant="primary">{t('presenterManager.generate', 'Save & Publish')}</Button>
            <Button onClick={() => previewRole(section)} icon={Eye} variant="secondary">{t('presenterManager.preview', 'Preview Role')}</Button>
            <Button onClick={publish} icon={Sparkles} variant="secondary">Publish Version</Button>
              <Button onClick={generatePatientVideos} variant="secondary">Generate Patient Videos (EN/HI/MR)</Button>
              <Button onClick={() => {
                // create lightweight TTS fallback entries for Patient EN/HI/MR
                const existing = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
                existing['patient_tour_en'] = { type: 'tts', script: 'Welcome to SmartCare Connect. I am your concierge and will guide you through the app.' };
                existing['patient_tour_hi'] = { type: 'tts', script: 'SmartCare Connect में आपका स्वागत है। मैं आपका कंसर्ज हूँ और मैं आपको ऐप के माध्यम से मार्गदर्शन करूँगा।' };
                existing['patient_tour_mr'] = { type: 'tts', script: 'SmartCare Connect मध्ये तुमचे स्वागत आहे. मी तुमचा कन्सर्ज आहे आणि मी तुम्हाला अॅपद्वारे मार्गदर्शन करीन.' };
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
                setMediaEntries(Object.entries(existing).map(([key, value]) => ({ id: key, ...value })));
                setStatus('TTS fallback entries created for Patient (EN/HI/MR). Preview the role to hear TTS.');
              }} variant="ghost">Use TTS Fallback (Patient)</Button>
              <Button onClick={generatePatientTTS} variant="ghost">Generate Server TTS (Patient)</Button>
              <Button onClick={() => setConfirmMigration(true)} variant="ghost" disabled={!user || !['admin','super_admin'].includes(user.role)}>
                Migrate LocalStorage to DB
              </Button>
              {!user || !['admin','super_admin'].includes(user.role) ? (
                <div className="text-xs text-slate-500">Admin only</div>
              ) : null}
              {confirmMigration ? (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <div className="font-semibold">Confirm migration</div>
                  <p className="mt-2">This will copy localStorage presentation media into the DB. Existing DB records are not removed.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button onClick={migrateLocalStorageToDB} variant="primary">Confirm</Button>
                    <Button onClick={() => setConfirmMigration(false)} variant="secondary">Cancel</Button>
                  </div>
                </div>
              ) : null}
              {migrationResult ? (
                <div className={`mt-4 rounded-2xl border ${migrationResult.success ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-rose-200 bg-rose-50 text-rose-900'} p-4 text-sm`}>
                  <div className="font-semibold">{migrationResult.success ? 'Migration complete' : 'Migration error'}</div>
                  <p className="mt-1">{migrationResult.message}</p>
                  {migrationResult.inserted ? <p className="mt-2 text-xs text-slate-700">Inserted IDs: {migrationResult.inserted.join(', ')}</p> : null}
                </div>
              ) : null}
          </div>
          <div className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700">{status}</div>

          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-semibold">Steps Editor — {section}</h3>
            <div className="grid gap-3 md:grid-cols-3 mt-3">
              <Input placeholder="Step id" value={newStep.id} onChange={(e) => setNewStep({ ...newStep, id: e.target.value })} />
              <Input placeholder="CSS selector (e.g. #nav .item)" value={newStep.selector} onChange={(e) => setNewStep({ ...newStep, selector: e.target.value })} />
              <Input type="number" placeholder="Duration (s)" value={newStep.duration} onChange={(e) => setNewStep({ ...newStep, duration: e.target.value })} />
              <Input placeholder="Media URL (optional)" value={newStep.mediaUrl} onChange={(e) => setNewStep({ ...newStep, mediaUrl: e.target.value })} />
              <select value={newStep.voice} onChange={(e) => setNewStep({ ...newStep, voice: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm">
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
              <div className="flex items-center">
                <Button onClick={addStep} variant="primary">Add Step</Button>
              </div>
              <textarea placeholder="Script (en)" value={newStep.scriptEn} onChange={(e) => setNewStep({ ...newStep, scriptEn: e.target.value })} className="col-span-3 mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm" rows={3} />
              <textarea placeholder="Script (hi)" value={newStep.scriptHi} onChange={(e) => setNewStep({ ...newStep, scriptHi: e.target.value })} className="col-span-3 mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm" rows={2} />
            </div>

            <div className="mt-4">
              <h4 className="font-medium">Existing Steps</h4>
              <ul className="mt-2 space-y-2">
                {(stepsByRole[section] || []).map((s, idx) => (
                  <li key={s.id} className="rounded-lg border p-3 flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{s.id} <span className="text-xs text-gray-500">• {s.duration}s</span></div>
                      <div className="text-sm text-gray-600 mt-1">{s.selector}</div>
                      <div className="text-sm text-gray-700 mt-2">{s.script?.en}</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button onClick={() => previewStep(section, idx)} variant="secondary">Preview</Button>
                      <Button onClick={() => removeStep(section, idx)} variant="ghost">Remove</Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        <Card padding="large" className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <History className="h-4 w-4 text-brand-600" /> {t('presenterManager.history', 'Version history and uploads')}
          </div>
          <div className="space-y-3">
            {mediaEntries.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">{t('presenterManager.empty', 'No presentation assets uploaded yet.')}</div>
            ) : mediaEntries.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold text-slate-900">{entry.id}</div>
                <div className="mt-1 text-xs text-slate-500">{entry.type} • {entry.voice} {entry.language ? '• ' + entry.language : ''}</div>
                {entry.createdAt ? <div className="mt-1 text-xs text-slate-400">Created: {new Date(entry.createdAt).toLocaleString()} {entry.createdBy ? '• by ' + entry.createdBy : ''}</div> : null}
                {entry.url ? <div className="mt-2 break-all text-xs text-brand-700">{entry.url}</div> : null}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
