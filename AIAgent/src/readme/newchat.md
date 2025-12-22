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
ChevronLeft,
Menu,
Loader2,
} from "lucide-react";

const apiKey = "AIzaSyCfzOmW3x9VcREd_JCyZfwmh20kzxmt78QG";
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";
const TTS_MODEL = "gemini-2.5-flash-preview-tts";

const SYSTEM_PROMPT = `You are a professional AI Medical Assistant. Your goal is to:

1. Conduct a thorough but empathetic symptom check with the user.
2. Ask clarifying questions one at a time (e.g., duration, severity, accompanying symptoms).
3. Based on the symptoms, identify potential conditions (clearly stating these are possibilities, not a final diagnosis).
4. Provide actionable precautionary measures and lifestyle advice.
5. ALWAYS include a medical disclaimer that you are an AI and the user should consult a human doctor for medical emergencies or formal diagnosis.
6. Keep your tone supportive, clinical, and clear.
7. Be concise but informative.`;

const REPORT_PROMPT = `Review the following medical chat history and generate a structured Health Summary Report.
The report must include:

- Patient Symptoms & Duration
- Potential Observations (Non-diagnostic)
- Suggested Precautionary Measures
- Recommended Next Steps
  Format it clearly with headers and bullet points.`;

// Helper to convert PCM16 to WAV for playback
const pcmToWav = (pcmData, sampleRate) => {
const buffer = new ArrayBuffer(44 + pcmData.length _ 2);
const view = new DataView(buffer);
const writeString = (offset, string) => {
for (let i = 0; i < string.length; i++) {
view.setUint8(offset + i, string.charCodeAt(i));
}
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
for (let i = 0; i < pcmData.length; i++, offset += 2) {
view.setInt16(offset, pcmData[i], true);
}
return new Blob([buffer], { type: "audio/wav" });
};

const App = () => {
const [chats, setChats] = useState([
{
id: "1",
title: "Initial Assessment",
messages: [
{
role: "bot",
text: "Hello. I am your AI Health Assistant. To help me understand how you are feeling, could you describe your symptoms or health concerns today?",
},
],
},
]);
const [activeChatId, setActiveChatId] = useState("1");
const [input, setInput] = useState("");
const [loading, setLoading] = useState(false);
const [showReport, setShowReport] = useState(false);
const [reportContent, setReportContent] = useState("");
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

// Setup Speech Recognition (STT) with Dynamic Silence Detection
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

          // Clear existing timer and start a new one
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

          silenceTimerRef.current = setTimeout(() => {
            const finalRequest = lastTranscriptRef.current;
            if (finalRequest.trim()) {
              handleSend(finalRequest);
              recognitionRef.current?.stop();
              setIsFinishingSpeech(false);
            }
          }, 1500); // 1.5 seconds of silence to trigger "Natural" end
        }
      };

      recognitionRef.current.onerror = (e) => {
        if (e.error !== "no-speech") {
          setIsRecording(false);
          setIsFinishingSpeech(false);
          setError("Speech recognition failed. Please try again.");
        }
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
        setIsFinishingSpeech(false);
      };
    }

}, [activeChatId, chats]);

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
contents: [{ parts: [{ text: `Say empathetically: ${text}` }] }],
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
        for (let i = 0; i < len; i += 2) {
          bytes[i / 2] =
            binaryString.charCodeAt(i) | (binaryString.charCodeAt(i + 1) << 8);
        }
        const wavBlob = pcmToWav(bytes, 24000);
        const url = URL.createObjectURL(wavBlob);
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.play();
          setIsSpeaking(true);
        }
      }
    } catch (e) {
      console.error("TTS Error", e);
    }

};

const handleSend = async (manualInput) => {
const textToSend = manualInput || input;
if (!textToSend.trim() || loading) return;

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    setInput("");
    const userMsg = { role: "user", text: textToSend.trim() };

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === activeChatId) {
          return { ...chat, messages: [...chat.messages, userMsg] };
        }
        return chat;
      })
    );

    setLoading(true);
    setError(null);
    setIsSpeaking(false);
    setIsFinishingSpeech(false);

    try {
      const chatContext = messages
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`)
        .join("\n");
      const fullPrompt = `${chatContext}\nUser: ${textToSend}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }],
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
        prev.map((chat) => {
          if (chat.id === activeChatId) {
            return {
              ...chat,
              messages: [
                ...chat.messages,
                userMsg,
                { role: "bot", text: aiText },
              ],
            };
          }
          return chat;
        })
      );

      callGeminiTTS(aiText);
    } catch (err) {
      setError("I encountered an error. Please try again.");
    } finally {
      setLoading(false);
    }

};

const startNewChat = () => {
const newId = Date.now().toString();
setChats([
...chats,
{
id: newId,
title: `Chat ${chats.length + 1}`,
messages: [
{
role: "bot",
text: "Hello again. How can I help with your health today?",
},
],
},
]);
setActiveChatId(newId);
setShowReport(false);
};

const generateReport = async () => {
if (messages.length < 3) {
setError("Please provide more information before generating a report.");
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
            contents: [{ parts: [{ text: history }] }],
            systemInstruction: { parts: [{ text: REPORT_PROMPT }] },
          }),
        }
      );
      const data = await response.json();
      setReportContent(data.candidates?.[0]?.content?.parts?.[0]?.text || "");
    } catch (err) {
      setError("Failed to generate report.");
    } finally {
      setGeneratingReport(false);
    }

};

