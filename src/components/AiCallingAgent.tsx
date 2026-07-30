import React, { useState, useEffect, useRef } from 'react';
import { Language, UserProfile, ChatMessage } from '../types';
import { translations } from '../data/translations';
import {
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Send,
  User,
  Bot,
  X,
  Radio,
} from 'lucide-react';

interface AiCallingAgentProps {
  currentLanguage: Language;
  currentUser: UserProfile;
  onClose: () => void;
}

export const AiCallingAgent: React.FC<AiCallingAgentProps> = ({
  currentLanguage,
  currentUser,
  onClose,
}) => {
  const t = translations[currentLanguage];

  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected' | 'ended'>('connected');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text:
        currentLanguage === 'mr'
          ? `नमस्कार ${currentUser.name}! स्मार्टकेअर AI मध्ये तुमचे स्वागत आहे. मी तुम्हाला ऑनलाइन ओपीडी पावती, डॉक्टरांची उपलब्धता किंवा औषध साठ्याविषयी कशी मदत करू शकतो?`
          : currentLanguage === 'hi'
          ? `नमस्ते ${currentUser.name}! स्मार्टकेयर AI में आपका स्वागत है। मैं आपकी ऑनलाइन ओपीडी पर्ची, डॉक्टर उपलब्धता या दवा स्टॉक में कैसे मदद कर सकता हूँ?`
          : `Hello ${currentUser.name}! Welcome to Smartcare AI Call Centre. How can I assist you with OPD booking, doctor availability, or pharmacy stock today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    // Speak initial welcome message
    speakText(messages[0].text);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  const speakText = (text: string) => {
    if (!synthRef.current || !isSpeakerOn) return;
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (currentLanguage === 'hi') utterance.lang = 'hi-IN';
    else if (currentLanguage === 'mr') utterance.lang = 'mr-IN';
    else utterance.lang = 'en-IN';

    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    synthRef.current.speak(utterance);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userQuery = inputText.trim();
    setInputText('');

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/call-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuestion: userQuery,
          language: currentLanguage,
          userRole: currentUser.role,
        }),
      });

      const data = await response.json();
      const aiReply = data.reply || data.fallbackReply || 'I am processing your query. Please hold on.';

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      speakText(aiReply);
    } catch (err) {
      const fallbackText =
        currentLanguage === 'mr'
          ? 'स्मार्टकेअर AI कडून प्रतिसाद: ओपीडी पावतीसाठी ॲपमधील ऑनलाइन ओपीडी टॅब वापरा.'
          : currentLanguage === 'hi'
          ? 'स्मार्टकेयर AI उत्तर: ओपीडी पर्ची के लिए कृपया ऐप के ऑनलाइन ओपीडी सेक्शन का उपयोग करें।'
          : 'Smartcare AI Response: For OPD booking, please use the Online OPD tab in the app.';

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      speakText(fallbackText);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndCall = () => {
    if (synthRef.current) synthRef.current.cancel();
    setCallStatus('ended');
    setTimeout(() => {
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-md shadow-sky-200">
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-800">Smartcare AI Voice Call</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold font-mono">
                  ACTIVE • {formatTime(callDuration)}
                </span>
              </div>
              <p className="text-xs text-slate-500">{t.aiCallAgentDesc}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleEndCall}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Audio Spectrum Waveform Banner */}
        <div className="bg-sky-50 border-b border-sky-100 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-700">
            <Radio className="w-4 h-4 animate-ping text-sky-600" />
            <span>AI Voice Stream Connected ({currentLanguage.toUpperCase()})</span>
          </div>

          <div className="flex items-center gap-1 h-6">
            <div className="w-1 bg-sky-500 h-3 animate-bounce [animation-delay:0ms] rounded-full" />
            <div className="w-1 bg-emerald-500 h-6 animate-bounce [animation-delay:150ms] rounded-full" />
            <div className="w-1 bg-sky-500 h-4 animate-bounce [animation-delay:300ms] rounded-full" />
            <div className="w-1 bg-emerald-500 h-5 animate-bounce [animation-delay:450ms] rounded-full" />
            <div className="w-1 bg-sky-500 h-2 animate-bounce [animation-delay:200ms] rounded-full" />
          </div>
        </div>

        {/* Conversation Transcript Log */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50 min-h-[250px]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                  m.sender === 'user'
                    ? 'bg-slate-800 text-white'
                    : 'bg-sky-600 text-white shadow-md shadow-sky-200'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-slate-800 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1 text-[10px] opacity-70">
                  <span className="font-bold">{m.sender === 'user' ? 'You' : 'Smartcare AI Agent'}</span>
                  <span>{m.timestamp}</span>
                </div>
                <p>{m.text}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs font-bold text-sky-700 bg-sky-50 p-3 rounded-2xl border border-sky-200 max-w-xs">
              <Sparkles className="w-4 h-4 text-sky-600 animate-spin" />
              <span>Smartcare AI is formulating spoken answer...</span>
            </div>
          )}
        </div>

        {/* Input & Call Controls */}
        <div className="p-4 bg-white border-t border-slate-200 space-y-3">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              placeholder={t.speakPrompt}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold transition-all shadow-md shadow-sky-200 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Phone Controls */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3.5 rounded-full border transition-all cursor-pointer ${
                isMuted ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={handleEndCall}
              className="px-6 py-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-200 flex items-center gap-2 transition-all cursor-pointer"
            >
              <PhoneOff className="w-5 h-5" />
              <span>End Voice Call</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`p-3.5 rounded-full border transition-all cursor-pointer ${
                !isSpeakerOn ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title={isSpeakerOn ? 'Turn off speaker' : 'Turn on speaker'}
            >
              {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
