import React, { useState, useMemo } from "react";
import {
  Search,
  Info,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Activity,
  CheckCircle2,
  XCircle,
  RefreshCw,
  BookOpen,
  Layers,
  Sparkles,
  HelpCircle,
} from "lucide-react";

// --- Mock Data ---
const CONDITIONS = [
  {
    id: "cold",
    name: "Common Cold",
    description:
      "A viral infection of your nose and throat. Usually harmless, though it might not feel that way.",
    symptoms: [
      "Cough",
      "Sore Throat",
      "Runny Nose",
      "Congestion",
      "Sneezing",
      "Mild Fatigue",
    ],
    typicalDuration: "7-10 days",
    severity: "Low",
  },
  {
    id: "flu",
    name: "Influenza (Flu)",
    description:
      "A common viral infection that can be deadly, especially in high-risk groups.",
    symptoms: [
      "Fever",
      "Cough",
      "Sore Throat",
      "Muscle Aches",
      "Fatigue",
      "Headache",
      "Chills",
    ],
    typicalDuration: "1-2 weeks",
    severity: "Moderate to High",
  },
  {
    id: "covid",
    name: "COVID-19",
    description: "A respiratory illness caused by the SARS-CoV-2 virus.",
    symptoms: [
      "Fever",
      "Cough",
      "Fatigue",
      "Loss of Taste/Smell",
      "Shortness of Breath",
      "Muscle Aches",
      "Headache",
    ],
    typicalDuration: "Varies widely",
    severity: "Varies",
  },
  {
    id: "allergies",
    name: "Seasonal Allergies",
    description: "Immune system reaction to pollen, dust, or other allergens.",
    symptoms: [
      "Runny Nose",
      "Sneezing",
      "Itchy Eyes",
      "Congestion",
      "Watery Eyes",
    ],
    typicalDuration: "Weeks/Months (Seasonal)",
    severity: "Low",
  },
  {
    id: "strep",
    name: "Strep Throat",
    description:
      "A bacterial infection that can make your throat feel sore and scratchy.",
    symptoms: [
      "Sore Throat",
      "Fever",
      "Swollen Lymph Nodes",
      "Headache",
      "Painful Swallowing",
    ],
    typicalDuration: "3-7 days with treatment",
    severity: "Moderate",
  },
  {
    id: "bronchitis",
    name: "Acute Bronchitis",
    description:
      "Inflammation of the lining of your bronchial tubes, which carry air to and from your lungs.",
    symptoms: [
      "Cough",
      "Mucus Production",
      "Fatigue",
      "Shortness of Breath",
      "Chest Discomfort",
    ],
    typicalDuration: "10-14 days",
    severity: "Moderate",
  },
];

const ALL_SYMPTOMS = Array.from(
  new Set(CONDITIONS.flatMap((c) => c.symptoms))
).sort();

