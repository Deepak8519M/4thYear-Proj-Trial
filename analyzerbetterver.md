import React, { useState, useEffect, useRef } from 'react';
import {
Upload,
FileText,
Activity,
AlertCircle,
CheckCircle2,
Info,
Loader2,
ArrowRight,
ShieldAlert,
Search,
Printer,
ChevronRight,
Stethoscope,
BookOpen,
Image as ImageIcon
} from 'lucide-react';

// --- Configuration & Constants ---
const apiKey = "";
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";

const SYSTEM_PROMPT = `
You are a professional medical report analysis assistant. Your task is to extract data from medical test images and provide a structured JSON response.

Analyze the image and return a JSON object with this exact structure:
{
"overview": {
"patientName": "Extracted name or 'Not specified'",
"date": "Date of test",
"reportType": "e.g., Complete Blood Count, Lipid Profile"
},
"biomarkers": [
{
"name": "Biomarker name",
"value": "Value with unit",
"range": "Reference range",
"status": "Normal" | "High" | "Low",
"note": "Short explanation of what this specific marker means"
}
],
"interpretation": "A professional summary of the findings in plain language.",
"actionableSteps": ["Suggestion 1", "Suggestion 2"],
"disclaimer": "AI-generated summary for informational purposes only. Consult a physician."
}

RULES:

- Be extremely precise with numerical values and units.
- Compare values against the provided reference ranges in the image to determine status.
- If a value is missing or illegible, omit that biomarker.
- Maintain a professional and helpful tone.
  `;

const App = () => {
const [image, setImage] = useState(null);
const [base64Image, setBase64Image] = useState(null);
const [loading, setLoading] = useState(false);
const [analysis, setAnalysis] = useState(null);
const [error, setError] = useState(null);
const fileInputRef = useRef(null);
const glossaryRef = useRef(null);

const handleFileUpload = (e) => {
const file = e.target.files[0];
if (file) {
if (!file.type.startsWith('image/')) {
setError("Please upload an image file (PNG/JPG).");
return;
}
setImage(URL.createObjectURL(file));
setError(null);
setAnalysis(null);

      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result.split(',')[1];
        setBase64Image(base64Data);
      };
      reader.readAsDataURL(file);
    }

};

