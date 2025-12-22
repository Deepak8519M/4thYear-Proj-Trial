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
Zap,
LayoutDashboard,
HeartPulse,
Thermometer,
Gauge,
TrendingUp,
ChevronRight,
Save,
CheckCircle2,
BarChart3,
AlertTriangle,
Lightbulb
} from 'lucide-react';

const apiKey = "";
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";
const TTS_MODEL = "gemini-2.5-flash-preview-tts";

const SYSTEM_PROMPT = `You are a professional AI Medical Assistant named MediFlow. Your goal is to:

1. PHASE 1 (INTAKE): Start by asking the user for their Name and Age. You cannot proceed to symptoms until you have this information.
2. PHASE 2 (VITALS): If the user has provided vital signs (Temperature, BP, Heart Rate) via the dashboard, acknowledge them and incorporate them into your analysis.
3. PHASE 3 (SYMPTOMS): Conduct a thorough but empathetic symptom check.
4. Ask clarifying questions one at a time (e.g., duration, severity, accompanying symptoms).
5. Based on the symptoms and vitals, identify potential conditions (clearly stating these are possibilities, not a final diagnosis).
6. Provide actionable precautionary measures and lifestyle advice.
7. ALWAYS include a medical disclaimer that you are an AI and the user should consult a human doctor for medical emergencies.
8. Tone: Supportive, clinical, and clear. Do not use markdown formatting like asterisks. Use plain text only.`;

const REPORT_SCHEMA = {
type: "OBJECT",
properties: {
patientName: { type: "STRING" },
patientAge: { type: "STRING" },
severityRating: { type: "STRING", description: "Low, Moderate, or High" },
symptomSummary: { type: "STRING" },
vitalsAnalysis: { type: "STRING" },
observations: { type: "ARRAY", items: { type: "STRING" } },
precautions: { type: "ARRAY", items: { type: "STRING" } },
nextSteps: { type: "STRING" }
},
required: ["patientName", "patientAge", "severityRating", "symptomSummary", "observations", "precautions"]
};

const STORAGE_KEY = 'mediflow_assessment_state_v6';

