import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini Client server-side
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // API Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // AI Voice Calling Agent Assistant Endpoint
  app.post('/api/gemini/call-assistant', async (req, res) => {
    try {
      const { userQuestion, language = 'en', userRole = 'patient' } = req.body;

      if (!userQuestion) {
        return res.status(400).json({ error: 'userQuestion is required' });
      }

      const languageMap: Record<string, string> = {
        en: 'English',
        hi: 'Hindi (हिंदी)',
        mr: 'Marathi (मराठी)',
      };

      const selectedLanguage = languageMap[language] || 'English';

      const systemInstruction = `You are SmartCare AI, a professional and empathetic voice calling agent for SmartCare Connect Hospital.
Your goal is to answer the user's hospital and healthcare questions concisely and clearly in ${selectedLanguage}.
Current user role: ${userRole}.

Key Hospital Information to reference if relevant:
- Hospital Name: SmartCare Connect Hospital & Multispecialty Research Centre
- OPD Hours: 08:30 AM to 02:00 PM & 04:30 PM to 08:30 PM (Mon-Sat)
- Emergency / Casualty / Ambulance Number: +91 1800-200-9999 (24/7)
- Blood Bank & Pharmacy: Open 24/7 (Ground Floor)
- ICU & Critical Care: 35 Oxygen/Ventilator Beds (2nd Floor, Wing C)
- Online OPD Registration: Users can generate a digital OPD token slip with QR code directly in this app!
- Government Schemes Accepted: Ayushman Bharat (PM-JAY), Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY), CGHS, ECHS.
- Doctor Departments: Cardiology, Orthopedics, Pediatrics, General Medicine, Neurology, Gynecology, ENT.

Instructions:
1. Speak directly in ${selectedLanguage} using warm, clear, conversational hospital phone tone.
2. Keep your spoken response brief (2-4 sentences max) so it sounds natural when read aloud over audio.
3. Provide practical, accurate advice on OPD booking, doctor availability, pharmacy stock, or emergency numbers.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: userQuestion,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText = response.text || 'Thank you for calling SmartCare Connect AI. How else can I assist you?';

      res.json({
        success: true,
        reply: replyText,
        language,
      });
    } catch (error: any) {
      console.error('Error in Gemini calling agent:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate voice response',
        fallbackReply:
          req.body.language === 'mr'
            ? 'स्मार्टकेअर AI मध्ये स्वागत आहे. ओपीडी पावतीसाठी आपण ॲपमधील ऑनलाइन ओपीडी विभागाचा वापर करू शकता किंवा हेल्प डेस्क +91 1800-200-9999 वर संपर्क साधू शकता.'
            : req.body.language === 'hi'
            ? 'स्मार्टकेयर AI में आपका स्वागत है। ओपीडी पर्ची के लिए आप ऐप के ऑनलाइन ओपीडी सेक्शन का उपयोग कर सकते हैं या आपातकालीन सहायता +91 1800-200-9999 पर कॉल कर सकते हैं।'
            : 'Welcome to SmartCare AI. For OPD slips, please use the Online OPD tab in the app or call our helpline +91 1800-200-9999 for emergency care.',
      });
    }
  });

  // Setup Vite middleware in Dev or Static Serving in Prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
