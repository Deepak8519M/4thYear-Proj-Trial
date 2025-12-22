import React, { useState, useEffect, useRef } from 'react';
import {
MessageSquare,
Send,
ShieldAlert,
FileText,
RefreshCw,
User,
Bot,
Download,
AlertCircle,
X,
Stethoscope,
Mic,
MicOff,
Volume2,
VolumeX,
Plus,
History,
Menu,
Loader2,
Calendar,
ClipboardList,
Image as ImageIcon,
Type,
Trash2,
Phone,
PhoneOff,
Activity,
Zap
} from 'lucide-react';

const apiKey = "";
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";
const TTS_MODEL = "gemini-2.5-flash-preview-tts";

const SYSTEM_PROMPT = `You are a professional AI Medical Assistant named MediFlow. Your goal is to:

1. PHASE 1 (INTAKE): Start by asking the user for their Name and Age. You cannot proceed to symptoms until you have this information.
2. PHASE 2 (SYMPTOMS): Once you have the Name and Age, conduct a thorough but empathetic symptom check.
3. Ask clarifying questions one at a time (e.g., duration, severity, accompanying symptoms).
4. Based on the symptoms, identify potential conditions (clearly stating these are possibilities, not a final diagnosis).
5. Provide actionable precautionary measures and lifestyle advice.
6. ALWAYS include a medical disclaimer that you are an AI and the user should consult a human doctor for medical emergencies.
7. Tone: Supportive, clinical, and clear. Do not use markdown formatting like asterisks. Use plain text only.
8. If in VOICE MODE: Keep responses extremely concise and natural for spoken dialogue.`;

const REPORT_SCHEMA = {
type: "OBJECT",
properties: {
patientName: { type: "STRING" },
patientAge: { type: "STRING" },
symptomSummary: { type: "STRING" },
observations: { type: "ARRAY", items: { type: "STRING" } },
precautions: { type: "ARRAY", items: { type: "STRING" } },
nextSteps: { type: "STRING" }
},
required: ["patientName", "patientAge", "symptomSummary", "observations", "precautions"]
};

const STORAGE_KEY = 'mediflow_assessment_state_v4';

const App = () => {
const [isDataLoaded, setIsDataLoaded] = useState(false);
const [chats, setChats] = useState([
{ id: '1', title: 'Assessment 1', messages: [{ role: 'bot', text: 'Welcome to MediFlow. To begin your clinical assessment, could you please provide your full name and age?' }] }
]);
const [activeChatId, setActiveChatId] = useState('1');
const [input, setInput] = useState('');
const [loading, setLoading] = useState(false);
const [showReport, setShowReport] = useState(false);
const [reportData, setReportData] = useState(null);
const [generatingReport, setGeneratingReport] = useState(false);
const [error, setError] = useState(null);
const [sidebarOpen, setSidebarOpen] = useState(true);

// Voice & Call States
const [isRecording, setIsRecording] = useState(false);
const [isSpeaking, setIsSpeaking] = useState(false);
const [voiceEnabled, setVoiceEnabled] = useState(true);
const [isFinishingSpeech, setIsFinishingSpeech] = useState(false);
const [isCallMode, setIsCallMode] = useState(false);

const chatEndRef = useRef(null);
const recognitionRef = useRef(null);
const audioRef = useRef(null);
const silenceTimerRef = useRef(null);
const reportRef = useRef(null);
const isProcessingRef = useRef(false);

const activeChat = chats.find(c => c.id === activeChatId) || chats[0];
const messages = activeChat.messages;

const scrollToBottom = () => {
chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
};

useEffect(() => {
const savedState = localStorage.getItem(STORAGE_KEY);
if (savedState) {
try {
const { chats: savedChats, activeChatId: savedActiveId } = JSON.parse(savedState);
if (savedChats?.length > 0) {
setChats(savedChats);
if (savedActiveId) setActiveChatId(savedActiveId);
}
} catch (e) { console.error(e); }
}
setIsDataLoaded(true);
}, []);

useEffect(() => {
if (!isDataLoaded) return;
localStorage.setItem(STORAGE_KEY, JSON.stringify({ chats, activeChatId }));
}, [chats, activeChatId, isDataLoaded]);

useEffect(() => { scrollToBottom(); }, [messages, loading]);

useEffect(() => {
const script = document.createElement('script');
script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
script.async = true;
document.body.appendChild(script);
return () => { if (document.body.contains(script)) document.body.removeChild(script); };
}, []);

// Optimized Speech Recognition with Double-Send Prevention
useEffect(() => {
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition && !recognitionRef.current) {
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }

        if (currentTranscript.trim()) {
          setInput(currentTranscript);
          setIsFinishingSpeech(true);

          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

          silenceTimerRef.current = setTimeout(() => {
            // Check processing ref to avoid double-sends
            if (currentTranscript.trim() && !isProcessingRef.current) {
              handleSend(currentTranscript.trim());
              recognition.stop();
            }
          }, 1100);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        setIsFinishingSpeech(false);
      };

      recognition.onerror = (e) => {
        if (e.error !== 'no-speech') {
          setIsRecording(false);
          setIsCallMode(false);
          setError("Microphone unavailable.");
        }
      };

      recognitionRef.current = recognition;
    }

}, [activeChatId]);

