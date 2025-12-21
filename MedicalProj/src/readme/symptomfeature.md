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
const API_KEY = ""; // Provided at runtime
const MODEL_TEXT = "gemini-2.5-flash-preview-09-2025";
const MODEL_TTS = "gemini-2.5-flash-preview-tts";

const App = () => {
const [activeTab, setActiveTab] = useState("heart");
const [view, setView] = useState("symptoms"); // Set symptoms as default for testing
const [isDarkMode, setIsDarkMode] = useState(false);
const [isPredicting, setIsPredicting] = useState(false);
const [prediction, setPrediction] = useState(null);

// AI Integration States
const [isAiProcessing, setIsAiProcessing] = useState(false);
const [isSpeaking, setIsSpeaking] = useState(false);
const [errorMessage, setErrorMessage] = useState(null);

// Agent / Chat States
const [chatMessages, setChatMessages] = useState([
{
role: "assistant",
content:
"Welcome to your VitaCore Clinical Session. I am your AI Health Agent. Please describe your symptoms or health queries in detail for a comprehensive analysis.",
},
]);
const [userInput, setUserInput] = useState("");
const [isChatting, setIsChatting] = useState(false);
const [clinicalReport, setClinicalReport] = useState(null);
const [agentMode, setAgentMode] = useState("chat");
const chatEndRef = useRef(null);

// Pharmacy State
const [pharmacyQuery, setPharmacyQuery] = useState("");
const [pharmacyResults, setPharmacyResults] = useState(null);
const [pharmacyMode, setPharmacyMode] = useState("recommend");

// Symptom Checker State (Updated for Structured Data)
const [symptomInput, setSymptomInput] = useState("");
const [symptomAnalysis, setSymptomAnalysis] = useState(null);

// Nearby Hospitals State
const [locationQuery, setLocationQuery] = useState("");
const [hospitalResults, setHospitalResults] = useState(null);

// Booking State
const [bookingSuccess, setBookingSuccess] = useState(false);
const [selectedDoctor, setSelectedDoctor] = useState(null);

// Form states
const [formData, setFormData] = useState({
heart: { age: "", sex: "1", cp: "0", trestbps: "", chol: "", fbs: "0", restecg: "0", thalach: "" },
diabetes: { pregnancies: "", glucose: "", bloodPressure: "", skinThickness: "", insulin: "", bmi: "", dpf: "", age: "" },
lung: { age: "", smoking: "1", yellowFingers: "1", anxiety: "1", peerPressure: "1", chronicDisease: "1", fatigue: "1", wheezing: "1" },
oncology: { scanType: "Lung Cancer X-Ray" },
});

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
return await response.json();
} catch (err) {
if (i === 4) throw err;
await new Promise((resolve) => setTimeout(resolve, delay));
delay \*= 2;
}
}
};

const callGemini = async (prompt, systemInstruction = "You are a professional medical AI assistant.") => {
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

      const buffer = Uint8Array.from(atob(base64Audio), (c) => c.charCodeAt(0)).buffer;
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

// --- Feature Handlers ---

const handleSymptomAnalysis = async (e) => {
e.preventDefault();
if (!symptomInput.trim()) return;
setIsAiProcessing(true);
setSymptomAnalysis(null);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_TEXT}:generateContent?key=${API_KEY}`;
    const payload = {
      contents: [{ parts: [{ text: `Analyze these symptoms: "${symptomInput}". Output JSON format for a diagnostic report.` }] }],
      systemInstruction: {
        parts: [{ text: "You are a senior clinical diagnostic physician. Provide a structured differential diagnosis. Focus on ruling out critical conditions." }],
      },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            criticalNote: { type: "STRING" },
            diagnoses: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  condition: { type: "STRING" },
                  confidence: { type: "STRING" },
                  specialist: { type: "STRING" },
                  urgency: { type: "STRING", enum: ["High", "Medium", "Low"] },
                  description: { type: "STRING" }
                },
                required: ["condition", "confidence", "specialist", "urgency"]
              }
            },
            disclaimer: { type: "STRING" }
          },
          required: ["criticalNote", "diagnoses", "disclaimer"]
        }
      }
    };

    try {
      const result = await executeGeminiRequest(url, payload);
      const content = result.candidates?.[0]?.content?.parts?.[0]?.text;
      setSymptomAnalysis(JSON.parse(content));
    } catch (err) {
      setErrorMessage("Diagnostic engine failed to synthesize data.");
    } finally {
      setIsAiProcessing(false);
    }

};

const handleHospitalSearch = async (e) => {
e.preventDefault();
if (!locationQuery.trim()) return;
setIsAiProcessing(true);
const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_TEXT}:generateContent?key=${API_KEY}`;
const payload = {
contents: [{ parts: [{ text: `Locate 5 real hospitals near "${locationQuery}".` }] }],
systemInstruction: { parts: [{ text: "Return JSON. Fields: name, address, specialty, emergencyRoom (bool), rating (1-5)." }] },
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
rating: { type: "NUMBER" }
}
}
}
}
}
}
};
try {
const result = await executeGeminiRequest(url, payload);
const content = JSON.parse(result.candidates[0].content.parts[0].text);
setHospitalResults(content.hospitals);
} catch (err) {
setErrorMessage("Location services unavailable.");
} finally {
setIsAiProcessing(false);
}
};

