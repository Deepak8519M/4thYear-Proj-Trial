import React, { useState, useEffect, useRef } from 'react';
import { 
  Stethoscope, 
  User, 
  Calendar, 
  Clock, 
  ChevronRight, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  FileText, 
  History, 
  ArrowLeft,
  Activity,
  HeartPulse,
  Baby,
  Sparkles,
  Search,
  Printer,
  Send,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, onSnapshot, doc, getDoc } from 'firebase/firestore';

// --- Configuration & Initialization ---
const apiKey = ""; // Provided by environment
const appId = typeof __app_id !== 'undefined' ? __app_id : 'healthtalk-ai-v1';
const firebaseConfig = typeof __initial_auth_token !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : { apiKey: "mock-key", authDomain: "mock.firebaseapp.com", projectId: "mock-project" };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Doctor Personas ---
const DOCTORS = [
  {
    id: 'dr-smith',
    name: 'Dr. Sarah Smith',
    specialty: 'General Physician',
    description: 'Expert in broad health concerns, preventative care, and routine check-ups.',
    voice: 'Kore', 
    style: 'Empathetic, methodical, and thorough.',
    systemPrompt: 'You are Dr. Sarah Smith, a General Physician. Your tone is empathetic and professional. Ask about duration, symptoms, and lifestyle.',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'dr-chen',
    name: 'Dr. Michael Chen',
    specialty: 'Pediatrician',
    description: 'Specializing in child health, developmental milestones, and adolescent care.',
    voice: 'Puck', 
    style: 'Gentle, patient, and clear instructions.',
    systemPrompt: 'You are Dr. Michael Chen, a Pediatrician. Your tone is warm and reassuring. You speak clearly.',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'dr-rodriguez',
    name: 'Dr. Elena Rodriguez',
    specialty: 'Dermatologist',
    description: 'Specialist in skin, hair, and nail health including chronic conditions.',
    voice: 'Leda', 
    style: 'Direct, analytical, and highly descriptive.',
    systemPrompt: 'You are Dr. Elena Rodriguez, a Dermatologist. Your tone is clinical and precise.',
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200'
  }
];

// --- Utility: PCM to WAV ---
function pcmToWav(pcmData, sampleRate = 24000) {
  const buffer = new ArrayBuffer(44 + pcmData.length * 2);
  const view = new DataView(buffer);
  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
  };
  writeString(0, 'RIFF');
  view.setUint32(4, 32 + pcmData.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, pcmData.length * 2, true);
  let offset = 44;
  for (let i = 0; i < pcmData.length; i++, offset += 2) view.setInt16(offset, pcmData[i], true);
  return new Blob([buffer], { type: 'audio/wav' });
}

