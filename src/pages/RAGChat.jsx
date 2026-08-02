import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { chatApi, reportsApi, prescriptionsApi } from '../services/api';
import { Send, Bot, User, Sparkles, AlertCircle, RefreshCw, MessageSquarePlus, Pencil, Trash2, Clock3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { twMerge } from 'tailwind-merge';
// no local hardcoded AI replies; use backend AI

const SUGGESTED_PROMPTS = [
  'Explain my latest blood test results',
  'What are the side effects of my medication?',
  'Analyze my recent heart rate trends',
];

const createWelcomeMessages = (name = '') => [
  { id: 1, role: 'assistant', text: `Hello ${name}! I'm TwinCare AI, your health companion. I've reviewed your latest reports and vitals. How can I help you today?` },
];

export default function RAGChat() {
  const { user } = useAuth();
  const location = useLocation();
  const [sessionId, setSessionId] = useState(location.state?.sessionId || null);
  const [messages, setMessages] = useState(() => createWelcomeMessages(user?.name || user?.full_name || ''));
  const [sessions, setSessions] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [recentReports, setRecentReports] = useState([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const messagesEndRef = useRef(null);

  const storageKey = user ? `smartcare_ai_sessions_${user._id || user.id || user.email}` : 'smartcare_ai_sessions_guest';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const readStoredSessions = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const writeStoredSessions = (nextSessions) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextSessions));
    } catch {
      console.warn('Could not persist chat sessions locally');
    }
  };

  const syncSessionToStorage = (targetSessionId, nextMessages, titleOverride = null) => {
    if (!targetSessionId) return;
    const now = new Date().toISOString();
    const preview = nextMessages[nextMessages.length - 1]?.text || '';
    setSessions((prev) => {
      const existing = prev.find((session) => session.id === targetSessionId);
      const next = existing
        ? prev.map((session) => session.id === targetSessionId
          ? { ...session, title: titleOverride || session.title || 'New Chat', updatedAt: now, messages: nextMessages, preview }
          : session)
        : [{ id: targetSessionId, title: titleOverride || 'New Chat', createdAt: now, updatedAt: now, messages: nextMessages, preview }, ...prev];
      writeStoredSessions(next);
      return next;
    });
  };

  const loadSessionMessages = async (targetSessionId, fallbackMessages = null, shouldSetActive = true) => {
    if (!targetSessionId) {
      setMessages(fallbackMessages || createWelcomeMessages(user?.name || user?.full_name || ''));
      return;
    }

    const storedSession = readStoredSessions().find((item) => item.id === targetSessionId);
    if (storedSession?.messages?.length) {
      setMessages(storedSession.messages);
    }

    try {
      setLoading(true);
      const res = await chatApi.getSession(targetSessionId);
      const payload = res.data || [];
      const sessionMessages = Array.isArray(payload) ? payload : payload.messages || [];
      const mappedMessages = sessionMessages.length > 0
        ? sessionMessages.map((msg, idx) => ({
            id: msg.id || msg.message_id || idx,
            role: msg.role || (msg.sender === 'user' ? 'user' : 'assistant'),
            text: msg.text || msg.message || msg.content || '',
          }))
        : (fallbackMessages || createWelcomeMessages(user?.name || user?.full_name || ''));
      setMessages(mappedMessages);
      if (shouldSetActive) {
        setSessionId(targetSessionId);
      }
      syncSessionToStorage(targetSessionId, mappedMessages, storedSession?.title || 'New Chat');
    } catch (err) {
      if (storedSession?.messages?.length) {
        setMessages(storedSession.messages);
      } else {
        setMessages(fallbackMessages || createWelcomeMessages(user?.name || user?.full_name || ''));
      }
    } finally {
      setLoading(false);
    }
  };

  const loadChatSessions = async () => {
    setHistoryLoading(true);
    const storedSessions = readStoredSessions();
    if (storedSessions.length > 0) {
      setSessions(storedSessions);
    }

    try {
      const res = await chatApi.listSessions();
      const payload = res.data || [];
      const normalized = (Array.isArray(payload) ? payload : payload.sessions || []).map((session) => ({
        id: session._id || session.id || session.session_id,
        title: session.session_title || session.title || 'New Chat',
        createdAt: session.started_at || session.created_at || session.createdAt,
        updatedAt: session.last_updated || session.updated_at || session.updatedAt,
        preview: session.preview || '',
      }));
      if (normalized.length > 0) {
        setSessions(normalized);
        writeStoredSessions(normalized);
        if (!sessionId) {
          setSessionId(normalized[0].id);
          await loadSessionMessages(normalized[0].id, null, true);
        }
      }
    } catch (err) {
      if (storedSessions.length > 0 && !sessionId) {
        setSessionId(storedSessions[0].id);
        await loadSessionMessages(storedSessions[0].id, storedSessions[0].messages || null, true);
      }
      if (storedSessions.length > 0) {
        setSessions(storedSessions);
      }
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    setSessionId(location.state?.sessionId || null);
    // Load sessions and if none exist, create a server-side welcome session
    (async () => {
      await loadChatSessions();
      // Load recent reports and prescriptions for context
      try {
        const repRes = await reportsApi.list();
        const repPayload = repRes.data || [];
        setRecentReports(Array.isArray(repPayload) ? repPayload.slice(0, 6) : []);
      } catch (e) {
        setRecentReports([]);
      }
      try {
        const presRes = await prescriptionsApi.list();
        const presPayload = presRes.data || [];
        setRecentPrescriptions(Array.isArray(presPayload) ? presPayload.slice(0, 6) : []);
      } catch (e) {
        setRecentPrescriptions([]);
      }

      // If after loading there is still no session, start a new one on the server
      if (!sessionId) {
        try {
          const res = await chatApi.startSession();
          const data = res.data || {};
          const sid = data.session_id || data.id;
          const msg = data.message || data.answer || '';
          if (sid) {
            setSessionId(sid);
            setMessages([{ id: 'ai-welcome', role: 'assistant', text: msg }]);
            syncSessionToStorage(sid, [{ id: 'ai-welcome', role: 'assistant', text: msg }], 'New Chat');
          }
        } catch (err) {
          // fallback to local welcome
          const initialMessages = createWelcomeMessages(user?.name || user?.full_name || '');
          setMessages(initialMessages);
        }
      }
    })();
  }, [user?._id || user?.id || user?.email, location.state?.sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    loadSessionMessages(sessionId);
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const startNewChat = () => {
    const welcomeMessages = createWelcomeMessages(user?.name || user?.full_name || '');
    setMessages(welcomeMessages);
    setSessionId(null);
    setInput('');
  };

  const handleSelectSession = async (targetSessionId) => {
    if (!targetSessionId) return;
    setSessionId(targetSessionId);
    await loadSessionMessages(targetSessionId);
  };

  const handleRenameSession = async (targetSessionId) => {
    const currentTitle = sessions.find((session) => session.id === targetSessionId)?.title || 'New Chat';
    const nextTitle = window.prompt('Rename chat', currentTitle);
    if (!nextTitle || !nextTitle.trim()) return;

    const trimmedTitle = nextTitle.trim();
    setSessions((prev) => {
      const updated = prev.map((session) => session.id === targetSessionId ? { ...session, title: trimmedTitle } : session);
      writeStoredSessions(updated);
      return updated;
    });

    try {
      await chatApi.renameSession(targetSessionId, trimmedTitle);
    } catch (err) {
      console.warn('Rename failed, persisted locally.', err);
    }
  };

  const handleDeleteSession = async (targetSessionId) => {
    if (!window.confirm('Delete this chat history?')) return;

    const remainingSessions = sessions.filter((session) => session.id !== targetSessionId);
    setSessions(remainingSessions);
    writeStoredSessions(remainingSessions);

    try {
      await chatApi.deleteSession(targetSessionId);
    } catch (err) {
      console.warn('Delete failed, session removed locally.', err);
    }

    if (sessionId === targetSessionId) {
      startNewChat();
    }
  };

  const handleSend = async (text = input) => {
    if (!text.trim() || loading) return;

    const trimmedText = text.trim();
    const userMsg = { id: Date.now(), role: 'user', text: trimmedText };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      // include recent reports and prescriptions as context when available
      const options = {};
      if (recentReports && recentReports.length) options.reports = recentReports.map(r => r.id || r._id).slice(0, 5);
      if (recentPrescriptions && recentPrescriptions.length) options.prescriptions = recentPrescriptions.map(p => p.id || p._id).slice(0, 5);

      const res = await chatApi.send(sessionId, trimmedText, null, null, options);
      const botText = res?.data?.content || res?.data?.message || res?.message || '';
      const botMsg = { id: Date.now() + 1, role: 'assistant', text: botText };
      const finalMessages = [...nextMessages, botMsg];
      setMessages(finalMessages);

      const resolvedSessionId = res?.data?.session_id || sessionId;
      if (resolvedSessionId) {
        setSessionId(resolvedSessionId);
        syncSessionToStorage(resolvedSessionId, finalMessages, sessions.find((existing) => existing.id === resolvedSessionId)?.title || 'New Chat');
        if (!sessions.some((existing) => existing.id === resolvedSessionId)) {
          setSessions((prev) => [{ id: resolvedSessionId, title: 'New Chat', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), messages: finalMessages, preview: botText }, ...prev]);
        }
      }
    } catch (err) {
      const message = err?.response?.data?.message || err?.response?.data?.detail || err?.message || 'AI service unavailable. Please try again later.';
      const errMsg = { id: Date.now() + 1, role: 'assistant', text: message };
      const fallbackMessages = [...nextMessages, errMsg];
      setMessages(fallbackMessages);
      const fallbackSessionId = sessionId || `local-${Date.now()}`;
      setSessionId(fallbackSessionId);
      syncSessionToStorage(fallbackSessionId, fallbackMessages, 'New Chat');
      setSessions((prev) => prev.some((item) => item.id === fallbackSessionId)
        ? prev
        : [{ id: fallbackSessionId, title: 'New Chat', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), messages: fallbackMessages, preview: message }, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] lg:h-[calc(100vh-7rem)] flex flex-col relative max-w-6xl mx-auto w-full -mt-2">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="flex items-center justify-between pb-6 border-b border-slate-200/50 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-glow">
            <Bot size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">TwinCare AI</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-medical-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-medical-600">Secure Medical Context Active</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={startNewChat}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-900 transition-colors"
            title="New Chat"
          >
            <MessageSquarePlus size={18} />
          </button>
          <button
            onClick={() => setMessages(createWelcomeMessages(user?.name || user?.full_name || ''))}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-900 transition-colors"
            title="Reset Chat"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 gap-4">
        <aside className="hidden lg:flex w-72 shrink-0 flex-col rounded-3xl border border-slate-200/70 bg-white/80 p-3 shadow-sm">
          <div className="mb-3 flex items-center justify-between px-2">
            <p className="text-sm font-semibold text-slate-700">Recent Chats</p>
            <button onClick={startNewChat} className="text-xs font-semibold text-brand-600">New</button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {historyLoading ? (
              <div className="px-2 py-4 text-sm text-slate-400">Loading chats...</div>
            ) : sessions.length === 0 ? (
              <div className="px-2 py-4 text-sm text-slate-400">No saved chats yet.</div>
            ) : (
              sessions.map((session) => (
                <div key={session.id} className={twMerge('rounded-2xl border p-3 transition-all', session.id === sessionId ? 'border-brand-200 bg-brand-50' : 'border-slate-200 bg-white hover:border-slate-300')}>
                  <button onClick={() => handleSelectSession(session.id)} className="w-full text-left">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{session.title || 'New Chat'}</p>
                        <p className="mt-1 truncate text-xs text-slate-500">{session.preview || 'Continue from where you left off.'}</p>
                      </div>
                      <Clock3 size={14} className="mt-0.5 shrink-0 text-slate-400" />
                    </div>
                  </button>
                  <div className="mt-3 flex items-center justify-end gap-2">
                    <button onClick={() => handleRenameSession(session.id)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" title="Rename">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDeleteSession(session.id)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-hide pb-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={twMerge(
                    'flex max-w-[85%] gap-4',
                    msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto',
                  )}
                >
                  <div className={twMerge(
                    'w-8 h-8 shrink-0 rounded-full flex items-center justify-center mt-1',
                    msg.role === 'user' ? 'bg-slate-200' : msg.role === 'system' ? 'bg-red-100' : 'bg-brand-100 text-brand-600',
                  )}>
                    {msg.role === 'user' ? <User size={16} className="text-slate-900" /> : msg.role === 'system' ? <AlertCircle size={16} className="text-red-500" /> : <Sparkles size={16} />}
                  </div>

                  <div className={twMerge(
                    'p-4 rounded-2xl shadow-sm text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-brand-100 text-brand-900 rounded-tr-sm shadow-glow-sm'
                      : msg.role === 'system'
                      ? 'bg-red-50 text-red-600 border border-red-100 rounded-tl-sm'
                      : 'bg-white border border-brand-200 text-brand-900 rounded-tl-sm',
                  )}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex mr-auto gap-4 max-w-[85%]"
                >
                  <div className="w-8 h-8 shrink-0 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center mt-1">
                    <Sparkles size={16} />
                  </div>
                  <div className="p-4 bg-white border border-slate-100 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          <div className="mt-4 shrink-0">
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt)}
                    className="text-xs font-semibold px-3 py-1.5 bg-white border border-brand-200 text-brand-700 rounded-full hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800 transition-colors shadow-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            <GlassCard className="!p-2 flex items-center gap-2 border border-brand-200/50 shadow-glass-dark">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about your health, lab results, or symptoms..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-brand-900 placeholder:text-brand-400 px-4 py-2 outline-none"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="w-10 h-10 shrink-0 bg-brand-500 rounded-xl flex items-center justify-center text-white disabled:opacity-50 hover:bg-brand-600 transition-colors shadow-glow-sm"
              >
                <Send size={18} className="ml-0.5" />
              </button>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