const pcmToWav = (pcmData, sampleRate) => {
const buffer = new ArrayBuffer(44 + pcmData.length _ 2);
const view = new DataView(buffer);
const writeString = (offset, string) => {
for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
};
writeString(0, 'RIFF');
view.setUint32(4, 32 + pcmData.length _ 2, true);
writeString(8, 'WAVE');
writeString(12, 'fmt ');
view.setUint32(16, 16, true);
view.setUint16(20, 1, true);
view.setUint16(22, 1, true);
view.setUint32(24, sampleRate, true);
view.setUint32(28, sampleRate _ 2, true);
view.setUint16(32, 2, true);
view.setUint16(34, 16, true);
writeString(36, 'data');
view.setUint32(40, pcmData.length _ 2, true);
let offset = 44;
for (let i = 0; i < pcmData.length; i++, offset += 2) view.setInt16(offset, pcmData[i], true);
return new Blob([buffer], { type: 'audio/wav' });
};

const toggleRecording = () => {
if (isRecording) {
recognitionRef.current?.stop();
} else {
setError(null);
setInput('');
recognitionRef.current?.start();
setIsRecording(true);
}
};

const toggleCallMode = () => {
if (isCallMode) {
setIsCallMode(false);
recognitionRef.current?.stop();
if (audioRef.current) audioRef.current.pause();
} else {
setIsCallMode(true);
setVoiceEnabled(true);
setError(null);

      const lastBotMsg = messages.filter(m => m.role === 'bot').pop();
      const greeting = lastBotMsg ? lastBotMsg.text : "Hello. I am MediFlow. Please tell me your full name and age.";
      callGeminiTTS(greeting);
    }

};

const callGeminiTTS = async (text) => {
if (!voiceEnabled || !text) return;
try {
const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent?key=${apiKey}`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
contents: [{ parts: [{ text: `Say naturally: ${text}` }] }],
generationConfig: {
responseModalities: ["AUDIO"],
speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } }
}
})
});
const result = await response.json();
const audioDataB64 = result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
if (audioDataB64) {
const binaryString = atob(audioDataB64);
const len = binaryString.length;
const bytes = new Int16Array(len / 2);
for (let i = 0; i < len; i += 2) bytes[i / 2] = binaryString.charCodeAt(i) | (binaryString.charCodeAt(i + 1) << 8);
const wavBlob = pcmToWav(bytes, 24000);
const url = URL.createObjectURL(wavBlob);
if (audioRef.current) {
audioRef.current.src = url;
audioRef.current.play();
setIsSpeaking(true);
if (isRecording) recognitionRef.current?.stop();
}
}
} catch (e) { console.error("TTS failed", e); }
};

const handleSend = async (manualInput) => {
const textToSend = (manualInput || input).trim();
if (!textToSend || isProcessingRef.current || loading) return;

    isProcessingRef.current = true;
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    const userMsg = { role: 'user', text: textToSend };
    setInput('');

    // STEP 1: Add user message immediately
    setChats(prev => prev.map(chat =>
      chat.id === activeChatId ? { ...chat, messages: [...chat.messages, userMsg] } : chat
    ));

    setLoading(true);
    setError(null);
    setIsSpeaking(false);
    setIsFinishingSpeech(false);

    try {
      const chatContext = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n');
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${chatContext}\nUser: ${textToSend}` }] }],
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }
        })
      });

      if (!response.ok) throw new Error();
      const data = await response.json();
      const rawAiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that.";
      const aiText = rawAiText.replace(/\*/g, '');

      // STEP 2: Only append the bot message
      setChats(prev => prev.map(chat =>
        chat.id === activeChatId ? { ...chat, messages: [...chat.messages, { role: 'bot', text: aiText }] } : chat
      ));

      await callGeminiTTS(aiText);
    } catch (err) {
      setError("Communication error. Please try again.");
    } finally {
      setLoading(false);
      isProcessingRef.current = false;
    }

};

