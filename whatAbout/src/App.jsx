import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Info, 
  HeartPulse, 
  Brain, 
  Zap, 
  ArrowRight, 
  RefreshCcw, 
  AlertCircle, 
  Sparkles, 
  Copy, 
  Check,
  BookOpen,
  Microscope,
  Waves
} from 'lucide-react';

const APP_NAME = "BioExplain";
const APP_ID = "health-curiosity-v1";

const App = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  const systemInstruction = `You are a Health Curiosity Assistant. Your purpose is to provide short, simple, and fascinating educational explanations about human biology and health mechanisms. 
  
  RULES:
  1. Explain the 'WHY' and 'HOW' (the biology/physiology).
  2. Use simple, non-technical language where possible.
  3. STRICTLY FORBIDDEN: Do not give medical advice, suggest treatments, or provide diagnoses. 
  4. If a user asks for personal medical advice (e.g., "Why does my head hurt?"), pivot to the general biology.
  5. FORMATTING: Use only plain text. DO NOT use asterisks (*), hashtags (#), bullet points with symbols, or horizontal lines. Use clear paragraph breaks for structure.
  6. Keep responses concise (under 150 words).
  7. Use a curious, encouraging, and scientific tone.`;

  const suggestedQuestions = [
    "Why is blood pressure important?",
    "How does the immune system remember viruses?",
    "Why do we need sleep for our brains?",
    "How do muscles grow after exercise?",
    "Why does the heart beat faster when we are scared?",
    "How do lungs exchange oxygen for carbon dioxide?"
  ];

  const handleCopy = () => {
    document.execCommand('copy'); 
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const callGemini = async (userQuery, retryCount = 0) => {
    const apiKey = "AIzaSyB_h5kFd5icgfoD0p9V1-Qyjosme_X6MCs"; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] }
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        if (res.status === 429 && retryCount < 5) {
          const delay = Math.pow(2, retryCount) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          return callGemini(userQuery, retryCount + 1);
        }
        throw new Error(`API Error: ${res.status}`);
      }

      const data = await res.json();
      let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't find an explanation for that. Try rephrasing!";
      
      return text.replace(/[*#\-_]/g, '').trim();
    } catch (err) {
      if (retryCount < 5) {
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return callGemini(userQuery, retryCount + 1);
      }
      throw err;
    }
  };

  const handleSubmit = async (e, directQuery = null) => {
    if (e) e.preventDefault();
    const activeQuery = directQuery || query;
    if (!activeQuery.trim()) return;

    setLoading(true);
    setError(null);
    setResponse('');

    try {
      const result = await callGemini(activeQuery);
      setResponse(result);
      setHistory(prev => [{ q: activeQuery, a: result }, ...prev.slice(0, 4)]);
      if (!directQuery) setQuery('');
    } catch (err) {
      setError("I'm having trouble connecting to the knowledge base. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFE] text-slate-900 font-sans p-4 md:p-12 selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-2xl mx-auto">
        {/* Header Section */}
        <header className="flex flex-col items-center text-center mb-16">
          <div className="relative group cursor-default">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
              <HeartPulse className="text-indigo-600 w-10 h-10" />
            </div>
          </div>
          <h1 className="text-4xl font-black mt-8 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900">
            BioExplain
          </h1>
          <p className="text-slate-400 mt-3 font-black tracking-[0.2em] text-[10px] uppercase">Scientific Discovery Hub</p>
        </header>

        {/* Input Interface */}
        <section className="bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] p-8 mb-12 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-indigo-50/50 rounded-full blur-3xl pointer-events-none"></div>
          
          <form onSubmit={handleSubmit} className="relative mb-10 z-10">
            <input
              type="text"
              className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/10 focus:bg-white focus:ring-[12px] focus:ring-indigo-500/5 transition-all rounded-[2rem] py-6 pl-14 pr-4 text-lg font-semibold outline-none placeholder:text-slate-300 shadow-inner"
              placeholder="How does our brain store memories?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-6 h-6" />
            <button 
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-200 text-white p-3.5 rounded-2xl transition-all active:scale-95 shadow-xl shadow-slate-900/10"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Prompt Suggestions */}
          <div className="flex flex-wrap justify-center gap-2 relative z-10">
            {suggestedQuestions.map((sq, i) => (
              <button
                key={i}
                onClick={() => {
                    setQuery(sq);
                    handleSubmit(null, sq);
                }}
                disabled={loading}
                className="text-[11px] font-black tracking-wide bg-white text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 px-5 py-3 rounded-2xl transition-all shadow-sm active:translate-y-0.5"
              >
                {sq}
              </button>
            ))}
          </div>
        </section>

        {/* Explanation Display */}
        <main className="space-y-10 min-h-[450px]">
          {loading && (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="relative h-20 w-20 mb-8 flex items-center justify-center">
                 <div className="absolute inset-0 border-2 border-indigo-100 rounded-full scale-150 opacity-20 animate-ping"></div>
                 <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                 <Sparkles className="text-indigo-500 w-6 h-6 animate-pulse" />
              </div>
              <p className="font-black text-[10px] uppercase tracking-[0.5em] text-indigo-600/60 ml-2">Mapping Biology</p>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 p-6 rounded-[2.5rem] border border-rose-100 flex gap-4 text-rose-900 shadow-sm animate-in fade-in zoom-in-95">
              <AlertCircle className="w-6 h-6 flex-shrink-0 text-rose-400" />
              <div>
                <p className="font-black text-[10px] uppercase tracking-widest mb-1">Observation Halted</p>
                <p className="text-sm font-bold leading-relaxed opacity-80">{error}</p>
              </div>
            </div>
          )}

          {response && !loading && (
            <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)]">
              {/* Premium Discovery Card */}
              <article className="bg-white p-10 md:p-16 rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.06)] border border-slate-100 relative group overflow-hidden">
                
                {/* Background Design Elements */}
                <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-[0.03]">
                    <div className="absolute top-10 right-10 rotate-12">
                        <Microscope className="w-64 h-64" />
                    </div>
                </div>
                
                {/* Gradient Accent Bar */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 opacity-60"></div>

                {/* Header Actions */}
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-4">
                    <div className="px-3 py-1 bg-indigo-50 rounded-full">
                        <span className="font-black text-[9px] uppercase tracking-[0.3em] text-indigo-600">Research Entry</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleCopy}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-indigo-600 text-slate-400 hover:text-white transition-all active:scale-90"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Content Hierarchy */}
                <div className="space-y-10 relative z-10">
                  {response.split('\n\n').map((paragraph, i) => {
                    const isFirst = i === 0;
                    return (
                      paragraph.trim() && (
                        <div key={i} className="relative group/text">
                          {isFirst && (
                              <div className="absolute -left-6 top-1 w-1 h-12 bg-indigo-500 rounded-full hidden md:block"></div>
                          )}
                          <p className={`
                            ${isFirst 
                              ? 'text-3xl font-black text-slate-900 leading-[1.3] tracking-tighter bg-clip-text' 
                              : 'text-lg text-slate-600 leading-[1.8] font-semibold tracking-tight'}
                          `}>
                            {paragraph}
                          </p>
                        </div>
                      )
                    );
                  })}
                </div>

                {/* Data Insights Footer */}
                <div className="mt-16 pt-12 border-t border-slate-50 flex flex-col md:flex-row md:items-center gap-10">
                    <div className="flex -space-x-2">
                        <div className="w-10 h-10 rounded-full bg-indigo-500 border-4 border-white flex items-center justify-center text-white shadow-sm shadow-indigo-200">
                            <Brain className="w-4 h-4" />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-500 border-4 border-white flex items-center justify-center text-white shadow-sm shadow-blue-200">
                            <Waves className="w-4 h-4" />
                        </div>
                    </div>
                    
                    <div className="flex-grow">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-1">Mechanism Classification</p>
                        <div className="flex gap-4">
                             <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                <span className="text-xs font-bold text-slate-500">Biological Logic</span>
                             </div>
                             <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                <span className="text-xs font-bold text-slate-500">Physiological Process</span>
                             </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 text-white px-6 py-4 rounded-3xl flex items-center gap-3 shadow-2xl shadow-slate-900/20">
                        <Sparkles className="w-4 h-4 text-indigo-300" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified Logic</span>
                    </div>
                </div>
              </article>
            </div>
          )}

          {!loading && !response && !error && (
            <div className="flex flex-col items-center justify-center py-20 opacity-20">
              <BookOpen className="w-16 h-16 mb-6 text-indigo-950" />
              <p className="font-black text-[10px] uppercase tracking-[0.5em] text-slate-900">Awaiting Inquiry</p>
            </div>
          )}
        </main>

        {/* Previous Discoveries Archive */}
        {history.length > 1 && !loading && (
            <div className="mt-24 mb-12">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] mb-8 text-center">Inquiry Archive</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {history.slice(1).map((item, idx) => (
                        <button 
                            key={idx}
                            onClick={() => {
                                setResponse(item.a);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="group bg-white p-6 rounded-[2rem] text-left border border-slate-100 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all flex flex-col justify-between h-full"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-indigo-50 transition-colors">
                                    <Zap className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500" />
                                </div>
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Entry #{history.length - idx}</span>
                            </div>
                            <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-relaxed mb-6">
                                {item.q}
                            </p>
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-indigo-300 transition-colors">
                                <span>View Data</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        )}

        {/* Regulatory Footer */}
        <footer className="mt-20 p-12 bg-[#0F172A] rounded-[4rem] text-slate-400 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-4">
                <div className="h-px bg-slate-800 flex-grow"></div>
                <Info className="w-5 h-5 text-indigo-400" />
                <div className="h-px bg-slate-800 flex-grow"></div>
            </div>
            <div className="text-center">
              <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-4">Educational Integrity Protocol</h4>
              <p className="text-[11px] leading-[1.8] font-medium opacity-60 max-w-lg mx-auto">
                <strong className="text-indigo-300 uppercase">Non-Diagnostic System.</strong> BioExplain synthesizes biological patterns for educational curiosity. It is not a clinical tool. If you are experiencing symptoms, consult a medical professional immediately. 
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;