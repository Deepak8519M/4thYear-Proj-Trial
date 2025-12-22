import React, { useState, useEffect, useRef, useMemo } from "react";
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
Lightbulb,
Clock,
ShieldCheck,
ArrowUpRight,
Info,
} from "lucide-react";

const apiKey = "AIzaSyDH_xoawv3p1LyvnuN24YQdjxIYXV_t_yU";
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
nextSteps: { type: "STRING" },
},
required: [
"patientName",
"patientAge",
"severityRating",
"symptomSummary",
"observations",
"precautions",
],
};

const STORAGE_KEY = "mediflow_assessment_state_v7";

const App = () => {
const [view, setView] = useState("chat"); // 'chat' or 'dashboard'
const [isDataLoaded, setIsDataLoaded] = useState(false);
const [chats, setChats] = useState([
{
id: "1",
title: "Assessment 1",
messages: [
{
role: "bot",
text: "Welcome to MediFlow. To begin your clinical assessment, could you please provide your full name and age?",
},
],
vitals: {},
report: null,
timestamp: Date.now(),
},
]);
const [activeChatId, setActiveChatId] = useState("1");
const [input, setInput] = useState("");
const [loading, setLoading] = useState(false);
const [showReport, setShowReport] = useState(false);
const [reportData, setReportData] = useState(null);
const [generatingReport, setGeneratingReport] = useState(false);
const [error, setError] = useState(null);
const [sidebarOpen, setSidebarOpen] = useState(true);

// Vitals State
const [vitals, setVitals] = useState({ temp: "", bp: "", hr: "" });
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

const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];
const messages = activeChat.messages;

const scrollToBottom = () => {
chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
};

useEffect(() => {
const savedState = localStorage.getItem(STORAGE_KEY);
if (savedState) {
try {
const { chats: savedChats, activeChatId: savedActiveId } =
JSON.parse(savedState);
if (savedChats?.length > 0) {
setChats(savedChats);
if (savedActiveId) {
setActiveChatId(savedActiveId);
const active = savedChats.find((c) => c.id === savedActiveId);
if (active?.vitals) setVitals(active.vitals);
}
}
} catch (e) {
console.error(e);
}
}
setIsDataLoaded(true);
}, []);

useEffect(() => {
if (!isDataLoaded) return;
localStorage.setItem(STORAGE_KEY, JSON.stringify({ chats, activeChatId }));
}, [chats, activeChatId, isDataLoaded]);

useEffect(() => {
scrollToBottom();
}, [messages, loading]);

useEffect(() => {
const script = document.createElement("script");
script.src =
"https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
script.async = true;
document.body.appendChild(script);
return () => {
if (document.body.contains(script)) document.body.removeChild(script);
};
}, []);

const saveVitals = () => {
setChats((prev) =>
prev.map((chat) =>
chat.id === activeChatId ? { ...chat, vitals } : chat
)
);
setVitalsSaved(true);
setTimeout(() => setVitalsSaved(false), 2000);
};

