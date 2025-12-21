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
} from "lucide-react";

const App = () => {
  const [activeTab, setActiveTab] = useState("heart");
  const [view, setView] = useState("diagnostic"); // 'diagnostic' or 'dashboard'
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState(null);

  // Gemini Integration States
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Imaging State
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const apiKey = ""; // Provided at runtime

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

  // --- Gemini API Helpers ---

  const callGemini = async (
    prompt,
    systemInstruction = "You are a senior medical consultant. Provide high-level clinical insights."
  ) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
    };
    return await executeGeminiRequest(url, payload);
  };

  const callGeminiVision = async (prompt, base64Image) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/png", data: base64Image } },
          ],
        },
      ],
      systemInstruction: {
        parts: [
          {
            text: "You are an expert radiologist. Analyze the provided medical image for abnormalities related to oncology. Be precise and professional.",
          },
        ],
      },
    };
    return await executeGeminiRequest(url, payload);
  };

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
        return data.candidates?.[0]?.content?.parts?.[0]?.text;
      } catch (err) {
        if (i === 4) throw err;
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  };

  const playGeminiTTS = async (text) => {
    setIsSpeaking(true);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
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
      const audioBlob = pcmToWav(base64Audio, 24000);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsSpeaking(false);
      audio.play();
    } catch (err) {
      console.error(err);
      setIsSpeaking(false);
    }
  };

  const pcmToWav = (base64, sampleRate) => {
    const buffer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)).buffer;
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
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    view.setUint32(36, 0x64617461, false);
    view.setUint32(40, length, true);
    return new Blob([wavHeader, buffer], { type: "audio/wav" });
  };

  // --- Handlers ---

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAiAnalysis = async () => {
    setIsAiProcessing(true);
    setErrorMessage(null);
    const currentData = formData[activeTab];
    const prompt = `Analyze these clinical parameters for a ${activeTab} model: ${JSON.stringify(
      currentData
    )}. Limit to 120 words.`;
    try {
      const result = await callGemini(prompt);
      setAiAnalysis(result);
    } catch (err) {
      setErrorMessage("AI Assistant is offline.");
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleAiRecommendations = async () => {
    if (!prediction) return;
    setIsAiProcessing(true);
    const prompt = `Provide 3 medical lifestyle tips for a ${prediction.status} risk level for ${activeTab}. Use bullets.`;
    try {
      const result = await callGemini(prompt, "You are a wellness coach.");
      setAiAnalysis(result);
    } catch (err) {
      setErrorMessage("Expert module error.");
    } finally {
      setIsAiProcessing(false);
    }
  };

  const simulatePrediction = async (e) => {
    e.preventDefault();
    setIsPredicting(true);
    setPrediction(null);
    setAiAnalysis(null);

    if (activeTab === "oncology" && imagePreview) {
      const base64Data = imagePreview.split(",")[1];
      try {
        const visionResult = await callGeminiVision(
          "Analyze this medical scan for abnormalities.",
          base64Data
        );
        setPrediction({
          status:
            visionResult.toLowerCase().includes("abnormality") ||
            visionResult.toLowerCase().includes("suspicious")
              ? "high"
              : "low",
          message: visionResult,
        });
      } catch (err) {
        setErrorMessage("Vision AI error.");
      } finally {
        setIsPredicting(false);
      }
    } else {
      setTimeout(() => {
        setIsPredicting(false);
        const result = Math.random() > 0.5;
        setPrediction({
          status: result ? "high" : "low",
          message: result
            ? `Indicators detected for ${activeTab}. Follow-up recommended.`
            : `Parameters are stable for ${activeTab}.`,
        });
      }, 1500);
    }
  };

  const tabs = [
    {
      id: "heart",
      label: "Cardiology",
      icon: Heart,
      color: "text-rose-500",
      bg: "bg-rose-50",
      darkBg: "dark:bg-rose-950/20",
    },
    {
      id: "diabetes",
      label: "Endocrinology",
      icon: Activity,
      color: "text-indigo-500",
      bg: "bg-indigo-50",
      darkBg: "dark:bg-indigo-950/20",
    },
    {
      id: "lung",
      label: "Pulmonology",
      icon: Wind,
      color: "text-cyan-500",
      bg: "bg-cyan-50",
      darkBg: "dark:bg-cyan-950/20",
    },
    {
      id: "oncology",
      label: "Oncology (AI Imaging)",
      icon: ScanSearch,
      color: "text-violet-500",
      bg: "bg-violet-50",
      darkBg: "dark:bg-violet-950/20",
    },
  ];

  // --- Sub-render Components ---

  const renderForm = () => {
    const currentTab = activeTab;
    const accentColor = tabs
      .find((t) => t.id === currentTab)
      .color.replace("text-", "");
    const ringColor = `focus:ring-${accentColor}`;

    if (activeTab === "oncology") {
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Scan Type / Target
            </label>
            <select
              className="w-full p-4 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none bg-slate-50/50 dark:bg-slate-900/50 dark:text-white"
              value={formData.oncology.scanType}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  oncology: { ...p.oncology, scanType: e.target.value },
                }))
              }
            >
              <option>Lung Cancer X-Ray</option>
              <option>Mammography (Breast Cancer)</option>
              <option>Dermoscopy (Skin Cancer)</option>
              <option>Brain MRI Analysis</option>
            </select>
          </div>
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`relative group cursor-pointer border-2 border-dashed rounded-[2.5rem] p-10 transition-all flex flex-col items-center justify-center gap-4 ${
              imagePreview
                ? "border-violet-400 bg-violet-50/20"
                : "border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 hover:bg-slate-50 dark:hover:bg-slate-900"
            }`}
          >
            <input
              type="file"
              hidden
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
            />
            {imagePreview ? (
              <div className="relative w-full max-w-sm">
                <img
                  src={imagePreview}
                  className="rounded-2xl shadow-2xl ring-4 ring-white dark:ring-slate-800"
                  alt="Scan Preview"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setImagePreview(null);
                    setSelectedImage(null);
                  }}
                  className="absolute -top-3 -right-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-white p-2 rounded-full shadow-lg hover:bg-red-50"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <div className="p-4 bg-violet-100 dark:bg-violet-900/50 text-violet-600 rounded-full group-hover:scale-110 transition-transform">
                  <Upload size={32} />
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    Upload Clinical Scan
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    Drag and drop files here
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.keys(formData[activeTab]).map((field) => (
          <div key={field} className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
              {field
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())}
            </label>
            {field === "sex" ||
            field.includes("smoking") ||
            field === "fatigue" ||
            field === "wheezing" ? (
              <select
                className={`w-full p-4 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none transition-all bg-slate-50/50 dark:bg-slate-900/50 dark:text-white ${ringColor} focus:ring-2`}
                value={formData[activeTab][field]}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    [activeTab]: { ...p[activeTab], [field]: e.target.value },
                  }))
                }
              >
                <option value="1">Positive / Male / Yes</option>
                <option value="0">Negative / Female / No</option>
              </select>
            ) : (
              <input
                type="number"
                placeholder="0"
                className={`w-full p-4 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none transition-all bg-slate-50/50 dark:bg-slate-900/50 dark:text-white ${ringColor} focus:ring-2`}
                value={formData[activeTab][field]}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    [activeTab]: { ...p[activeTab], [field]: e.target.value },
                  }))
                }
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderDashboard = () => {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Welcome, Dr. Sarah
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">
              "The art of medicine consists of amusing the patient while nature
              cures the disease."
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                System Health
              </p>
              <p className="text-sm font-black text-slate-800 dark:text-slate-100">
                Optimal Performance
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              label: "Total Analyses",
              value: "1,284",
              icon: Activity,
              trend: "+12%",
              color: "text-violet-600",
              bg: "bg-violet-50",
            },
            {
              label: "High Risk Alerts",
              value: "42",
              icon: AlertCircle,
              trend: "-2%",
              color: "text-rose-600",
              bg: "bg-rose-50",
            },
            {
              label: "AI Accuracy",
              value: "94.8%",
              icon: BrainCircuit,
              trend: "+0.4%",
              color: "text-indigo-600",
              bg: "bg-indigo-50",
            },
            {
              label: "Active Sessions",
              value: "8",
              icon: Users,
              trend: "Stable",
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 group hover:shadow-xl transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`p-3 rounded-2xl ${stat.bg} dark:bg-slate-900 ${stat.color}`}
                >
                  <stat.icon size={20} />
                </div>
                <span
                  className={`text-[10px] font-black px-2 py-1 rounded-full ${
                    stat.trend.includes("+")
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-rose-50 text-rose-600"
                  }`}
                >
                  {stat.trend}
                </span>
              </div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                {stat.label}
              </h4>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-slate-800 dark:text-white">
                Analysis Distribution
              </h3>
              <select className="bg-slate-50 dark:bg-slate-900 text-xs font-bold p-2 rounded-xl outline-none dark:text-slate-300">
                <option>Last 30 Days</option>
                <option>Last Quarter</option>
              </select>
            </div>
            <div className="h-64 flex items-end justify-between gap-4">
              {[60, 45, 90, 65, 80, 55, 100].map((h, i) => (
                <div key={i} className="flex-1 group relative">
                  <div
                    className="w-full bg-slate-100 dark:bg-slate-900 rounded-t-xl transition-all duration-500 group-hover:bg-violet-200 dark:group-hover:bg-violet-900/50"
                    style={{ height: `${h}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {h}%
                    </div>
                  </div>
                  <div className="mt-4 text-[10px] font-bold text-slate-400 text-center uppercase">
                    Mon
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-8">
              Diagnostic Mix
            </h3>
            <div className="flex-1 flex flex-col justify-center items-center relative">
              {/* Fake SVG Pie Chart */}
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth="20"
                  className="dark:stroke-slate-900"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="transparent"
                  stroke="#8b5cf6"
                  strokeWidth="20"
                  strokeDasharray="376"
                  strokeDashoffset="120"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="transparent"
                  stroke="#f43f5e"
                  strokeWidth="20"
                  strokeDasharray="376"
                  strokeDashoffset="300"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter">
                  Vita
                </p>
              </div>
            </div>
            <div className="space-y-3 mt-6">
              {[
                { name: "Cardiology", color: "bg-rose-500", pct: "40%" },
                { name: "Oncology", color: "bg-violet-500", pct: "35%" },
                { name: "Other", color: "bg-slate-200", pct: "25%" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="text-xs font-bold text-slate-500">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-300">
                    {item.pct}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

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
              <div className="bg-gradient-to-tr from-violet-600 to-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-violet-200 dark:shadow-none">
                <Zap className="text-white fill-current" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-800 dark:text-white uppercase">
                  VitaCore AI
                </h1>
                <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">
                  Med Suite v2.0
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          <nav className="flex flex-col gap-3">
            <button
              onClick={() => setView("diagnostic")}
              className={`flex items-center gap-4 p-4 rounded-[1.25rem] transition-all font-bold text-sm ${
                view === "diagnostic"
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                  : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <div className="p-2 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
                <ScanSearch size={18} />
              </div>
              Clinical Suite
            </button>

            <div className="h-px bg-slate-100 dark:bg-slate-800 mx-4 my-2" />

            {view === "diagnostic" &&
              tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setPrediction(null);
                      setAiAnalysis(null);
                    }}
                    className={`flex items-center justify-between p-4 rounded-[1.25rem] transition-all duration-300 group ${
                      isActive
                        ? `${tab.bg} ${tab.darkBg} ${tab.color} shadow-sm border border-slate-100 dark:border-transparent`
                        : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2.5 rounded-xl transition-all ${
                          isActive
                            ? "bg-white dark:bg-slate-900 shadow-md scale-110"
                            : "bg-slate-50 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-900"
                        }`}
                      >
                        <Icon size={20} />
                      </div>
                      <span className="font-bold text-sm">{tab.label}</span>
                    </div>
                    <ChevronRight
                      size={14}
                      className={`transition-all duration-300 ${
                        isActive ? "translate-x-1 opacity-100" : "opacity-0"
                      }`}
                    />
                  </button>
                );
              })}

            <button
              onClick={() => setView("dashboard")}
              className={`mt-6 flex items-center gap-4 p-5 rounded-[2rem] transition-all font-black text-sm uppercase tracking-widest ${
                view === "dashboard"
                  ? "bg-violet-600 text-white shadow-xl shadow-violet-200 dark:shadow-none"
                  : "bg-slate-900 text-white hover:bg-slate-800 shadow-lg"
              }`}
            >
              <LayoutDashboard size={20} />
              Analytics Hub
            </button>
          </nav>

          <div className="mt-auto p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] text-white overflow-hidden relative shadow-2xl">
            <BrainCircuit
              className="absolute -bottom-4 -right-4 opacity-10"
              size={100}
            />
            <p className="text-xs font-bold text-violet-400 mb-2 flex items-center gap-1">
              <ShieldCheck size={12} /> HIPAA COMPLIANT
            </p>
            <p className="text-[11px] text-slate-300 leading-relaxed font-medium relative z-10">
              Diagnostic data is handled with end-to-end encryption.
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-14 overflow-y-auto bg-[radial-gradient(circle_at_top_right,_#f1f5f9_0%,_transparent_50%)] dark:bg-none">
          <div className="max-w-4xl mx-auto">
            {view === "dashboard" ? (
              renderDashboard()
            ) : (
              <div className="animate-in fade-in duration-500">
                <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-1 w-12 bg-violet-500 rounded-full" />
                      <span className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                        VitaCore Diagnostics
                      </span>
                    </div>
                    <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                      {tabs.find((t) => t.id === activeTab).label}
                    </h2>
                  </div>

                  <button
                    onClick={handleAiAnalysis}
                    disabled={isAiProcessing}
                    className="group flex items-center gap-3 px-8 py-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-full font-black shadow-xl hover:shadow-2xl transition-all active:scale-95 disabled:opacity-50 border border-slate-100 dark:border-slate-700"
                  >
                    <div className="bg-violet-600 text-white p-1.5 rounded-full group-hover:rotate-12 transition-transform">
                      {isAiProcessing ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Sparkles size={16} />
                      )}
                    </div>
                    <span className="text-sm">✨ Smart Insights</span>
                  </button>
                </div>

                {/* AI Analysis Modal */}
                {aiAnalysis && (
                  <div className="mb-10 p-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white dark:border-slate-800 shadow-2xl rounded-[3rem] animate-in zoom-in-95 duration-500">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-violet-600 text-white rounded-2xl shadow-lg shadow-violet-100 dark:shadow-none">
                          <BrainCircuit size={24} />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-slate-800 dark:text-slate-200">
                            Intelligence Feed
                          </h3>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                            AI Medical Context
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => playGeminiTTS(aiAnalysis)}
                          disabled={isSpeaking}
                          className="p-3 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 hover:text-violet-600 transition-colors disabled:opacity-50"
                        >
                          <Volume2 size={20} />
                        </button>
                        <button
                          onClick={() => setAiAnalysis(null)}
                          className="p-3 text-slate-300 hover:text-slate-600"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium text-lg">
                      {aiAnalysis}
                    </div>
                  </div>
                )}

                {/* Diagnostic Form Card */}
                <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] border border-slate-100 dark:border-slate-800 overflow-hidden">
                  <form onSubmit={simulatePrediction} className="p-10 md:p-14">
                    {renderForm()}
                    <div className="mt-14 flex flex-col md:flex-row items-center gap-8 border-t border-slate-50 dark:border-slate-800 pt-12">
                      <button
                        type="submit"
                        disabled={
                          isPredicting ||
                          (activeTab === "oncology" && !imagePreview)
                        }
                        className={`w-full md:w-auto px-12 py-5 rounded-[2rem] font-black text-white tracking-wide transition-all transform active:scale-95 disabled:opacity-30 flex items-center justify-center gap-4 ${
                          activeTab === "heart"
                            ? "bg-rose-500 hover:bg-rose-600 shadow-rose-200"
                            : activeTab === "diabetes"
                            ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
                            : activeTab === "lung"
                            ? "bg-cyan-500 hover:bg-cyan-600 shadow-cyan-200"
                            : "bg-violet-600 hover:bg-violet-700 shadow-violet-200"
                        } shadow-2xl dark:shadow-none`}
                      >
                        {isPredicting ? (
                          <>
                            <Loader2 className="animate-spin" size={24} />{" "}
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Zap size={20} /> Process Diagnostic
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((p) => ({
                            ...p,
                            [activeTab]: Object.keys(p[activeTab]).reduce(
                              (acc, k) => ({ ...acc, [k]: "" }),
                              {}
                            ),
                          }));
                          setPrediction(null);
                          setAiAnalysis(null);
                          setImagePreview(null);
                        }}
                        className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-bold text-sm tracking-tight transition-all"
                      >
                        Clear Session
                      </button>
                    </div>
                  </form>

                  {prediction && (
                    <div
                      className={`p-10 md:p-14 animate-in slide-in-from-bottom-8 duration-700 border-t dark:border-slate-800 ${
                        prediction.status === "high"
                          ? "bg-rose-50/30 dark:bg-rose-950/10"
                          : "bg-emerald-50/30 dark:bg-emerald-950/10"
                      }`}
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start gap-10">
                        <div className="flex items-start gap-6 flex-1">
                          <div
                            className={`p-5 rounded-[2rem] flex-shrink-0 shadow-lg ${
                              prediction.status === "high"
                                ? "bg-rose-500 text-white shadow-rose-100 dark:shadow-none"
                                : "bg-emerald-500 text-white shadow-emerald-100 dark:shadow-none"
                            }`}
                          >
                            {prediction.status === "high" ? (
                              <AlertCircle size={32} />
                            ) : (
                              <CheckCircle2 size={32} />
                            )}
                          </div>
                          <div>
                            <h3
                              className={`text-2xl font-black mb-4 ${
                                prediction.status === "high"
                                  ? "text-rose-900 dark:text-rose-200"
                                  : "text-emerald-900 dark:text-emerald-200"
                              }`}
                            >
                              {prediction.status === "high"
                                ? "High Risk Assessment"
                                : "Normal Baseline"}
                            </h3>
                            <p
                              className={`text-lg font-medium leading-relaxed ${
                                prediction.status === "high"
                                  ? "text-rose-700/80 dark:text-rose-400"
                                  : "text-emerald-700/80 dark:text-emerald-400"
                              }`}
                            >
                              {prediction.message}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-4 w-full md:w-auto">
                          <button
                            onClick={handleAiRecommendations}
                            className="flex items-center justify-center gap-3 px-8 py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl font-black text-slate-800 dark:text-white hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                          >
                            <MessageSquarePlus
                              size={20}
                              className="text-violet-600"
                            />{" "}
                            Advice
                          </button>
                          <button
                            onClick={() => playGeminiTTS(prediction.message)}
                            disabled={isSpeaking}
                            className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 dark:bg-slate-700 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                          >
                            <Volume2 size={20} /> Audio
                          </button>
                        </div>
                      </div>
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

export default App;
