import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  FileText, 
  FlaskConical, 
  Activity, 
  Search, 
  Calendar, 
  Filter, 
  Upload, 
  X, 
  ChevronRight, 
  Clock, 
  Stethoscope,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Maximize2,
  Image as ImageIcon
} from 'lucide-react';

// --- Configuration ---
const apiKey = ""; // Provided by environment
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent";

const CATEGORIES = {
  ALL: 'All',
  PRESCRIPTION: 'Prescription',
  LAB_REPORT: 'Lab Report',
  SCAN: 'Scan',
  OTHER: 'Other'
};

const CATEGORY_COLORS = {
  [CATEGORIES.PRESCRIPTION]: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  [CATEGORIES.LAB_REPORT]: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  [CATEGORIES.SCAN]: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  [CATEGORIES.OTHER]: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

// Icon Mapping Helper
const CategoryIcon = ({ category, size = 18, className = "" }) => {
  switch (category) {
    case CATEGORIES.PRESCRIPTION: return <Stethoscope size={size} className={className} />;
    case CATEGORIES.LAB_REPORT: return <FlaskConical size={size} className={className} />;
    case CATEGORIES.SCAN: return <Activity size={size} className={className} />;
    default: return <FileText size={size} className={className} />;
  }
};

export default function App() {
  const [documents, setDocuments] = useState([
    {
      id: '1',
      title: 'Blood Work Results',
      category: CATEGORIES.LAB_REPORT,
      date: '2023-11-15',
      provider: 'City General Hospital',
      summary: 'Complete blood count within normal ranges except for slightly low Vitamin D.',
      fileName: 'blood_report_nov.pdf',
      thumbnail: null
    },
    {
      id: '2',
      title: 'Amoxicillin Prescription',
      category: CATEGORIES.PRESCRIPTION,
      date: '2023-12-01',
      provider: 'Dr. Sarah Jenkins',
      summary: 'Course of antibiotics for sinus infection. 500mg twice daily.',
      fileName: 'rx_10293.jpg',
      thumbnail: null
    }
  ]);

  const [filter, setFilter] = useState(CATEGORIES.ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'idle', 'success', 'error', 'verifying'
  const [pendingDoc, setPendingDoc] = useState(null);
  const [viewerDoc, setViewerDoc] = useState(null); // State for the image viewer

  // Filtered and sorted documents
  const filteredDocs = useMemo(() => {
    return documents
      .filter(doc => (filter === CATEGORIES.ALL || doc.category === filter))
      .filter(doc => 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        doc.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.summary.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [documents, filter, searchQuery]);

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUpload = async (file) => {
    setIsAnalyzing(true);
    setUploadStatus(null);

    try {
      const base64Data = await fileToBase64(file);
      const pureBase64 = base64Data.split(',')[1];
      const mimeType = file.type;

      const prompt = `Analyze this medical document. Precisely identify: 
      1. Document Category (exactly one of: Prescription, Lab Report, Scan, or Other)
      2. Document Date (CRITICAL: Look for the date the report was issued or signed. Format as YYYY-MM-DD. If no date is visible, use the current date ${new Date().toISOString().split('T')[0]})
      3. Provider Name (The hospital, clinic, or doctor)
      4. A 1-sentence summary of results.
      5. A descriptive title.
      
      Return ONLY a JSON object with keys: category, date, provider, summary, title.`;

      const response = await fetch(`${API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inlineData: { mimeType: mimeType.includes('pdf') ? 'application/pdf' : mimeType, data: pureBase64 } }
            ]
          }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (!response.ok) throw new Error('Analysis failed');
      
      const result = await response.json();
      const analysis = JSON.parse(result.candidates[0].content.parts[0].text);

      setPendingDoc({
        id: Date.now().toString(),
        title: analysis.title || file.name,
        category: Object.values(CATEGORIES).includes(analysis.category) ? analysis.category : CATEGORIES.OTHER,
        date: analysis.date || new Date().toISOString().split('T')[0],
        provider: analysis.provider || 'Unknown Provider',
        summary: analysis.summary || '',
        fileName: file.name,
        thumbnail: mimeType.startsWith('image/') ? base64Data : null
      });
      
      setUploadStatus('verifying');
    } catch (error) {
      console.error(error);
      setUploadStatus('error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const finalizeDocument = () => {
    setDocuments(prev => [pendingDoc, ...prev]);
    setUploadStatus('success');
    setTimeout(() => {
      setIsUploadModalOpen(false);
      setUploadStatus(null);
      setPendingDoc(null);
    }, 1200);
  };

  const deleteDocument = (id) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/20">
              <Activity size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">HealthVault</h1>
          </div>

          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text"
                placeholder="Search records..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border-slate-700 focus:bg-slate-900 border focus:border-blue-500/50 rounded-2xl outline-none text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-2xl font-semibold shadow-lg shadow-blue-600/20"
          >
            <Plus size={18} />
            <span>Upload Record</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-3 space-y-6">
          <section className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Filters</h3>
            <nav className="flex flex-col gap-1">
              {Object.values(CATEGORIES).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                    filter === cat ? 'bg-blue-500/10 text-blue-400 font-bold' : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {cat === CATEGORIES.ALL ? <Filter size={18} /> : <CategoryIcon category={cat} size={18} />}
                    <span className="text-sm">{cat}</span>
                  </div>
                </button>
              ))}
            </nav>
          </section>

          <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl border border-slate-800 relative overflow-hidden group">
            <div className="relative z-10 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-blue-400">
                <CheckCircle2 size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Privacy Enabled</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                Analysis results are displayed for your verification before being stored in your timeline.
              </p>
            </div>
          </div>
        </aside>

        {/* Timeline */}
        <div className="lg:col-span-9">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <Clock size={24} className="text-blue-500" />
              Timeline History
            </h2>
          </div>

          {filteredDocs.length === 0 ? (
            <div className="bg-slate-900 border-2 border-dashed border-slate-800 rounded-[2rem] p-16 text-center">
              <FileText className="text-slate-700 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-bold text-slate-300">No records found</h3>
            </div>
          ) : (
            <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-[11px] before:top-4 before:bottom-4 before:w-[2px] before:bg-slate-800">
              {filteredDocs.map((doc) => (
                <div key={doc.id} className="relative group">
                  <div className={`absolute -left-[35px] top-6 w-4 h-4 rounded-full border-4 border-slate-950 z-10 ${
                    doc.category === CATEGORIES.PRESCRIPTION ? 'bg-blue-500' :
                    doc.category === CATEGORIES.LAB_REPORT ? 'bg-purple-500' :
                    doc.category === CATEGORIES.SCAN ? 'bg-amber-500' : 'bg-slate-500'
                  }`} />
                  
                  <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 hover:border-slate-700 transition-all shadow-xl shadow-black/20">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Thumbnail with Click to Open Viewer */}
                      <div 
                        onClick={() => doc.thumbnail && setViewerDoc(doc)}
                        className={`w-full md:w-36 h-36 flex-shrink-0 bg-slate-800 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-700 transition-transform ${doc.thumbnail ? 'cursor-pointer hover:scale-[1.02] relative group/thumb' : ''}`}
                      >
                        {doc.thumbnail ? (
                          <>
                            <img src={doc.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                              <Maximize2 className="text-white" size={24} />
                            </div>
                          </>
                        ) : (
                          <CategoryIcon category={doc.category} size={40} className="text-slate-600" />
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${CATEGORY_COLORS[doc.category]}`}>
                              {doc.category}
                            </span>
                            <div className="flex items-center gap-4">
                              <span className="text-xs text-slate-500 flex items-center gap-1.5 font-bold">
                                <Calendar size={14} />
                                {new Date(doc.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                              </span>
                              <button onClick={() => deleteDocument(doc.id)} className="text-slate-600 hover:text-red-400">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          <h3 className="text-xl font-bold text-slate-100 mb-2">{doc.title}</h3>
                          <div className="text-sm text-slate-400 font-semibold mb-3 flex items-center gap-2">
                            <Stethoscope size={14} className="text-slate-500" /> {doc.provider}
                          </div>
                          <p className="text-sm text-slate-500 italic bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                            "{doc.summary}"
                          </p>
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between">
                           <span className="text-[10px] text-slate-600 font-mono">{doc.fileName}</span>
                           <button 
                             onClick={() => doc.thumbnail && setViewerDoc(doc)}
                             className="text-blue-400 text-xs font-bold hover:text-blue-300 flex items-center gap-1"
                           >
                             View Full Record <ChevronRight size={14} />
                           </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Image Viewer Modal */}
      {viewerDoc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" onClick={() => setViewerDoc(null)} />
          <div className="relative max-w-5xl w-full max-h-full flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute -top-12 right-0 flex items-center gap-4">
               <div className="text-white text-sm font-medium">
                 {viewerDoc.title} ({new Date(viewerDoc.date).toLocaleDateString()})
               </div>
               <button 
                onClick={() => setViewerDoc(null)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
               >
                <X size={24} />
               </button>
            </div>
            <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
              <img 
                src={viewerDoc.thumbnail} 
                alt={viewerDoc.title} 
                className="max-w-full max-h-[80vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal with Verification Step */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => !isAnalyzing && setIsUploadModalOpen(false)} />
          
          <div className="relative w-full max-w-xl bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-100">
                  {uploadStatus === 'verifying' ? 'Verify Details' : 'Add Health Record'}
                </h2>
                <p className="text-sm text-slate-500">
                  {uploadStatus === 'verifying' ? 'Ensure the AI correctly identified the date and provider' : 'Scan or upload medical paperwork'}
                </p>
              </div>
              <button onClick={() => setIsUploadModalOpen(false)} className="p-3 text-slate-400 hover:bg-slate-800 rounded-2xl" disabled={isAnalyzing}>
                <X size={24} />
              </button>
            </div>

            <div className="p-10">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-6">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin" />
                    <Activity className="absolute inset-0 m-auto text-blue-500 animate-pulse" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-100">Extracting Information...</h3>
                </div>
              ) : uploadStatus === 'verifying' && pendingDoc ? (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Document Date</label>
                      <input 
                        type="date" 
                        value={pendingDoc.date}
                        onChange={(e) => setPendingDoc({...pendingDoc, date: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Category</label>
                      <select 
                        value={pendingDoc.category}
                        onChange={(e) => setPendingDoc({...pendingDoc, category: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 focus:border-blue-500 outline-none"
                      >
                        {Object.values(CATEGORIES).filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Title</label>
                    <input 
                      type="text" 
                      value={pendingDoc.title}
                      onChange={(e) => setPendingDoc({...pendingDoc, title: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Provider / Doctor</label>
                    <input 
                      type="text" 
                      value={pendingDoc.provider}
                      onChange={(e) => setPendingDoc({...pendingDoc, provider: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Summary</label>
                    <textarea 
                      value={pendingDoc.summary}
                      onChange={(e) => setPendingDoc({...pendingDoc, summary: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 focus:border-blue-500 outline-none h-20 resize-none"
                    />
                  </div>

                  <button 
                    onClick={finalizeDocument}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all mt-4 shadow-xl shadow-blue-600/20"
                  >
                    <Save size={18} /> Confirm & Save to Timeline
                  </button>
                </div>
              ) : uploadStatus === 'success' ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-lg font-bold">Successfully Saved</h3>
                </div>
              ) : (
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0]) handleUpload(e.dataTransfer.files[0]);
                  }}
                  className="group relative border-2 border-dashed border-slate-800 rounded-[2rem] p-12 transition-all hover:border-blue-500/50 hover:bg-blue-500/5 text-center cursor-pointer bg-slate-950/50"
                  onClick={() => document.getElementById('fileInput').click()}
                >
                  <input id="fileInput" type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                  <div className="w-20 h-20 bg-slate-900 text-blue-500 shadow-xl rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all border border-slate-800">
                    <Upload size={36} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-100">Drop files to start</h3>
                  <p className="text-slate-500 text-sm mt-2 mb-8 font-medium">AI will identify the date and details for you</p>
                  <div className="inline-flex items-center gap-6 px-6 py-3 bg-slate-900 rounded-2xl border border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <span className="flex items-center gap-2"><ImageIcon size={14} className="text-blue-500" /> Photo</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                    <span className="flex items-center gap-2"><FileText size={14} className="text-purple-500" /> PDF</span>
                  </div>
                </div>
              )}
            </div>

            <div className="px-10 py-6 bg-slate-950/50 border-t border-slate-800 text-[10px] text-slate-600 text-center font-bold uppercase tracking-[0.2em]">
              Verified Data Extraction • Privacy Focused
            </div>
          </div>
        </div>
      )}
    </div>
  );
}