const onAudioEnded = () => {
setIsSpeaking(false);
if (isCallMode) {
setInput('');
recognitionRef.current?.start();
setIsRecording(true);
}
};

const startNewChat = () => {
if (loading) return;
const newId = Date.now().toString();
const newChat = {
id: newId,
title: `Assessment ${chats.length + 1}`,
messages: [{ role: 'bot', text: 'Welcome to MediFlow. Please provide your full name and age.' }]
};
setChats([...chats, newChat]);
setActiveChatId(newId);
};

const deleteChat = (e, id) => {
e.stopPropagation();
const updatedChats = chats.filter(chat => chat.id !== id);
if (updatedChats.length === 0) {
const newId = Date.now().toString();
setChats([{ id: newId, title: 'Assessment 1', messages: [{ role: 'bot', text: 'Welcome to MediFlow. Please provide your name and age.' }] }]);
setActiveChatId(newId);
} else {
setChats(updatedChats);
if (activeChatId === id) setActiveChatId(updatedChats[0].id);
}
};

const generateReport = async () => {
if (messages.length < 3) {
setError("Please provide more information for the report.");
return;
}
setGeneratingReport(true);
setShowReport(true);
setError(null);

    try {
      const history = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n');
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Generate clinical report JSON for:\n\n${history}` }] }],
          generationConfig: { responseMimeType: "application/json", responseSchema: REPORT_SCHEMA }
        })
      });
      const data = await response.json();
      setReportData(JSON.parse(data.candidates[0].content.parts[0].text));
    } catch (err) { setError("Report generation failed."); setShowReport(false); } finally { setGeneratingReport(false); }

};

return (
<div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
<audio ref={audioRef} onEnded={onAudioEnded} hidden />

      {/* History Sidebar */}
      <aside className={`${sidebarOpen ? 'w-80' : 'w-0'} bg-slate-900 transition-all duration-300 flex flex-col overflow-hidden shrink-0 shadow-2xl z-40`}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-xl"><Stethoscope className="text-white" size={20} /></div>
            <span className="font-bold text-white text-lg">MediFlow</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white lg:hidden"><X size={20} /></button>
        </div>
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          <button onClick={startNewChat} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg"><Plus size={18} />New Assessment</button>
          <div className="space-y-1">
            <p className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">History</p>
            {chats.map(chat => (
              <div key={chat.id} className="group relative flex items-center">
                <button onClick={() => setActiveChatId(chat.id)} className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 pr-10 ${activeChatId === chat.id ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                  <History size={16} /><span className="truncate text-sm font-medium">{chat.title}</span>
                </button>
                <button onClick={(e) => deleteChat(e, chat.id)} className="absolute right-2 p-1.5 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* REDESIGNED Call Mode Overlay */}
        {isCallMode && (
          <div className="absolute inset-0 z-[60] bg-slate-950 flex flex-col items-center justify-between text-white p-12 animate-in fade-in duration-700">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none flex items-center justify-center">
               <div className="absolute w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px] animate-pulse"></div>
            </div>

            <div className="relative z-10 w-full flex justify-between items-center px-4">
              <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Clinically Secure Connection</span>
              </div>
              <Activity size={24} className="text-blue-500/50" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-12 text-center w-full max-w-lg">
              <div className="relative">
                <div className={`absolute -inset-16 rounded-full border border-blue-500/10 transition-all duration-1000 ${isSpeaking ? 'scale-150 opacity-0' : 'scale-100'}`}></div>
                <div className={`relative p-24 rounded-full bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 shadow-[0_0_100px_-20px_rgba(37,99,235,0.8)] transition-all duration-500 ${isRecording && !isSpeaking ? 'scale-110' : 'scale-100'}`}>
                  {isSpeaking ? (
                    <div className="flex gap-1.5 items-center">
                       <div className="w-2 h-12 bg-white rounded-full animate-[pulse_1s_infinite]"></div>
                       <div className="w-2 h-20 bg-white/80 rounded-full animate-[pulse_1.2s_infinite]"></div>
                       <div className="w-2 h-12 bg-white rounded-full animate-[pulse_1.4s_infinite]"></div>
                    </div>
                  ) : (
                    <Bot size={72} className="text-white drop-shadow-lg" />
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-5xl font-black tracking-tighter text-white">
                  {isSpeaking ? 'MediFlow' : isRecording ? 'Listening' : 'Thinking'}
                </h2>
                <p className="text-blue-400 font-bold uppercase tracking-[0.3em] text-xs">Hands-Free Assessment</p>
              </div>

              {/* Enhanced Visual Feedback Bubble */}
              <div className="bg-white/5 border-2 border-white/10 backdrop-blur-2xl p-8 rounded-[2.5rem] w-full min-h-[160px] flex flex-col items-center justify-center shadow-2xl relative">
                 <div className="absolute -top-4 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Live Transcription</div>
                 <p className="text-2xl text-blue-50 font-semibold italic opacity-95 leading-relaxed">
                   {isRecording ? (input || "Please speak clearly...") : (isSpeaking ? "Communicating Guidance..." : "Synthesizing Symptoms...")}
                 </p>
              </div>
            </div>

            <div className="relative z-10 w-full flex justify-center pb-8">
              <button
                onClick={toggleCallMode}
                className="group flex flex-col items-center gap-6"
              >
                <div className="bg-red-500 hover:bg-red-600 p-10 rounded-full shadow-[0_0_60px_-10px_rgba(239,68,68,0.5)] transition-all hover:scale-110 active:scale-90 border-4 border-white/10">
                  <PhoneOff size={40} className="text-white" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-400 group-hover:text-red-300">Terminate Call</span>
              </button>
            </div>
          </div>
        )}

        <header className="bg-white border-b px-8 py-5 flex items-center justify-between shadow-sm shrink-0 z-30">
          <div className="flex items-center gap-4">
            {!sidebarOpen && <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg"><Menu size={20} /></button>}
            <div>
              <h1 className="text-lg font-bold text-slate-800">{activeChat.title}</h1>
              <p className="text-[10px] font-bold text-green-600 uppercase tracking-tighter flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>Clinical Support Active
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleCallMode}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md group"
            >
              <Phone size={18} className="group-hover:animate-bounce" /> Voice Call
            </button>
            <button onClick={generateReport} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-md">
              <FileText size={18} />Generate Report
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 bg-[#fcfcfd]">
          <div className="max-w-3xl mx-auto space-y-6 pb-12">
            {!isDataLoaded ? (
              <div className="h-full flex flex-col items-center justify-center py-20 text-slate-400 font-bold uppercase tracking-widest animate-pulse"><RefreshCw className="animate-spin mb-2" /> Resuming session...</div>
            ) : messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white shadow-blue-100' : 'bg-white text-slate-400 border border-slate-200'}`}>
                    {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                  </div>
                  <div className={`p-4 rounded-3xl text-sm sm:text-base shadow-sm border leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white border-blue-600 rounded-tr-none' : 'bg-white text-slate-800 border-slate-100 rounded-tl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-3 p-4 ml-14">
                <div className="flex gap-1.5"><div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [delay:200ms]"></div><div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [delay:400ms]"></div></div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Analysing...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input Dock */}
        <div className="p-6 bg-white border-t border-slate-100 shadow-inner">
          <div className="max-w-3xl mx-auto flex items-center gap-4 relative">
            {error && <div className="absolute bottom-full mb-4 left-0 right-0 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100 animate-in slide-in-from-bottom-2"><AlertCircle size={14} className="inline mr-2" />{error}</div>}
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isRecording ? "Listening..." : "Tell me about your health..."}
                className={`w-full pl-6 pr-14 py-4 rounded-2xl border-2 transition-all focus:outline-none focus:ring-4 focus:ring-blue-50/50 ${isRecording ? 'border-blue-400 bg-blue-50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {isFinishingSpeech && <Loader2 className="animate-spin text-blue-500" size={18} />}
                <button onClick={toggleRecording} className={`p-2.5 rounded-xl transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-slate-400 hover:text-blue-600 border border-slate-100 shadow-sm'}`}>
                  {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
              </div>
            </div>
            <button onClick={() => handleSend()} disabled={loading || !input.trim()} className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-30 transition-all shadow-lg shadow-blue-100"><Send size={24} /></button>
          </div>
        </div>

        {/* Report Overlay */}
        {showReport && (
          <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="px-10 py-8 border-b bg-slate-50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-900 p-3 rounded-2xl text-white"><FileText size={24} /></div>
                  <h2 className="text-2xl font-bold text-slate-900">Health Summary</h2>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => {
                    const content = `MEDIFLOW ASSESSMENT\nName: ${reportData.patientName}\nAge: ${reportData.patientAge}\nSummary: ${reportData.symptomSummary}\nObs: ${reportData.observations.join(', ')}\nPre: ${reportData.precautions.join(', ')}`;
                    const blob = new Blob([content], { type: 'text/plain' });
                    const link = document.createElement('a');
                    link.download = "MediFlow_Report.txt"; link.href = URL.createObjectURL(blob); link.click();
                  }} className="p-2.5 bg-white rounded-xl text-slate-600 border shadow-sm hover:bg-slate-50"><Type size={20} /></button>
                  <button onClick={() => setShowReport(false)} className="p-2.5 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500"><X size={24} /></button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-12 bg-white" ref={reportRef}>
                {generatingReport ? (
                  <div className="h-full flex flex-col items-center justify-center gap-6"><div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div><p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Synthesizing Clinical Record...</p></div>
                ) : reportData && (
                  <div className="max-w-prose mx-auto space-y-12 pb-10">
                    <section className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 grid grid-cols-2 gap-8">
                      <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label><p className="text-xl font-bold">{reportData.patientName}</p></div>
                      <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Age</label><p className="text-xl font-bold">{reportData.patientAge} Years</p></div>
                    </section>
                    <section>
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-3"><MessageSquare className="text-blue-600" size={18}/> Symptom Summary</h3>
                      <p className="text-slate-600 leading-relaxed font-medium">{reportData.symptomSummary}</p>
                    </section>
                    <section>
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-3"><ClipboardList className="text-slate-900" size={18}/> Clinical Observations</h3>
                      <ul className="space-y-3">{reportData.observations.map((obs, i) => <li key={i} className="flex gap-3 text-slate-600 p-4 bg-slate-50 rounded-2xl border border-slate-100"><Zap className="text-blue-500 shrink-0" size={14}/> {obs}</li>)}</ul>
                    </section>
                    <section>
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-3"><ShieldAlert className="text-green-600" size={18}/> Precautions</h3>
                      <ul className="space-y-3">{reportData.precautions.map((p, i) => <li key={i} className="p-4 bg-green-50/50 rounded-2xl text-green-900 font-bold border border-green-100">• {p}</li>)}</ul>
                    </section>
                    <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-xl">
                      <p className="text-xs opacity-60 mb-2 uppercase font-black tracking-[0.2em] text-blue-400">Recommended Next Steps</p>
                      <p className="text-lg font-medium">{reportData.nextSteps}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 italic text-center pt-8 border-t border-slate-100">Consult a GP immediately for clinical diagnosis. This AI assessment is for recording symptoms only.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

);
};

export default App;