const App = () => {
const [view, setView] = useState('chat'); // 'chat' or 'dashboard'
const [isDataLoaded, setIsDataLoaded] = useState(false);
const [chats, setChats] = useState([
{ id: '1', title: 'Assessment 1', messages: [{ role: 'bot', text: 'Welcome to MediFlow. To begin your clinical assessment, could you please provide your full name and age?' }], vitals: {}, report: null }
]);
const [activeChatId, setActiveChatId] = useState('1');
const [input, setInput] = useState('');
const [loading, setLoading] = useState(false);
const [showReport, setShowReport] = useState(false);
const [reportData, setReportData] = useState(null);
const [generatingReport, setGeneratingReport] = useState(false);
const [error, setError] = useState(null);
const [sidebarOpen, setSidebarOpen] = useState(true);

// Vitals State
const [vitals, setVitals] = useState({ temp: '', bp: '', hr: '' });
const [vitalsSaved, setVitalsSaved] = useState(false);

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
if (savedActiveId) {
setActiveChatId(savedActiveId);
const active = savedChats.find(c => c.id === savedActiveId);
if (active?.vitals) setVitals(active.vitals);
}
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

const saveVitals = () => {
setChats(prev => prev.map(chat =>
chat.id === activeChatId ? { ...chat, vitals } : chat
));
setVitalsSaved(true);
setTimeout(() => setVitalsSaved(false), 2000);
};

// Speech Recognition
useEffect(() => {
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition && !recognitionRef.current) {
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript.trim()) {
          setInput(currentTranscript);
          setIsFinishingSpeech(true);
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
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

    setChats(prev => prev.map(chat =>
      chat.id === activeChatId ? { ...chat, messages: [...chat.messages, userMsg] } : chat
    ));

    setLoading(true);
    setError(null);
    setIsSpeaking(false);
    setIsFinishingSpeech(false);

    try {
      const chatContext = activeChat.messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n');
      const vitalsString = vitals.temp ? `[Patient Vitals: Temp ${vitals.temp}, BP ${vitals.bp}, HR ${vitals.hr}]` : '';

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${vitalsString}\n${chatContext}\nUser: ${textToSend}` }] }],
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }
        })
      });

      if (!response.ok) throw new Error();
      const data = await response.json();
      const rawAiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that.";
      const aiText = rawAiText.replace(/\*/g, '');

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
const assessmentNumber = chats.length + 1;
const newChat = {
id: newId,
title: `Assessment ${assessmentNumber}`,
messages: [{ role: 'bot', text: 'Welcome to MediFlow. Please provide your full name and age.' }],
vitals: {},
report: null
};
setChats([...chats, newChat]);
setActiveChatId(newId);
setVitals({ temp: '', bp: '', hr: '' });
setView('chat');
};

const deleteChat = (e, id) => {
e.stopPropagation();
const updatedChats = chats.filter(chat => chat.id !== id);
if (updatedChats.length === 0) {
startNewChat();
} else {
setChats(updatedChats);
if (activeChatId === id) {
setActiveChatId(updatedChats[0].id);
setVitals(updatedChats[0].vitals || { temp: '', bp: '', hr: '' });
}
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
      const vitalsText = vitals.temp ? `Vitals recorded: Temp ${vitals.temp}, BP ${vitals.bp}, HR ${vitals.hr}.` : "No vitals recorded.";

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Generate clinical report JSON for:\n\n${vitalsText}\n${history}` }] }],
          generationConfig: { responseMimeType: "application/json", responseSchema: REPORT_SCHEMA }
        })
      });
      const data = await response.json();
      const parsedReport = JSON.parse(data.candidates[0].content.parts[0].text);
      setReportData(parsedReport);

      // Save report to chat history
      setChats(prev => prev.map(chat =>
        chat.id === activeChatId ? { ...chat, report: parsedReport } : chat
      ));

    } catch (err) { setError("Report generation failed."); setShowReport(false); } finally { setGeneratingReport(false); }

};

const downloadAsImage = () => {
if (!reportRef.current || !window.html2canvas) return;
const element = reportRef.current;
window.html2canvas(element, {
backgroundColor: "#ffffff",
scale: 2,
useCORS: true,
scrollY: 0,
windowHeight: element.scrollHeight,
height: element.scrollHeight,
width: element.offsetWidth,
onclone: (clonedDoc) => {
const clonedReport = clonedDoc.getElementById('clinical-report-container');
if (clonedReport) {
clonedReport.style.height = 'auto';
clonedReport.style.overflow = 'visible';
clonedReport.style.maxHeight = 'none';
}
}
}).then(canvas => {
const link = document.createElement('a');
link.download = `MediFlow_Report_${reportData?.patientName || 'Patient'}.png`;
link.href = canvas.toDataURL('image/png');
link.click();
});
};

const downloadAsText = () => {
if (!reportData) return;
const separator = "=".repeat(60);
const line = "-".repeat(60);
const content = `
${separator}
            MEDIFLOW CLINICAL ASSESSMENT REPORT
${separator}
PATIENT: ${reportData.patientName} (${reportData.patientAge}Y)
SEVERITY: ${reportData.severityRating}
DATE: ${new Date().toLocaleDateString()}

${line}
SYMPTOM SUMMARY
${line}
${reportData.symptomSummary}

${line}
CLINICAL OBSERVATIONS
${line}
${reportData.observations.map((obs, i) => `[${i + 1}] ${obs}`).join('\n')}

${line}
PRECAUTIONARY MEASURES
${line}
${reportData.precautions.map(prec => `> ${prec}`).join('\n')}

${line}
RECOMMENDED NEXT STEPS
${line}
${reportData.nextSteps}
${separator}
`.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.download = `MediFlow_Report_${reportData.patientName}.txt`;
    link.href = URL.createObjectURL(blob);
    link.click();

};