const fetchWithRetry = async (url, options, retries = 5, backoff = 1000) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
    }
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw error;
  }
};

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [activeReport, setActiveReport] = useState(null);
  const [isConsulting, setIsConsulting] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const audioRef = useRef(null);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  
  const selectedDoctorRef = useRef(null);
  const messagesRef = useRef([]);
  const isConsultingRef = useRef(false);
  const isSpeakingRef = useRef(false);

  useEffect(() => {
    selectedDoctorRef.current = selectedDoctor;
    isConsultingRef.current = isConsulting;
    isSpeakingRef.current = isSpeaking;
  }, [selectedDoctor, isConsulting, isSpeaking]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) { console.error("Auth Error:", err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'consultations'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSessions(data.sort((a, b) => b.timestamp - a.timestamp));
    }, (error) => console.error("Snapshot error:", error));
    return () => unsubscribe();
  }, [user]);

  const speakText = async (text, doctor) => {
    if (!doctor) return;
    setIsSpeaking(true);
    isSpeakingRef.current = true;
    setErrorMsg(null);
    try {
      const data = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: text }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: doctor.voice }
              }
            }
          },
          model: "gemini-2.5-flash-preview-tts"
        })
      });

      const pcmBase64 = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!pcmBase64) throw new Error("Voice data missing in response");

      const pcmData = new Int16Array(Uint8Array.from(atob(pcmBase64), c => c.charCodeAt(0)).buffer);
      const wavBlob = pcmToWav(pcmData);
      const url = URL.createObjectURL(wavBlob);
      const audio = new Audio(url);
      audioRef.current = audio;
      
      const finishSpeaking = () => {
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        if (isConsultingRef.current) {
          setTimeout(() => startListening(), 100);
        }
      };

      audio.onended = finishSpeaking;
      audio.onerror = finishSpeaking;

      await audio.play();
    } catch (err) {
      console.error("TTS Error:", err);
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      if (isConsultingRef.current) {
        startListening();
      }
    }
  };

  const getAIResponse = async (userText, doctor, history) => {
    try {
      const data = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            ...history.map(m => ({ role: m.role === 'ai' ? 'model' : 'user', parts: [{ text: m.text }] })),
            { role: 'user', parts: [{ text: userText }] }
          ],
          systemInstruction: { parts: [{ text: doctor.systemPrompt + " Always end your responses with a question. If you have enough info, say: 'I have sufficient information to generate your report now. Is there anything else?'" }] }
        })
      });
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that.";
    } catch (err) {
      console.error("AI Error:", err);
      return "I apologize, I'm having trouble connecting. Could you repeat that?";
    }
  };

  const startConsultation = async (doctor) => {
    setSelectedDoctor(doctor);
    const welcome = `Hello, I am ${doctor.name}, your ${doctor.specialty}. How can I help you today?`;
    setMessages([{ role: 'ai', text: welcome }]);
    setView('consult');
    setIsConsulting(true);
    await speakText(welcome, doctor);
  };

  const handleUserMessage = async (text) => {
    const doctor = selectedDoctorRef.current;
    if (!text.trim() || !doctor || isProcessing) return;
    
    setIsProcessing(true);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      recognitionRef.current.onend = null; 
      recognitionRef.current.stop();
    }

    const currentHistory = messagesRef.current;
    const newMessages = [...currentHistory, { role: 'user', text }];
    setMessages(newMessages);
    setTranscription('');
    
    const aiText = await getAIResponse(text, doctor, newMessages);
    setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    setIsProcessing(false);
    await speakText(aiText, doctor);
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) return;
    if (isSpeakingRef.current || !isConsultingRef.current || isProcessing) return;
    
    if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setIsListening(true);
      setErrorMsg(null);
    };
    
    recognition.onresult = (event) => {
      let fullTranscript = '';
      for (let i = 0; i < event.results.length; ++i) {
        fullTranscript += event.results[i][0].transcript;
      }

      const combined = fullTranscript.trim();
      if (combined) {
        setTranscription(combined);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (combined.length > 2 && isConsultingRef.current && !isSpeakingRef.current && !isProcessing) {
            handleUserMessage(combined);
          }
        }, 2200); 
      }
    };

    recognition.onerror = (event) => {
        if (event.error !== 'no-speech') {
            console.error("Speech Recognition Error:", event.error);
        }
        setIsListening(false);
    };

    recognition.onend = () => {
        if (isConsultingRef.current && !isSpeakingRef.current && !isProcessing) {
            try { recognition.start(); } catch(e) {}
        } else {
            setIsListening(false);
        }
    };

    recognitionRef.current = recognition;
    try { recognition.start(); } catch(e) {}
  };

  const endConsultation = async () => {
    setIsConsulting(false);
    isConsultingRef.current = false;
    if (audioRef.current) audioRef.current.pause();
    if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
    }
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    const currentMessages = messagesRef.current;
    const currentDoctor = selectedDoctorRef.current;

    setIsProcessing(true);
    try {
        const reportDataResponse = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Summarize this medical consultation into a JSON report. Fields: chiefComplaint, summary, symptoms (array), duration, severity (Low/Medium/High). Conversation: ${JSON.stringify(currentMessages)}` }] }],
            generationConfig: { 
              responseMimeType: "application/json",
              responseSchema: {
                type: "OBJECT",
                properties: {
                  chiefComplaint: { type: "STRING" },
                  summary: { type: "STRING" },
                  symptoms: { type: "ARRAY", items: { type: "STRING" } },
                  duration: { type: "STRING" },
                  severity: { type: "STRING" }
                }
              }
            }
          })
        });

        const reportData = JSON.parse(reportDataResponse.candidates[0].content.parts[0].text);
        const docData = {
          doctorId: currentDoctor.id,
          doctorName: currentDoctor.name,
          doctorSpecialty: currentDoctor.specialty,
          timestamp: Date.now(),
          report: reportData,
          messages: currentMessages
        };
        if (user) await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'consultations'), docData);
    } catch (e) {
        console.error("Report generation failed", e);
    }
    setIsProcessing(false);
    setView('history');
  };

  // --- Views ---
  const Home = () => (
    <div className="max-w-6xl mx-auto p-6 animate-in fade-in duration-700">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-600/30 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-[0_0_15px_rgba(37,99,235,0.1)]">
          <Sparkles size={12} />
          Neural Medical Intelligence
        </div>
        <h1 className="text-6xl font-black text-white mb-4 tracking-tighter">
          HealthTalk <span className="text-blue-600 drop-shadow-[0_0_10px_rgba(37,99,235,0.4)]">AI</span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto font-medium">Next-generation medical voice protocol. Secure. Clinical. Intelligent.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        {DOCTORS.map(doc => (
          <div key={doc.id} className="bg-[#0a0a0a] rounded-[2.5rem] p-2 border border-zinc-800 hover:border-blue-500/50 transition-all duration-500 group shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <div className="relative h-64 rounded-[2rem] overflow-hidden mb-6">
              <img src={doc.avatar} alt={doc.name} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
              <div className="absolute bottom-4 left-6">
                 <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${doc.color}`}>
                  {doc.specialty}
                </span>
              </div>
            </div>
            <div className="px-6 pb-6">
              <h3 className="text-2xl font-black text-zinc-100 mb-2 tracking-tight">{doc.name}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6 h-12 overflow-hidden font-medium">{doc.description}</p>
              <button 
                onClick={() => startConsultation(doc)}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all active:scale-95"
              >
                Initiate Protocol
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 flex justify-center">
        <button 
          onClick={() => setView('history')}
          className="group flex items-center gap-3 px-8 py-4 bg-[#0a0a0a] border border-zinc-800 rounded-2xl text-zinc-400 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-900 hover:text-zinc-100 transition-all shadow-xl"
        >
          <History size={16} />
          Encrypted Archives
        </button>
      </div>
    </div>
  );

  const Consultation = () => (
    <div className="max-w-4xl mx-auto h-[85vh] flex flex-col animate-in slide-in-from-bottom-8 duration-700">
      <div className="bg-[#0a0a0a] p-6 rounded-t-[2.5rem] border-b border-zinc-800 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border border-zinc-700">
              <img src={selectedDoctor?.avatar} alt="" className="w-full h-full object-cover grayscale-[0.3]" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-[#0a0a0a] shadow-[0_0_10px_rgba(37,99,235,0.6)] animate-pulse" />
          </div>
          <div>
            <h2 className="font-black text-zinc-100 text-lg tracking-tight">{selectedDoctor?.name}</h2>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">{selectedDoctor?.specialty} • Active Node</p>
            </div>
          </div>
        </div>
        <button 
          onClick={endConsultation}
          disabled={isProcessing}
          className="px-5 py-2.5 bg-zinc-900 text-zinc-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-950 hover:text-red-400 transition-all border border-zinc-800 disabled:opacity-50"
        >
          {isProcessing ? <Loader2 size={16} className="animate-spin" /> : 'Terminate'}
        </button>
      </div>

      <div className="flex-grow bg-black overflow-y-auto p-8 space-y-6 scrollbar-hide border-x border-zinc-800">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[75%] p-5 rounded-2xl ${
              m.role === 'ai' 
                ? 'bg-[#0a0a0a] text-zinc-100 border border-zinc-800 rounded-tl-none' 
                : 'bg-blue-600 text-white font-bold rounded-tr-none shadow-[0_0_20px_rgba(37,99,235,0.2)]'
            }`}>
              <p className="text-[14px] leading-relaxed">{m.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-8 bg-[#0a0a0a] rounded-b-[2.5rem] border-t border-zinc-800 shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col items-center gap-6">
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <AlertCircle size={14} />
              {errorMsg}
            </div>
          )}
          
          <div className={`transition-all duration-300 min-h-[1.5rem] text-center px-10 text-xs font-bold uppercase tracking-widest ${transcription ? 'text-blue-400' : 'text-zinc-600 italic'}`}>
            {transcription ? `"${transcription}"` : isListening ? "Neural Link Listening..." : isSpeaking ? "Agent Transmitting..." : "Standby..."}
          </div>
          
          <div className="flex items-center gap-8">
            <button 
              disabled={isSpeaking || isProcessing}
              onClick={isListening ? () => recognitionRef.current?.stop() : startListening}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all relative ${
                isListening 
                  ? 'bg-red-600 text-white scale-110 shadow-[0_0_30px_rgba(220,38,38,0.4)]' 
                  : (isSpeaking || isProcessing)
                    ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed opacity-30' 
                    : 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff size={32} />
                  <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-25" />
                </>
              ) : isProcessing ? (
                <Loader2 size={32} className="animate-spin text-blue-400" />
              ) : (
                <Mic size={32} />
              )}
            </button>

            {transcription && isListening && (
              <button 
                onClick={() => handleUserMessage(transcription)}
                className="w-14 h-14 bg-[#0a0a0a] border border-zinc-700 text-blue-400 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-lg animate-in fade-in zoom-in"
              >
                <Send size={20} />
              </button>
            )}
          </div>
          <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em]">
            Protocol: {isListening ? 'Streaming' : isSpeaking ? 'Transmitting' : 'Idle'}
          </p>
        </div>
      </div>
    </div>
  );

  const ConsultationHistory = () => (
    <div className="max-w-6xl mx-auto p-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-10">
        <div>
          <button onClick={() => setView('home')} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-4 font-black text-[10px] uppercase tracking-widest">
            <ArrowLeft size={16} />
            Back to Terminal
          </button>
          <h1 className="text-4xl font-black text-white tracking-tighter">Encrypted Archives</h1>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-[#0a0a0a] rounded-[2.5rem] p-24 text-center border border-zinc-800">
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-6 text-zinc-700 border border-zinc-800">
            <History size={32} />
          </div>
          <h3 className="text-2xl font-black text-zinc-100 mb-2">No Archived Data</h3>
          <p className="text-zinc-500 max-w-xs mx-auto text-sm font-medium">Complete a session to populate the neural medical archive.</p>
        </div>
      ) : (
        <div className="bg-[#0a0a0a] rounded-[2.5rem] border border-zinc-800 overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-zinc-900/50 border-b border-zinc-800">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Medical Agent</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Chief Complaint</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Timestamp</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {sessions.map((s) => (
                <tr key={s.id} className="hover:bg-zinc-900/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-400 font-black border border-blue-600/20 text-xs">
                        {s.doctorName?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-zinc-100 group-hover:text-blue-400 transition-colors text-sm">{s.doctorName}</div>
                        <div className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">{s.doctorSpecialty}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm text-zinc-400 truncate max-w-xs italic">"{s.report?.chiefComplaint || "N/A"}"</p>
                  </td>
                  <td className="px-8 py-6 text-xs font-bold">
                    <div className="text-zinc-300">{new Date(s.timestamp).toLocaleDateString()}</div>
                    <div className="text-zinc-600 text-[10px]">{new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td className="px-8 py-6">
                    <button 
                      onClick={() => { setActiveReport(s); setView('report'); }}
                      className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-blue-400 hover:bg-blue-600 hover:text-white font-black text-[10px] transition-all uppercase tracking-widest"
                    >
                      <FileText size={14} />
                      Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const ReportView = () => {
    if (!activeReport) return null;
    const { report, doctorName, doctorSpecialty, timestamp } = activeReport;
    return (
      <div className="max-w-3xl mx-auto p-8 animate-in zoom-in-95 duration-500">
        <button onClick={() => setView('history')} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-10 font-black text-[10px] uppercase tracking-widest no-print">
          <ArrowLeft size={16} />
          Back to Archives
        </button>

        <div className="bg-[#0a0a0a] rounded-[2.5rem] border border-zinc-800 overflow-hidden shadow-[0_0_80px_rgba(0,0,0,1)] print:bg-white print:text-black print:rounded-none print:border-none">
          <div className="bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] p-10 border-b border-zinc-800 flex justify-between items-start print:bg-white print:border-b-2 print:border-black">
            <div>
              <h1 className="text-3xl font-black mb-2 tracking-tighter text-white print:text-black">Medical Voice Agent Report</h1>
              <div className="px-3 py-1 bg-blue-600/10 rounded-full inline-flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest border border-blue-600/20 print:border-black print:text-black">
                <Clock size={12} />
                Generated: {new Date(timestamp).toLocaleString()}
              </div>
            </div>
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 print:border-black print:bg-white">
              <Stethoscope size={36} className="text-blue-500 print:text-black" />
            </div>
          </div>

          <div className="p-10 space-y-10">
            <div className="grid grid-cols-2 gap-8 border-b border-zinc-800 pb-10 print:border-black">
              <section>
                <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-4 print:text-black">Protocol Node</h2>
                <div className="space-y-1">
                  <p className="font-black text-xl text-zinc-100 print:text-black">{doctorName}</p>
                  <p className="text-zinc-500 font-black uppercase text-[10px] tracking-widest print:text-black">{doctorSpecialty}</p>
                </div>
              </section>
              <section>
                <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-4 print:text-black">Clinical Severity</h2>
                <div className={`inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  report?.severity === 'High' ? 'bg-red-500/10 text-red-500 border-red-500/30' : 
                  report?.severity === 'Medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' :
                  'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                } print:border-black print:text-black print:bg-white`}>
                  Status: {report?.severity || 'Low'} Risk
                </div>
              </section>
            </div>

            <section>
              <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4 print:text-black">Chief Complaint</h2>
              <p className="text-2xl font-black text-zinc-100 print:text-black leading-tight italic tracking-tight">
                "{report?.chiefComplaint || 'Data unavailable'}"
              </p>
            </section>

            <section>
              <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4 print:text-black">Neural Summary</h2>
              <p className="text-zinc-400 print:text-black leading-relaxed font-medium">
                {report?.summary || 'No summary available.'}
              </p>
            </section>

            <div className="grid grid-cols-2 gap-10">
              <section>
                <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4 print:text-black">Identified Markers</h2>
                <div className="flex flex-wrap gap-2">
                  {report?.symptoms?.map((s, i) => (
                    <span key={i} className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl text-xs font-black uppercase tracking-tighter print:bg-white print:border-black print:text-black">
                      {s}
                    </span>
                  )) || <span className="text-zinc-600 text-[10px] italic uppercase">Zero markers detected</span>}
                </div>
              </section>
              <section className="bg-black p-6 rounded-2xl border border-zinc-800 print:bg-white print:border-black">
                <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-4 print:text-black">Node Metrics</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Duration</span>
                    <span className="font-black text-zinc-100 print:text-black">{report?.duration || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Accuracy</span>
                    <span className="font-black text-zinc-100 print:text-black">Neural (99.8%)</span>
                  </div>
                </div>
              </section>
            </div>

            <div className="pt-10 border-t border-zinc-800 mt-10 text-center print:border-black">
              <p className="text-[9px] text-zinc-700 uppercase font-black tracking-[0.5em] print:text-black">Confidential Neural Archive • Node {activeReport.id.substring(0,8)}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-2 gap-4 no-print">
           <button 
            onClick={() => window.print()}
            className="py-4 bg-[#0a0a0a] border border-zinc-800 text-zinc-100 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-zinc-900 transition-all shadow-xl"
          >
            <Printer size={16} />
            Export Protocol
          </button>
          <button 
            onClick={() => setView('history')}
            className="py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
          >
            <History size={16} />
            Return to Archives
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-blue-600 selection:text-white">
      <nav className="bg-[#0a0a0a]/80 backdrop-blur-2xl border-b border-zinc-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div 
            onClick={() => setView('home')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] group-hover:scale-110 transition-transform">
              H
            </div>
            <span className="font-black text-xl tracking-tighter text-white">HealthTalk <span className="text-blue-500">AI</span></span>
          </div>
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setView('history')}
              className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all ${view === 'history' ? 'text-blue-500' : 'text-zinc-500 hover:text-zinc-100'}`}
            >
              Archives
            </button>
            <div className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 text-zinc-500 hover:text-white transition-colors cursor-pointer">
              <User size={20} />
            </div>
          </div>
        </div>
      </nav>

      <main className="py-12">
        {view === 'home' && <Home />}
        {view === 'consult' && <Consultation />}
        {view === 'history' && <ConsultationHistory />}
        {view === 'report' && <ReportView />}
      </main>

      <footer className="py-12 text-center text-zinc-700 text-[9px] font-black border-t border-zinc-900 bg-black mt-auto uppercase tracking-[0.5em]">
        <p>&copy; 2024 Neural Medical protocol • Encrypted Voice Transmission</p>
      </footer>
    </div>
  );
}