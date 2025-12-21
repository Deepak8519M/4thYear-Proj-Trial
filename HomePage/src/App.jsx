import React, { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithCustomToken,
  signInAnonymously,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
} from "firebase/firestore";
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
  LogIn,
  UserPlus,
  LogOut,
  ArrowRight,
} from "lucide-react";

// --- Firebase Initialization (Using Rule 1 & 2 logic) ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== "undefined" ? __app_id : "vitacore-pro-suite";

const MODEL_TEXT = "gemini-2.5-flash-preview-09-2025";
const MODEL_TTS = "gemini-2.5-flash-preview-tts";
const API_KEY = "";

const App = () => {
  // Navigation and Theme
  const [user, setUser] = useState(null);
  const [view, setView] = useState("landing"); // landing, auth, dashboard, symptoms, pharmacy, diagnostic, hospitals, booking, agent
  const [authMode, setAuthMode] = useState("login"); // login, signup
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Feature States
  const [activeTab, setActiveTab] = useState("heart");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [symptomInput, setSymptomInput] = useState("");
  const [symptomAnalysis, setSymptomAnalysis] = useState(null);
  const [pharmacyQuery, setPharmacyQuery] = useState("");
  const [pharmacyResults, setPharmacyResults] = useState(null);
  const [pharmacyMode, setPharmacyMode] = useState("recommend");
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      content:
        "Welcome to your VitaCore Clinical Session. I am your AI Health Agent. How can I assist you today?",
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const [hospitalResults, setHospitalResults] = useState(null);
  const [locationQuery, setLocationQuery] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [clinicalReport, setClinicalReport] = useState(null);
  const [agentMode, setAgentMode] = useState("chat");

  // Auth Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [authError, setAuthError] = useState("");

  const chatEndRef = useRef(null);

  // --- Rule 3: Auth Before Queries ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (
          typeof __initial_auth_token !== "undefined" &&
          __initial_auth_token
        ) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Initial Auth Error:", err);
      } finally {
        setLoading(false);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Automatically move to dashboard if user is authenticated and on login pages
      if (currentUser && (view === "auth" || view === "landing")) {
        setView("dashboard");
      }
    });
    return () => unsubscribe();
  }, [view]);

  useEffect(() => {
    if (view === "agent")
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, view]);

  // --- Auth Handlers ---
  const handleAuthAction = async (e) => {
    e.preventDefault();
    setIsAiProcessing(true);
    setAuthError("");
    try {
      if (authMode === "signup") {
        const cred = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        await updateProfile(cred.user, { displayName: fullName });
        // Rule 1: Save metadata to user-specific path
        const userDoc = doc(
          db,
          "artifacts",
          appId,
          "users",
          cred.user.uid,
          "profile",
          "info"
        );
        await setDoc(userDoc, { name: fullName, email, createdAt: Date.now() });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setView("landing");
    // Re-sign in anonymously to maintain Rule 3 context
    await signInAnonymously(auth);
  };

  // --- AI API Helpers ---
  const callGemini = async (
    prompt,
    systemInstruction = "Medical AI",
    isJson = false
  ) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_TEXT}:generateContent?key=${API_KEY}`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      ...(isJson && {
        generationConfig: { responseMimeType: "application/json" },
      }),
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text;
  };

  const playGeminiTTS = async (text) => {
    if (isSpeaking || !text) return;
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
      model: MODEL_TTS,
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
      const v = new DataView(wavHeader);
      v.setUint32(0, 0x52494646, false);
      v.setUint32(4, 36 + length, true);
      v.setUint32(8, 0x57415645, false);
      v.setUint32(12, 0x666d7420, false);
      v.setUint32(16, 16, true);
      v.setUint16(20, 1, true);
      v.setUint16(22, 1, true);
      v.setUint32(24, 24000, true);
      v.setUint32(28, 24000 * 2, true);
      v.setUint16(32, 2, true);
      v.setUint16(34, 16, true);
      v.setUint32(36, 0x64617461, false);
      v.setUint32(40, length, true);

      const audioBlob = new Blob([wavHeader, buffer], { type: "audio/wav" });
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.onended = () => setIsSpeaking(false);
      audio.play();
    } catch (err) {
      console.error(err);
      setIsSpeaking(false);
    }
  };

  // --- Feature Logic ---
  const handlePharmacySearch = async (e) => {
    e.preventDefault();
    if (!pharmacyQuery.trim()) return;
    setIsAiProcessing(true);
    setPharmacyResults(null);

    const isAlt = pharmacyMode === "alternative";
    const prompt = isAlt
      ? `Provide generic alternatives for the medicine "${pharmacyQuery}". Format as JSON: { "medicine": "string", "alternatives": [{ "name": "string", "activeIngredient": "string", "costDifference": "string", "safetyRating": "High/Medium/Low" }] }`
      : `Recommend medicines for "${pharmacyQuery}". Format as JSON: { "condition": "string", "medicines": [{ "name": "string", "dosage": "string", "sideEffects": "string" }] }`;

    try {
      const res = await callGemini(
        prompt,
        "You are a senior clinical pharmacologist.",
        true
      );
      setPharmacyResults(JSON.parse(res));
    } catch (err) {
      console.error("AI Parse Error:", err);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleSymptomAnalysis = async (e) => {
    e.preventDefault();
    if (!symptomInput.trim()) return;
    setIsAiProcessing(true);
    setSymptomAnalysis(null);

    const prompt = `Analyze symptoms: "${symptomInput}". Output JSON: { "criticalNote": "string warning", "diagnoses": [{ "condition": "string", "confidence": "string percentage", "specialist": "string", "urgency": "High/Medium/Low", "description": "string" }] }`;
    try {
      const res = await callGemini(
        prompt,
        "Diagnostic physician expert.",
        true
      );
      setSymptomAnalysis(JSON.parse(res));
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleHospitalSearch = async (e) => {
    e.preventDefault();
    if (!locationQuery.trim()) return;
    setIsAiProcessing(true);
    try {
      const res = await callGemini(
        `Hospitals near ${locationQuery}. JSON: { "hospitals": [{ "name": "string", "address": "string", "specialty": "string", "rating": number, "emergencyRoom": boolean }] }`,
        "Mapping expert",
        true
      );
      setHospitalResults(JSON.parse(res).hospitals);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiProcessing(false);
    }
  };

  // --- UI Components ---
  const UrgencyBadge = ({ level }) => {
    const styles = {
      High: "bg-rose-100 text-rose-700 border-rose-200",
      Medium: "bg-amber-100 text-amber-700 border-amber-200",
      Low: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
          styles[level] || styles.Low
        }`}
      >
        {level}
      </span>
    );
  };

  // --- Views ---
  const LandingView = () => (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-hidden font-sans">
      <nav className="p-8 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="bg-violet-600 p-2.5 rounded-2xl shadow-lg">
            <Zap className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
            VitaCore AI
          </h1>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => {
              setAuthMode("login");
              setView("auth");
            }}
            className="px-6 py-2.5 font-bold text-slate-600 dark:text-slate-400 hover:text-violet-600 transition-colors"
          >
            Login
          </button>
          <button
            onClick={() => {
              setAuthMode("signup");
              setView("auth");
            }}
            className="px-6 py-2.5 bg-violet-600 text-white font-bold rounded-xl shadow-xl shadow-violet-200 dark:shadow-none hover:bg-violet-700 transition-all"
          >
            Sign Up
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 pt-20 pb-40 grid lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-50 dark:bg-violet-900/30 text-violet-600 rounded-full text-xs font-black uppercase tracking-widest">
            <Sparkles size={14} /> Clinical Intelligence Suite v2.5
          </div>
          <h2 className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9]">
            The Future of <span className="text-violet-600">Smart</span>{" "}
            Healthcare.
          </h2>
          <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg">
            VitaCore empowers patients and doctors with AI-driven diagnostics,
            pharmacy cost-optimization, and intelligent specialist routing.
          </p>
          <div className="flex gap-4 pt-4">
            <button
              onClick={() => {
                setAuthMode("signup");
                setView("auth");
              }}
              className="px-10 py-5 bg-slate-900 dark:bg-violet-600 text-white font-black rounded-[2rem] shadow-2xl flex items-center gap-3 group transition-all hover:scale-105 active:scale-95"
            >
              Get Started Now{" "}
              <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </button>
            <button className="px-10 py-5 border-2 border-slate-100 dark:border-slate-800 text-slate-800 dark:text-white font-black rounded-[2rem] hover:bg-slate-50 dark:hover:bg-slate-900">
              Technology Roadmap
            </button>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-10 bg-violet-500/10 blur-[100px] rounded-full" />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-10 rounded-[4rem] shadow-2xl">
            <div className="grid grid-cols-2 gap-6">
              <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] space-y-4">
                <Stethoscope className="text-violet-600" size={32} />
                <h4 className="font-black dark:text-white">
                  Differential Diagnosis
                </h4>
                <p className="text-sm text-slate-400">
                  Map symptoms to thousands of documented clinical conditions.
                </p>
              </div>
              <div className="p-8 bg-violet-600 text-white rounded-[2.5rem] space-y-4 shadow-xl">
                <Pill size={32} />
                <h4 className="font-black">Pharmacy Optimizer</h4>
                <p className="text-sm opacity-80">
                  Find generic matches and save up to 80% on medications.
                </p>
              </div>
              <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] space-y-4 col-span-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-black dark:text-white">
                    AI Diagnostic Engine Status
                  </h4>
                  <div className="flex items-center gap-2 text-emerald-500 text-xs font-black">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />{" "}
                    ONLINE
                  </div>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full w-[94%] bg-emerald-500" />
                </div>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                  94.2% Diagnostic Accuracy Score
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );

  const AuthView = () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-12 border dark:border-slate-800">
        <button
          onClick={() => setView("landing")}
          className="mb-8 text-slate-400 hover:text-violet-600 flex items-center gap-2 font-bold text-sm"
        >
          <ChevronRight className="rotate-180" size={16} /> Back
        </button>
        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
          {authMode === "login" ? "Welcome Back" : "Clinical Registration"}
        </h3>
        <p className="text-slate-400 mb-8 font-medium italic">
          {authMode === "login"
            ? "Access your secure health dashboard"
            : "Join the VitaCore medical network"}
        </p>

        {authError && (
          <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold border border-rose-100">
            {authError}
          </div>
        )}

        <form onSubmit={handleAuthAction} className="space-y-6">
          {authMode === "signup" && (
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">
                Full Name
              </label>
              <input
                required
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none dark:text-white border-2 border-transparent focus:border-violet-500/20 transition-all"
                placeholder="Dr. John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">
              Email Address
            </label>
            <input
              required
              type="email"
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none dark:text-white border-2 border-transparent focus:border-violet-500/20 transition-all"
              placeholder="name@healthcare.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">
              Secure Password
            </label>
            <input
              required
              type="password"
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none dark:text-white border-2 border-transparent focus:border-violet-500/20 transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            disabled={isAiProcessing}
            className="w-full py-5 bg-violet-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl hover:bg-violet-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isAiProcessing ? (
              <Loader2 className="animate-spin" />
            ) : authMode === "login" ? (
              <LogIn size={18} />
            ) : (
              <UserPlus size={18} />
            )}
            {authMode === "login" ? "Secure Sign In" : "Register Profile"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-bold text-slate-500">
          {authMode === "login" ? "New to VitaCore?" : "Already registered?"}{" "}
          <button
            onClick={() =>
              setAuthMode(authMode === "login" ? "signup" : "login")
            }
            className="text-violet-600 underline font-black"
          >
            {authMode === "login" ? "Create Account" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );

  const DashboardView = () => (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Intelligence Dashboard
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium italic">
            Clinical Session Active for{" "}
            {user?.displayName || user?.email || "User"}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border dark:border-slate-800 flex gap-4 items-center">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Biometric Sync
            </p>
            <p className="text-xs font-bold text-emerald-500 flex items-center gap-1 justify-end">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />{" "}
              Active
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: "Consults",
            val: "12",
            icon: ClipboardList,
            color: "violet",
          },
          {
            label: "Safety Score",
            val: "98%",
            icon: ShieldCheck,
            color: "emerald",
          },
          { label: "Reports", val: "4", icon: FileText, color: "rose" },
          { label: "Meds Hub", val: "Active", icon: Pill, color: "cyan" },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border dark:border-slate-800"
          >
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-violet-600 bg-violet-50 dark:bg-violet-950/40 mb-6`}
            >
              <s.icon size={24} />
            </div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              {s.label}
            </h4>
            <p className="text-3xl font-black dark:text-white">{s.val}</p>
          </div>
        ))}
      </div>
      <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
        <Sparkles
          className="absolute -right-10 -top-10 opacity-10"
          size={240}
        />
        <div className="max-w-xl relative z-10">
          <h3 className="text-3xl font-black mb-4">
            Start New Clinical Mapping
          </h3>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Enter patient symptoms or describe physiological variance for an
            instant differential diagnosis report.
          </p>
          <button
            onClick={() => setView("symptoms")}
            className="px-10 py-4 bg-violet-600 rounded-2xl font-black uppercase tracking-widest hover:bg-violet-700 transition-all flex items-center gap-2 shadow-lg shadow-violet-500/20"
          >
            Launch Symptom Checker <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderPharmacy = () => (
    <div className="animate-in fade-in slide-in-from-right-12 duration-700 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Pharmacy Hub
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium italic">
            Advanced generic matching & cost analysis.
          </p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
          <button
            onClick={() => {
              setPharmacyMode("recommend");
              setPharmacyResults(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              pharmacyMode === "recommend"
                ? "bg-white dark:bg-slate-900 text-violet-600 shadow-sm"
                : "text-slate-400"
            }`}
          >
            RECOMMEND
          </button>
          <button
            onClick={() => {
              setPharmacyMode("alternative");
              setPharmacyResults(null);
            }}
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
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl p-12">
        <form onSubmit={handlePharmacySearch} className="relative group">
          <input
            type="text"
            placeholder={
              pharmacyMode === "recommend"
                ? "Condition (e.g., GERD, Diabetes)..."
                : "Brand Name (e.g., Tylenol, Lipitor)..."
            }
            className="w-full bg-slate-50 dark:bg-slate-800 p-6 pr-32 rounded-3xl border-none outline-none dark:text-white text-lg font-medium focus:ring-4 ring-violet-500/10 transition-all"
            value={pharmacyQuery}
            onChange={(e) => setPharmacyQuery(e.target.value)}
          />
          <button
            type="submit"
            disabled={isAiProcessing || !pharmacyQuery}
            className="absolute right-3 top-3 bottom-3 px-6 bg-violet-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-violet-700 transition-all flex items-center gap-2"
          >
            {isAiProcessing ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Search size={16} />
            )}{" "}
            Scan
          </button>
        </form>

        {pharmacyResults && (
          <div className="mt-12 animate-in zoom-in-95">
            {pharmacyMode === "alternative" ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                  <ShieldCheck size={20} />
                  <p className="text-sm font-bold uppercase tracking-widest">
                    Generic Matching Results for {pharmacyResults.medicine}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pharmacyResults.alternatives?.map((alt, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border dark:border-slate-700 shadow-sm hover:shadow-xl transition-all"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-xl font-black text-slate-800 dark:text-white">
                          {alt.name}
                        </h4>
                        <div className="px-3 py-1 bg-violet-100 text-violet-600 rounded-full text-[10px] font-black uppercase">
                          {alt.safetyRating} Safety
                        </div>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Active Ingredient
                      </p>
                      <p className="text-sm font-bold dark:text-slate-300 mb-6">
                        {alt.activeIngredient}
                      </p>
                      <div className="flex justify-between items-center pt-6 border-t dark:border-slate-700">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-400 uppercase">
                            Estimated Savings
                          </span>
                          <span className="text-sm font-black text-emerald-600">
                            {alt.costDifference}
                          </span>
                        </div>
                        <button className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-10 rounded-[2.5rem] border dark:border-slate-700">
                <h3 className="font-black text-xl dark:text-white mb-8 flex items-center gap-3">
                  <Info className="text-violet-600" /> Recommendations for{" "}
                  {pharmacyResults.condition}
                </h3>
                <div className="space-y-6">
                  {pharmacyResults.medicines?.map((med, idx) => (
                    <div
                      key={idx}
                      className="flex gap-6 p-6 bg-white dark:bg-slate-900 rounded-2xl border dark:border-slate-800 items-start shadow-sm"
                    >
                      <div className="p-3 bg-violet-100 dark:bg-violet-950/40 text-violet-600 rounded-xl">
                        <Pill size={24} />
                      </div>
                      <div>
                        <h4 className="font-black text-lg dark:text-white">
                          {med.name}
                        </h4>
                        <p className="text-sm text-slate-500 font-medium mb-2">
                          Standard Clinical Dosage: {med.dosage}
                        </p>
                        <p className="text-xs text-rose-500 font-bold uppercase tracking-widest">
                          Critical Side Effects: {med.sideEffects}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const SidebarButton = ({ icon: Icon, label, id, currentView, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-4 p-4 rounded-[1.25rem] transition-all font-bold text-sm w-full text-left ${
        currentView === id
          ? `bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white`
          : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
      }`}
    >
      <div
        className={`p-2 rounded-xl shadow-sm ${
          currentView === id
            ? "bg-white dark:bg-slate-900 text-violet-600"
            : "bg-white dark:bg-slate-900 opacity-60"
        }`}
      >
        <Icon size={18} />
      </div>
      {label}
    </button>
  );

  if (loading)
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
        <p className="font-black uppercase tracking-widest text-[10px] text-slate-400">
          Secure Initialization Protocol...
        </p>
      </div>
    );

  if (view === "landing") return <LandingView />;
  if (view === "auth") return <AuthView />;

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        isDarkMode ? "dark" : ""
      }`}
    >
      <div className="bg-[#F8FAFC] dark:bg-slate-950 flex flex-col md:flex-row font-sans text-slate-900 dark:text-slate-100 min-h-screen">
        <aside className="w-full md:w-80 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 p-8 flex flex-col gap-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-violet-600 to-indigo-600 p-2.5 rounded-2xl shadow-lg">
                <Zap className="text-white fill-current" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
                  VitaCore
                </h1>
                <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">
                  Clinical Suite
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
          <nav className="flex flex-col gap-1">
            <SidebarButton
              icon={LayoutDashboard}
              label="Dashboard"
              id="dashboard"
              currentView={view}
              onClick={setView}
            />
            <SidebarButton
              icon={Stethoscope}
              label="Symptom Checker"
              id="symptoms"
              currentView={view}
              onClick={setView}
            />
            <SidebarButton
              icon={Pill}
              label="Pharmacy Hub"
              id="pharmacy"
              currentView={view}
              onClick={setView}
            />
            <SidebarButton
              icon={ScanSearch}
              label="Clinical Suite"
              id="diagnostic"
              currentView={view}
              onClick={setView}
            />
            <SidebarButton
              icon={MapPin}
              label="Hospital Finder"
              id="hospitals"
              currentView={view}
              onClick={setView}
            />
            <SidebarButton
              icon={Calendar}
              label="Booking"
              id="booking"
              currentView={view}
              onClick={setView}
            />
            <SidebarButton
              icon={Bot}
              label="AI Consultant"
              id="agent"
              currentView={view}
              onClick={setView}
            />

            <div className="h-px bg-slate-100 dark:bg-slate-800 mx-4 my-6" />

            <button
              onClick={handleLogout}
              className="flex items-center gap-4 p-4 rounded-[1.25rem] text-rose-500 font-bold text-sm hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
            >
              <div className="p-2 bg-rose-100 dark:bg-rose-950/40 rounded-xl text-rose-600">
                <LogOut size={18} />
              </div>{" "}
              Sign Out
            </button>
          </nav>
        </aside>

        <main className="flex-1 p-6 md:p-14 overflow-y-auto bg-[radial-gradient(circle_at_top_right,_#f1f5f9_0%,_transparent_50%)] dark:bg-none">
          <div className="max-w-6xl mx-auto">
            {view === "dashboard" && <DashboardView />}
            {view === "symptoms" && (
              <div className="animate-in fade-in slide-in-from-right-12 duration-700 space-y-8 pb-20">
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  Symptom Detector
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl">
                      <textarea
                        value={symptomInput}
                        onChange={(e) => setSymptomInput(e.target.value)}
                        placeholder="Describe symptoms in detail (e.g. Sharp abdominal pain after meals)..."
                        className="w-full h-48 bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border-none outline-none dark:text-white resize-none"
                      />
                      <button
                        onClick={handleSymptomAnalysis}
                        disabled={isAiProcessing || !symptomInput}
                        className="w-full mt-6 py-4 bg-violet-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3"
                      >
                        {isAiProcessing ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <Zap size={20} />
                        )}{" "}
                        Synthesize
                      </button>
                    </div>
                  </div>
                  <div className="lg:col-span-8">
                    {symptomAnalysis ? (
                      <div className="space-y-6">
                        <div className="bg-rose-600 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                          <AlertCircle className="absolute -right-4 -top-4 opacity-10 w-32 h-32" />
                          <h3 className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-80">
                            Critical Observation
                          </h3>
                          <p className="text-lg font-bold">
                            {symptomAnalysis.criticalNote}
                          </p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border shadow-2xl overflow-hidden">
                          <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800">
                              <tr>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                  Condition
                                </th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                                  Urgency
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-slate-800">
                              {symptomAnalysis.diagnoses.map((diag, i) => (
                                <tr key={i}>
                                  <td className="p-6">
                                    <p className="font-black dark:text-white">
                                      {diag.condition}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                      {diag.description}
                                    </p>
                                  </td>
                                  <td className="p-6 text-center">
                                    <UrgencyBadge level={diag.urgency} />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="h-[400px] border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[4rem] flex flex-col items-center justify-center text-slate-300 opacity-50">
                        <ScanSearch size={64} />
                        <p className="mt-4 font-black uppercase text-xs tracking-widest">
                          Enter Symptom Log
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {view === "pharmacy" && renderPharmacy()}
            {view === "diagnostic" && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-4xl font-black">
                    {tabs.find((t) => t.id === activeTab).label} Analysis
                  </h2>
                  <div className="flex gap-2">
                    {tabs.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
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
                <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-12 shadow-2xl border dark:border-slate-800">
                  <div className="grid grid-cols-2 gap-8">
                    {Object.keys(formData[activeTab]).map((field) => (
                      <div key={field} className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400">
                          {field}
                        </label>
                        <input
                          type="number"
                          className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold"
                        />
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-12 py-6 bg-slate-900 dark:bg-violet-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl hover:bg-violet-700 transition-all">
                    Execute Scan
                  </button>
                </div>
              </div>
            )}
            {view === "hospitals" && (
              <div className="space-y-8 animate-in slide-in-from-right-12">
                <h2 className="text-4xl font-black">Regional Hospital Map</h2>
                <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 shadow-xl">
                  <form
                    onSubmit={handleHospitalSearch}
                    className="relative mb-12"
                  >
                    <input
                      type="text"
                      placeholder="Enter City/State..."
                      className="w-full bg-slate-50 dark:bg-slate-800 p-6 pr-44 rounded-[2.5rem] outline-none"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="absolute right-3 top-3 bottom-3 px-8 bg-cyan-600 text-white rounded-[2rem] font-black uppercase"
                    >
                      Search Map
                    </button>
                  </form>
                  {hospitalResults && (
                    <div className="grid grid-cols-3 gap-6">
                      {hospitalResults.map((h, i) => (
                        <div
                          key={i}
                          className="p-8 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] border dark:border-slate-700"
                        >
                          <h4 className="font-black text-lg mb-2">{h.name}</h4>
                          <p className="text-xs text-slate-400 mb-6">
                            {h.address}
                          </p>
                          <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase">
                            Route Location
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            {view === "booking" && (
              <div className="animate-in fade-in slide-in-from-bottom-10 space-y-8">
                <h2 className="text-4xl font-black">
                  Expert Consultant Booking
                </h2>
                <div className="grid grid-cols-4 gap-6">
                  {[
                    "Dr. Sarah Vance",
                    "Dr. Mark Thorne",
                    "Dr. Alex Chen",
                    "Dr. Julia Ross",
                  ].map((d, i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border shadow-sm text-center"
                    >
                      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto mb-6 flex items-center justify-center font-black text-violet-600">
                        DR
                      </div>
                      <h4 className="font-black text-lg mb-1">{d}</h4>
                      <p className="text-[10px] font-black text-violet-600 uppercase mb-6">
                        Certified Specialist
                      </p>
                      <button className="w-full py-3 bg-violet-600 text-white rounded-xl font-black text-[10px] uppercase">
                        Book Slot
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {view === "agent" && renderAgentView()}
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
