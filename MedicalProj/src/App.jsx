import React, { useState, useEffect, useRef } from "react";
import {
  Heart,
  Activity,
  Wind,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  BrainCircuit,
  Volume2,
  MessageSquarePlus,
  ShieldCheck,
  Upload,
  Image as ImageIcon,
  ScanSearch,
  Zap,
  X,
  Sun,
  Moon,
  LayoutDashboard,
  TrendingUp,
  Users,
  Clock,
  ArrowUpRight,
  Bot,
  Send,
  FileText,
  Download,
  RotateCcw,
  Pill,
  Search,
  Stethoscope,
  DollarSign,
  ShoppingCart,
  History,
  Info,
  MapPin,
  Calendar,
  Star,
  Phone,
  Navigation,
  ExternalLink,
  ClipboardList,
  FileSearch,
} from "lucide-react";

// --- Constants ---
const API_KEY = "AIzaSyCkaC4j2ANCMnP0W0CyFwHJsQdVfJyYQwE"; // Provided at runtime

const MODEL_TEXT = "gemini-2.5-flash-preview-09-2025";
const MODEL_TTS = "gemini-2.5-flash-preview-tts";

const App = () => {
  const [activeTab, setActiveTab] = useState("heart");
  const [view, setView] = useState("diagnostic"); // 'diagnostic', 'dashboard', 'agent', 'pharmacy', 'symptoms', 'hospitals', 'booking'
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState(null);

  // AI Integration States
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Agent / Chat States - Enhanced version
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      content:
        "Welcome to your VitaCore Clinical Session. I am your AI Health Agent. Please describe your symptoms or health queries in detail for a comprehensive analysis.",
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [clinicalReport, setClinicalReport] = useState(null);
  const [agentMode, setAgentMode] = useState("chat"); // 'chat' or 'report'
  const chatEndRef = useRef(null);

  // Pharmacy State
  const [pharmacyQuery, setPharmacyQuery] = useState("");
  const [pharmacyResults, setPharmacyResults] = useState(null);
  const [pharmacyMode, setPharmacyMode] = useState("recommend"); // 'recommend' or 'alternative'

  // Symptom Checker State
  const [symptomInput, setSymptomInput] = useState("");
  const [symptomAnalysis, setSymptomAnalysis] = useState(null);

  // Nearby Hospitals State
  const [locationQuery, setLocationQuery] = useState("");
  const [hospitalResults, setHospitalResults] = useState(null);

  // Booking State
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Imaging State
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Form states for each disease type
  const [formData, setFormData] = useState({
    heart: {
      age: "",
      sex: "1",
      cp: "0",
      trestbps: "",
      chol: "",
      fbs: "0",
      restecg: "0",
      thalach: "",
    },
    diabetes: {
      pregnancies: "",
      glucose: "",
      bloodPressure: "",
      skinThickness: "",
      insulin: "",
      bmi: "",
      dpf: "",
      age: "",
    },
    lung: {
      age: "",
      smoking: "1",
      yellowFingers: "1",
      anxiety: "1",
      peerPressure: "1",
      chronicDisease: "1",
      fatigue: "1",
      wheezing: "1",
    },
    oncology: { scanType: "Lung Cancer X-Ray" },
  });

  useEffect(() => {
    if (view === "agent") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, view]);

  // --- Gemini API Helpers ---

  const executeGeminiRequest = async (url, payload) => {
    let delay = 1000;
    for (let i = 0; i < 5; i++) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("API Error");
        const data = await response.json();
        return data;
      } catch (err) {
        if (i === 4) throw err;
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  };

  const callGemini = async (
    prompt,
    systemInstruction = "You are a professional medical AI assistant."
  ) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_TEXT}:generateContent?key=${API_KEY}`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
    };
    const result = await executeGeminiRequest(url, payload);
    return result.candidates?.[0]?.content?.parts?.[0]?.text;
  };

  const playGeminiTTS = async (text) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_TTS}:generateContent?key=${API_KEY}`;
    const payload = {
      contents: [{ parts: [{ text: `Say professionally: ${text}` }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
        },
      },
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      const base64Audio = data.candidates[0].content.parts[0].inlineData.data;

      const buffer = Uint8Array.from(atob(base64Audio), (c) =>
        c.charCodeAt(0)
      ).buffer;
      const length = buffer.byteLength;
      const wavHeader = new ArrayBuffer(44);
      const view = new DataView(wavHeader);
      view.setUint32(0, 0x52494646, false);
      view.setUint32(4, 36 + length, true);
      view.setUint32(8, 0x57415645, false);
      view.setUint32(12, 0x666d7420, false);
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, 24000, true);
      view.setUint32(28, 24000 * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      view.setUint32(36, 0x64617461, false);
      view.setUint32(40, length, true);

      const audioBlob = new Blob([wavHeader, buffer], { type: "audio/wav" });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsSpeaking(false);
      audio.play();
    } catch (err) {
      console.error(err);
      setIsSpeaking(false);
    }
  };

  // --- Agent Feature Handlers ---

  const generateReport = async () => {
    if (chatMessages.length < 2) return;
    setIsGeneratingSummary(true);
    setAgentMode("report");

    const conversationHistory = chatMessages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");

    const prompt = `Based on the following medical conversation history, generate a high-fidelity, professional Clinical Consultation Report. 
    Format it exactly with these sections:
    1. PATIENT SUMMARY & CHIEF COMPLAINT
    2. SYMPTOMATIC ANALYSIS
    3. PRELIMINARY AI OBSERVATIONS
    4. RECOMMENDED CLINICAL PATHWAY (Next Steps)
    5. URGENCY LEVEL
    6. IMPORTANT DISCLAIMER
    
    Conversation:
    ${conversationHistory}`;

    try {
      const summary = await callGemini(
        prompt,
        "You are a Chief Medical Officer generating a formal clinical summary."
      );
      setClinicalReport(summary);
    } catch (err) {
      setErrorMessage("Report generation failed.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const downloadReport = () => {
    if (!clinicalReport) return;
    const header = `VITACORE AI CLINICAL SUITE - MEDICAL REPORT\nGenerated: ${new Date().toLocaleString()}\n-------------------------------------------\n\n`;
    const blob = new Blob([header + clinicalReport], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `VitaCore_Health_Report_${new Date().getTime()}.txt`;
    link.click();
  };

  // --- Specific Feature Handlers ---

  const handlePharmacySearch = async (e) => {
    e.preventDefault();
    if (!pharmacyQuery.trim()) return;
    setIsAiProcessing(true);
    setPharmacyResults(null);

    let prompt = "";
    if (pharmacyMode === "recommend") {
      prompt = `Provide a comprehensive medicine recommendation for the condition: "${pharmacyQuery}". 
      List 3-5 standard medications, typical dosages, and common side effects. 
      Format as a clean professional report with markdown headers. 
      Always include a disclaimer that this is not medical advice.`;
    } else {
      prompt = `For the medicine "${pharmacyQuery}", suggest 3-5 low-cost or generic alternatives that use the same active ingredients. 
      Explain the price difference logic (generic vs brand) and ensure safety warnings are included. 
      Format as a comparison list.`;
    }

    try {
      const result = await callGemini(
        prompt,
        "You are a clinical pharmacologist."
      );
      setPharmacyResults(result);
    } catch (err) {
      setErrorMessage("Pharmacy database connection failed.");
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleSymptomAnalysis = async (e) => {
    e.preventDefault();
    if (!symptomInput.trim()) return;
    setIsAiProcessing(true);
    setSymptomAnalysis(null);

    const prompt = `Analyze these symptoms: "${symptomInput}". 
    Identify the 3 most likely medical conditions. 
    For each, provide: 1. Condition Name, 2. Probable Confidence (%), 3. Recommended Specialist (e.g., Cardiologist), 4. Urgency Level (Low/Medium/High).
    Keep it professional and concise.`;

    try {
      const result = await callGemini(
        prompt,
        "You are a senior diagnostic physician."
      );
      setSymptomAnalysis(result);
    } catch (err) {
      setErrorMessage("Diagnostic engine error.");
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleHospitalSearch = async (e) => {
    e.preventDefault();
    if (!locationQuery.trim()) return;
    setIsAiProcessing(true);
    setHospitalResults(null);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_TEXT}:generateContent?key=${API_KEY}`;
    const payload = {
      contents: [
        {
          parts: [
            {
              text: `Locate 5 real hospitals near "${locationQuery}" immediately. Output JSON.`,
            },
          ],
        },
      ],
      systemInstruction: {
        parts: [
          {
            text: "Return a JSON object with a 'hospitals' array. Each object: 'name', 'address', 'specialty', 'emergencyRoom' (boolean), 'rating' (float 1-5). Use real data for this city.",
          },
        ],
      },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            hospitals: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  name: { type: "STRING" },
                  address: { type: "STRING" },
                  specialty: { type: "STRING" },
                  emergencyRoom: { type: "BOOLEAN" },
                  rating: { type: "NUMBER" },
                },
                required: [
                  "name",
                  "address",
                  "specialty",
                  "emergencyRoom",
                  "rating",
                ],
              },
            },
          },
        },
      },
    };

    try {
      const result = await executeGeminiRequest(url, payload);
      const content = result.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(content);
      setHospitalResults(parsed.hospitals);
    } catch (err) {
      setErrorMessage(
        "Could not fetch nearby hospitals. Please try a different location."
      );
      console.error(err);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleBooking = (doc) => {
    setSelectedDoctor(doc);
    setIsAiProcessing(true);
    setTimeout(() => {
      setIsAiProcessing(false);
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setSelectedDoctor(null);
      }, 3000);
    }, 1500);
  };

  // --- UI Components ---

  const SidebarButton = ({
    icon: Icon,
    label,
    id,
    currentView,
    onClick,
    colorClass = "",
  }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-4 p-4 rounded-[1.25rem] transition-all font-bold text-sm w-full text-left ${
        currentView === id
          ? `bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white ${colorClass}`
          : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
      }`}
    >
      <div
        className={`p-2 rounded-xl shadow-sm ${
          currentView === id
            ? "bg-white dark:bg-slate-900"
            : "bg-white dark:bg-slate-900 opacity-60"
        }`}
      >
        <Icon size={18} />
      </div>
      {label}
    </button>
  );

  // --- Enhanced Agent View ---

  const renderAgentView = () => (
    <div className="animate-in fade-in slide-in-from-bottom-10 duration-700 h-full flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
            <Bot className="text-violet-600" size={36} /> Health Concierge Pro
          </h2>
          <p className="text-slate-500 font-medium italic">
            High-fidelity clinical agent and reporting suite.
          </p>
        </div>
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
          <button
            onClick={() => setAgentMode("chat")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              agentMode === "chat"
                ? "bg-white dark:bg-slate-900 text-violet-600 shadow-md"
                : "text-slate-400"
            }`}
          >
            <MessageSquarePlus size={14} /> LIVE CONSULT
          </button>
          <button
            onClick={generateReport}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              agentMode === "report"
                ? "bg-white dark:bg-slate-900 text-violet-600 shadow-md"
                : "text-slate-400"
            }`}
          >
            <ClipboardList size={14} /> CLINICAL REPORT
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left Column: Chat */}
        <div
          className={`lg:col-span-7 flex flex-col transition-all duration-500 ${
            agentMode === "report"
              ? "opacity-40 grayscale pointer-events-none"
              : ""
          }`}
        >
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden">
            <div className="p-8 overflow-y-auto space-y-6 flex-1">
              {chatMessages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] p-6 rounded-[2.5rem] text-sm font-medium shadow-sm transition-all animate-in slide-in-from-bottom-2 ${
                      m.role === "user"
                        ? "bg-violet-600 text-white rounded-tr-none"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none border dark:border-slate-700"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form
              className="p-6 bg-slate-50 dark:bg-slate-900 border-t dark:border-slate-800 flex gap-3 items-center"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!userInput.trim() || isChatting) return;
                const newMsgs = [
                  ...chatMessages,
                  { role: "user", content: userInput },
                ];
                setChatMessages(newMsgs);
                setUserInput("");
                setIsChatting(true);
                const res = await callGemini(
                  userInput,
                  "Professional health agent. Respond as a clinical expert."
                );
                setChatMessages([
                  ...newMsgs,
                  { role: "assistant", content: res },
                ]);
                setIsChatting(false);
              }}
            >
              <div className="relative flex-1 group">
                <input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 p-5 pr-14 rounded-2xl outline-none shadow-inner dark:text-white border-2 border-transparent focus:border-violet-500/20 transition-all font-medium"
                  placeholder="Describe symptoms, ask about treatments..."
                />
                <button
                  type="button"
                  onClick={() =>
                    playGeminiTTS(
                      chatMessages[chatMessages.length - 1]?.content || ""
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-600 transition-colors"
                >
                  <Volume2 size={20} />
                </button>
              </div>
              <button className="bg-slate-900 dark:bg-violet-600 p-5 text-white rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg">
                {isChatting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Report */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col h-full overflow-hidden relative">
            <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="font-black text-xs uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <FileSearch size={16} className="text-violet-500" /> Clinical
                Report Summary
              </h3>
              {clinicalReport && (
                <button
                  onClick={downloadReport}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-md"
                >
                  <Download size={14} /> Export Report
                </button>
              )}
            </div>

            <div className="flex-1 p-8 overflow-y-auto">
              {isGeneratingSummary ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                  <p className="font-black text-slate-400 uppercase tracking-widest text-xs">
                    Synthesizing Clinical Data...
                  </p>
                </div>
              ) : clinicalReport ? (
                <div className="animate-in fade-in zoom-in-95 duration-500">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {clinicalReport}
                  </pre>
                  <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                    <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest leading-normal">
                      Note: This report is AI-generated for informational
                      purposes. Please present this to a human specialist for
                      validation.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 px-6">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                    <ClipboardList size={40} className="text-slate-400" />
                  </div>
                  <h4 className="text-xl font-black text-slate-400 mb-2">
                    No Active Report
                  </h4>
                  <p className="text-sm font-medium text-slate-400">
                    Interact with the Health Concierge on the left, then click
                    "CLINICAL REPORT" to generate a professional summary of your
                    session.
                  </p>
                </div>
              )}
            </div>

            {!clinicalReport &&
              !isGeneratingSummary &&
              chatMessages.length > 1 && (
                <div className="p-6">
                  <button
                    onClick={generateReport}
                    className="w-full py-4 bg-violet-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-violet-700 transition-all flex items-center justify-center gap-3 group"
                  >
                    <Sparkles
                      size={18}
                      className="group-hover:rotate-12 transition-transform"
                    />{" "}
                    Generate Professional Report
                  </button>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderNearbyHospitals = () => (
    <div className="animate-in fade-in slide-in-from-right-12 duration-700 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Rapid Hospital Locator
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium italic">
            Instant identification of medical hubs in your area.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-12 border border-slate-100 dark:border-slate-800 shadow-xl">
        <form onSubmit={handleHospitalSearch} className="relative mb-12">
          <div className="relative group">
            <input
              type="text"
              placeholder="Enter city or ZIP code (e.g. Vizag, 530001)..."
              className="w-full bg-slate-50 dark:bg-slate-800 p-6 pr-44 rounded-[2.5rem] border-none focus:ring-4 ring-cyan-100 dark:ring-cyan-900/20 outline-none dark:text-white text-lg font-medium transition-all"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
            />
            <button
              type="submit"
              disabled={isAiProcessing || !locationQuery}
              className="absolute right-3 top-3 bottom-3 px-8 bg-cyan-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-cyan-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-cyan-200 dark:shadow-none"
            >
              {isAiProcessing ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Zap size={16} />
              )}
              Scan Location
            </button>
          </div>
        </form>

        {hospitalResults ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in zoom-in-95">
            {hospitalResults.map((hospital, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-2xl transition-all group flex flex-col relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <MapPin size={100} />
                </div>

                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 rounded-3xl group-hover:scale-110 transition-transform">
                    <Stethoscope size={24} />
                  </div>
                  {hospital.emergencyRoom && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-rose-200 dark:border-rose-900/50">
                      <span className="w-1.5 h-1.5 bg-rose-600 rounded-full animate-pulse" />
                      Critical Care
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 leading-tight pr-6">
                  {hospital.name}
                </h3>

                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < Math.floor(hospital.rating || 0)
                          ? "text-amber-400 fill-current"
                          : "text-slate-200 dark:text-slate-700"
                      }
                    />
                  ))}
                  <span className="text-xs font-black text-slate-400 ml-2 tracking-tighter uppercase">
                    {hospital.rating} Rating
                  </span>
                </div>

                <div className="space-y-4 mb-10 flex-1">
                  <div className="flex gap-4">
                    <Activity
                      size={18}
                      className="text-cyan-500 flex-shrink-0"
                    />
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                        Primary Focus
                      </p>
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        {hospital.specialty}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <MapPin
                      size={18}
                      className="text-slate-400 flex-shrink-0"
                    />
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                        Address
                      </p>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                        {hospital.address}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                        hospital.name + " " + hospital.address
                      )}`,
                      "_blank"
                    )
                  }
                  className="w-full py-4 bg-slate-900 dark:bg-cyan-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-cyan-700 transition-all flex items-center justify-center gap-3 shadow-xl group/btn"
                >
                  <Navigation
                    size={18}
                    className="group-hover/btn:translate-x-1 transition-transform"
                  />
                  Get Directions
                  <ExternalLink size={14} className="opacity-50" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-96 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[4rem] flex flex-col items-center justify-center text-center p-12 relative overflow-hidden">
            {isAiProcessing ? (
              <div className="space-y-6">
                <div className="w-24 h-24 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <div>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white">
                    Mapping Local Clinical Hubs...
                  </h3>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">
                    Connecting to regional health database
                  </p>
                </div>
              </div>
            ) : (
              <div className="opacity-30">
                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <MapPin size={48} className="text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-400">
                  Regional Diagnostic View
                </h3>
                <p className="text-slate-300 font-medium max-w-xs mt-2 mx-auto">
                  Search for a location above to immediately generate hospital
                  cards with routing links.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderDoctorBooking = () => {
    const doctors = [
      {
        name: "Dr. Elena Vance",
        specialty: "Cardiology",
        rating: 4.9,
        exp: "15 yrs",
        img: "EV",
      },
      {
        name: "Dr. Marcus Thorne",
        specialty: "Endocrinology",
        rating: 4.8,
        exp: "12 yrs",
        img: "MT",
      },
      {
        name: "Dr. Sarah Chen",
        specialty: "Pulmonology",
        rating: 5.0,
        exp: "10 yrs",
        img: "SC",
      },
      {
        name: "Dr. Julian Ross",
        specialty: "Oncology",
        rating: 4.7,
        exp: "18 yrs",
        img: "JR",
      },
    ];

    return (
      <div className="animate-in fade-in slide-in-from-right-12 duration-700 space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Book a Specialist
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium italic">
              Consult with our network of top-rated clinical experts.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border dark:border-slate-800 flex items-center gap-3">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
              <Calendar size={18} />
            </div>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
              My Appointments (2)
            </p>
          </div>
        </div>

        {bookingSuccess ? (
          <div className="bg-emerald-500 text-white p-10 rounded-[3rem] text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-3xl font-black mb-2">Booking Confirmed!</h3>
            <p className="font-bold opacity-90">
              Appointment set with {selectedDoctor?.name}. A confirmation email
              has been sent.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((doc, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group flex flex-col"
              >
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6 flex items-center justify-center text-xl font-black text-slate-400 group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white transition-all">
                  {doc.img}
                </div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white mb-1">
                  {doc.name}
                </h3>
                <p className="text-xs font-bold text-violet-600 uppercase tracking-widest mb-4">
                  {doc.specialty}
                </p>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-amber-400 fill-current" />
                    <span className="text-xs font-black">{doc.rating}</span>
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {doc.exp}
                  </div>
                </div>
                <button
                  onClick={() => handleBooking(doc)}
                  disabled={isAiProcessing}
                  className="mt-auto py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-violet-600 transition-all flex items-center justify-center gap-2"
                >
                  {isAiProcessing && selectedDoctor?.name === doc.name ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <Calendar size={14} />
                  )}
                  Book Session
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="bg-slate-900 text-white p-10 rounded-[3rem] overflow-hidden relative shadow-2xl">
          <Zap className="absolute -top-10 -right-10 opacity-10" size={200} />
          <div className="relative z-10 max-w-lg">
            <h3 className="text-2xl font-black mb-4 tracking-tight">
              Need an Immediate Consultation?
            </h3>
            <p className="text-slate-400 font-medium mb-6 leading-relaxed text-sm">
              Our AI Triage system can connect you to an on-duty emergency
              specialist in under 5 minutes via secure video link.
            </p>
            <button className="px-8 py-3 bg-white text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">
              Start Urgent Call
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderPharmacy = () => (
    <div className="animate-in fade-in slide-in-from-right-12 duration-700 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Pharmacy Hub
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium italic">
            Advanced medication insights & cost-optimizer.
          </p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
          <button
            onClick={() => setPharmacyMode("recommend")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              pharmacyMode === "recommend"
                ? "bg-white dark:bg-slate-900 text-violet-600 shadow-sm"
                : "text-slate-400"
            }`}
          >
            RECOMMEND
          </button>
          <button
            onClick={() => setPharmacyMode("alternative")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              pharmacyMode === "alternative"
                ? "bg-white dark:bg-slate-900 text-violet-600 shadow-sm"
                : "text-slate-400"
            }`}
          >
            ALT-SEARCH
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="p-8 md:p-12">
          <form onSubmit={handlePharmacySearch} className="relative group">
            <input
              type="text"
              placeholder={
                pharmacyMode === "recommend"
                  ? "Enter a disease or condition (e.g. Hypertension)..."
                  : "Enter a brand name medicine (e.g. Advil)..."
              }
              className="w-full bg-slate-50 dark:bg-slate-800 p-6 pr-32 rounded-3xl border-none focus:ring-4 ring-violet-100 dark:ring-violet-900/20 outline-none dark:text-white text-lg font-medium transition-all"
              value={pharmacyQuery}
              onChange={(e) => setPharmacyQuery(e.target.value)}
            />
            <button
              type="submit"
              disabled={isAiProcessing || !pharmacyQuery}
              className="absolute right-3 top-3 bottom-3 px-6 bg-violet-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-violet-700 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isAiProcessing ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Search size={16} />
              )}
              Search
            </button>
          </form>

          {pharmacyResults && (
            <div className="mt-12 p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-violet-100 dark:bg-violet-900/50 text-violet-600 rounded-xl">
                    {pharmacyMode === "recommend" ? (
                      <Pill size={20} />
                    ) : (
                      <DollarSign size={20} />
                    )}
                  </div>
                  <h3 className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest text-xs">
                    AI Pharmacist Report
                  </h3>
                </div>
                <button
                  onClick={() => playGeminiTTS(pharmacyResults)}
                  className="p-2 text-slate-400 hover:text-violet-600"
                >
                  <Volume2 size={20} />
                </button>
              </div>
              <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {pharmacyResults}
              </div>
            </div>
          )}

          {!pharmacyResults && !isAiProcessing && (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-40 grayscale">
              {[
                { label: "Dosage Accuracy", icon: Clock },
                { label: "Cost Analysis", icon: DollarSign },
                { label: "Side Effects", icon: Info },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl flex flex-col items-center gap-3"
                >
                  <item.icon size={24} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSymptomChecker = () => (
    <div className="animate-in fade-in slide-in-from-right-12 duration-700 space-y-8">
      <div>
        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Symptom Detector
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium italic">
          Describe your discomfort for AI-powered disease mapping.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">
              Symptom Input Field
            </label>
            <textarea
              value={symptomInput}
              onChange={(e) => setSymptomInput(e.target.value)}
              placeholder="Example: I have been feeling sharp chest pain combined with shortness of breath for the last 2 hours..."
              className="w-full h-48 bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border-none outline-none dark:text-white resize-none font-medium text-sm leading-relaxed"
            />
            <button
              onClick={handleSymptomAnalysis}
              disabled={isAiProcessing || !symptomInput}
              className="w-full mt-6 py-4 bg-slate-900 dark:bg-violet-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-xl"
            >
              {isAiProcessing ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Zap size={20} />
              )}
              Analyze Symptoms
            </button>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/30">
            <div className="flex gap-4 items-center">
              <div className="p-3 bg-emerald-500 text-white rounded-2xl">
                <ShieldCheck size={20} />
              </div>
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
                Your data is anonymized and processed using HIPAA-standard
                protocols.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {symptomAnalysis ? (
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl animate-in slide-in-from-bottom-8">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 rounded-2xl flex items-center justify-center">
                    <Stethoscope size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-xl">
                      Diagnostic Outlook
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Confidence Analysis complete
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => playGeminiTTS(symptomAnalysis)}
                  className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-indigo-600"
                >
                  <Volume2 size={24} />
                </button>
              </div>
              <div className="prose prose-indigo dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-loose text-lg whitespace-pre-line">
                {symptomAnalysis}
              </div>
              <div className="mt-10 pt-10 border-t dark:border-slate-800 flex gap-4">
                <button className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-all">
                  Export Findings
                </button>
                <button className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all">
                  Book Specialist
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[4rem] flex flex-col items-center justify-center text-center p-12 opacity-30">
              <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <ScanSearch size={48} className="text-slate-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-400">
                Waiting for Input
              </h3>
              <p className="text-slate-300 font-medium max-w-xs mt-2">
                Enter your symptoms on the left to start the AI diagnostic
                mapping engine.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        isDarkMode ? "dark" : ""
      }`}
    >
      <div className="bg-[#F8FAFC] dark:bg-slate-950 flex flex-col md:flex-row font-sans text-slate-900 dark:text-slate-100 selection:bg-violet-100 selection:text-violet-900 min-h-screen">
        {/* Sidebar */}
        <aside className="w-full md:w-80 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 p-8 flex flex-col gap-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-violet-600 to-indigo-600 p-2.5 rounded-2xl shadow-lg">
                <Zap className="text-white fill-current" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-800 dark:text-white uppercase">
                  VitaCore AI
                </h1>
                <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">
                  Med Suite Pro
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            <SidebarButton
              icon={ScanSearch}
              label="Clinical Suite"
              id="diagnostic"
              currentView={view}
              onClick={setView}
            />
            <SidebarButton
              icon={Pill}
              label="Pharmacy Hub"
              id="pharmacy"
              currentView={view}
              onClick={setView}
              colorClass="text-emerald-600"
            />
            <SidebarButton
              icon={Stethoscope}
              label="Symptom Checker"
              id="symptoms"
              currentView={view}
              onClick={setView}
              colorClass="text-indigo-600"
            />
            <SidebarButton
              icon={MapPin}
              label="Nearby Hospitals"
              id="hospitals"
              currentView={view}
              onClick={setView}
              colorClass="text-cyan-600"
            />
            <SidebarButton
              icon={Calendar}
              label="Doctor Booking"
              id="booking"
              currentView={view}
              onClick={setView}
              colorClass="text-rose-600"
            />
            <SidebarButton
              icon={Bot}
              label="AI Health Agent"
              id="agent"
              currentView={view}
              onClick={setView}
              colorClass="text-violet-600"
            />

            <div className="h-px bg-slate-100 dark:bg-slate-800 mx-4 my-2" />

            <button
              onClick={() => setView("dashboard")}
              className={`mt-4 flex items-center gap-4 p-5 rounded-[2rem] transition-all font-black text-sm uppercase tracking-widest ${
                view === "dashboard"
                  ? "bg-violet-600 text-white shadow-xl shadow-violet-200"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              <LayoutDashboard size={20} /> Analytics Hub
            </button>
          </nav>

          <div className="mt-auto p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] text-white relative overflow-hidden">
            <BrainCircuit
              className="absolute -bottom-4 -right-4 opacity-10"
              size={100}
            />
            <p className="text-xs font-bold text-violet-400 mb-1 flex items-center gap-1">
              <ShieldCheck size={12} /> ENCRYPTED
            </p>
            <p className="text-[10px] text-slate-400 leading-relaxed relative z-10 font-medium italic">
              Diagnostic data handled with E2E security protocols.
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-14 overflow-y-auto bg-[radial-gradient(circle_at_top_right,_#f1f5f9_0%,_transparent_50%)] dark:bg-none">
          <div className="max-w-5xl mx-auto">
            {view === "pharmacy" ? (
              renderPharmacy()
            ) : view === "symptoms" ? (
              renderSymptomChecker()
            ) : view === "hospitals" ? (
              renderNearbyHospitals()
            ) : view === "booking" ? (
              renderDoctorBooking()
            ) : view === "dashboard" ? (
              <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-10">
                <h2 className="text-4xl font-black text-slate-900 dark:text-white">
                  Hospital Intelligence
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    {
                      label: "Analyses",
                      val: "2,541",
                      c: "text-violet-600",
                      bg: "bg-violet-50",
                    },
                    {
                      label: "High Risk",
                      val: "18",
                      c: "text-rose-600",
                      bg: "bg-rose-50",
                    },
                    {
                      label: "AI Accuracy",
                      val: "96.4%",
                      c: "text-indigo-600",
                      bg: "bg-indigo-50",
                    },
                    {
                      label: "Emergency Ops",
                      val: "Active",
                      c: "text-emerald-600",
                      bg: "bg-emerald-50",
                    },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border dark:border-slate-700"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center ${s.c} mb-4`}
                      >
                        <Activity size={18} />
                      </div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase mb-1">
                        {s.label}
                      </h4>
                      <p className="text-2xl font-black dark:text-white">
                        {s.val}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : view === "agent" ? (
              renderAgentView()
            ) : (
              <div className="space-y-10">
                <div className="flex justify-between items-center">
                  <h2 className="text-5xl font-black tracking-tight">
                    {tabs.find((t) => t.id === activeTab).label}
                  </h2>
                  <div className="flex gap-2">
                    {tabs.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setActiveTab(t.id);
                          setPrediction(null);
                        }}
                        className={`p-4 rounded-2xl transition-all ${
                          activeTab === t.id
                            ? "bg-violet-600 text-white shadow-lg"
                            : "bg-white dark:bg-slate-800 text-slate-400"
                        }`}
                      >
                        <t.icon size={20} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 md:p-14 shadow-2xl border dark:border-slate-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {Object.keys(formData[activeTab]).map((field) => (
                      <div key={field} className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {field.replace(/([A-Z])/g, " $1").toUpperCase()}
                        </label>
                        <input
                          type="number"
                          className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none dark:text-white font-bold"
                          placeholder="0"
                          value={formData[activeTab][field]}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              [activeTab]: {
                                ...p[activeTab],
                                [field]: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setIsPredicting(true);
                      setTimeout(() => {
                        setIsPredicting(false);
                        setPrediction({
                          status: Math.random() > 0.5 ? "high" : "low",
                          message:
                            "Patient indicators suggest moderate physiological variance. Monitoring recommended.",
                        });
                      }, 1500);
                    }}
                    className="w-full mt-12 py-6 bg-slate-900 dark:bg-violet-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95"
                  >
                    {isPredicting ? (
                      <Loader2 className="animate-spin inline mr-2" />
                    ) : (
                      "Run Deep-Scan Diagnosis"
                    )}
                  </button>

                  {prediction && (
                    <div
                      className={`mt-10 p-8 rounded-[2.5rem] animate-in zoom-in-95 ${
                        prediction.status === "high"
                          ? "bg-rose-50 dark:bg-rose-950/20 text-rose-900"
                          : "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-900"
                      }`}
                    >
                      <h3 className="font-black text-xl mb-2 flex items-center gap-2">
                        {prediction.status === "high" ? (
                          <AlertCircle />
                        ) : (
                          <CheckCircle2 />
                        )}
                        Assessment Result
                      </h3>
                      <p className="font-medium opacity-80">
                        {prediction.message}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

const tabs = [
  { id: "heart", label: "Cardiology", icon: Heart },
  { id: "diabetes", label: "Endocrinology", icon: Activity },
  { id: "lung", label: "Pulmonology", icon: Wind },
  { id: "oncology", label: "Oncology", icon: ImageIcon },
];

export default App;