const handlePharmacySearch = async (e) => {
e.preventDefault();
if (!pharmacyQuery.trim()) return;
setIsAiProcessing(true);
const prompt = pharmacyMode === "recommend"
? `Provide medications for: "${pharmacyQuery}". List brand, generic, dosage, side effects.`
: `Generic alternatives for: "${pharmacyQuery}". Compare prices and safety.`;

    try {
      const res = await callGemini(prompt, "You are a clinical pharmacologist.");
      setPharmacyResults(res);
    } finally {
      setIsAiProcessing(false);
    }

};

// --- UI Components ---

const UrgencyBadge = ({ level }) => {
const styles = {
High: "bg-rose-100 text-rose-700 border-rose-200",
Medium: "bg-amber-100 text-amber-700 border-amber-200",
Low: "bg-emerald-100 text-emerald-700 border-emerald-200"
};
return (
<span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[level] || styles.Low}`}>
{level}
</span>
);
};

const renderSymptomChecker = () => (
<div className="animate-in fade-in slide-in-from-right-12 duration-700 space-y-8 pb-20">
<div>
<h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
Symptom Detector <span className="text-violet-600">v2.1</span>
</h2>
<p className="text-slate-500 dark:text-slate-400 font-medium italic">
High-fidelity diagnostic mapping for clinical decision support.
</p>
</div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Input */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">
              Patient Symptom Log
            </label>
            <textarea
              value={symptomInput}
              onChange={(e) => setSymptomInput(e.target.value)}
              placeholder="Describe symptoms in detail (e.g., 'Sharp pain behind breastbone after meals, radiates to back')..."
              className="w-full h-48 bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border-none outline-none dark:text-white resize-none font-medium text-sm leading-relaxed focus:ring-2 ring-violet-500/20 transition-all"
            />
            <button
              onClick={handleSymptomAnalysis}
              disabled={isAiProcessing || !symptomInput}
              className="w-full mt-6 py-4 bg-slate-900 dark:bg-violet-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-xl"
            >
              {isAiProcessing ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
              Synthesize Diagnosis
            </button>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 p-6 rounded-[2rem] border border-amber-100 dark:border-amber-900/30">
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-amber-500 text-white rounded-2xl">
                <AlertCircle size={20} />
              </div>
              <p className="text-xs font-bold text-amber-800 dark:text-amber-200 leading-relaxed">
                Emergency Triage: If experiencing severe breathlessness or crushing pain, bypass this tool and contact emergency services.
              </p>
            </div>
          </div>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-8">
          {symptomAnalysis ? (
            <div className="space-y-6 animate-in slide-in-from-bottom-8">
              {/* Critical Note Card */}
              <div className="bg-rose-600 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                <AlertCircle className="absolute -right-4 -top-4 opacity-10 w-32 h-32" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">Urgent Clinical Note</h3>
                <p className="text-lg font-bold leading-relaxed">{symptomAnalysis.criticalNote}</p>
              </div>

              {/* Main Diagnostic Table */}
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden">
                <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-violet-600 text-white rounded-xl">
                      <Stethoscope size={20} />
                    </div>
                    <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-lg">Differential Diagnosis</h3>
                  </div>
                  <button onClick={() => playGeminiTTS(symptomAnalysis.diagnoses.map(d => d.condition).join(", "))} className="p-2 text-slate-400 hover:text-violet-600">
                    <Volume2 size={24} />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50">
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">#</th>
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Condition</th>
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Confidence</th>
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialist</th>
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Urgency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-slate-800">
                      {symptomAnalysis.diagnoses.map((diag, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                          <td className="p-6 font-black text-slate-300">{(idx + 1).toString().padStart(2, '0')}</td>
                          <td className="p-6">
                            <p className="font-black text-slate-800 dark:text-white mb-1">{diag.condition}</p>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-xs">{diag.description}</p>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-violet-500 rounded-full"
                                  style={{ width: diag.confidence }}
                                />
                              </div>
                              <span className="text-xs font-black text-slate-600 dark:text-slate-400">{diag.confidence}</span>
                            </div>
                          </td>
                          <td className="p-6">
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border dark:border-slate-700">
                              {diag.specialist}
                            </span>
                          </td>
                          <td className="p-6"><UrgencyBadge level={diag.urgency} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-8 bg-slate-50/50 dark:bg-slate-800/50 border-t dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
                  <p className="text-[10px] font-bold text-slate-400 italic max-w-md">{symptomAnalysis.disclaimer}</p>
                  <div className="flex gap-2">
                    <button className="px-6 py-2.5 bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Export Report</button>
                    <button onClick={() => setView("booking")} className="px-6 py-2.5 bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-700 shadow-lg shadow-violet-200 dark:shadow-none transition-all">Book Consultant</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[500px] border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[4rem] flex flex-col items-center justify-center text-center p-12 relative overflow-hidden">
              {isAiProcessing ? (
                <div className="space-y-6">
                  <div className="w-24 h-24 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white">Analyzing Clinical Data...</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">Mapping symptoms to differential diagnostics</p>
                  </div>
                </div>
              ) : (
                <div className="opacity-30 flex flex-col items-center">
                  <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                    <ScanSearch size={48} className="text-slate-300" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-400">Diagnostic Hub Idle</h3>
                  <p className="text-slate-300 font-medium max-w-xs mt-2">Enter patient observations on the left to generate a professional clinical breakdown.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

);

// --- Main Sidebar Button ---
const SidebarButton = ({ icon: Icon, label, id, currentView, onClick, colorClass = "" }) => (
<button
onClick={() => onClick(id)}
className={`flex items-center gap-4 p-4 rounded-[1.25rem] transition-all font-bold text-sm w-full text-left ${
        currentView === id
          ? `bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white ${colorClass}`
          : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
      }`} >
<div className={`p-2 rounded-xl shadow-sm ${currentView === id ? "bg-white dark:bg-slate-900" : "bg-white dark:bg-slate-900 opacity-60"}`}>
<Icon size={18} />
</div>
{label}
</button>
);

return (
<div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? "dark" : ""}`}>
<div className="bg-[#F8FAFC] dark:bg-slate-950 flex flex-col md:flex-row font-sans text-slate-900 dark:text-slate-100 selection:bg-violet-100 selection:text-violet-900 min-h-screen">

        {/* Sidebar */}
        <aside className="w-full md:w-80 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 p-8 flex flex-col gap-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-violet-600 to-indigo-600 p-2.5 rounded-2xl shadow-lg">
                <Zap className="text-white fill-current" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-800 dark:text-white uppercase">VitaCore AI</h1>
                <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">Med Suite Pro</p>
              </div>
            </div>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            <SidebarButton icon={ScanSearch} label="Clinical Suite" id="diagnostic" currentView={view} onClick={setView} />
            <SidebarButton icon={Pill} label="Pharmacy Hub" id="pharmacy" currentView={view} onClick={setView} colorClass="text-emerald-600" />
            <SidebarButton icon={Stethoscope} label="Symptom Checker" id="symptoms" currentView={view} onClick={setView} colorClass="text-indigo-600" />
            <SidebarButton icon={MapPin} label="Nearby Hospitals" id="hospitals" currentView={view} onClick={setView} colorClass="text-cyan-600" />
            <SidebarButton icon={Calendar} label="Doctor Booking" id="booking" currentView={view} onClick={setView} colorClass="text-rose-600" />
            <SidebarButton icon={Bot} label="AI Health Agent" id="agent" currentView={view} onClick={setView} colorClass="text-violet-600" />
            <div className="h-px bg-slate-100 dark:bg-slate-800 mx-4 my-2" />
            <button onClick={() => setView("dashboard")} className={`mt-4 flex items-center gap-4 p-5 rounded-[2rem] transition-all font-black text-sm uppercase tracking-widest ${view === "dashboard" ? "bg-violet-600 text-white shadow-xl" : "bg-slate-900 text-white"}`}>
              <LayoutDashboard size={20} /> Analytics Hub
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-14 overflow-y-auto bg-[radial-gradient(circle_at_top_right,_#f1f5f9_0%,_transparent_50%)] dark:bg-none">
          <div className="max-w-6xl mx-auto">
            {view === "symptoms" ? renderSymptomChecker() : (
              <div className="flex flex-col items-center justify-center h-full opacity-40 text-center">
                <Bot size={64} className="mb-4" />
                <h2 className="text-2xl font-black">View Development in Progress</h2>
                <p>Switch to Symptom Checker to see the new structured diagnostics.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>

);
};

export default App;
