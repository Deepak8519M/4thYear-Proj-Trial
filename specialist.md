import React, { useState, useEffect, useMemo } from 'react';
import {
Search,
Stethoscope,
Activity,
ShieldAlert,
Info,
ChevronRight,
UserRound,
Heart,
Bone,
Brain,
ArrowRight,
RefreshCw,
AlertTriangle,
ShieldCheck,
Target,
Zap,
Eye,
Thermometer,
Wind,
Ear
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query } from 'firebase/firestore';

// --- Constants ---
const apiKey = "";
const modelName = "gemini-2.5-flash-preview-09-2025";

const SYSTEM_PROMPT = `
Suggest medical specialties for health concerns.
RULES:

1. NO diagnosis/treatment.
2. Suggest 1-2 specialties.
3. Output strictly in JSON.
4. If it's an emergency (chest pain, stroke, trauma), set isEmergency to true.

Format:
{
"isEmergency": boolean,
"suggestions": [{ "specialty": "Name", "reason": "Why", "focus": "Expertise" }],
"disclaimer": "Informational only."
}
`;

const App = () => {
const [concern, setConcern] = useState('');
const [exampleSearch, setExampleSearch] = useState('');
const [loading, setLoading] = useState(false);
const [result, setResult] = useState(null);
const [error, setError] = useState(null);
const [history, setHistory] = useState([]);
const [user, setUser] = useState(null);

useEffect(() => {
const initFirebase = async () => {
try {
const firebaseConfig = JSON.parse(window.**firebase_config || '{}');
if (!firebaseConfig.apiKey) return;
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = window.**app_id || 'specialty-finder-v2';

        const initAuth = async () => {
          if (typeof window.__initial_auth_token !== 'undefined' && window.__initial_auth_token) {
            await signInWithCustomToken(auth, window.__initial_auth_token);
          } else {
            await signInAnonymously(auth);
          }
        };
        initAuth();
        onAuthStateChanged(auth, (u) => setUser(u));
      } catch (err) {
        console.error("Firebase Init Error:", err);
      }
    };
    initFirebase();

}, []);

useEffect(() => {
if (!user) return;
const db = getFirestore();
const appId = window.\_\_app_id || 'specialty-finder-v2';
const historyRef = collection(db, 'artifacts', appId, 'users', user.uid, 'search_history');
const q = query(historyRef);
const unsubscribe = onSnapshot(q, (snapshot) => {
const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
setHistory(items.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5));
}, (err) => console.error("Firestore error:", err));
return () => unsubscribe();
}, [user]);

