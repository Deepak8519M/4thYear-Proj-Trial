import React, { useState, useEffect } from "react";
import {
  Activity,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Clipboard,
  Info,
  ShieldAlert,
  CheckCircle2,
  Stethoscope,
  Clock,
  ArrowRight,
  User,
  Heart,
  Search,
  RefreshCcw,
  BookOpen,
  Download,
  Loader2,
  Plus,
  X,
} from "lucide-react";

/**
 * VitalSense: AI Health Assessment System
 * Fixed: Input focus loss issue by moving sub-components outside the main component.
 */

// --- Sub-components moved outside to prevent re-mounting on every state change ---

const ProgressBar = ({ step }) => (
  <div className="w-full h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
    <div
      className="h-full bg-blue-600 transition-all duration-500 ease-out"
      style={{ width: `${(step / 4) * 100}%` }}
    />
  </div>
);

const Step0Disclaimer = ({ onNext }) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-4">
      <ShieldAlert className="text-amber-600 shrink-0 w-6 h-6" />
      <div>
        <h3 className="font-semibold text-amber-900">
          Important Medical Disclaimer
        </h3>
        <p className="text-sm text-amber-800 mt-1 leading-relaxed">
          This tool is for informational purposes only. It is{" "}
          <strong>not a medical diagnosis</strong>.
        </p>
      </div>
    </div>

    <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">
        Welcome to VitalSense AI
      </h2>
      <p className="text-slate-600 mb-8 leading-relaxed">
        Provide your symptoms to receive a structured analysis designed to help
        you communicate more effectively with your doctor.
      </p>

      <div className="space-y-4 mb-8">
        {[
          "Secure and private assessment",
          "Symptom-to-Summary analysis",
          "Lifestyle and screening recommendations",
        ].map((text, i) => (
          <div key={i} className="flex items-center gap-3 text-slate-700">
            <CheckCircle2 className="text-blue-500 w-5 h-5" />
            <span className="font-medium">{text}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onNext}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 group"
      >
        Start Assessment
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>

    <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-center">
      <p className="text-xs text-red-600 uppercase tracking-widest font-bold mb-1 text-center">
        Emergency Notice
      </p>
      <p className="text-sm text-red-800">
        If you have chest pain or trouble breathing, call 911 immediately.
      </p>
    </div>
  </div>
);

const Step1Profile = ({
  formData,
  setFormData,
  commonConditions,
  toggleMedicalHistory,
  customInput,
  setCustomInput,
  addCustomCondition,
  onNext,
  onBack,
}) => (
  <div className="animate-in fade-in duration-500">
    <h2 className="text-2xl font-bold text-slate-800 mb-2">
      Tell us about yourself
    </h2>
    <p className="text-slate-500 mb-8">
      Basic information helps tailor the assessment.
    </p>

    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Age</label>
          <input
            type="number"
            placeholder="e.g. 35"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Gender</label>
          <select
            value={formData.gender}
            onChange={(e) =>
              setFormData({ ...formData, gender: e.target.value })
            }
            className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-sm font-semibold text-slate-700">
          Medical History
        </label>
        <div className="flex flex-wrap gap-2 mb-4">
          {commonConditions.map((condition) => (
            <button
              key={condition}
              onClick={() => toggleMedicalHistory(condition)}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                formData.medicalHistory.includes(condition)
                  ? "bg-blue-600 border-blue-600 text-white shadow-md"
                  : "bg-white border-slate-200 text-slate-600 hover:border-blue-300"
              }`}
            >
              {condition}
            </button>
          ))}
        </div>

        <form onSubmit={addCustomCondition} className="flex gap-2">
          <input
            type="text"
            placeholder="Add other condition..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            className="flex-1 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
          />
          <button
            type="submit"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-3 rounded-xl transition-all"
            title="Add Condition"
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>

        {formData.medicalHistory.filter((c) => !commonConditions.includes(c))
          .length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.medicalHistory
              .filter((c) => !commonConditions.includes(c))
              .map((custom) => (
                <div
                  key={custom}
                  className="flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200"
                >
                  {custom}
                  <button
                    onClick={() => toggleMedicalHistory(custom)}
                    className="hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>

    <div className="flex gap-4 mt-12">
      <button
        onClick={onBack}
        className="flex-1 py-4 text-slate-600 font-bold rounded-xl border border-slate-200 hover:bg-slate-50"
      >
        Back
      </button>
      <button
        onClick={onNext}
        disabled={!formData.age || !formData.gender}
        className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-100"
      >
        Next
      </button>
    </div>
  </div>
);

const Step2Symptoms = ({
  formData,
  setFormData,
  durations,
  onNext,
  onBack,
}) => (
  <div className="animate-in fade-in duration-500">
    <h2 className="text-2xl font-bold text-slate-800 mb-2">
      Describe your symptoms
    </h2>
    <p className="text-slate-500 mb-6">
      Enter as much detail as possible. You can type multiple lines.
    </p>

    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">
          Symptom Details
        </label>
        <textarea
          placeholder="Describe what you are feeling, e.g., 'Sharp pain in lower back that started yesterday. It feels worse when sitting down...'"
          value={formData.symptoms}
          onChange={(e) =>
            setFormData({ ...formData, symptoms: e.target.value })
          }
          className="w-full h-48 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-y font-medium text-slate-700 leading-relaxed"
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-700">Duration</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {durations.map((d) => (
            <button
              key={d}
              onClick={() => setFormData({ ...formData, duration: d })}
              className={`py-3 px-3 text-sm font-bold rounded-xl border transition-all ${
                formData.duration === d
                  ? "bg-blue-50 border-blue-600 text-blue-700"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-400"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>

    <div className="flex gap-4 mt-12">
      <button
        onClick={onBack}
        className="flex-1 py-4 text-slate-600 font-bold rounded-xl border border-slate-200 hover:bg-slate-50"
      >
        Back
      </button>
      <button
        onClick={onNext}
        disabled={formData.symptoms.trim().length < 5}
        className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-100"
      >
        Next
      </button>
    </div>
  </div>
);

const Step3Severity = ({
  formData,
  setFormData,
  onBack,
  onAnalyze,
  isAnalyzing,
  error,
}) => (
  <div className="animate-in fade-in duration-500">
    <h2 className="text-2xl font-bold text-slate-800 mb-2">Severity Level</h2>
    <p className="text-slate-500 mb-12">
      On a scale of 1 to 10, how much is this affecting your day?
    </p>

    <div className="space-y-12 mb-12">
      <div className="relative pt-1 px-4">
        <div className="flex justify-between text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">
          <span>Mild</span>
          <span>Intense</span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={formData.severity}
          onChange={(e) =>
            setFormData({ ...formData, severity: parseInt(e.target.value) })
          }
          className="w-full h-4 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between mt-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <button
              key={n}
              onClick={() => setFormData({ ...formData, severity: n })}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-black transition-all ${
                formData.severity === n
                  ? "bg-blue-600 text-white scale-125"
                  : "text-slate-300 hover:text-slate-500"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex gap-5 items-center">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg ${
            formData.severity > 7
              ? "bg-red-500 shadow-red-100"
              : formData.severity > 4
              ? "bg-amber-500 shadow-amber-100"
              : "bg-green-500 shadow-green-100"
          }`}
        >
          {formData.severity}
        </div>
        <div>
          <h4 className="font-bold text-slate-800">
            Current Rating: {formData.severity}/10
          </h4>
          <p className="text-sm text-slate-500 leading-relaxed">
            {formData.severity > 7
              ? "High impact. Urgent consultation recommended if persistent."
              : "Moderate impact. Monitor closely over the next 48 hours."}
          </p>
        </div>
      </div>
    </div>

    {error && (
      <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 flex items-center gap-3">
        <AlertCircle className="w-5 h-5" />
        {error}
      </div>
    )}

    <div className="flex gap-4 mt-8">
      <button
        onClick={onBack}
        className="flex-1 py-4 text-slate-600 font-bold rounded-xl border border-slate-200 hover:bg-slate-50"
      >
        Back
      </button>
      <button
        onClick={onAnalyze}
        disabled={isAnalyzing}
        className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating Analysis...
          </>
        ) : (
          "Generate Health Summary"
        )}
      </button>
    </div>
  </div>
);

const ResultsDashboard = ({ result, onRestart, onDownload, isDownloading }) => (
  <div className="animate-in fade-in zoom-in-95 duration-700 pb-10">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          Health Analysis Summary
        </h2>
        <p className="text-slate-500 text-sm font-medium">
          VitalSense AI Report • {new Date().toLocaleDateString()}
        </p>
      </div>
      <div
        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest self-start ${
          result.riskLevel === "High"
            ? "bg-red-100 text-red-600"
            : result.riskLevel === "Moderate"
            ? "bg-amber-100 text-amber-600"
            : "bg-blue-100 text-blue-600"
        }`}
      >
        Risk Level: {result.riskLevel}
      </div>
    </div>

    <div className="grid gap-6">
      <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="text-blue-600 w-5 h-5" />
          <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">
            Medical Context Overview
          </h3>
        </div>
        <p className="text-slate-700 leading-relaxed font-medium italic border-l-4 border-blue-500 pl-6">
          "{result.summary}"
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
          <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5" /> Lifestyle Advice
          </h4>
          <ul className="space-y-3">
            {result.lifestyleAdvice.map((item, idx) => (
              <li
                key={idx}
                className="text-sm font-medium text-blue-800 flex gap-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
          <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
            <Stethoscope className="w-5 h-5" /> Suggested Screening
          </h4>
          <ul className="space-y-3">
            {result.medicalTests.map((item, idx) => (
              <li
                key={idx}
                className="text-sm font-medium text-indigo-800 flex gap-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
        <h4 className="font-bold text-slate-800 mb-4 text-xs uppercase tracking-widest">
          Key Areas for Clinical Discussion
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {result.concerns.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-4 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 flex items-center gap-3 shadow-sm"
            >
              <Search className="w-4 h-4 text-blue-500" />
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-slate-900 text-white rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
            <BookOpen className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="font-bold">Clinical Communication Aid</p>
            <p className="text-xs text-slate-400">
              Save this summary to share with your provider.
            </p>
          </div>
        </div>
        <button
          onClick={onDownload}
          disabled={isDownloading}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
        >
          {isDownloading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {isDownloading ? "Generating..." : "Download Report"}
        </button>
      </div>

      <button
        onClick={onRestart}
        className="text-slate-400 hover:text-slate-700 text-sm font-bold mx-auto flex items-center gap-2 mt-6 transition-colors"
      >
        <RefreshCcw className="w-4 h-4" />
        Start New Assessment
      </button>
    </div>
  </div>
);

// --- Main App Component ---

const VitalSense = () => {
  const [step, setStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const [customInput, setCustomInput] = useState("");

  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    symptoms: "",
    duration: "1-3 days",
    severity: 5,
    medicalHistory: [],
  });

  const apiKey = ""; // Environment provided key

  const commonConditions = [
    "Diabetes",
    "Hypertension",
    "Asthma",
    "High Cholesterol",
    "Heart Disease",
  ];

  const durations = [
    "Less than 24h",
    "1-3 days",
    "1 week",
    "2+ weeks",
    "Chronic",
  ];

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  const toggleMedicalHistory = (item) => {
    setFormData((prev) => ({
      ...prev,
      medicalHistory: prev.medicalHistory.includes(item)
        ? prev.medicalHistory.filter((i) => i !== item)
        : [...prev.medicalHistory, item],
    }));
  };

  const addCustomCondition = (e) => {
    if (e) e.preventDefault();
    const trimmed = customInput.trim();
    if (trimmed && !formData.medicalHistory.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        medicalHistory: [...prev.medicalHistory, trimmed],
      }));
      setCustomInput("");
    }
  };

  const analyzeHealth = async () => {
    setIsAnalyzing(true);
    setError(null);

    const systemPrompt = `You are a professional AI Health Assistant. Analyze user symptoms and provide a structured JSON response. 
    IMPORTANT: You are NOT a doctor. Do NOT provide diagnoses or prescriptions. Provide awareness and guidance.
    
    Response Schema:
    {
      "summary": "Professional overview of reported symptoms",
      "riskLevel": "Low | Moderate | High",
      "concerns": ["Area 1", "Area 2"],
      "lifestyleAdvice": ["Advice 1", "Advice 2"],
      "medicalTests": ["Suggested test 1", "Suggested test 2"]
    }`;

    const userQuery = `
      User Profile: ${formData.age} year old ${formData.gender}.
      Symptoms: ${formData.symptoms}
      Duration: ${formData.duration}
      Reported Severity: ${formData.severity}/10
      Medical History: ${formData.medicalHistory.join(", ") || "None reported"}
    `;

    const fetchWithRetry = async (retries = 5, delay = 1000) => {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: userQuery }] }],
              systemInstruction: { parts: [{ text: systemPrompt }] },
              generationConfig: {
                responseMimeType: "application/json",
              },
            }),
          }
        );

        if (!response.ok) throw new Error("API Error");
        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        return JSON.parse(textResponse);
      } catch (err) {
        if (retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          return fetchWithRetry(retries - 1, delay * 2);
        }
        throw err;
      }
    };

    try {
      const aiResponse = await fetchWithRetry();
      setResult(aiResponse);
      setStep(4);
    } catch (err) {
      setError(
        "We encountered an issue analyzing your symptoms. Please check your connection and try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadReport = () => {
    setIsDownloading(true);
    try {
      const reportContent = `
VITALSENSE HEALTH ASSESSMENT REPORT
Generated on: ${new Date().toLocaleString()}
-------------------------------------------
USER PROFILE:
Age: ${formData.age}
Gender: ${formData.gender}
Medical History: ${formData.medicalHistory.join(", ") || "None"}

SYMPTOMS:
Description: ${formData.symptoms}
Duration: ${formData.duration}
Severity Score: ${formData.severity}/10

AI ANALYSIS:
Risk Level: ${result.riskLevel}
Summary: ${result.summary}

POTENTIAL CONCERNS:
${result.concerns.map((c) => `- ${c}`).join("\n")}

LIFESTYLE ADVICE:
${result.lifestyleAdvice.map((a) => `- ${a}`).join("\n")}

RECOMMENDED TESTS TO DISCUSS WITH DOCTOR:
${result.medicalTests.map((t) => `- ${t}`).join("\n")}

-------------------------------------------
DISCLAIMER: This report is generated by AI for informational purposes only.
It is NOT a medical diagnosis. Please consult a healthcare professional.
      `;

      const blob = new Blob([reportContent], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `VitalSense_Report_${formData.age}_${formData.gender}.txt`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed", err);
    } finally {
      setTimeout(() => setIsDownloading(false), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-8 font-sans antialiased text-slate-900">
      <div className="max-w-2xl mx-auto pt-6 pb-20">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-100 ring-4 ring-blue-50">
            <Activity className="text-white w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
              VitalSense
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-[10px] uppercase tracking-[0.25em] font-black text-blue-600">
                AI Health Assessment Core
              </p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <main className="relative">
          {step > 0 && step < 4 && <ProgressBar step={step} />}

          <div className="relative">
            {step === 0 && <Step0Disclaimer onNext={handleNext} />}

            {step === 1 && (
              <Step1Profile
                formData={formData}
                setFormData={setFormData}
                commonConditions={commonConditions}
                toggleMedicalHistory={toggleMedicalHistory}
                customInput={customInput}
                setCustomInput={setCustomInput}
                addCustomCondition={addCustomCondition}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {step === 2 && (
              <Step2Symptoms
                formData={formData}
                setFormData={setFormData}
                durations={durations}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {step === 3 && (
              <Step3Severity
                formData={formData}
                setFormData={setFormData}
                onBack={handleBack}
                onAnalyze={analyzeHealth}
                isAnalyzing={isAnalyzing}
                error={error}
              />
            )}

            {step === 4 && result && (
              <ResultsDashboard
                result={result}
                onRestart={() => {
                  setStep(0);
                  setResult(null);
                }}
                onDownload={downloadReport}
                isDownloading={isDownloading}
              />
            )}
          </div>
        </main>

        {/* Global Footer */}
        {step < 4 && (
          <footer className="mt-16 pt-8 border-t border-slate-200">
            <div className="flex items-center gap-5 text-slate-400">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
                <div className="w-10 h-10 rounded-full border-4 border-white bg-blue-600 flex items-center justify-center text-white font-black text-[10px] shadow-lg">
                  AI
                </div>
              </div>
              <p className="text-[11px] font-medium leading-relaxed uppercase tracking-wider">
                Processed via secure AI node. <br />
                VitalSense does not store PII data.
              </p>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};

export default VitalSense;