const App = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'matrix'
  const [expandedCondition, setExpandedCondition] = useState(null);

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const filteredSymptoms = ALL_SYMPTOMS.filter((s) =>
    s.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const rankedConditions = useMemo(() => {
    return CONDITIONS.map((condition) => {
      const matches = condition.symptoms.filter((s) =>
        selectedSymptoms.includes(s)
      );
      const score = matches.length;
      const percentage =
        selectedSymptoms.length > 0
          ? Math.round((score / selectedSymptoms.length) * 100)
          : 0;

      return { ...condition, score, percentage, matchedSymptoms: matches };
    }).sort((a, b) => b.score - a.score || b.percentage - a.percentage);
  }, [selectedSymptoms]);

  // Insight Logic: Find which conditions share the most of the selected symptoms
  const overlapInsights = useMemo(() => {
    if (selectedSymptoms.length < 1) return null;
    const topMatches = rankedConditions.filter((c) => c.score > 0);
    if (topMatches.length === 0)
      return "No conditions in our database match these specific symptoms.";
    if (topMatches.length === 1)
      return `Only the ${topMatches[0].name} typically matches this specific selection.`;

    return `Your selected symptoms are common across ${topMatches.length} different conditions. This highlights how easily certain illnesses can be mistaken for one another.`;
  }, [selectedSymptoms, rankedConditions]);

  const clearSymptoms = () => {
    setSelectedSymptoms([]);
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      {/* Header & Disclaimer */}
      <header className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
              <Activity className="text-blue-600" />
              Symptom Overlap Visualizer
            </h1>
            <p className="text-slate-500 mt-1">
              An educational tool to visualize health condition intersections.
            </p>
          </div>
          <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm self-start">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Comparison Cards
            </button>
            <button
              onClick={() => setViewMode("matrix")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                viewMode === "matrix"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              The Full Matrix
            </button>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="text-amber-600 shrink-0 mt-0.5"
              size={20}
            />
            <div>
              <p className="font-bold text-amber-900 text-sm italic underline mb-1">
                NOT A MEDICAL DIAGNOSTIC TOOL
              </p>
              <p className="text-amber-800 text-xs leading-relaxed">
                This is for educational visualization only. Many serious
                conditions share symptoms with minor ones. If you are feeling
                unwell, please consult a qualified healthcare professional.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Symptom Selection */}
        <section className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-slate-700">
                <Search size={18} className="text-blue-500" />
                Step 1: Select Symptoms
              </h2>
              {selectedSymptoms.length > 0 && (
                <button
                  onClick={clearSymptoms}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded"
                >
                  <RefreshCw size={12} /> Reset
                </button>
              )}
            </div>

            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Type to filter symptoms..."
                className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex flex-wrap gap-2">
                {filteredSymptoms.map((symptom) => (
                  <button
                    key={symptom}
                    onClick={() => toggleSymptom(symptom)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 transform active:scale-95 ${
                      selectedSymptoms.includes(symptom)
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg -translate-y-0.5"
                        : "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                Your Selection
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedSymptoms.length === 0 ? (
                  <div className="flex items-center gap-2 text-slate-400 py-2">
                    <HelpCircle size={16} />
                    <span className="text-sm italic">Nothing selected yet</span>
                  </div>
                ) : (
                  selectedSymptoms.map((s) => (
                    <span
                      key={s}
                      className="pl-3 pr-1 py-1 bg-blue-50 text-blue-700 rounded-lg flex items-center gap-1 text-xs font-bold border border-blue-100"
                    >
                      {s}
                      <button
                        onClick={() => toggleSymptom(s)}
                        className="p-1 hover:bg-blue-200 rounded-md transition-colors text-blue-400 hover:text-blue-600"
                      >
                        <XCircle size={14} />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Visualization */}
        <section className="lg:col-span-8 space-y-6">
          {/* Dynamic Insight Banner */}
          {selectedSymptoms.length > 0 && (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles size={20} className="text-blue-200" />
                <h3 className="font-bold text-lg">Visualizer Insights</h3>
              </div>
              <p className="text-blue-50 leading-relaxed text-sm">
                {overlapInsights}
              </p>
            </div>
          )}

          {viewMode === "grid" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="font-bold text-slate-700 flex items-center gap-2">
                  <Layers size={18} className="text-slate-400" />
                  Step 2: Compare Overlaps
                </h2>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-200 px-2 py-1 rounded">
                  Match Accuracy: High
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rankedConditions.map((condition) => {
                  const hasMatch = condition.score > 0;
                  return (
                    <div
                      key={condition.id}
                      className={`bg-white border-2 rounded-2xl overflow-hidden transition-all duration-300 transform ${
                        hasMatch
                          ? "border-blue-500 shadow-xl opacity-100"
                          : "border-slate-100 opacity-40 scale-[0.98]"
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="max-w-[70%]">
                            <h3 className="font-black text-xl text-slate-800 leading-tight">
                              {condition.name}
                            </h3>
                            <span
                              className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${
                                condition.severity === "Low"
                                  ? "bg-green-100 text-green-700"
                                  : condition.severity === "Moderate"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-rose-100 text-rose-700"
                              }`}
                            >
                              {condition.severity} Severity
                            </span>
                          </div>
                          {hasMatch && (
                            <div className="flex flex-col items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl border border-blue-100">
                              <div className="text-xl font-black text-blue-600 leading-none">
                                {condition.percentage}%
                              </div>
                              <div className="text-[9px] font-bold text-blue-400 uppercase mt-1">
                                Match
                              </div>
                            </div>
                          )}
                        </div>

                        <p className="text-sm text-slate-500 mb-6 leading-relaxed line-clamp-3 italic">
                          "{condition.description}"
                        </p>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                              Shared Symptoms ({condition.score})
                            </span>
                            <span className="h-[1px] flex-grow mx-4 bg-slate-100"></span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {condition.symptoms.map((s) => {
                              const isMatch = selectedSymptoms.includes(s);
                              return (
                                <span
                                  key={s}
                                  className={`text-[11px] px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 border transition-all ${
                                    isMatch
                                      ? "bg-blue-600 border-blue-600 text-white font-bold shadow-sm"
                                      : "bg-slate-50 border-slate-100 text-slate-400"
                                  }`}
                                >
                                  {isMatch ? (
                                    <CheckCircle2 size={12} />
                                  ) : (
                                    <div className="w-3" />
                                  )}
                                  {s}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          setExpandedCondition(
                            expandedCondition === condition.id
                              ? null
                              : condition.id
                          )
                        }
                        className={`w-full px-6 py-4 border-t flex items-center justify-between text-xs font-black uppercase tracking-widest transition-colors ${
                          expandedCondition === condition.id
                            ? "bg-slate-800 text-white"
                            : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        <span>Deep Dive: Duration & Details</span>
                        {expandedCondition === condition.id ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </button>

                      {expandedCondition === condition.id && (
                        <div className="p-6 bg-slate-100 border-t border-slate-200 animate-in slide-in-from-top-4 duration-300">
                          <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                              <span className="block text-[10px] font-bold text-slate-400 uppercase mb-2">
                                Recovery Window
                              </span>
                              <span className="text-sm text-slate-800 font-bold">
                                {condition.typicalDuration}
                              </span>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                              <span className="block text-[10px] font-bold text-slate-400 uppercase mb-2">
                                Distinguishing Marker
                              </span>
                              <span className="text-xs text-blue-600 font-bold leading-tight">
                                {condition.id === "covid"
                                  ? "Loss of Taste/Smell is highly specific."
                                  : condition.id === "allergies"
                                  ? "Itchy eyes are rare in viruses."
                                  : condition.id === "flu"
                                  ? "Sudden, high fever onset is typical."
                                  : "Varies per individual."}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Matrix View */
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl overflow-x-auto animate-in fade-in duration-500">
              <div className="mb-8">
                <h2 className="text-xl font-black text-slate-800">
                  The Overlap Matrix
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  A clinical view of how symptoms map across potential
                  conditions.
                </p>
              </div>

              <table className="w-full border-separate border-spacing-y-1">
                <thead>
                  <tr>
                    <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100 min-w-[160px]">
                      Condition Attribute
                    </th>
                    {CONDITIONS.map((c) => (
                      <th
                        key={c.id}
                        className="p-4 text-center text-[10px] font-black text-slate-600 uppercase tracking-tighter border-b-2 border-slate-100 min-w-[110px]"
                      >
                        <div className="bg-slate-50 py-2 rounded-lg border border-slate-100">
                          {c.name}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ALL_SYMPTOMS.map((symptom) => {
                    const isSelected = selectedSymptoms.includes(symptom);
                    return (
                      <tr
                        key={symptom}
                        className={`group transition-all ${
                          isSelected ? "scale-[1.01] z-10" : ""
                        }`}
                      >
                        <td
                          className={`p-4 text-sm rounded-l-xl transition-all border-y border-l ${
                            isSelected
                              ? "bg-blue-600 text-white font-bold border-blue-600 shadow-md"
                              : "bg-white text-slate-600 border-slate-50 group-hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isSelected && (
                              <Sparkles size={12} className="text-blue-200" />
                            )}
                            {symptom}
                          </div>
                        </td>
                        {CONDITIONS.map((condition, idx) => {
                          const hasSymptom =
                            condition.symptoms.includes(symptom);
                          const isLast = idx === CONDITIONS.length - 1;
                          return (
                            <td
                              key={condition.id}
                              className={`p-4 text-center transition-all border-y ${
                                isLast ? "rounded-r-xl border-r" : ""
                              } ${
                                isSelected
                                  ? "bg-blue-50 border-blue-100"
                                  : "bg-white border-slate-50 group-hover:bg-slate-50"
                              }`}
                            >
                              {hasSymptom ? (
                                <div
                                  className={`inline-flex items-center justify-center w-8 h-8 rounded-xl transition-all ${
                                    isSelected
                                      ? "bg-blue-600 text-white scale-110 shadow-lg"
                                      : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                                  }`}
                                >
                                  <CheckCircle2 size={16} />
                                </div>
                              ) : (
                                <span className="text-slate-100 font-black text-lg">
                                  ·
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <span className="block text-xs font-black text-blue-800 uppercase tracking-widest">
                      Active Intersection
                    </span>
                    <span className="text-xs text-blue-600">
                      This condition shares a symptom you selected.
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center text-slate-400">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <span className="block text-xs font-black text-slate-600 uppercase tracking-widest">
                      General Trait
                    </span>
                    <span className="text-xs text-slate-400">
                      Common in this condition, but not in your search.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedSymptoms.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 px-8 text-center bg-white rounded-3xl border-4 border-dashed border-slate-200 mt-4 transition-all hover:border-blue-200">
              <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6 text-blue-500 animate-pulse">
                <Activity size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-700 mb-2">
                Start the Visualization
              </h3>
              <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
                Click on symptoms in the sidebar (like "Cough" or "Fever") to
                see how they intersect across common health conditions.
              </p>
              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => toggleSymptom("Cough")}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-600 transition-colors"
                >
                  Try "Cough"
                </button>
                <button
                  onClick={() => toggleSymptom("Fever")}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-600 transition-colors"
                >
                  Try "Fever"
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="max-w-6xl mx-auto mt-16 pt-10 border-t border-slate-200 text-center pb-20">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-white px-6 py-2 rounded-full border border-slate-200 shadow-sm flex items-center gap-2 text-slate-500 text-xs font-medium">
            <BookOpen size={14} className="text-blue-500" />
            <span>Source: General Clinical Symptom Data (Mock Database)</span>
          </div>
          <div className="text-[11px] text-slate-400 uppercase tracking-[0.2em] font-black">
            Empowering Health Literacy Through Data Visualization
          </div>
        </div>
      </footer>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `,
        }}
      />
    </div>
  );
};

export default App;
