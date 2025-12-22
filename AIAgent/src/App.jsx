import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";

const apiKey = "AIzaSyC-YoMTBSOl5XVQjUrjn_LllvgqesJfbSY";
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";
const TTS_MODEL = "gemini-2.5-flash-preview-tts";

const SYSTEM_PROMPT = `You are a professional AI Medical Assistant. Your goal is to:
1. PHASE 1 (INTAKE): Start by asking the user for their Name and Age. You cannot proceed to symptoms until you have this information.
2. PHASE 2 (SYMPTOMS): Once you have the Name and Age, conduct a thorough but empathetic symptom check.
3. Ask clarifying questions one at a time (e.g., duration, severity, accompanying symptoms).
4. Based on the symptoms, identify potential conditions (clearly stating these are possibilities, not a final diagnosis).
5. Provide actionable precautionary measures and lifestyle advice.
6. ALWAYS include a medical disclaimer that you are an AI and the user should consult a human doctor for medical emergencies.
7. Tone: Supportive, clinical, and clear.`;

const REPORT_SCHEMA = {
  type: "OBJECT",
  properties: {
    patientName: { type: "STRING" },
    patientAge: { type: "STRING" },
    symptomSummary: { type: "STRING" },
    observations: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
    precautions: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
    nextSteps: { type: "STRING" },
  },
  required: [
    "patientName",
    "patientAge",
    "symptomSummary",
    "observations",
    "precautions",
  ],
};

const STORAGE_KEY = "mediflow_assessment_state";

