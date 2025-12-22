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
  Printer,
  Calendar,
  ClipboardList,
} from "lucide-react";

const apiKey = "AIzaSyCfzOmW3x9VcREd_JCyZfwmh20kzxmt78QG";
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

const App = () => {
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

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];
  const messages = activeChat.messages;

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

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
                <MessageSquare size={16} />
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
            {messages.map((msg, i) => (
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
              disabled={loading || !input.trim()}
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
              <div className="px-10 py-8 border-b bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-900 p-3 rounded-2xl text-white">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      Medical Summary Report
                    </h2>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-1">
                      Official Clinical Intake
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="p-2.5 hover:bg-white rounded-xl text-slate-600 border shadow-sm"
                  >
                    <Printer size={20} />
                  </button>
                  <button
                    onClick={() => setShowReport(false)}
                    className="p-2.5 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-12 bg-white space-y-12">
                {generatingReport ? (
                  <div className="h-full flex flex-col items-center justify-center gap-6">
                    <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                      Compiling Clinical Data...
                    </p>
                  </div>
                ) : (
                  reportData && (
                    <div className="max-w-prose mx-auto">
                      {/* Patient Card */}
                      <section className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 grid grid-cols-2 gap-8 mb-12">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Full Name
                          </label>
                          <p className="text-xl font-bold text-slate-800">
                            {reportData.patientName}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Age
                          </label>
                          <p className="text-xl font-bold text-slate-800">
                            {reportData.patientAge} Years
                          </p>
                        </div>
                        <div className="space-y-1 border-t pt-4 border-slate-200">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Date of Assessment
                          </label>
                          <div className="flex items-center gap-2 text-slate-600 font-medium">
                            <Calendar size={14} />
                            {new Date().toLocaleDateString()}
                          </div>
                        </div>
                        <div className="space-y-1 border-t pt-4 border-slate-200">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Assessment ID
                          </label>
                          <div className="text-slate-600 font-mono text-xs">
                            MF-
                            {Math.random()
                              .toString(36)
                              .substr(2, 9)
                              .toUpperCase()}
                          </div>
                        </div>
                      </section>

                      <div className="space-y-10">
                        <section>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                              <MessageSquare size={16} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">
                              Symptom Summary
                            </h3>
                          </div>
                          <p className="text-slate-600 leading-relaxed pl-11">
                            {reportData.symptomSummary}
                          </p>
                        </section>

                        <section>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                              <ClipboardList size={16} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">
                              Clinical Observations
                            </h3>
                          </div>
                          <ul className="space-y-3 pl-11">
                            {reportData.observations.map((item, i) => (
                              <li
                                key={i}
                                className="flex gap-3 text-slate-600 leading-snug"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0"></span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </section>

                        <section>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                              <ShieldAlert size={16} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">
                              Precautionary Measures
                            </h3>
                          </div>
                          <ul className="space-y-3 pl-11">
                            {reportData.precautions.map((item, i) => (
                              <li
                                key={i}
                                className="flex gap-3 text-slate-600 leading-snug bg-green-50/50 p-3 rounded-xl border border-green-100/50"
                              >
                                <span className="text-green-600 font-bold">
                                  •
                                </span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </section>

                        <div className="p-8 bg-slate-900 rounded-[2rem] text-white">
                          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 mb-2">
                            Recommended Next Steps
                          </h4>
                          <p className="text-slate-300 leading-relaxed">
                            {reportData.nextSteps ||
                              "Consult a general practitioner within 24-48 hours for a physical examination and formal diagnosis."}
                          </p>
                        </div>

                        <div className="pt-8 border-t border-slate-100 flex gap-4 text-slate-400 italic text-[11px] leading-relaxed">
                          <AlertCircle
                            size={20}
                            className="shrink-0 text-slate-300"
                          />
                          <p>
                            This report is for informational purposes and was
                            generated by an AI assistant. It does not replace
                            professional medical judgment. If you are
                            experiencing a life-threatening emergency, contact
                            emergency services immediately.
                          </p>
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