// Optimized Speech Recognition
useEffect(() => {
const SpeechRecognition =
window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition && !recognitionRef.current) {
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let currentTranscript = "";
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
        if (e.error !== "no-speech") {
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
for (let i = 0; i < string.length; i++)
view.setUint8(offset + i, string.charCodeAt(i));
};
writeString(0, "RIFF");
view.setUint32(4, 32 + pcmData.length _ 2, true);
writeString(8, "WAVE");
writeString(12, "fmt ");
view.setUint32(16, 16, true);
view.setUint16(20, 1, true);
view.setUint16(22, 1, true);
view.setUint32(24, sampleRate, true);
view.setUint32(28, sampleRate _ 2, true);
view.setUint16(32, 2, true);
view.setUint16(34, 16, true);
writeString(36, "data");
view.setUint32(40, pcmData.length _ 2, true);
let offset = 44;
for (let i = 0; i < pcmData.length; i++, offset += 2)
view.setInt16(offset, pcmData[i], true);
return new Blob([buffer], { type: "audio/wav" });
};

const toggleRecording = () => {
if (isRecording) {
recognitionRef.current?.stop();
} else {
setError(null);
setInput("");
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
const lastBotMsg = messages.filter((m) => m.role === "bot").pop();
const greeting = lastBotMsg
? lastBotMsg.text
: "Hello. I am MediFlow. Please provide your full name and age.";
callGeminiTTS(greeting);
}
};

const callGeminiTTS = async (text) => {
if (!voiceEnabled || !text) return;
try {
const response = await fetch(
`https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent?key=${apiKey}`,
{
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
contents: [{ parts: [{ text: `Say naturally: ${text}` }] }],
generationConfig: {
responseModalities: ["AUDIO"],
speechConfig: {
voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
},
},
}),
}
);
const result = await response.json();
const audioDataB64 =
result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
if (audioDataB64) {
const binaryString = atob(audioDataB64);
const len = binaryString.length;
const bytes = new Int16Array(len / 2);
for (let i = 0; i < len; i += 2)
bytes[i / 2] =
binaryString.charCodeAt(i) | (binaryString.charCodeAt(i + 1) << 8);
const wavBlob = pcmToWav(bytes, 24000);
const url = URL.createObjectURL(wavBlob);
if (audioRef.current) {
audioRef.current.src = url;
audioRef.current.play();
setIsSpeaking(true);
if (isRecording) recognitionRef.current?.stop();
}
}
} catch (e) {
console.error("TTS failed", e);
}
};

const handleSend = async (manualInput) => {
const textToSend = (manualInput || input).trim();
if (!textToSend || isProcessingRef.current || loading) return;

    isProcessingRef.current = true;
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    const userMsg = { role: "user", text: textToSend };
    setInput("");

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId
          ? { ...chat, messages: [...chat.messages, userMsg] }
          : chat
      )
    );

    setLoading(true);
    setError(null);
    setIsSpeaking(false);
    setIsFinishingSpeech(false);

    try {
      const chatContext = activeChat.messages
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`)
        .join("\n");
      const vitalsString = vitals.temp
        ? `[Patient Vitals: Temp ${vitals.temp}, BP ${vitals.bp}, HR ${vitals.hr}]`
        : "";

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${vitalsString}\n${chatContext}\nUser: ${textToSend}`,
                  },
                ],
              },
            ],
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          }),
        }
      );

      if (!response.ok) throw new Error();
      const data = await response.json();
      const rawAiText =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "I'm sorry, I couldn't process that.";
      const aiText = rawAiText.replace(/\*/g, "");

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChatId
            ? {
                ...chat,
                messages: [...chat.messages, { role: "bot", text: aiText }],
              }
            : chat
        )
      );

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
setInput("");
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
messages: [
{
role: "bot",
text: "Welcome to MediFlow. Please provide your full name and age.",
},
],
vitals: {},
report: null,
timestamp: Date.now(),
};
setChats([...chats, newChat]);
setActiveChatId(newId);
setVitals({ temp: "", bp: "", hr: "" });
setView("chat");
};

const deleteChat = (e, id) => {
e.stopPropagation();
const updatedChats = chats.filter((chat) => chat.id !== id);
if (updatedChats.length === 0) {
startNewChat();
} else {
setChats(updatedChats);
if (activeChatId === id) {
setActiveChatId(updatedChats[0].id);
setVitals(updatedChats[0].vitals || { temp: "", bp: "", hr: "" });
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
      const history = messages
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`)
        .join("\n");
      const vitalsText = vitals.temp
        ? `Vitals recorded: Temp ${vitals.temp}, BP ${vitals.bp}, HR ${vitals.hr}.`
        : "No vitals recorded.";

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Generate clinical report JSON for:\n\n${vitalsText}\n${history}`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: REPORT_SCHEMA,
            },
          }),
        }
      );
      const data = await response.json();
      const parsedReport = JSON.parse(data.candidates[0].content.parts[0].text);
      setReportData(parsedReport);

      // Save report to chat history
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChatId ? { ...chat, report: parsedReport } : chat
        )
      );
    } catch (err) {
      setError("Report generation failed.");
      setShowReport(false);
    } finally {
      setGeneratingReport(false);
    }

};

