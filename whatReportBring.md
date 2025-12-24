import React, { useState, useEffect } from 'react';
import {
Stethoscope,
FileText,
MessageSquare,
CheckCircle2,
Download,
PlusCircle,
ClipboardCheck,
Loader2,
AlertCircle,
ChevronRight,
Info,
FileDown
} from 'lucide-react';

const apiKey = ""; // Environment provided key
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";

const App = () => {
const [reason, setReason] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [checklist, setChecklist] = useState(null);
const [checkedItems, setCheckedItems] = useState({});

const generateChecklist = async (e) => {
if (e) e.preventDefault();
if (!reason.trim()) return;

    setLoading(true);
    setError(null);
    setChecklist(null);
    setCheckedItems({});

    const systemPrompt = `You are a professional Patient Advocate and Medical Administrative Assistant.
    Your task is to generate a comprehensive, practical, and highly specific pre-doctor visit checklist based on the user's reason for the visit.

    Structure the response as a JSON object with these fields:
    - visitSummary: A brief 1-sentence summary of the focus.
    - documents: Array of items like insurance cards, ID, specific old test results, medication lists, etc.
    - symptoms: Array of specific details/symptoms the patient should track or mention (e.g., frequency, triggers, duration).
    - questions: Array of high-value questions to ask the doctor.
    - preparation: Array of practical prep steps (e.g., fasting, wearing loose clothes, bringing a friend).

    Maintain a supportive, clear, and professional tone. Do not provide medical advice; focus on preparation and communication.`;

    const userQuery = `Reason for visit: ${reason}`;

    const fetchWithRetry = async (retries = 0) => {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                type: "OBJECT",
                properties: {
                  visitSummary: { type: "STRING" },
                  documents: { type: "ARRAY", items: { type: "STRING" } },
                  symptoms: { type: "ARRAY", items: { type: "STRING" } },
                  questions: { type: "ARRAY", items: { type: "STRING" } },
                  preparation: { type: "ARRAY", items: { type: "STRING" } }
                },
                required: ["visitSummary", "documents", "symptoms", "questions", "preparation"]
              }
            }
          })
        });

        if (!response.ok) throw new Error('API request failed');

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error('No content received');

        return JSON.parse(text);
      } catch (err) {
        if (retries < 5) {
          const delay = Math.pow(2, retries) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchWithRetry(retries + 1);
        }
        throw err;
      }
    };

    try {
      const result = await fetchWithRetry();
      setChecklist(result);
    } catch (err) {
      setError("We encountered an issue generating your checklist. Please try again in a moment.");
    } finally {
      setLoading(false);
    }

};

const toggleItem = (category, index) => {
const key = `${category}-${index}`;
setCheckedItems(prev => ({
...prev,
[key]: !prev[key]
}));
};

const handleDownload = () => {
// 1. Try Triggering Print (for PDF)
const originalTitle = document.title;
const cleanReason = reason.trim().replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 30);
const fileName = `Medical_Report_${cleanReason || 'Checklist'}`;
document.title = fileName;

    // Some browsers block window.print in iframes. If it blocks, we fall back to text download.
    try {
      window.print();
    } catch (e) {
      console.warn("Print blocked or failed. Using text fallback.");
    }

    // 2. Generate Text Fallback (Ensures a file is actually "downloaded")
    const reportText = `

DOCTOR VISIT REPORT
Generated: ${new Date().toLocaleString()}
Reason for Visit: ${reason}

CLINICAL SUMMARY:
${checklist.visitSummary}

---

DOCUMENTATION TO BRING:
${checklist.documents.map(item => `[ ] ${item}`).join('\n')}

---

PREPARATION TASKS:
${checklist.preparation.map(item => `[ ] ${item}`).join('\n')}

---

OBSERVATIONS TO SHARE:
${checklist.symptoms.map(item => `[ ] ${item}`).join('\n')}

---

QUESTIONS FOR PROVIDER:
${checklist.questions.map(item => `[ ] ${item}`).join('\n')}

---

This report is a preparation tool and does not constitute medical advice.
`.trim();

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Restore title
    setTimeout(() => {
      document.title = originalTitle;
    }, 500);

};

const Section = ({ title, items, icon: Icon, category, colorClass }) => {
if (!items || items.length === 0) return null;
return (
<div className="mb-8 bg-slate-900 rounded-xl shadow-xl border border-slate-800 overflow-hidden print:border print:border-slate-200 print:shadow-none print:bg-white print:mb-6">
<div className={`px-5 py-3 flex items-center gap-3 ${colorClass} text-white print:text-black print:bg-slate-100 print:border-b print:border-slate-200`}>
<Icon size={20} className="print:text-slate-700" />
<h2 className="font-bold text-lg uppercase tracking-tight">{title}</h2>
</div>
<ul className="divide-y divide-slate-800 print:divide-slate-200">
{items.map((item, idx) => (
<li
key={idx}
onClick={() => toggleItem(category, idx)}
className="flex items-start gap-3 p-4 hover:bg-slate-800/50 transition-colors cursor-pointer group print:hover:bg-transparent print:p-3" >
<div className={`mt-0.5 flex-shrink-0 transition-transform print:hidden ${checkedItems[`${category}-${idx}`] ? 'text-green-400 scale-110' : 'text-slate-600 group-hover:text-slate-400'}`}>
{checkedItems[`${category}-${idx}`] ? <CheckCircle2 size={22} /> : <PlusCircle size={22} />}
</div>
<div className="hidden print:block mt-1 w-4 h-4 border border-slate-400 rounded-sm flex-shrink-0"></div>
<span className={`text-slate-300 print:text-slate-800 leading-relaxed ${checkedItems[`${category}-${idx}`] ? 'line-through opacity-30 print:opacity-100 print:no-underline' : ''}`}>
{item}
</span>
</li>
))}
</ul>
</div>
);
};

