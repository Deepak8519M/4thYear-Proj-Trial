import React, { useState, useEffect } from 'react';
import {
Stethoscope,
MessageSquare,
AlertCircle,
Loader2,
ChevronRight,
ShieldAlert,
ClipboardList,
RefreshCcw
} from 'lucide-react';

const appId = typeof **app_id !== 'undefined' ? **app_id : 'health-query-planner';

const App = () => {
const [input, setInput] = useState('');
const [questions, setQuestions] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [hasGenerated, setHasGenerated] = useState(false);

const generateQuestions = async () => {
if (!input.trim()) return;

    setLoading(true);
    setError(null);
    setQuestions([]);

    const apiKey = ""; // Provided by environment
    const systemPrompt = `
      You are a medical literacy assistant. Your goal is to empower patients to have better conversations with their doctors.
      Based on the symptoms or health concerns described by the user, generate 6-8 clear, concise, and educational questions they can ask a healthcare professional.

      CRITICAL GUIDELINES:
      - DO NOT provide a diagnosis or name specific conditions as "the likely cause".
      - DO NOT recommend specific medications or treatments.
      - Focus on: Understanding the underlying cause, clarifying necessary tests, lifestyle adjustments, precautions, timeline for recovery, and "red flag" symptoms.
      - Keep questions professional and open-ended.
      - Format the output as a clean list of questions without introductory or concluding text.
    `;

    const userQuery = `My symptoms/concerns are: ${input}`;

    const fetchWithRetry = async (retries = 0) => {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: userQuery }] }],
              systemInstruction: { parts: [{ text: systemPrompt }] }
            })
          }
        );

        if (!response.ok) throw new Error('API request failed');

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (text) {
          // Parse the text into a clean list
          const lines = text.split('\n')
            .map(line => line.replace(/^[\s\-\d\.]+/g, '').trim())
            .filter(line => line.length > 5);
          setQuestions(lines);
          setHasGenerated(true);
        } else {
          throw new Error('No content received');
        }
      } catch (err) {
        if (retries < 5) {
          const delay = Math.pow(2, retries) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchWithRetry(retries + 1);
        }
        setError("I'm having trouble connecting to the medical assistant. Please try again in a moment.");
      } finally {
        setLoading(false);
      }
    };

    await fetchWithRetry();

};

const reset = () => {
setInput('');
setQuestions([]);
setHasGenerated(false);
setError(null);
};

return (
<div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
<div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <header className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
            <Stethoscope size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">Consultation Planner</h1>
            <p className="text-slate-500 text-sm">Prepare better questions for your next doctor's visit.</p>
          </div>
        </header>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800 text-sm leading-relaxed">
          <ShieldAlert className="shrink-0 text-amber-600" size={20} />
          <p>
            <strong>Medical Disclaimer:</strong> This tool is for educational purposes only. It does not provide medical advice or diagnoses. Always seek the advice of a qualified health provider with any questions you may have regarding a medical condition. <strong>If you are experiencing a medical emergency, call local emergency services immediately.</strong>
          </p>
        </div>

        {/* Input Section */}
        {!hasGenerated ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <MessageSquare size={16} />
                Describe your symptoms or concerns
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g., I've been having mild lower back pain for three weeks that gets worse after sitting..."
                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
              />
            </div>

            <button
              onClick={generateQuestions}
              disabled={loading || !input.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Preparing your questions...
                </>
              ) : (
                <>
                  Generate Question List
                  <ChevronRight size={20} />
                </>
              )}
            </button>
          </div>
        ) : (
          /* Results Section */
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <ClipboardList className="text-blue-600" size={20} />
                  Questions to Ask Your Doctor
                </h2>
                <button
                  onClick={reset}
                  className="text-slate-400 hover:text-blue-600 flex items-center gap-1 text-sm font-medium transition-colors"
                >
                  <RefreshCcw size={14} />
                  Start Over
                </button>
              </div>

              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
                  >
                    <div className="h-6 w-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold group-hover:bg-blue-100 group-hover:text-blue-600 shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-slate-700 leading-snug">{q}</p>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pro-Tip</h3>
                <p className="text-sm text-slate-600 italic">
                  Take a screenshot or print this list to keep in your pocket during the appointment. Don't be afraid to take notes while the doctor speaks!
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex gap-3 items-center">
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Footer info */}
        <footer className="text-center pb-8">
          <p className="text-xs text-slate-400">
            Powered by medical literacy AI guidance. Use this as a supplement to professional care.
          </p>
        </footer>
      </div>
    </div>

);
};

export default App;