const downloadAsImage = () => {
if (!reportRef.current || !window.html2canvas) return;
const element = reportRef.current;
window
.html2canvas(element, {
backgroundColor: "#ffffff",
scale: 2,
useCORS: true,
scrollY: 0,
windowHeight: element.scrollHeight,
height: element.scrollHeight,
width: element.offsetWidth,
onclone: (clonedDoc) => {
const clonedReport = clonedDoc.getElementById(
"clinical-report-container"
);
if (clonedReport) {
clonedReport.style.height = "auto";
clonedReport.style.overflow = "visible";
clonedReport.style.maxHeight = "none";
}
},
})
.then((canvas) => {
const link = document.createElement("a");
link.download = `MediFlow_Report_${
          reportData?.patientName || "Patient"
        }.png`;
link.href = canvas.toDataURL("image/png");
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
${reportData.observations.map((obs, i) => `[${i + 1}] ${obs}`).join("\n")}

${line}
PRECAUTIONARY MEASURES
${line}
${reportData.precautions.map((prec) => `> ${prec}`).join("\n")}

${line}
RECOMMENDED NEXT STEPS
${line}
${reportData.nextSteps}
${separator}
`.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.download = `MediFlow_Report_${reportData.patientName}.txt`;
    link.href = URL.createObjectURL(blob);
    link.click();

};

// Advanced Dashboard Calculations
const dashboardStats = useMemo(() => {
const totalReports = chats.filter((c) => c.report).length;
const highRiskReports = chats.filter(
(c) => c.report?.severityRating === "High"
).length;
const moderateRiskReports = chats.filter(
(c) => c.report?.severityRating === "Moderate"
).length;

    // Most recent precautions
    const allPrecautions = chats
      .flatMap((c) => c.report?.precautions || [])
      .reverse()
      .slice(0, 4);

    // Extract common symptoms (naive approach)
    const symptoms = chats
      .flatMap((c) => c.report?.symptomSummary.toLowerCase().split(/\W+/) || [])
      .filter(
        (w) =>
          w.length > 4 &&
          !["patient", "feels", "reported", "having"].includes(w)
      );

    const symptomFreq = symptoms.reduce((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {});

    const topSymptoms = Object.entries(symptomFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map((entry) => entry[0]);

    return {
      totalAssessments: chats.length,
      highRiskCount: highRiskReports,
      riskLevel:
        highRiskReports > 0
          ? "Urgent"
          : moderateRiskReports > 0
          ? "Moderate"
          : "Stable",
      recentPrecautions: allPrecautions,
      topSymptoms: topSymptoms,
      vitalsHistory: chats
        .filter((c) => c.vitals?.temp)
        .slice(-5)
        .reverse(),
    };

}, [chats]);

return (

<div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
<audio ref={audioRef} onEnded={onAudioEnded} hidden />

      {/* History Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-80" : "w-0"
        } bg-[#0F172A] transition-all duration-300 flex flex-col overflow-hidden shrink-0 shadow-2xl z-40`}
      >
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2.5 rounded-2xl shadow-lg shadow-blue-500/20">
              <Stethoscope className="text-white" size={20} />
            </div>
            <span className="font-black text-white text-xl tracking-tight">
              MEDIFLOW
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-slate-500 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-3">
          <button
            onClick={() => setView("dashboard")}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${
              view === "dashboard"
                ? "bg-blue-600 text-white shadow-2xl shadow-blue-600/30 ring-4 ring-blue-600/10"
                : "text-slate-400 hover:bg-white/5"
            }`}
          >
            <LayoutDashboard size={20} />
            Health Center
          </button>
          <button
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-bold transition-all mt-2 border border-white/10"
          >
            <Plus size={18} />
            New Intake
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 space-y-2 pb-10 custom-scrollbar">
          <p className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
            Patient Records
          </p>
          {chats.map((chat) => (
            <div key={chat.id} className="group relative flex items-center">
              <button
                onClick={() => {
                  setActiveChatId(chat.id);
                  setVitals(chat.vitals || { temp: "", bp: "", hr: "" });
                  setView("chat");
                }}
                className={`w-full text-left px-5 py-4 rounded-2xl transition-all flex items-center gap-4 ${
                  activeChatId === chat.id && view === "chat"
                    ? "bg-white/10 text-white border-l-4 border-blue-500"
                    : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
                }`}
              >
                <Clock size={16} />
                <span className="truncate text-sm font-semibold">
                  {chat.title}
                </span>
              </button>
              <button
                onClick={(e) => deleteChat(e, chat.id)}
                className="absolute right-4 p-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b px-10 py-6 flex items-center justify-between shrink-0 z-30 sticky top-0">
          <div className="flex items-center gap-6">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2.5 hover:bg-slate-100 rounded-xl transition-all"
              >
                <Menu size={20} />
              </button>
            )}
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                {view === "dashboard" ? "Health Analytics" : activeChat.title}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    view === "dashboard"
                      ? "bg-indigo-500 animate-pulse"
                      : "bg-green-500"
                  }`}
                ></span>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {view === "dashboard" ? "Dashboard Active" : "Session Active"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {view === "chat" && (
              <>
                <button
                  onClick={toggleCallMode}
                  className="flex items-center gap-3 bg-blue-600 text-white px-6 py-3 rounded-2xl text-sm font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95 group"
                >
                  <Phone size={18} className="group-hover:animate-bounce" />{" "}
                  VOIP CALL
                </button>
                <button
                  onClick={generateReport}
                  className="flex items-center gap-3 bg-slate-900 text-white px-6 py-3 rounded-2xl text-sm font-black hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                >
                  <FileText size={18} /> REPORT
                </button>
              </>
            )}
            {view === "dashboard" && (
              <button
                onClick={() => setView("chat")}
                className="flex items-center gap-3 bg-slate-100 text-slate-900 px-6 py-3 rounded-2xl text-sm font-black hover:bg-slate-200 transition-all"
              >
                RESUME SESSION <ChevronRight size={18} />
              </button>
            )}
          </div>
        </header>

        {view === "dashboard" ? (
          <div className="flex-1 overflow-y-auto p-12 space-y-12 bg-[#F8FAFC] animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Dynamic Risk & Stability Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-8 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-125"></div>
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">
                      Patient Health Stability
                    </h2>
                    <p className="text-slate-500 font-medium">
                      Aggregate assessment profile based on historical clinical
                      data.
                    </p>
                  </div>
                  <div
                    className={`px-5 py-2 rounded-2xl font-black text-xs uppercase tracking-widest ${
                      dashboardStats.riskLevel === "Urgent"
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {dashboardStats.riskLevel} Risk
                  </div>
                </div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10 mt-12">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Total Clinical Hours
                    </p>
                    <p className="text-4xl font-black text-slate-900">
                      {chats.length * 0.5}h
                    </p>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full w-2/3"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Guidance Compliance
                    </p>
                    <p className="text-4xl font-black text-slate-900">88%</p>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-green-500 h-full w-[88%]"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Recovery Velocity
                    </p>
                    <p className="text-4xl font-black text-slate-900">
                      Moderate
                    </p>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 bg-[#0F172A] p-10 rounded-[3rem] shadow-2xl text-white flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="bg-white/10 p-2.5 rounded-xl">
                      <Zap className="text-blue-400" size={20} />
                    </div>
                    <h3 className="font-black text-sm uppercase tracking-widest text-slate-400">
                      Clinical Core
                    </h3>
                  </div>
                  <p className="text-2xl font-black mb-2 leading-tight">
                    AI Health Assistant is monitoring 24/7
                  </p>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Medical intelligence v7.2 is processing symptom patterns and
                    vital trends across your session history.
                  </p>
                </div>
                <div className="pt-8 border-t border-white/5 mt-8 flex items-center gap-4">
                  <div className="flex -space-x-3">
                    <div className="w-10 h-10 rounded-full border-2 border-[#0F172A] bg-blue-500 flex items-center justify-center font-bold text-xs">
                      A
                    </div>
                    <div className="w-10 h-10 rounded-full border-2 border-[#0F172A] bg-indigo-500 flex items-center justify-center font-bold text-xs">
                      B
                    </div>
                    <div className="w-10 h-10 rounded-full border-2 border-[#0F172A] bg-slate-700 flex items-center justify-center font-bold text-xs">
                      +
                    </div>
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Multimodal Inputs Active
                  </p>
                </div>
              </div>
            </div>

            {/* Vitals & Trends Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Vitals Command Center */}
              <div className="xl:col-span-2 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-4">
                    <div className="bg-red-50 p-2 rounded-xl">
                      <HeartPulse className="text-red-500" size={20} />
                    </div>
                    Biometric Telemetry
                  </h3>
                  <button
                    onClick={saveVitals}
                    className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                      vitalsSaved
                        ? "bg-green-500 text-white scale-105"
                        : "bg-slate-900 text-white hover:bg-blue-600 shadow-xl active:scale-95"
                    }`}
                  >
                    {vitalsSaved ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      <>
                        <Save size={18} /> Commit Biometrics
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="group space-y-4">
                    <div className="flex justify-between items-end px-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Body Temp
                      </label>
                      <span className="text-[10px] font-bold text-blue-500">
                        Normal Range
                      </span>
                    </div>
                    <div className="relative">
                      <Thermometer
                        className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors"
                        size={24}
                      />
                      <input
                        value={vitals.temp}
                        onChange={(e) =>
                          setVitals({ ...vitals, temp: e.target.value })
                        }
                        type="text"
                        placeholder="98.6"
                        className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-[2rem] transition-all outline-none text-2xl font-black text-slate-800 shadow-inner"
                      />
                    </div>
                  </div>
                  <div className="group space-y-4">
                    <div className="flex justify-between items-end px-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Blood Pressure
                      </label>
                      <span className="text-[10px] font-bold text-red-500">
                        Sys/Dia
                      </span>
                    </div>
                    <div className="relative">
                      <Gauge
                        className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors"
                        size={24}
                      />
                      <input
                        value={vitals.bp}
                        onChange={(e) =>
                          setVitals({ ...vitals, bp: e.target.value })
                        }
                        type="text"
                        placeholder="120/80"
                        className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-[2rem] transition-all outline-none text-2xl font-black text-slate-800 shadow-inner"
                      />
                    </div>
                  </div>
                  <div className="group space-y-4">
                    <div className="flex justify-between items-end px-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Heart Rate
                      </label>
                      <span className="text-[10px] font-bold text-green-500">
                        BPM
                      </span>
                    </div>
                    <div className="relative">
                      <Activity
                        className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors"
                        size={24}
                      />
                      <input
                        value={vitals.hr}
                        onChange={(e) =>
                          setVitals({ ...vitals, hr: e.target.value })
                        }
                        type="text"
                        placeholder="72"
                        className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-[2rem] transition-all outline-none text-2xl font-black text-slate-800 shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-12 overflow-hidden rounded-[2.5rem] border border-slate-100 bg-slate-50/50">
                  <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <TrendingUp size={14} /> Historical Biometric Log
                    </h4>
                    <Info size={14} className="text-slate-300" />
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                          <th className="pb-4 px-4">Date</th>
                          <th className="pb-4 px-4">Temperature</th>
                          <th className="pb-4 px-4">Blood Pressure</th>
                          <th className="pb-4 px-4">Pulse</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardStats.vitalsHistory.map((v, i) => (
                          <tr
                            key={i}
                            className="group hover:bg-white transition-colors"
                          >
                            <td className="py-4 px-4 text-xs font-bold text-slate-900 border-b border-slate-50">
                              {new Date(v.timestamp).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-4 text-sm font-black text-blue-600 border-b border-slate-50">
                              {v.vitals?.temp || "N/A"}
                            </td>
                            <td className="py-4 px-4 text-sm font-black text-red-500 border-b border-slate-50">
                              {v.vitals?.bp || "N/A"}
                            </td>
                            <td className="py-4 px-4 text-sm font-black text-green-600 border-b border-slate-50">
                              {v.vitals?.hr || "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Symptom Cloud & Analysis */}
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200 flex flex-col space-y-10">
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-4 mb-8">
                    <div className="bg-blue-50 p-2 rounded-xl">
                      <Activity className="text-blue-500" size={20} />
                    </div>
                    Symptom Extraction
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {dashboardStats.topSymptoms.length > 0 ? (
                      dashboardStats.topSymptoms.map((s, i) => (
                        <div
                          key={i}
                          className="px-4 py-2 bg-slate-50 rounded-full text-xs font-bold text-slate-600 border border-slate-100 flex items-center gap-2"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                          {s}
                        </div>
                      ))
                    ) : (
                      <div className="text-center w-full py-6 text-slate-400 italic text-sm">
                        Insufficient data to extract patterns.
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Lightbulb className="text-amber-500" size={14} /> Urgent
                    Care Protocol
                  </h4>
                  <div className="space-y-4">
                    {dashboardStats.recentPrecautions.length > 0 ? (
                      dashboardStats.recentPrecautions.map((p, i) => (
                        <div
                          key={i}
                          className="p-5 bg-indigo-50/50 rounded-3xl border border-indigo-100/50 flex gap-4 group hover:bg-white hover:border-indigo-200 transition-all cursor-default"
                        >
                          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm font-black text-xs text-indigo-600">
                            {i + 1}
                          </div>
                          <p className="text-sm text-indigo-900 font-bold leading-relaxed">
                            {p}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="bg-slate-50 rounded-3xl p-10 text-center space-y-4 border border-slate-100">
                        <ShieldCheck
                          size={32}
                          className="text-slate-200 mx-auto"
                        />
                        <p className="text-xs font-black text-slate-300 uppercase tracking-widest leading-loose">
                          Comprehensive assessment required to generate
                          protocol.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Records Management Grid */}
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-4">
                  <div className="bg-slate-900 p-2 rounded-xl">
                    <ClipboardList className="text-white" size={20} />
                  </div>
                  Comprehensive Intake History
                </h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Updated Real-Time
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {chats
                  .slice(-8)
                  .reverse()
                  .map((c) => (
                    <div
                      key={c.id}
                      className="group p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 cursor-pointer relative"
                      onClick={() => {
                        setActiveChatId(c.id);
                        setVitals(c.vitals || { temp: "", bp: "", hr: "" });
                        setView("chat");
                      }}
                    >
                      <div className="absolute top-6 right-6 p-2 bg-white rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                        <ArrowUpRight size={18} className="text-blue-500" />
                      </div>
                      <div className="flex flex-col h-full justify-between gap-8">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                            {new Date(c.timestamp).toLocaleDateString()}
                          </p>
                          <h4 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                            {c.title}
                          </h4>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
                              {c.messages.length} exchanges
                            </span>
                          </div>
                          {c.report && (
                            <div
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                c.report.severityRating === "High"
                                  ? "bg-red-100 text-red-600"
                                  : "bg-blue-100 text-blue-600"
                              }`}
                            >
                              <Activity size={10} /> {c.report.severityRating}{" "}
                              Risk
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                <div
                  onClick={startNewChat}
                  className="p-8 border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:border-blue-200 group transition-all duration-500 cursor-pointer bg-slate-50/30"
                >
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm">
                    <Plus className="text-slate-300" size={28} />
                  </div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-500">
                    Initiate New Clinical Intake
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-10 bg-[#fcfcfd]">
              <div className="max-w-3xl mx-auto space-y-8 pb-12">
                {!isDataLoaded ? (
                  <div className="h-full flex flex-col items-center justify-center py-20 text-slate-400 font-bold uppercase tracking-widest animate-pulse">
                    <RefreshCw className="animate-spin mb-4" /> Resuming medical
                    context...
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      } animate-in fade-in slide-in-from-bottom-2 duration-400`}
                    >
                      <div
                        className={`flex gap-5 max-w-[85%] ${
                          msg.role === "user" ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                            msg.role === "user"
                              ? "bg-blue-600 text-white shadow-blue-600/20"
                              : "bg-white text-slate-400 border border-slate-100 shadow-sm"
                          }`}
                        >
                          {msg.role === "user" ? (
                            <User size={24} />
                          ) : (
                            <Bot size={24} />
                          )}
                        </div>
                        <div
                          className={`p-6 rounded-[2rem] text-sm sm:text-base shadow-sm border leading-relaxed ${
                            msg.role === "user"
                              ? "bg-blue-600 text-white border-blue-600 rounded-tr-none"
                              : "bg-white text-slate-800 border-slate-100 rounded-tl-none font-medium"
                          }`}
                        >
                          {msg.text}
                          {msg.role === "bot" &&
                            isSpeaking &&
                            i === messages.length - 1 && (
                              <div className="absolute -bottom-2 -right-2 flex h-5 w-5">
                                <span className="animate-ping absolute h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="h-5 w-5 rounded-full bg-blue-500 border-4 border-white"></span>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {loading && (
                  <div className="flex items-center gap-4 p-6 ml-16">
                    <div className="flex gap-2">
                      <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce [delay:200ms]"></div>
                      <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce [delay:400ms]"></div>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      MediFlow Engine Synthesizing...
                    </span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>

            <div className="p-8 bg-white border-t border-slate-100 shadow-[0_-4px_40px_-20px_rgba(0,0,0,0.1)]">
              <div className="max-w-3xl mx-auto flex items-center gap-5 relative">
                {error && (
                  <div className="absolute bottom-full mb-6 left-0 right-0 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-black uppercase tracking-widest border-2 border-red-100 animate-in slide-in-from-bottom-2 shadow-xl">
                    <AlertCircle size={16} className="inline mr-3" />
                    {error}
                  </div>
                )}
                <div className="relative flex-1 group">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    placeholder={
                      isRecording
                        ? "Clinician Mode Active..."
                        : "Relay health details to MediFlow..."
                    }
                    className={`w-full pl-8 pr-16 py-5 rounded-[2rem] border-2 transition-all focus:outline-none focus:ring-8 focus:ring-blue-600/5 text-lg font-medium ${
                      isRecording
                        ? "border-blue-400 bg-blue-50"
                        : "border-slate-100 bg-slate-50 hover:border-slate-300"
                    }`}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                    {isFinishingSpeech && (
                      <Loader2
                        className="animate-spin text-blue-500"
                        size={22}
                      />
                    )}
                    <button
                      onClick={toggleRecording}
                      className={`p-3 rounded-2xl transition-all shadow-md ${
                        isRecording
                          ? "bg-red-500 text-white animate-pulse"
                          : "bg-white text-slate-400 hover:text-blue-600 border border-slate-100 active:scale-90"
                      }`}
                    >
                      {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => handleSend()}
                  disabled={loading || !input.trim()}
                  className="p-5 bg-blue-600 text-white rounded-3xl hover:bg-blue-700 disabled:opacity-30 transition-all shadow-2xl shadow-blue-600/20 active:scale-95"
                >
                  <Send size={28} />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Report Overlay */}
        {showReport && (
          <div className="absolute inset-0 z-50 bg-slate-900/50 backdrop-blur-xl flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-2xl h-[90vh] rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500 border border-white/20">
              <div className="px-12 py-10 border-b bg-slate-50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-5">
                  <div className="bg-slate-950 p-4 rounded-2xl text-white shadow-xl">
                    <FileText size={28} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                      Clinical Report
                    </h2>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mt-1">
                      Generated Assessment Record
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={downloadAsText}
                    className="flex items-center gap-3 p-3.5 bg-white hover:bg-slate-50 rounded-2xl text-slate-700 border border-slate-200 shadow-sm transition-all text-xs font-black uppercase tracking-widest"
                  >
                    <Type size={18} /> TXT
                  </button>
                  <button
                    onClick={downloadAsImage}
                    className="flex items-center gap-3 p-3.5 bg-blue-600 hover:bg-blue-700 rounded-2xl text-white shadow-xl shadow-blue-600/20 transition-all text-xs font-black uppercase tracking-widest"
                  >
                    <ImageIcon size={18} /> PNG
                  </button>
                  <button
                    onClick={() => setShowReport(false)}
                    className="p-3.5 hover:bg-red-50 rounded-2xl text-slate-400 hover:text-red-500 transition-all"
                  >
                    <X size={28} />
                  </button>
                </div>
              </div>

              <div
                className="flex-1 overflow-y-auto p-16 bg-white"
                id="clinical-report-container"
                ref={reportRef}
              >
                {generatingReport ? (
                  <div className="h-full flex flex-col items-center justify-center gap-8">
                    <div className="w-20 h-20 border-8 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">
                      Synthesizing Health Data...
                    </p>
                  </div>
                ) : (
                  reportData && (
                    <div className="max-w-prose mx-auto space-y-16 pb-12">
                      <section className="bg-slate-950 rounded-[3rem] p-12 text-white flex flex-col sm:flex-row justify-between items-center gap-10 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full -mr-20 -mt-20"></div>
                        <div className="space-y-6">
                          <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                              Patient Identification
                            </label>
                            <p className="text-3xl font-black">
                              {reportData.patientName}
                            </p>
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                              Chronological Age
                            </label>
                            <p className="text-3xl font-black">
                              {reportData.patientAge} Years
                            </p>
                          </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 text-center min-w-[160px]">
                          <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-3">
                            Severity Score
                          </label>
                          <div
                            className={`text-3xl font-black uppercase tracking-tighter ${
                              reportData.severityRating === "High"
                                ? "text-red-400"
                                : reportData.severityRating === "Moderate"
                                ? "text-amber-400"
                                : "text-green-400"
                            }`}
                          >
                            {reportData.severityRating}
                          </div>
                        </div>
                      </section>

                      <section className="relative">
                        <div className="flex items-center gap-5 mb-8">
                          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-600/20">
                            <MessageSquare size={24} />
                          </div>
                          <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                            Symptom Summary
                          </h3>
                        </div>
                        <div className="pl-16">
                          <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 font-medium text-slate-700 leading-relaxed text-lg italic shadow-inner">
                            "{reportData.symptomSummary}"
                          </div>
                        </div>
                      </section>

                      <section className="relative">
                        <div className="flex items-center gap-5 mb-8">
                          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl">
                            <Activity size={24} />
                          </div>
                          <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                            Clinical Observations
                          </h3>
                        </div>
                        <div className="pl-16 grid gap-5">
                          {reportData.observations.map((obs, i) => (
                            <div
                              key={i}
                              className="flex gap-5 text-slate-600 p-6 bg-white rounded-[2rem] border border-slate-100 hover:border-blue-200 transition-all shadow-sm group"
                            >
                              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
                                <Zap className="text-blue-500" size={18} />
                              </div>
                              <p className="text-lg font-bold text-slate-800 leading-snug">
                                {obs}
                              </p>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section className="relative">
                        <div className="flex items-center gap-5 mb-8">
                          <div className="w-12 h-12 rounded-2xl bg-green-600 text-white flex items-center justify-center shadow-xl shadow-green-600/20">
                            <ShieldAlert size={24} />
                          </div>
                          <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                            Health Protocol
                          </h3>
                        </div>
                        <div className="pl-16 grid gap-5">
                          {reportData.precautions.map((p, i) => (
                            <div
                              key={i}
                              className="p-6 bg-green-50/30 rounded-[2rem] text-green-950 font-black border border-green-100/50 flex gap-5 items-center"
                            >
                              <div className="w-3 h-3 rounded-full bg-green-500 shrink-0 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                              <p className="text-lg">{p}</p>
                            </div>
                          ))}
                        </div>
                      </section>

                      <div className="p-12 bg-gradient-to-br from-[#0F172A] to-slate-800 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 group-hover:scale-125 transition-all duration-1000"></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-400 mb-4 ml-1">
                          Assessed Next Steps
                        </p>
                        <p className="text-2xl font-bold leading-relaxed relative z-10">
                          {reportData.nextSteps}
                        </p>
                      </div>

                      <div className="pt-12 border-t border-slate-100 space-y-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] text-center">
                          Reference:{" "}
                          {`MF-${Math.random()
                            .toString(36)
                            .substr(2, 9)
                            .toUpperCase()}`}
                        </p>
                        <div className="bg-amber-50/50 p-8 rounded-[2.5rem] border border-amber-100/50 text-[11px] text-amber-800/80 leading-relaxed font-bold text-center italic">
                          This documentation is intended for medical information
                          recording purposes only. It is not a replacement for a
                          professional clinical diagnosis from a certified
                          General Practitioner.
                        </div>
                      </div>
                    </div>
                  )
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
