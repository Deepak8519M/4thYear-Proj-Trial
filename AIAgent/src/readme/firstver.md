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
- Recommended Next Steps (e.g., see a specialist, rest, etc.)
  Format it clearly with headers and bullet points. Do not use markdown styling that would look messy; keep it professional for a document view.`;

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
const [messages, setMessages] = useState([
{
role: "bot",
text: "Hello. I am your AI Health Assistant. To help me understand how you are feeling, could you describe your symptoms or health concerns today?",
},
]);
const [input, setInput] = useState("");
const [loading, setLoading] = useState(false);
const [showReport, setShowReport] = useState(false);
const [reportContent, setReportContent] = useState("");
const [generatingReport, setGeneratingReport] = useState(false);
const [error, setError] = useState(null);

// Voice States
const [isRecording, setIsRecording] = useState(false);
const [isSpeaking, setIsSpeaking] = useState(false);
const [voiceEnabled, setVoiceEnabled] = useState(true);

const chatEndRef = useRef(null);
const recognitionRef = useRef(null);
const audioRef = useRef(null);

const scrollToBottom = () => {
chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
};

useEffect(() => {
scrollToBottom();
}, [messages]);

// Setup Speech Recognition (STT)
useEffect(() => {
const SpeechRecognition =
window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
recognitionRef.current = new SpeechRecognition();
recognitionRef.current.continuous = false;
recognitionRef.current.interimResults = false;
recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = () => {
        setIsRecording(false);
        setError("Speech recognition failed. Please try again or type.");
      };

      recognitionRef.current.onend = () => setIsRecording(false);
    }

}, []);

const toggleRecording = () => {
if (isRecording) {
recognitionRef.current?.stop();
} else {
setError(null);
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

const callGemini = async (prompt, systemInstruction = SYSTEM_PROMPT) => {
let retries = 0;
const maxRetries = 5;

    const executeRequest = async () => {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] },
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429 && retries < maxRetries) {
          const delay = Math.pow(2, retries) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
          retries++;
          return executeRequest();
        }
        throw new Error("Failed to reach the AI service.");
      }

      const data = await response.json();
      return (
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "I'm sorry, I couldn't process that."
      );
    };

    return executeRequest();

};

const handleSend = async () => {
if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);
    setError(null);
    setIsSpeaking(false);

    try {
      const context = messages
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`)
        .join("\n");
      const fullPrompt = `${context}\nUser: ${userMsg}`;

      const aiResponse = await callGemini(fullPrompt);
      setMessages((prev) => [...prev, { role: "bot", text: aiResponse }]);

      // Speak the response
      callGeminiTTS(aiResponse);
    } catch (err) {
      setError("I encountered an error. Please try again.");
    } finally {
      setLoading(false);
    }

};