return (
<div className="flex h-screen bg-white font-sans text-slate-900 overflow-hidden">
<audio ref={audioRef} onEnded={() => setIsSpeaking(false)} hidden />

      {/* Sidebar - Chat History */}
      <aside
        className={`${
          sidebarOpen ? "w-72" : "w-0"
        } bg-slate-900 transition-all duration-300 flex flex-col overflow-hidden shrink-0 shadow-2xl z-40`}
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Stethoscope className="text-blue-400" size={20} />
            <span className="font-bold tracking-tight">MediFlow History</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-slate-500 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <button
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all shadow-lg"
          >
            <Plus size={18} />
            New Assessment
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-3 mb-2 mt-4">
            Recent Sessions
          </p>
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 group ${
                activeChatId === chat.id
                  ? "bg-slate-800 text-white shadow-md"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
              <MessageSquare
                size={16}
                className={
                  activeChatId === chat.id
                    ? "text-blue-400"
                    : "text-slate-600 group-hover:text-slate-400"
                }
              />
              <div className="truncate text-sm font-medium">{chat.title}</div>
            </button>
          ))}
        </div>

        <div className="p-4 bg-slate-950/50 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <User className="text-blue-400" size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">
                Patient Session
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                Local Identity
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
        {/* Header */}
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm shrink-0 z-30">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
              >
                <Menu size={20} />
              </button>
            )}
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                {activeChat.title}
              </h1>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isRecording ? "bg-red-500 animate-pulse" : "bg-green-500"
                  }`}
                ></span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  {isRecording ? "Listening..." : "Live Support Active"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-2 rounded-full transition-colors ${
                voiceEnabled
                  ? "bg-blue-100 text-blue-600"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            <button
              onClick={generateReport}
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-md"
            >
              <FileText size={18} />
              <span className="hidden sm:inline">Final Report</span>
            </button>
          </div>
        </header>

        {/* Chat Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="max-w-4xl mx-auto space-y-6 pb-12">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                } animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[70%] flex gap-4 ${
                    msg.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-slate-600 border"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User size={20} />
                    ) : (
                      <Bot size={20} />
                    )}
                  </div>
                  <div
                    className={`p-4 rounded-3xl text-sm sm:text-base leading-relaxed shadow-sm relative ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                    {msg.role === "bot" &&
                      isSpeaking &&
                      i === messages.length - 1 && (
                        <div className="absolute -bottom-1 -right-1">
                          <span className="flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                          </span>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-4 items-center text-slate-400 ml-14">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Bottom Input Area */}
        <div className="p-4 sm:p-6 bg-white border-t">
          <div className="max-w-4xl mx-auto relative">
            {error && (
              <div className="absolute bottom-full mb-4 left-0 right-0 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-2 animate-in slide-in-from-bottom-4">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="relative flex-1 group">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder={
                    isRecording
                      ? "Transcribing live..."
                      : "Describe symptoms..."
                  }
                  className={`w-full pl-6 pr-14 py-4 rounded-2xl border-2 transition-all shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-100 ${
                    isRecording
                      ? "border-blue-400 bg-blue-50/50"
                      : "border-slate-100 group-hover:border-slate-200"
                  }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {isFinishingSpeech && (
                    <Loader2 className="animate-spin text-blue-500" size={18} />
                  )}
                  <button
                    onClick={toggleRecording}
                    className={`p-2.5 rounded-xl transition-all shadow-sm ${
                      isRecording
                        ? "bg-red-500 text-white animate-pulse shadow-red-200"
                        : "bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-white border border-slate-100"
                    }`}
                  >
                    {isRecording ? <MicOff size={22} /> : <Mic size={22} />}
                  </button>
                </div>
              </div>
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-30 transition-all shadow-lg shadow-blue-100"
              >
                <Send size={24} />
              </button>
            </div>
            <p className="mt-4 text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
              Natural Voice Detection Active •{" "}
              {isRecording ? "Submit in 1.5s of silence" : "Tap Mic to Start"}
            </p>
          </div>
        </div>

        {/* Report Panel Overlay */}
        {showReport && (
          <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl h-full max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="px-8 py-6 border-b flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">
                    Health Summary
                  </h3>
                  <p className="text-xs text-slate-500">
                    Based on patient session: {activeChat.title}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const el = document.createElement("textarea");
                      el.value = reportContent;
                      document.body.appendChild(el);
                      el.select();
                      document.execCommand("copy");
                      document.body.removeChild(el);
                    }}
                    className="p-2 hover:bg-white rounded-xl text-slate-600 border shadow-sm transition-all"
                  >
                    <Download size={20} />
                  </button>
                  <button
                    onClick={() => setShowReport(false)}
                    className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-10 font-serif text-slate-800">
                {generatingReport ? (
                  <div className="h-full flex flex-col items-center justify-center gap-6">
                    <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="font-sans text-sm font-semibold text-slate-500 tracking-wide uppercase">
                      Compiling assessment...
                    </p>
                  </div>
                ) : (
                  <div className="max-w-prose mx-auto">
                    <div className="mb-8 border-b pb-4">
                      <p className="text-[10px] uppercase font-bold text-blue-600 tracking-widest mb-1">
                        Generated Assessment Report
                      </p>
                      <p className="text-xs text-slate-400 font-sans">
                        Date: {new Date().toLocaleDateString()}
                      </p>
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed text-lg">
                      {reportContent}
                    </div>
                    <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-100 italic text-sm text-slate-500 font-sans">
                      "Please share this report with your primary care physician
                      for a formal diagnosis and treatment plan."
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