return (
<div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30 p-4 md:p-8">
<div className="max-w-3xl mx-auto">
{/_ Header _/}
<header className="text-center mb-10 print:text-left print:mb-8 print:border-b print:border-slate-200 print:pb-6">
<div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl text-white mb-4 shadow-xl shadow-blue-900/20 print:bg-slate-100 print:text-slate-900 print:shadow-none print:p-2">
<Stethoscope size={32} />
</div>
<h1 className="text-4xl font-extrabold text-white tracking-tight mb-2 print:text-slate-900 print:text-3xl">Doctor Visit Report</h1>
<p className="text-slate-400 text-lg print:text-slate-600 print:text-sm">Patient Preparation Checklist & Clinical Focus Summary</p>
<div className="hidden print:block mt-4 text-xs text-slate-400 space-y-1">
<p>Report Date: {new Date().toLocaleDateString()}</p>
<p>Reason for Consultation: <span className="text-slate-900 font-semibold">{reason}</span></p>
</div>
</header>

        {/* Input Form */}
        <div className="bg-slate-900 p-6 rounded-2xl shadow-2xl shadow-black/50 border border-slate-800 mb-8 print:hidden">
          <form onSubmit={generateChecklist} className="space-y-4">
            <div>
              <label htmlFor="reason" className="block text-sm font-semibold text-slate-300 mb-2 ml-1">
                Reason for your visit?
              </label>
              <div className="relative group">
                <input
                  id="reason"
                  type="text"
                  placeholder="e.g., Chronic migraines, pediatric checkup..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-800 border-2 border-slate-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-lg pr-12 text-white placeholder:text-slate-500"
                  required
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <ClipboardCheck size={24} />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !reason.trim()}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Building Report...
                </>
              ) : (
                <>Generate My Report</>
              )}
            </button>
          </form>
        </div>

        {/* Error Handling */}
        {error && (
          <div className="bg-red-950/30 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3 mb-8 animate-in fade-in slide-in-from-top-4">
            <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-200 font-medium">{error}</p>
          </div>
        )}

        {/* Checklist Results */}
        {checklist && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 px-1 print:hidden">
              <div className="max-w-[70%]">
                <h2 className="text-2xl font-bold text-white">Visit Preparation Guide</h2>
                <p className="text-blue-400 font-medium flex items-center gap-1">
                  <Info size={16} /> {checklist.visitSummary}
                </p>
              </div>
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-bold transition-all shadow-xl active:scale-95 group"
              >
                <FileDown size={20} className="group-hover:translate-y-0.5 transition-transform" />
                Download Report
              </button>
            </div>

            <div className="hidden print:block mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Clinical Summary</h3>
              <p className="text-slate-700 italic">{checklist.visitSummary}</p>
            </div>

            <Section
              title="Documentation to Bring"
              items={checklist.documents}
              icon={FileText}
              category="docs"
              colorClass="bg-indigo-600"
            />

            <Section
              title="Preparation Tasks"
              items={checklist.preparation}
              icon={ClipboardCheck}
              category="prep"
              colorClass="bg-blue-600"
            />

            <Section
              title="Observations to Share"
              items={checklist.symptoms}
              icon={Stethoscope}
              category="symptoms"
              colorClass="bg-emerald-600"
            />

            <Section
              title="Questions for Provider"
              items={checklist.questions}
              icon={MessageSquare}
              category="questions"
              colorClass="bg-orange-600"
            />

            <div className="mt-8 p-6 bg-blue-900/20 rounded-2xl border border-blue-800/50 print:hidden">
              <h3 className="text-blue-300 font-bold flex items-center gap-2 mb-2">
                <ChevronRight size={20} />
                Pro-Tip
              </h3>
              <p className="text-blue-100/80 leading-relaxed">
                We've triggered a Print dialog for PDF saving and a text file download for your convenience. Keep this report handy during your consultation!
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!checklist && !loading && !error && (
          <div className="text-center py-20 opacity-10 select-none grayscale pointer-events-none">
            <ClipboardCheck size={80} className="mx-auto mb-4" />
            <p className="text-xl font-medium">Ready to prep for your visit.</p>
          </div>
        )}

        {/* Print Only Footer */}
        <div className="hidden print:block mt-12 text-center border-t border-slate-200 pt-8 text-slate-400 text-[10px] uppercase tracking-widest">
          <p>This report is a preparation tool and does not constitute medical advice.</p>
          <p className="mt-1">Generated by DocPrep Report Assistant</p>
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            margin: 15mm;
          }
          body {
            background: white !important;
            color: black !important;
            padding: 0 !important;
          }
          .min-h-screen { min-height: auto !important; background: transparent !important; }
          .print-hidden { display: none !important; }
          h2, h1, p, span, li, h3 { color: black !important; }
          .max-w-3xl { max-width: 100% !important; margin: 0 !important; }
        }
      `}</style>
    </div>

);
};

export default App;