const generateReport = async () => {
if (messages.length < 3) {
setError(
"Please provide more information about your symptoms before generating a report."
);
return;
}

    setGeneratingReport(true);
    setShowReport(true);
    setError(null);

    try {
      const history = messages
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`)
        .join("\n");
      const report = await callGemini(history, REPORT_PROMPT);
      setReportContent(report);
    } catch (err) {
      setError("Failed to generate report.");
    } finally {
      setGeneratingReport(false);
    }

};

const copyReport = () => {
const el = document.createElement("textarea");
el.value = reportContent;
document.body.appendChild(el);
el.select();
document.execCommand("copy");
document.body.removeChild(el);
};

return (
<div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
<audio ref={audioRef} onEnded={() => setIsSpeaking(false)} hidden />

      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Stethoscope className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">MediFlow AI</h1>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live Vocal Assessment
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2 rounded-full transition-colors ${
              voiceEnabled
                ? "bg-blue-100 text-blue-600"
                : "bg-slate-100 text-slate-400"
            }`}
            title={voiceEnabled ? "Mute Bot Voice" : "Unmute Bot Voice"}
          >
            {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button
            onClick={generateReport}
            className="hidden sm:flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-100 transition-colors border border-blue-200"
          >
            <FileText size={18} />
            <span>Generate Report</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col h-full bg-white md:border-r">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] flex gap-3 ${
                    msg.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === "user"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User size={18} />
                    ) : (
                      <Bot size={18} />
                    )}
                  </div>
                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm relative ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                    {msg.role === "bot" &&
                      isSpeaking &&
                      i === messages.length - 1 && (
                        <div className="absolute -bottom-1 -right-1">
                          <span className="flex h-3 w-3 relative">
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
                <div className="flex gap-3 items-center text-slate-400 text-sm animate-pulse ml-11">
                  <RefreshCw className="animate-spin" size={16} />
                  <span>MediFlow is analyzing...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t bg-slate-50">
            {error && (
              <div className="mb-3 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder={
                    isRecording
                      ? "Listening..."
                      : "Describe symptoms or speak..."
                  }
                  className={`w-full pl-4 pr-12 py-3 rounded-xl border transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isRecording
                      ? "border-blue-400 ring-2 ring-blue-100 bg-blue-50"
                      : "border-slate-200 bg-white"
                  }`}
                />
                <button
                  onClick={toggleRecording}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
                    isRecording
                      ? "bg-red-500 text-white animate-pulse"
                      : "text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                  }`}
                >
                  {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
              </div>
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md"
              >
                <Send size={20} />
              </button>
            </div>
            <p className="mt-3 text-[10px] text-center text-slate-400 uppercase tracking-widest font-bold">
              Disclaimer: Voice analysis for guidance only. Not diagnostic.
            </p>
          </div>
        </div>

        {/* Report Panel */}
        {showReport && (
          <div className="absolute inset-0 z-50 md:relative md:w-1/2 lg:w-2/5 md:z-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 md:p-0 md:block">
            <div className="bg-white w-full h-full max-h-[90vh] md:max-h-none rounded-2xl md:rounded-none shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right-10 duration-300">
              <div className="px-6 py-4 border-b flex items-center justify-between bg-slate-50 shrink-0">
                <div className="flex items-center gap-2 font-bold text-slate-700">
                  <FileText className="text-blue-600" size={20} />
                  Health Summary Report
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyReport}
                    className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    onClick={() => setShowReport(false)}
                    className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 font-serif leading-relaxed text-slate-800">
                {generatingReport ? (
                  <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-400">
                    <RefreshCw className="animate-spin w-8 h-8" />
                    <p className="font-sans text-sm font-medium">
                      Synthesizing health data...
                    </p>
                  </div>
                ) : (
                  <div className="max-w-prose mx-auto">
                    <div className="mb-8 pb-4 border-b-2 border-slate-100 flex justify-between items-end">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-1">
                          Clinical Summary
                        </h2>
                        <p className="text-sm text-slate-500 italic font-sans">
                          MediFlow Assessment Engine
                        </p>
                      </div>
                      <div className="text-right text-xs text-slate-400 font-sans">
                        Generated: {new Date().toLocaleDateString()}
                      </div>
                    </div>

                    <div className="whitespace-pre-wrap text-sm sm:text-base">
                      {reportContent}
                    </div>

                    <div className="mt-12 pt-6 border-t border-slate-100 bg-amber-50 p-4 rounded-xl border-dashed border-2">
                      <div className="flex gap-2 text-amber-700 mb-2 font-sans">
                        <ShieldAlert size={18} className="shrink-0" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Medical Disclaimer
                        </span>
                      </div>
                      <p className="text-[11px] leading-tight text-amber-800/80 font-sans">
                        This document is generated by an Artificial Intelligence
                        and is provided for informational purposes only. It does
                        not constitute medical advice, diagnosis, or treatment.
                        Always seek the advice of your physician or other
                        qualified health provider with any questions you may
                        have regarding a medical condition.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>

);
};

export default App;