// Helper to calculate clinical statistics
const getDashboardStats = () => {
const totalReports = chats.filter(c => c.report).length;
const highRiskReports = chats.filter(c => c.report?.severityRating === 'High').length;
const allPrecautions = chats.flatMap(c => c.report?.precautions || []).slice(0, 5);

    return {
      totalAssessments: chats.length,
      highRiskCount: highRiskReports,
      riskLevel: highRiskReports > 0 ? 'Elevated' : totalReports > 0 ? 'Managed' : 'Baseline',
      recentTasks: allPrecautions
    };

};

const stats = getDashboardStats();

return (
<div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
<audio ref={audioRef} onEnded={onAudioEnded} hidden />

      {/* History Sidebar */}
      <aside className={`${sidebarOpen ? 'w-80' : 'w-0'} bg-slate-900 transition-all duration-300 flex flex-col overflow-hidden shrink-0 shadow-2xl z-40`}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-xl"><Stethoscope className="text-white" size={20} /></div>
            <span className="font-bold text-white text-lg tracking-tight">MediFlow</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white lg:hidden"><X size={20} /></button>
        </div>

        <div className="p-4 flex flex-col gap-2">
          <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-bold transition-all ${view === 'dashboard' ? 'bg-blue-600 text-white shadow-xl translate-x-2' : 'text-slate-400 hover:bg-white/5'}`}>
            <LayoutDashboard size={20} />Health Dashboard
          </button>
          <button onClick={startNewChat} className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold transition-all mt-2">
            <Plus size={18} />New Assessment
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-1 pb-6">
          <p className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">History</p>
          {chats.map(chat => (
            <div key={chat.id} className="group relative flex items-center">
              <button onClick={() => { setActiveChatId(chat.id); setVitals(chat.vitals || { temp: '', bp: '', hr: '' }); setView('chat'); }} className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 pr-10 ${activeChatId === chat.id && view === 'chat' ? 'bg-white/10 text-white border-l-4 border-blue-500' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                <History size={16} /><span className="truncate text-sm font-medium">{chat.title}</span>
              </button>
              <button onClick={(e) => deleteChat(e, chat.id)} className="absolute right-2 p-1.5 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Call Mode Overlay */}
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
              <div className="relative p-24 rounded-full bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 shadow-[0_0_100px_-20px_rgba(37,99,235,0.8)] transition-all duration-500 ${isRecording && !isSpeaking ? 'scale-110' : 'scale-100'}">
                {isSpeaking ? <div className="flex gap-1.5 h-12 items-center"><div className="w-2 bg-white rounded-full animate-[pulse_1s_infinite] h-8"></div><div className="w-2 bg-white rounded-full animate-[pulse_1.2s_infinite] h-12"></div><div className="w-2 bg-white rounded-full animate-[pulse_1.4s_infinite] h-8"></div></div> : <Bot size={72} className="text-white" />}
              </div>
              <div className="space-y-4">
                <h2 className="text-5xl font-black tracking-tighter text-white">{isSpeaking ? 'MediFlow' : isRecording ? 'Listening' : 'Thinking'}</h2>
                <p className="text-blue-400 font-bold uppercase tracking-[0.3em] text-xs">Hands-Free Assessment</p>
              </div>
              <div className="bg-white/5 border-2 border-white/10 backdrop-blur-2xl p-8 rounded-[2.5rem] w-full min-h-[160px] flex items-center justify-center shadow-2xl">
                 <p className="text-2xl text-blue-50 font-semibold italic opacity-95 leading-relaxed">{isRecording ? (input || "...") : "Synthesizing guidance..."}</p>
              </div>
            </div>
            <div className="relative z-10 w-full flex justify-center pb-8">
              <button onClick={toggleCallMode} className="group flex flex-col items-center gap-6">
                <div className="bg-red-500 hover:bg-red-600 p-10 rounded-full shadow-[0_0_60px_-10px_rgba(239,68,68,0.5)] transition-all hover:scale-110 border-4 border-white/10"><PhoneOff size={40} className="text-white" /></div>
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-400 group-hover:text-red-300">Terminate Call</span>
              </button>
            </div>
          </div>
        )}

        <header className="bg-white border-b px-8 py-5 flex items-center justify-between shadow-sm shrink-0 z-30">
          <div className="flex items-center gap-4">
            {!sidebarOpen && <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg"><Menu size={20} /></button>}
            <div>
              <h1 className="text-lg font-extrabold text-slate-800 tracking-tight">{view === 'dashboard' ? 'Health Command Dashboard' : activeChat.title}</h1>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>Secure Clinical Environment
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {view === 'chat' && (
              <>
                <button onClick={toggleCallMode} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md group">
                  <Phone size={18} className="group-hover:animate-bounce" /> Voice Call
                </button>
                <button onClick={generateReport} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-md">
                  <FileText size={18} />Generate Report
                </button>
              </>
            )}
          </div>
        </header>

        {view === 'dashboard' ? (
          <div className="flex-1 overflow-y-auto p-10 bg-slate-50 space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
             {/* Key Metrics Row */}
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
                   <div className="bg-blue-50 text-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-4"><BarChart3 size={24} /></div>
                   <div>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Case Volume</p>
                      <p className="text-4xl font-black text-slate-900 mt-1">{stats.totalAssessments}</p>
                   </div>
                </div>
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
                   <div className="bg-red-50 text-red-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-4"><AlertTriangle size={24} /></div>
                   <div>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">High Severity Risks</p>
                      <p className={`text-4xl font-black mt-1 ${stats.highRiskCount > 0 ? 'text-red-500' : 'text-slate-900'}`}>{stats.highRiskCount}</p>
                   </div>
                </div>
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
                   <div className="bg-indigo-50 text-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-4"><Activity size={24} /></div>
                   <div>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Aggregate Health Score</p>
                      <p className="text-4xl font-black text-slate-900 mt-1">{stats.riskLevel === 'Baseline' ? 'N/A' : stats.riskLevel === 'Elevated' ? 'Poor' : 'Stable'}</p>
                   </div>
                </div>
                <div className="bg-slate-900 p-8 rounded-[2rem] shadow-xl text-white flex flex-col justify-between">
                   <div className="bg-blue-500/20 text-blue-400 w-12 h-12 rounded-2xl flex items-center justify-center mb-4"><Zap size={24} /></div>
                   <div>
                      <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Intelligence Layer</p>
                      <p className="text-xl font-bold mt-2 leading-tight">Gemini 2.5 Flash Optimized</p>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Vitals Tracker Section */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 lg:col-span-2">
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-black tracking-tight flex items-center gap-3 uppercase text-slate-900"><HeartPulse className="text-red-500" /> Active Session Vitals</h3>
                      <button
                        onClick={saveVitals}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg ${vitalsSaved ? 'bg-green-500 text-white scale-105' : 'bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-0.5'}`}
                      >
                        {vitalsSaved ? <><CheckCircle2 size={18} /> Committed</> : <><Save size={18} /> Save to Session</>}
                      </button>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between px-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Temperature</label>
                          <span className="text-[10px] font-bold text-blue-500">°C / °F</span>
                        </div>
                        <div className="relative group">
                          <Thermometer className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                          <input value={vitals.temp} onChange={(e) => setVitals({...vitals, temp: e.target.value})} type="text" placeholder="98.6" className="w-full pl-12 pr-5 py-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-3xl transition-all outline-none text-xl font-bold text-slate-900 shadow-inner" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between px-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Blood Pressure</label>
                          <span className="text-[10px] font-bold text-red-500">mmHg</span>
                        </div>
                        <div className="relative group">
                          <Gauge className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                          <input value={vitals.bp} onChange={(e) => setVitals({...vitals, bp: e.target.value})} type="text" placeholder="120/80" className="w-full pl-12 pr-5 py-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-3xl transition-all outline-none text-xl font-bold text-slate-900 shadow-inner" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between px-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Heart Rate</label>
                          <span className="text-[10px] font-bold text-green-500">BPM</span>
                        </div>
                        <div className="relative group">
                          <Activity className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                          <input value={vitals.hr} onChange={(e) => setVitals({...vitals, hr: e.target.value})} type="text" placeholder="72" className="w-full pl-12 pr-5 py-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-3xl transition-all outline-none text-xl font-bold text-slate-900 shadow-inner" />
                        </div>
                      </div>
                   </div>
                   <div className="mt-8 p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-start gap-4">
                      <Bot className="text-blue-500 shrink-0 mt-1" size={20} />
                      <p className="text-sm text-blue-900/70 font-medium italic leading-relaxed">Saving these vitals will allow me to provide a significantly more accurate severity risk analysis during our next conversation.</p>
                   </div>
                </div>

                {/* Health Insights Sidebar */}
                <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white overflow-hidden relative group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
                   <h3 className="text-xl font-black tracking-tight mb-8 flex items-center gap-3 uppercase"><Lightbulb className="text-blue-400" /> Action Protocol</h3>
                   <div className="space-y-6 relative z-10">
                      {stats.recentTasks.length > 0 ? stats.recentTasks.map((task, i) => (
                        <div key={i} className="flex gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-default">
                           <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">{i+1}</div>
                           <p className="text-sm text-slate-200 font-medium leading-relaxed">{task}</p>
                        </div>
                      )) : (
                        <div className="text-center py-12 space-y-4">
                           <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto"><ClipboardList className="text-slate-500" /></div>
                           <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">No Protocol Generated Yet</p>
                        </div>
                      )}
                   </div>
                   <button onClick={() => setView('chat')} className="w-full mt-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-900/20">Resume Assessment <ChevronRight size={16} /></button>
                </div>
             </div>

             {/* Recent History Grid */}
             <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                <h3 className="text-2xl font-black tracking-tighter mb-10 text-slate-900 flex items-center gap-4 uppercase"><ClipboardList className="text-blue-600" /> Clinical Session Log</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                   {chats.slice(-4).reverse().map(c => (
                     <div key={c.id} className="group p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 cursor-pointer relative" onClick={() => { setActiveChatId(c.id); setVitals(c.vitals || { temp: '', bp: '', hr: '' }); setView('chat'); }}>
                        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight size={20} className="text-blue-500" /></div>
                        <div className="flex flex-col h-full justify-between gap-6">
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Session</p>
                              <h4 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{c.title}</h4>
                           </div>
                           <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                 <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{c.messages.length} interactions</span>
                              </div>
                              {c.report && (
                                <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${c.report.severityRating === 'High' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                   Severity: {c.report.severityRating}
                                </div>
                              )}
                           </div>
                        </div>
                     </div>
                   ))}
                   <div onClick={startNewChat} className="p-8 border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:border-blue-200 group transition-all duration-500 cursor-pointer">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-all"><Plus className="text-slate-300 group-hover:text-blue-500" /></div>
                      <span className="text-xs font-black text-slate-300 uppercase tracking-widest group-hover:text-blue-500">Start New Case</span>
                   </div>
                </div>
             </div>
          </div>
        ) : (
          <>
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
                    className={`w-full pl-6 pr-14 py-4 rounded-2xl border-2 transition-all focus:outline-none focus:ring-4 focus:ring-blue-50/50 ${isRecording ? 'border-blue-400 bg-blue-50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`} />
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
          </>
        )}

        {/* Report Overlay */}
        {showReport && (
          <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="px-10 py-8 border-b bg-slate-50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-900 p-3 rounded-2xl text-white"><FileText size={24} /></div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Clinical Summary</h2>
                </div>
                <div className="flex gap-2">
                  <button onClick={downloadAsText} className="flex items-center gap-2 p-2.5 bg-white hover:bg-slate-50 rounded-xl text-slate-700 border border-slate-200 shadow-sm transition-all text-sm font-bold"><Type size={20} /> <span className="hidden sm:inline">Text</span></button>
                  <button onClick={downloadAsImage} className="flex items-center gap-2 p-2.5 bg-blue-50 hover:bg-blue-100 rounded-xl text-blue-700 border border-blue-200 shadow-sm transition-all text-sm font-bold"><ImageIcon size={20} /> <span className="hidden sm:inline">Image</span></button>
                  <button onClick={() => setShowReport(false)} className="p-2.5 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500"><X size={24} /></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-12 bg-white" id="clinical-report-container" ref={reportRef}>
                {generatingReport ? (
                  <div className="h-full flex flex-col items-center justify-center gap-6"><div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div><p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Synthesizing Clinical Record...</p></div>
                ) : reportData && (
                  <div className="max-w-prose mx-auto space-y-12 pb-10">
                    <section className="bg-slate-50 rounded-[2rem] p-10 border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-8 relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16"></div>
                       <div className="space-y-4">
                          <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Name</label><p className="text-2xl font-black text-slate-900">{reportData.patientName}</p></div>
                          <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Age</label><p className="text-2xl font-black text-slate-900">{reportData.patientAge} Years</p></div>
                       </div>
                       <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 text-center min-w-[140px]">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Severity Rating</label>
                          <div className={`text-2xl font-black uppercase ${reportData.severityRating === 'High' ? 'text-red-500' : reportData.severityRating === 'Moderate' ? 'text-amber-500' : 'text-green-500'}`}>
                            {reportData.severityRating}
                          </div>
                       </div>
                    </section>

                    <section>
                      <h3 className="text-xl font-black mb-6 flex items-center gap-4 uppercase tracking-tight"><MessageSquare className="text-blue-600" size={20}/> Symptom Summary</h3>
                      <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 font-medium text-slate-700 leading-relaxed">{reportData.symptomSummary}</div>
                    </section>

                    <section>
                      <h3 className="text-xl font-black mb-6 flex items-center gap-4 uppercase tracking-tight"><Activity className="text-red-500" size={20}/> Clinical Analysis</h3>
                      <ul className="grid gap-3">{reportData.observations.map((obs, i) => <li key={i} className="flex gap-4 text-slate-600 p-5 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors shadow-sm"><Zap className="text-blue-500 shrink-0 mt-1" size={16}/> {obs}</li>)}</ul>
                    </section>

                    <section>
                      <h3 className="text-xl font-black mb-6 flex items-center gap-4 uppercase tracking-tight"><ShieldAlert className="text-green-600" size={20}/> Precautionary Protocol</h3>
                      <ul className="grid gap-3">{reportData.precautions.map((p, i) => <li key={i} className="p-5 bg-green-50/50 rounded-2xl text-green-900 font-bold border border-green-100 shadow-sm flex gap-3"><span className="text-green-600 mt-1">•</span> {p}</li>)}</ul>
                    </section>

                    <div className="p-10 bg-slate-900 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-all duration-700"></div>
                      <p className="text-xs opacity-60 mb-3 uppercase font-black tracking-[0.4em] text-blue-400">Immediate Next Steps</p>
                      <p className="text-xl font-medium leading-relaxed relative z-10">{reportData.nextSteps}</p>
                    </div>

                    <div className="pt-10 border-t border-slate-100 space-y-4">
                       <p className="text-[10px] text-slate-400 italic text-center">Case Reference: MF-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                       <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 text-[11px] text-amber-800 leading-relaxed font-medium">
                          <strong>DISCLAIMER:</strong> This is an automated summary intended for recording health data. It does not replace an official diagnosis.
                       </div>
                    </div>
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