const App = () => {
  // Persistence States
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [chats, setChats] = useState([
    {
      id: "1",
      title: "New Assessment",
      messages: [
        {
          role: "bot",
          text: "Welcome to MediFlow. To begin your clinical assessment, could you please provide your full name and age?",
        },
      ],
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

  // Voice States
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isFinishingSpeech, setIsFinishingSpeech] = useState(false);

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const lastTranscriptRef = useRef("");
  const reportRef = useRef(null);

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];
  const messages = activeChat.messages;

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load data from Local Storage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const { chats: savedChats, activeChatId: savedActiveId } =
          JSON.parse(savedState);
        if (savedChats) setChats(savedChats);
        if (savedActiveId) setActiveChatId(savedActiveId);
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }
    setIsDataLoaded(true);
  }, []);

  // Sync state to Local Storage whenever it changes
  useEffect(() => {
    if (!isDataLoaded) return;

    const stateToSave = JSON.stringify({
      chats,
      activeChatId,
      lastUpdated: Date.now(),
    });
    localStorage.setItem(STORAGE_KEY, stateToSave);
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

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }

        if (currentTranscript.trim()) {
          setInput(currentTranscript);
          lastTranscriptRef.current = currentTranscript;
          setIsFinishingSpeech(true);

          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

          silenceTimerRef.current = setTimeout(() => {
            const finalRequest = lastTranscriptRef.current;
            if (finalRequest.trim()) {
              handleSend(finalRequest);
              recognitionRef.current?.stop();
              setIsFinishingSpeech(false);
            }
          }, 1500);
        }
      };

      recognitionRef.current.onerror = (e) => {
        if (e.error !== "no-speech") {
          setIsRecording(false);
          setIsFinishingSpeech(false);
          setError("Speech recognition failed.");
        }
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
        setIsFinishingSpeech(false);
      };
    }
  }, [activeChatId, chats]);

  const pcmToWav = (pcmData, sampleRate) => {
    const buffer = new ArrayBuffer(44 + pcmData.length * 2);
    const view = new DataView(buffer);
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++)
        view.setUint8(offset + i, string.charCodeAt(i));
    };
    writeString(0, "RIFF");
    view.setUint32(4, 32 + pcmData.length * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, pcmData.length * 2, true);
    let offset = 44;
    for (let i = 0; i < pcmData.length; i++, offset += 2)
      view.setInt16(offset, pcmData[i], true);
    return new Blob([buffer], { type: "audio/wav" });
  };

  const toggleRecording = () => {
    if (isRecording) {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      recognitionRef.current?.stop();
    } else {
      setError(null);
      setInput("");
      lastTranscriptRef.current = "";
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const callGeminiTTS = async (text) => {
    if (!voiceEnabled) return;
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
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSend = async (manualInput) => {
    const textToSend = manualInput || input;
    if (!textToSend.trim() || loading) return;

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    setInput("");
    const userMsg = { role: "user", text: textToSend.trim() };

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
      const chatContext = messages
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`)
        .join("\n");
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              { parts: [{ text: `${chatContext}\nUser: ${textToSend}` }] },
            ],
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          }),
        }
      );
      if (!response.ok) throw new Error();
      const data = await response.json();
      const aiText =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "I'm sorry, I couldn't process that.";
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChatId
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  userMsg,
                  { role: "bot", text: aiText },
                ],
              }
            : chat
        )
      );
      callGeminiTTS(aiText);
    } catch (err) {
      setError("Assessment service error.");
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (messages.length < 3) {
      setError("Please complete the intake and symptom description first.");
      return;
    }
    setGeneratingReport(true);
    setShowReport(true);
    setError(null);

    try {
      const history = messages
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`)
        .join("\n");
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
                    text: `Based on this medical conversation, generate a professional Health Summary Report in JSON format:\n\n${history}`,
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
      const report = JSON.parse(data.candidates[0].content.parts[0].text);
      setReportData(report);
    } catch (err) {
      setError("Failed to compile medical report.");
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
        logging: false,
        useCORS: true,
        scrollY: -window.scrollY,
        windowHeight: element.scrollHeight,
        height: element.scrollHeight,
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

    const separator = "=".repeat(50);
    const content = `
MEDIFLOW CLINICAL ASSESSMENT REPORT
${separator}
DATE: ${new Date().toLocaleDateString()}
CASE REF: MF-${Math.random().toString(36).substr(2, 9).toUpperCase()}
${separator}

PATIENT INFORMATION
-------------------
Name: ${reportData.patientName}
Age:  ${reportData.patientAge}

SYMPTOM SUMMARY
---------------
${reportData.symptomSummary}

CLINICAL OBSERVATIONS
---------------------
${reportData.observations.map((obs) => `- ${obs}`).join("\n")}

PRECAUTIONARY MEASURES
----------------------
${reportData.precautions.map((prec) => `- ${prec}`).join("\n")}

RECOMMENDED NEXT STEPS
----------------------
${
  reportData.nextSteps || "Schedule a consultation with a General Practitioner."
}

${separator}
IMPORTANT DISCLAIMER:
This automated summary is intended for informational purposes and does not 
constitute a medical diagnosis. In case of emergency, contact local services 
immediately.
${separator}
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.download = `MediFlow_Report_${reportData.patientName}.txt`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <audio ref={audioRef} onEnded={() => setIsSpeaking(false)} hidden />

      {/* History Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-80" : "w-0"
        } bg-slate-900 transition-all duration-300 flex flex-col overflow-hidden shrink-0 shadow-2xl z-40`}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-xl">
              <Stethoscope className="text-white" size={20} />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">
              MediFlow
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-slate-400 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          <button
            onClick={() => {
              const newId = Date.now().toString();
              setChats([
                ...chats,
                {
                  id: newId,
                  title: "New Assessment",
                  messages: [
                    {
                      role: "bot",
                      text: "Welcome. Please provide your name and age to begin.",
                    },
                  ],
                },
              ]);
              setActiveChatId(newId);
            }}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg"
          >
            <Plus size={18} />
            New Assessment
          </button>
          <div className="space-y-1">
            <p className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Recent Sessions
            </p>
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${
                  activeChatId === chat.id
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <History size={16} />
                <span className="truncate text-sm font-medium">
                  {chat.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="bg-white border-b px-8 py-5 flex items-center justify-between shadow-sm shrink-0 z-30">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <Menu size={20} />
              </button>
            )}
            <div>
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">
                {activeChat.title}
              </h1>
              <p className="text-[10px] font-bold text-green-600 uppercase tracking-tighter flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                Clinical Assessment Active
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-2.5 rounded-full transition-all ${
                voiceEnabled
                  ? "bg-blue-50 text-blue-600"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            <button
              onClick={generateReport}
              className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-md"
            >
              <FileText size={18} />
              Generate Clinical Report
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 bg-[#fcfcfd]">
          <div className="max-w-3xl mx-auto space-y-6">
            {!isDataLoaded && (
              <div className="h-full flex flex-col items-center justify-center gap-4 py-20 text-slate-400">
                <RefreshCw className="animate-spin w-8 h-8" />
                <p className="text-sm font-bold uppercase tracking-widest">
                  Resuming Session...
                </p>
              </div>
            )}
            {isDataLoaded &&
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  } animate-in fade-in slide-in-from-bottom-2`}
                >
                  <div
                    className={`flex gap-4 max-w-[85%] ${
                      msg.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-white text-slate-400 border border-slate-200"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <User size={20} />
                      ) : (
                        <Bot size={20} />
                      )}
                    </div>
                    <div
                      className={`p-4 rounded-3xl text-sm sm:text-base leading-relaxed relative shadow-sm border ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white border-blue-600 rounded-tr-none"
                          : "bg-white text-slate-800 border-slate-100 rounded-tl-none"
                      }`}
                    >
                      {msg.text}
                      {msg.role === "bot" &&
                        isSpeaking &&
                        i === messages.length - 1 && (
                          <div className="absolute -bottom-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="h-3 w-3 rounded-full bg-blue-500"></span>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            {loading && (
              <div className="flex gap-1.5 p-4 ml-14">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input Dock */}
        <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
          <div className="max-w-3xl mx-auto flex items-center gap-4 relative">
            {error && (
              <div className="absolute bottom-full mb-4 left-0 right-0 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-medium flex items-center gap-2 animate-in slide-in-from-bottom-2">
                <AlertCircle size={14} />
                {error}
              </div>
            )}
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder={
                  isRecording
                    ? "Listening..."
                    : "Tell me your name or describe symptoms..."
                }
                className={`w-full pl-6 pr-14 py-4 rounded-2xl border-2 transition-all focus:outline-none focus:ring-4 focus:ring-blue-50/50 ${
                  isRecording
                    ? "border-blue-400 bg-blue-50"
                    : "border-slate-100 bg-slate-50"
                }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {isFinishingSpeech && (
                  <Loader2 className="animate-spin text-blue-500" size={18} />
                )}
                <button
                  onClick={toggleRecording}
                  className={`p-2.5 rounded-xl transition-all ${
                    isRecording
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-white text-slate-400 hover:text-blue-600 border border-slate-100"
                  }`}
                >
                  {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
              </div>
            </div>
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim() || !isDataLoaded}
              className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-30 transition-all shadow-lg shadow-blue-200"
            >
              <Send size={24} />
            </button>
          </div>
        </div>

        {/* Medical Report Panel */}
        {showReport && (
          <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="px-10 py-8 border-b bg-slate-50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-900 p-3 rounded-2xl text-white">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                      Clinical Summary
                    </h2>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-1">
                      Official Digital Assessment
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={downloadAsText}
                    className="flex items-center gap-2 p-2.5 bg-white hover:bg-slate-50 rounded-xl text-slate-700 border border-slate-200 shadow-sm transition-all text-sm font-bold"
                  >
                    <Type size={18} />
                    <span className="hidden sm:inline">Text</span>
                  </button>
                  <button
                    onClick={downloadAsImage}
                    className="flex items-center gap-2 p-2.5 bg-blue-50 hover:bg-blue-100 rounded-xl text-blue-700 border border-blue-200 shadow-sm transition-all text-sm font-bold"
                  >
                    <ImageIcon size={18} />
                    <span className="hidden sm:inline">Image</span>
                  </button>
                  <button
                    onClick={() => setShowReport(false)}
                    className="p-2.5 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div
                className="flex-1 overflow-y-auto p-12 bg-white"
                ref={reportRef}
              >
                {generatingReport ? (
                  <div className="h-full flex flex-col items-center justify-center gap-6">
                    <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                      Synthesizing Patient Record...
                    </p>
                  </div>
                ) : (
                  reportData && (
                    <div className="max-w-prose mx-auto">
                      {/* Patient Information Section */}
                      <section className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100 grid grid-cols-2 gap-10 mb-14 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-10 -mt-10"></div>
                        <div className="space-y-1 relative z-10">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Patient Name
                          </label>
                          <p className="text-2xl font-black text-slate-900 tracking-tight">
                            {reportData.patientName}
                          </p>
                        </div>
                        <div className="space-y-1 relative z-10">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Patient Age
                          </label>
                          <p className="text-2xl font-black text-slate-900 tracking-tight">
                            {reportData.patientAge} Years
                          </p>
                        </div>
                        <div className="space-y-1 border-t pt-6 border-slate-200">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Date of Assessment
                          </label>
                          <div className="flex items-center gap-2 text-slate-600 font-bold text-lg">
                            <Calendar size={18} className="text-blue-500" />
                            {new Date().toLocaleDateString()}
                          </div>
                        </div>
                        <div className="space-y-1 border-t pt-6 border-slate-200">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Case Reference
                          </label>
                          <div className="text-slate-600 font-mono text-sm tracking-tight">
                            MF-
                            {Math.random()
                              .toString(36)
                              .substr(2, 9)
                              .toUpperCase()}
                          </div>
                        </div>
                      </section>

                      {/* Body Sections */}
                      <div className="space-y-12">
                        <section className="relative">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-100">
                              <MessageSquare size={20} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                              Symptom Summary
                            </h3>
                          </div>
                          <div className="pl-14">
                            <p className="text-slate-700 leading-relaxed text-lg font-medium">
                              {reportData.symptomSummary}
                            </p>
                          </div>
                        </section>

                        <section className="relative">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                              <ClipboardList size={20} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                              Clinical Observations
                            </h3>
                          </div>
                          <div className="pl-14 grid gap-4">
                            {reportData.observations.map((item, i) => (
                              <div
                                key={i}
                                className="flex gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors"
                              >
                                <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></span>
                                <p className="text-slate-700 font-medium leading-snug">
                                  {item}
                                </p>
                              </div>
                            ))}
                          </div>
                        </section>

                        <section className="relative">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-green-600 text-white flex items-center justify-center shadow-lg shadow-green-100">
                              <ShieldAlert size={20} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                              Precautionary Measures
                            </h3>
                          </div>
                          <div className="pl-14 space-y-4">
                            {reportData.precautions.map((item, i) => (
                              <div
                                key={i}
                                className="flex gap-4 items-start p-5 bg-green-50/50 rounded-2xl border border-green-100/50"
                              >
                                <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                                  <span className="text-xs font-black">✓</span>
                                </div>
                                <p className="text-green-900 font-bold leading-tight">
                                  {item}
                                </p>
                              </div>
                            ))}
                          </div>
                        </section>

                        <div className="mt-16 p-10 bg-slate-900 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700"></div>
                          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-4">
                            Recommended Next Steps
                          </h4>
                          <p className="text-slate-200 leading-relaxed text-lg font-medium relative z-10">
                            {reportData.nextSteps ||
                              "Please schedule a priority consultation with a certified General Practitioner to discuss these findings and establish a formal diagnostic plan."}
                          </p>
                        </div>

                        <div className="pt-12 border-t border-slate-100 flex gap-6 text-slate-400 italic text-xs leading-relaxed pb-10">
                          <AlertCircle
                            size={24}
                            className="shrink-0 text-slate-300"
                          />
                          <div className="space-y-2">
                            <p className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">
                              Important Disclaimer
                            </p>
                            <p>
                              This automated summary is intended to assist in
                              symptom recording and does not constitute a
                              medical diagnosis. AI interpretations may vary;
                              accuracy depends on provided input. In case of
                              severe chest pain, shortness of breath, or loss of
                              consciousness, proceed immediately to the nearest
                              emergency department.
                            </p>
                          </div>
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