const analyzeReport = async () => {
if (!base64Image) return;
setLoading(true);
setError(null);

    const callApi = async (attempt = 0) => {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: "Analyze this medical report and return structured JSON according to your instructions." },
                    { inlineData: { mimeType: "image/png", data: base64Image } }
                  ]
                }
              ],
              systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
              generationConfig: {
                responseMimeType: "application/json"
              }
            }),
          }
        );

        if (!response.ok) {
          if (response.status === 429 && attempt < 5) {
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            return callApi(attempt + 1);
          }
          throw new Error(`Connection issue. Please try again.`);
        }

        const result = await response.json();
        const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!jsonText) throw new Error("Could not parse data from image.");

        const parsedData = JSON.parse(jsonText);
        setAnalysis(parsedData);
      } catch (err) {
        setError("Analysis failed. Ensure the text in the image is clear and well-lit.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    await callApi();

};

const getStatusColor = (status) => {
switch (status?.toLowerCase()) {
case 'high': return 'text-red-600 bg-red-50 border-red-100';
case 'low': return 'text-amber-600 bg-amber-50 border-amber-100';
default: return 'text-emerald-600 bg-emerald-50 border-emerald-100';
}
};

const scrollToGlossary = () => {
glossaryRef.current?.scrollIntoView({ behavior: 'smooth' });
};

return (
<div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
{/_ Header _/}
<nav className="bg-white border-b border-slate-200 sticky top-0 z-20 print:hidden">
<div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
<div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
<div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
<Activity className="w-5 h-5" />
</div>
<span>MedScan AI</span>
</div>
<div className="flex items-center gap-6 text-sm font-medium text-slate-500">
<span className="flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-emerald-500" /> HIPAA Compliant Logic</span>
<div className="h-4 w-[1px] bg-slate-200"></div>
<button className="text-indigo-600 hover:text-indigo-700 transition-colors">Help</button>
</div>
</div>
</nav>

      <main className="max-w-6xl mx-auto px-4 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left: Input & Status */}
        <div className="lg:col-span-4 space-y-6 print:hidden">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-500" />
              Upload Source
            </h2>

            <div
              onClick={() => fileInputRef.current.click()}
              className={`group border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all
                ${image ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}`}
            >
              <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} accept="image/*" />

              {image ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-200 bg-white">
                  <img src={image} alt="Preview" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white text-xs font-bold bg-white/20 backdrop-blur px-3 py-1.5 rounded-full">Replace Image</span>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">Click to upload medical report</p>
                  <p className="text-xs text-slate-400 mt-1">Accepts high-res JPG or PNG</p>
                </div>
              )}
            </div>

            {image && (
              <button
                onClick={analyzeReport}
                disabled={loading}
                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</> : <><Search className="w-5 h-5" /> Generate Report</>}
              </button>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
              <div className="text-xs text-amber-800 leading-relaxed">
                <p className="font-bold mb-1">Important Disclaimer</p>
                This analysis is performed by AI for educational purposes. It cannot replace a clinical diagnosis. Always verify findings with a qualified medical professional.
              </div>
            </div>
          </div>
        </div>

        {/* Right: Modern Structured Results */}
        <div className="lg:col-span-8 space-y-6">
          {!analysis && !loading && !error && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Stethoscope className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-slate-800 font-bold text-xl">No Analysis Active</h3>
              <p className="text-slate-500 text-sm mt-2 max-w-sm">
                Upload your laboratory test or clinical report to see a structured digital breakdown of your health metrics.
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
              <h3 className="text-slate-900 font-bold text-lg">Digitizing Report...</h3>
              <p className="text-slate-500 text-sm mt-2">We are identifying biomarkers and cross-referencing ranges.</p>
              <div className="w-64 mt-8 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 animate-[loading_1.5s_infinite]" />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-white rounded-2xl border-2 border-red-50 p-8 text-center">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-slate-800 font-bold">{error}</p>
              <button onClick={() => window.location.reload()} className="mt-4 text-indigo-600 font-bold text-sm">Refresh and try again</button>
            </div>
          )}

          {analysis && !loading && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">

              {/* Header Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-indigo-600 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white">
                  <div>
                    <h2 className="text-2xl font-bold">{analysis.overview.reportType || "Clinical Analysis"}</h2>
                    <p className="text-indigo-100 text-sm flex items-center gap-2 mt-1">
                      <FileText className="w-4 h-4" />
                      {analysis.overview.patientName} • {analysis.overview.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 print:hidden">
                    <button
                      onClick={scrollToGlossary}
                      className="bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors"
                    >
                      <BookOpen className="w-4 h-4" /> Glossary
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="bg-white hover:bg-slate-50 text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                    >
                      <Printer className="w-4 h-4" /> Print Full Report
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Laboratory Biomarkers</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="pb-3 font-bold text-slate-700 text-sm">Marker</th>
                          <th className="pb-3 font-bold text-slate-700 text-sm">Value</th>
                          <th className="pb-3 font-bold text-slate-700 text-sm">Reference Range</th>
                          <th className="pb-3 font-bold text-slate-700 text-sm text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysis.biomarkers.map((item, idx) => (
                          <React.Fragment key={idx}>
                            <tr className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                              <td className="py-4 pr-4">
                                <div className="font-semibold text-slate-900 text-sm">{item.name}</div>
                                <div className="text-[10px] text-slate-400 font-medium max-w-[200px] truncate" title={item.note}>
                                  {item.note}
                                </div>
                              </td>
                              <td className="py-4 text-sm font-mono font-bold text-slate-800">{item.value}</td>
                              <td className="py-4 text-xs font-medium text-slate-500">{item.range}</td>
                              <td className="py-4 text-center">
                                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(item.status)}`}>
                                  {item.status?.toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Interpretation Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                    <Activity className="w-4 h-4 text-indigo-500" /> Professional Interpretation
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed italic">
                    "{analysis.interpretation}"
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Actionable Next Steps
                  </h3>
                  <ul className="space-y-3">
                    {analysis.actionableSteps.map((step, idx) => (
                      <li key={idx} className="flex gap-3 text-xs text-slate-600 font-medium group">
                        <ChevronRight className="w-4 h-4 text-indigo-300 mt-0.5 group-hover:text-indigo-500 shrink-0" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Biomarker Glossary Section (The "What each mean" part) */}
              <div ref={glossaryRef} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                  <BookOpen className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-lg font-bold text-slate-800">Detailed Biomarker Reference</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {analysis.biomarkers.map((item, idx) => (
                    <div key={idx} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 hover:border-indigo-100 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-indigo-900">{item.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 bg-white border border-slate-100 rounded">REF: {item.range}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {item.note || "No additional detailed information available for this specific marker."}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Printed Image Section - Only shows when printing */}
              <div className="hidden print:block space-y-4 pt-8 border-t-2 border-dashed border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <ImageIcon className="w-5 h-5 text-slate-400" />
                  <h3 className="text-lg font-bold text-slate-700">Source Documentation</h3>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <img
                    src={image}
                    alt="Original Report Source"
                    className="w-full h-auto object-contain max-h-[1000px]"
                  />
                </div>
                <p className="text-[10px] text-slate-400 text-center italic">
                  End of digitized report. Original image included for clinician verification.
                </p>
              </div>

              {/* Bottom Disclaimer */}
              <div className="text-center px-6 py-4 print:hidden">
                <p className="text-[10px] text-slate-400 font-medium">
                  {analysis.disclaimer} • Generated by MedScan AI Platform
                </p>
              </div>

            </div>
          )}
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @media print {
          body { background: white !important; }
          main { display: block !important; padding: 0 !important; }
          .lg\\:col-span-8 { width: 100% !important; margin: 0 !important; }
          .shadow-sm { box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
          nav, .print\\:hidden { display: none !important; }
          .rounded-2xl { border-radius: 8px !important; }
          .bg-indigo-600 { background-color: #4f46e5 !important; -webkit-print-color-adjust: exact; }
          .text-white { color: white !important; }
          .grid { display: block !important; }
          .grid > div { margin-bottom: 20px !important; page-break-inside: avoid; }
          img { max-width: 100% !important; page-break-inside: avoid; }
        }
      `}} />
    </div>

);
};

export default App;
