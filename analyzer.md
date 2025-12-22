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
Search
} from 'lucide-react';

// --- Configuration & Constants ---
const apiKey = ""; // Provided by environment
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";

const SYSTEM_PROMPT = `
You are a medical report analysis assistant. Your task is to extract data from medical test images (blood tests, lab reports, etc.) and provide a structured, easy-to-understand summary.

Your response MUST follow this structure:

1. **Report Overview**: Patient info (if visible, sanitized), date, and type of test.
2. **Key Findings**: List specific biomarkers or values that are outside of reference ranges.
3. **General Interpretation**: Explain what these markers typically indicate in plain language.
4. **Actionable Suggestions**: Suggest lifestyle changes or specific questions the user should ask their doctor.

IMPORTANT RULES:

- ALWAYS include a prominent medical disclaimer stating you are an AI, not a doctor.
- Do NOT provide a definitive diagnosis (e.g., say "Values may suggest anemia" instead of "You have anemia").
- If values are normal, emphasize that.
- Use clear, professional, and empathetic tone.
  `;

const App = () => {
const [image, setImage] = useState(null);
const [base64Image, setBase64Image] = useState(null);
const [loading, setLoading] = useState(false);
const [analysis, setAnalysis] = useState(null);
const [error, setError] = useState(null);
const fileInputRef = useRef(null);

// Handle File Upload & Conversion to Base64
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

// API Call with Exponential Backoff
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
                    { text: "Please analyze this medical report image. Extract the key data points and provide a summary as per your instructions." },
                    { inlineData: { mimeType: "image/png", data: base64Image } }
                  ]
                }
              ],
              systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }
            }),
          }
        );

        if (!response.ok) {
          if (response.status === 429 && attempt < 5) {
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            return callApi(attempt + 1);
          }
          throw new Error(`API Error: ${response.statusText}`);
        }

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) throw new Error("Could not extract analysis from response.");

        setAnalysis(text);
      } catch (err) {
        setError("Failed to analyze the report. Please ensure the image is clear and try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    await callApi();

};

return (
<div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
{/_ Header _/}
<nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
<div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
<div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
<Activity className="w-6 h-6" />
<span>MedScan AI</span>
</div>
<div className="flex items-center gap-4 text-sm font-medium text-slate-500">
<span className="hidden sm:inline">Secure & Private Analysis</span>
<ShieldAlert className="w-5 h-5 text-orange-400" />
</div>
</div>
</nav>

      <main className="max-w-5xl mx-auto px-4 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Upload & Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-500" />
              Upload Report
            </h2>

            <div
              onClick={() => fileInputRef.current.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all
                ${image ? 'border-blue-200 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}`}
            >
              <input
                type="file"
                hidden
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
              />

              {image ? (
                <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden border border-slate-200">
                  <img src={image} alt="Preview" className="w-full h-full object-contain bg-white" />
                  <div className="absolute inset-0 bg-black/5 flex items-end p-3 opacity-0 hover:opacity-100 transition-opacity">
                    <button className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm">
                      Change Image
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                    <FileText className="w-6 h-6" />
                  </div>
                  <p className="text-sm text-slate-600 text-center font-medium">Click to upload or drag & drop</p>
                  <p className="text-xs text-slate-400 mt-1">Supports PNG, JPG (Max 5MB)</p>
                </>
              )}
            </div>

            {image && (
              <button
                onClick={analyzeReport}
                disabled={loading}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing Data...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Extract & Analyze
                  </>
                )}
              </button>
            )}
          </div>

          {/* Disclaimer Card */}
          <div className="bg-orange-50 border border-orange-100 p-5 rounded-2xl">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-orange-900 mb-1">Medical Disclaimer</h3>
                <p className="text-xs text-orange-800 leading-relaxed">
                  This tool uses AI to summarize text from images. It is not a medical professional.
                  Predictions are probabilistic and should only be used to facilitate discussions with your doctor.
                  Do not make health decisions based solely on this summary.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-7 space-y-6">
          {!analysis && !loading && !error && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-slate-100/50 rounded-2xl border-2 border-dashed border-slate-200">
              <Activity className="w-12 h-12 text-slate-300 mb-4" />
              <h3 className="text-slate-500 font-medium">Ready for Analysis</h3>
              <p className="text-slate-400 text-sm mt-2 max-w-xs">
                Upload a lab report or test result on the left to generate an automated medical summary.
              </p>
            </div>
          )}

          {loading && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
              <div className="relative mb-6">
                <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <Activity className="absolute inset-0 m-auto w-6 h-6 text-blue-600 animate-pulse" />
              </div>
              <h3 className="text-slate-900 font-semibold text-lg">Processing Your Report</h3>
              <p className="text-slate-500 text-sm mt-2 max-w-xs">
                Extracting biomarkers and comparing values against standard reference ranges...
              </p>

              <div className="w-full max-w-sm mt-8 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-400/30 animate-[loading_2s_infinite]"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 p-8 rounded-2xl text-center">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-red-900 font-bold mb-2">Analysis Failed</h3>
              <p className="text-red-800 text-sm mb-6">{error}</p>
              <button
                onClick={analyzeReport}
                className="bg-white border border-red-200 text-red-600 px-6 py-2 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {analysis && !loading && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Analysis Summary</h2>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Info className="w-3 h-3" /> Generated by Gemini 2.5 Flash
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Status</span>
                  <span className="text-xs font-bold text-green-600 px-2 py-1 bg-green-50 rounded-md">COMPLETED</span>
                </div>
              </div>

              <div className="prose prose-slate max-w-none">
                {analysis.split('\n').map((line, i) => {
                  if (line.trim().startsWith('###')) {
                    return <h3 key={i} className="text-lg font-bold text-slate-800 mt-6 mb-3 first:mt-0">{line.replace('###', '').trim()}</h3>;
                  }
                  if (line.trim().startsWith('**')) {
                    return <p key={i} className="my-2"><strong className="text-blue-700">{line.replace(/\*\*/g, '')}</strong></p>;
                  }
                  if (line.trim().startsWith('-')) {
                    return (
                      <div key={i} className="flex gap-3 my-2 group">
                        <ArrowRight className="w-4 h-4 text-blue-400 mt-1 shrink-0 group-hover:translate-x-1 transition-transform" />
                        <p className="text-slate-600 text-sm m-0 leading-relaxed">{line.replace('-', '').trim()}</p>
                      </div>
                    );
                  }
                  return line.trim() ? <p key={i} className="text-slate-600 text-sm leading-relaxed mb-4">{line}</p> : <br key={i} />;
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[10px] text-slate-400 italic">This session will not be saved. Download your results if needed.</p>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 px-4 py-2 bg-blue-50 rounded-lg transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Save as PDF
                </button>
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
      `}} />
    </div>

);
};

export default App;
