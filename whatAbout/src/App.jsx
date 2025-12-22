import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Info,
  HeartPulse,
  Brain,
  Zap,
  ArrowRight,
  RefreshCcw,
  AlertCircle,
} from "lucide-react";

const APP_NAME = "BioExplain";
const APP_ID = "health-curiosity-v1";

const App = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  // System instructions to ensure educational tone and avoid medical advice
  const systemInstruction = `You are a Health Curiosity Assistant. Your purpose is to provide short, simple, and fascinating educational explanations about human biology and health mechanisms. 
  
  RULES:
  1. Explain the 'WHY' and 'HOW' (the biology/physiology).
  2. Use simple, non-technical language where possible.
  3. STRICTLY FORBIDDEN: Do not give medical advice, suggest treatments, or provide diagnoses. 
  4. If a user asks for personal medical advice (e.g., "Why does my head hurt?"), pivot to the general biology (e.g., "Here is how headaches generally work in the human body...") or state that you can only provide general educational information.
  5. Keep responses concise (under 150 words).
  6. Use a curious, encouraging, and scientific tone.`;

  const suggestedQuestions = [
    "Why is blood pressure important?",
    "How does the immune system remember viruses?",
    "Why do we need sleep for our brains?",
    "How do muscles grow after exercise?",
    "Why does the heart beat faster when we are scared?",
    "How do lungs exchange oxygen for carbon dioxide?",
  ];

  const callGemini = async (userQuery, retryCount = 0) => {
    const apiKey = "AIzaSyB_h5kFd5icgfoD0p9V1-Qyjosme_X6MCs"; // API key is handled by the environment
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
    };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        if (res.status === 429 && retryCount < 5) {
          const delay = Math.pow(2, retryCount) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
          return callGemini(userQuery, retryCount + 1);
        }
        throw new Error(`API Error: ${res.status}`);
      }

      const data = await res.json();
      return (
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "I couldn't find an explanation for that. Try rephrasing!"
      );
    } catch (err) {
      if (retryCount < 5) {
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
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
    setResponse("");

    try {
      const result = await callGemini(activeQuery);
      setResponse(result);
      setHistory((prev) => [
        { q: activeQuery, a: result },
        ...prev.slice(0, 4),
      ]);
      if (!directQuery) setQuery("");
    } catch (err) {
      setError(
        "I'm having trouble connecting to the knowledge base. Please try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="flex items-center gap-3 mb-8">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
            <HeartPulse className="text-white w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              {APP_NAME}
            </h1>
            <p className="text-sm text-slate-500 font-medium italic">
              Health Curiosity Mode
            </p>
          </div>
        </header>

        {/* Search Area */}
        <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 mb-8 border border-slate-100">
          <form onSubmit={handleSubmit} className="relative mb-6">
            <input
              type="text"
              className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-400 focus:bg-white transition-all rounded-2xl py-4 pl-14 pr-4 text-lg outline-none placeholder:text-slate-400"
              placeholder="Why is blood pressure important?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white p-2 rounded-xl transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Suggestions */}
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((sq, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(sq);
                  handleSubmit(null, sq);
                }}
                disabled={loading}
                className="text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 rounded-full transition-colors flex items-center gap-1"
              >
                <Zap className="w-3 h-3" />
                {sq}
              </button>
            ))}
          </div>
        </section>

        {/* Results / Feedback */}
        <main className="space-y-6 min-h-[300px]">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 animate-pulse">
              <RefreshCcw className="w-8 h-8 animate-spin mb-4 text-blue-500" />
              <p className="font-medium">Exploring the biology...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex gap-3 text-red-700">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {response && !loading && (
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-blue-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 mb-4 text-blue-600">
                <Brain className="w-6 h-6" />
                <h2 className="font-bold text-lg uppercase tracking-wider text-slate-400 text-xs">
                  Explanation
                </h2>
              </div>
              <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-lg">
                {response.split("\n").map((line, i) => (
                  <p key={i} className="mb-4">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          )}

          {!loading && !response && !error && (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl">
              <p className="text-slate-400">
                Ask a general health question to begin.
              </p>
            </div>
          )}
        </main>

        {/* Disclaimer Footer */}
        <footer className="mt-12 p-6 bg-slate-100 rounded-2xl border border-slate-200">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-500 leading-relaxed">
              <p className="font-bold mb-1 uppercase tracking-tight">
                Important Disclaimer
              </p>
              <p>
                <strong>BioExplain</strong> is strictly for educational and
                informational purposes. It does not provide medical advice,
                diagnosis, or treatment. Always seek the advice of your
                physician or other qualified health provider with any questions
                you may have regarding a medical condition. Never disregard
                professional medical advice or delay in seeking it because of
                something you have read here.
              </p>
            </div>
          </div>
        </footer>

        {/* Recent History (Mini) */}
        {history.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">
              Recently Explored
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {history.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setResponse(item.a);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="bg-white/60 p-4 rounded-xl text-left border border-slate-200 hover:border-blue-200 transition-all group"
                >
                  <p className="text-sm font-semibold text-slate-700 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {item.q}
                  </p>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-1">
                    {item.a}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
