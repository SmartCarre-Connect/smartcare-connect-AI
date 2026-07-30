import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { helpCenterApi } from '../services/api';
import { Headset, Search, ArrowRight } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const DEFAULT_CONTEXT = [
  'How can I book an appointment?',
  'Where can I download my medical reports?',
  'How do I use the hospital navigation map?',
  'What should I do in an emergency?',
  'How can I update my profile and contact details?',
];

function HelpCenter() {
  const { user } = useAuth();
  const [question, setQuestion] = useState('');
  const [language, setLanguage] = useState('auto');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const askQuestion = async (text) => {
    if (!text.trim()) return;
    const query = text.trim();
    setError(null);
    setLoading(true);
    setHistory((prev) => [...prev, { id: Date.now(), role: 'user', text: query }]);
    setQuestion('');

    try {
      const res = await helpCenterApi.ask(query, language);
      setHistory((prev) => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        text: res.data?.answer || res.data?.message || 'I could not retrieve an answer at this time.',
      }] );
    } catch (err) {
      console.error('HelpCenter API error', err);
      setError(err.response?.data?.message || 'Unable to get help center response. Please try again later.');
      setHistory((prev) => [...prev, {
        id: Date.now() + 1,
        role: 'system',
        text: 'Sorry, I could not process your question right now.',
      }] );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Help Center"
        subtitle="Ask the AI agent anything about the hospital, app, or your care journey. Supports English, Hindi, Marathi and regional languages."
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card padding="large" className="space-y-6">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-slate-500">Hi {user?.name || 'there'}, how can I support you today?</p>
            <div className="grid gap-3 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Your question</label>
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. How do I book a doctor, or where is the pediatric wing?"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none"
                >
                  <option value="auto">Auto detect</option>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="bn">Bengali</option>
                  <option value="te">Telugu</option>
                  <option value="ur">Urdu</option>
                  <option value="ta">Tamil</option>
                  <option value="mr">Marathi</option>
                  <option value="gu">Gujarati</option>
                  <option value="kn">Kannada</option>
                  <option value="ml">Malayalam</option>
                </select>
                <p className="mt-2 text-xs text-slate-400">Choose the response language for your AI support.</p>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() => askQuestion(question)}
                  disabled={!question.trim() || loading}
                  icon={ArrowRight}
                  className="w-full"
                >
                  Ask AI
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {DEFAULT_CONTEXT.map((prompt) => (
              <button
                key={prompt}
                onClick={() => askQuestion(prompt)}
                className="text-left rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:border-brand-300 hover:bg-brand-50 transition"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-sm text-slate-500">
                Your AI help history will appear here. Ask a question to get started.
              </div>
            ) : (
              history.map((entry) => (
                <div
                  key={entry.id}
                  className={`rounded-3xl p-5 shadow-sm ${entry.role === 'assistant' ? 'bg-slate-50 border border-slate-200' : entry.role === 'system' ? 'bg-red-50 border border-red-200' : 'bg-white border border-slate-200'}`}
                >
                  <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <span>{entry.role === 'assistant' ? 'AI Answer' : entry.role === 'user' ? 'Your Question' : 'System'}</span>
                  </div>
                  <p className="text-sm leading-7 text-slate-800">{entry.text}</p>
                </div>
              ))
            )}
          </div>

          {error && (
            <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </Card>

        <Card padding="large" className="space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-700">
              <Search className="w-4 h-4" />
              AI Help Center
            </div>
            <h2 className="text-xl font-bold text-slate-900">How SmartCare AI can help</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Use this AI-powered help center for app guidance, hospital navigation, appointment help, emergency procedures, insurance support and more.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-brand-50 p-4 mt-4">
            <p className="text-sm font-semibold text-brand-900">Need a narrated video guide?</p>
            <p className="text-sm text-brand-700 mt-2">Use the premium AI virtual presenter for an interactive narrated walkthrough in English, Hindi, or Marathi.</p>
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">Ask about hospital locations</p>
              <p className="text-sm text-slate-500 mt-2">"Where is the pediatric department?"</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">Get app usage help</p>
              <p className="text-sm text-slate-500 mt-2">"How do I update my profile and notifications?"</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">Learn about emergency support</p>
              <p className="text-sm text-slate-500 mt-2">"What should I do if a patient needs urgent help?"</p>
            </div>
            <div className="rounded-3xl border border-brand-200 bg-brand-50 p-5">
              <p className="text-sm font-semibold text-brand-900">Watch the video walkthrough</p>
              <p className="text-sm text-brand-700 mt-2">Go to Hospital Map for the AI avatar tutorial in English, Hindi, or Marathi.</p>
              <Link
                to="/presenter"
                className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Open AI Virtual Presenter
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default HelpCenter;