const findSpecialist = async (e) => {
if (e) e.preventDefault();
if (!concern.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: concern }] }],
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (!response.ok) throw new Error("API Connection Failed");

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const parsed = JSON.parse(text);
        setResult(parsed);
        if (user) {
          const db = getFirestore();
          const appId = window.__app_id || 'specialty-finder-v2';
          await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'search_history'), {
            concern, result: parsed, timestamp: Date.now()
          });
        }
      }
    } catch (err) {
      setError("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }

};

const allExamples = [
{ t: "Chest pressure", i: <Heart className="w-4 h-4" /> },
{ t: "Joint stiffness", i: <Bone className="w-4 h-4" /> },
{ t: "Memory loss", i: <Brain className="w-4 h-4" /> },
{ t: "Blurry vision", i: <Eye className="w-4 h-4" /> },
{ t: "Chronic cough", i: <Wind className="w-4 h-4" /> },
{ t: "Persistent fever", i: <Thermometer className="w-4 h-4" /> },
{ t: "Skin rash", i: <Activity className="w-4 h-4" /> },
{ t: "Hearing loss", i: <Ear className="w-4 h-4" /> },
{ t: "Digestive issues", i: <Activity className="w-4 h-4" /> },
{ t: "Anxiety & Mood", i: <Brain className="w-4 h-4" /> },
{ t: "Lower back pain", i: <Bone className="w-4 h-4" /> },
{ t: "Severe dizziness", i: <Brain className="w-4 h-4" /> },
{ t: "Numbness in feet", i: <Activity className="w-4 h-4" /> },
{ t: "Frequent urination", i: <Activity className="w-4 h-4" /> },
{ t: "Thyroid concerns", i: <Activity className="w-4 h-4" /> }
];

const filteredExamples = useMemo(() => {
if (!exampleSearch.trim()) return allExamples;
return allExamples.filter(ex =>
ex.t.toLowerCase().includes(exampleSearch.toLowerCase())
);
}, [exampleSearch]);

return (
<div className="min-h-screen bg-[#020617] text-slate-100 p-4 md:p-12 transition-colors duration-500">
<div className="max-w-6xl mx-auto">

        <header className="mb-12 text-center">
          <div className="inline-block p-4 bg-blue-600/10 rounded-full border border-blue-500/20 mb-6">
            <Stethoscope className="text-blue-500 w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
            Specialist<span className="text-blue-500">Fast</span>
          </h1>
          <p className="text-slate-500 font-medium italic">Instant medical specialty routing.</p>
        </header>

        <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-800 mb-12 max-w-2xl mx-auto shadow-2xl">
          <form onSubmit={findSpecialist} className="space-y-6">
            <div className="relative group">
              <textarea
                value={concern}
                onChange={(e) => setConcern(e.target.value)}
                placeholder="Describe what you are feeling..."
                className="w-full p-6 rounded-2xl bg-slate-950 border border-slate-800 focus:border-blue-500 transition-all min-h-[140px] resize-none text-lg outline-none"
              />
              <button
                type="submit"
                disabled={loading || !concern.trim()}
                className={`absolute bottom-4 right-4 p-4 rounded-xl transition-all ${
                  loading || !concern.trim() ? 'bg-slate-800 text-slate-600' : 'bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-500/20'
                }`}
              >
                {loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <ArrowRight className="w-6 h-6" />}
              </button>
            </div>

            {/* Expanded Examples with Search */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1 gap-4">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] whitespace-nowrap">Common Symptoms</span>
                <div className="relative flex-grow max-w-[240px]">
                  <input
                    type="text"
                    placeholder="Search symptoms..."
                    value={exampleSearch}
                    onChange={(e) => setExampleSearch(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 pl-4 pr-10 text-[11px] text-slate-300 outline-none focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-700"
                  />
                  <Search className="absolute right-3 top-2.5 w-3.5 h-3.5 text-slate-600" />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto scrollbar-hide">
                {filteredExamples.map((ex, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setConcern(ex.t)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/30 hover:bg-slate-800 rounded-full text-[11px] text-slate-400 hover:text-white transition-all border border-transparent hover:border-slate-700 whitespace-nowrap"
                  >
                    {ex.i} {ex.t}
                  </button>
                ))}
                {filteredExamples.length === 0 && (
                  <span className="text-[10px] text-slate-600 italic px-2">No matching common symptoms found.</span>
                )}
              </div>
            </div>
          </form>
        </div>

        <main>
          {error && (
            <div className="max-w-2xl mx-auto bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-400 text-center mb-8">
              {error}
            </div>
          )}

          {result && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
              <div className={`p-8 rounded-[2rem] border ${result.isEmergency ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
                <div className="flex items-center gap-6">
                  {result.isEmergency ? (
                    <div className="p-4 bg-red-600 rounded-2xl shadow-lg shadow-red-500/40">
                      <ShieldAlert className="w-10 h-10 text-white" />
                    </div>
                  ) : (
                    <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/40">
                      <ShieldCheck className="w-10 h-10 text-white" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-widest">{result.isEmergency ? 'Emergency Alert' : 'Recommended Path'}</h2>
                    <p className="text-base opacity-70 font-medium max-w-2xl">
                      {result.isEmergency
                        ? 'Your symptoms indicate an urgent medical situation. Seek immediate care at an Emergency Room or call 911.'
                        : 'Based on your description, we identified the following specialists as relevant for a consultation.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Flex Grid Container for Cards */}
              <div className="flex flex-wrap gap-8 justify-center items-stretch">
                {result.suggestions.map((s, i) => (
                  <div key={i} className="flex-1 min-w-[320px] max-w-[500px] bg-slate-900/60 border border-slate-800 rounded-[2.5rem] p-10 hover:border-blue-500/30 transition-all group relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Target className="w-24 h-24 text-blue-500" />
                    </div>

                    <div className="flex items-center justify-between mb-8 relative z-10">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-blue-500/80 uppercase tracking-[0.2em]">Medical Specialist</span>
                        <h3 className="text-3xl font-black text-white group-hover:text-blue-400 transition-colors leading-none">{s.specialty}</h3>
                      </div>
                      <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                        <Activity className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="space-y-6 flex-grow relative z-10">
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Clinical Relevance</span>
                        <p className="text-slate-300 text-sm leading-relaxed italic">"{s.reason}"</p>
                      </div>
                      <div className="pt-6 border-t border-slate-800">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Primary Focus</span>
                        <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                          <p className="text-blue-200 font-bold text-sm tracking-tight">{s.focus}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-900 max-w-2xl mx-auto">
                <p className="text-[10px] text-slate-600 text-center italic leading-relaxed">
                  <Info className="w-3 h-3 inline mr-1 mb-0.5" />
                  {result.disclaimer} Specialist Fast AI is a non-diagnostic routing tool. Always seek the advice of your physician or other qualified health provider with any questions regarding a medical condition.
                </p>
              </div>
            </div>
          )}

          {!result && history.length > 0 && (
            <div className="mt-20 text-center animate-in fade-in duration-1000">
              <span className="text-[10px] font-black text-slate-800 uppercase tracking-[0.4em] mb-8 block">Recent Searches</span>
              <div className="flex flex-wrap gap-4 justify-center">
                {history.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => { setConcern(h.concern); setResult(h.result); }}
                    className="px-6 py-4 bg-slate-900/30 border border-slate-800 rounded-2xl hover:bg-slate-900 transition-all text-xs font-bold text-slate-500 hover:text-slate-300 max-w-[180px] truncate"
                  >
                    {h.concern}
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>

        <footer className="mt-32 py-10 text-center opacity-20 hover:opacity-100 transition-opacity">
          <Zap className="w-6 h-6 mx-auto mb-2 text-blue-500" />
          <p className="text-[10px] font-black tracking-[0.2em] uppercase">Specialist Fast AI Protocol • Secure Analysis</p>
        </footer>
      </div>
    </div>

);
};

export default App;
