import React, { useState, useMemo, useEffect } from 'react';
import {
PlayCircle,
BookOpen,
ExternalLink,
Search,
Heart,
Activity,
Brain,
Zap,
Info,
ChevronRight,
Filter,
X,
ShieldCheck,
Stethoscope,
Wind,
Bookmark,
BookmarkCheck,
Clock,
Volume2,
Maximize,
SkipBack,
SkipForward,
Youtube,
Home,
PlusCircle,
Settings,
Image as ImageIcon,
Sparkles,
Loader2,
LayoutDashboard,
Trash2,
BarChart3,
Lock,
CheckCircle2,
AlertCircle,
Users,
Layers,
Globe,
Utensils,
Sun,
ShieldAlert,
KeyRound,
LogOut
} from 'lucide-react';

// --- Constants ---
const DEFAULT_PASSWORD = "admin123";
const STORAGE_KEY = "health_hub_local_data";
const PASS_KEY = "health_hub_admin_pass";
const apiKey = "";

const CATEGORIES = [
{ id: 'all', name: 'All Topics', icon: <Filter className="w-4 h-4" /> },
{ id: 'heart', name: 'Heart Health', icon: <Heart className="w-4 h-4" /> },
{ id: 'diabetes', name: 'Diabetes', icon: <Activity className="w-4 h-4" /> },
{ id: 'fitness', name: 'Fitness & Pain', icon: <Zap className="w-4 h-4" /> },
{ id: 'mental', name: 'Mental Health', icon: <Brain className="w-4 h-4" /> },
{ id: 'nutrition', name: 'Nutrition & Diet', icon: <Utensils className="w-4 h-4" /> },
{ id: 'tests', name: 'Medical Tests', icon: <Stethoscope className="w-4 h-4" /> },
{ id: 'respiratory', name: 'Respiratory', icon: <Wind className="w-4 h-4" /> },
{ id: 'skin', name: 'Skin Health', icon: <Sun className="w-4 h-4" /> },
{ id: 'lifestyle', name: 'Sleep & Habits', icon: <Wind className="w-4 h-4" /> },
];

// --- Sub-Components ---

const Badge = ({ type }) => {
const styles = {
video: "bg-red-900/40 text-red-300 border-red-800",
article: "bg-blue-900/40 text-blue-300 border-blue-800",
link: "bg-purple-900/40 text-purple-300 border-purple-800",
};
const icons = {
video: <PlayCircle className="w-3 h-3 mr-1" />,
article: <BookOpen className="w-3 h-3 mr-1" />,
link: <ExternalLink className="w-3 h-3 mr-1" />,
};
return (
<span className={`flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[type]}`}>
{icons[type]}
{type.toUpperCase()}
</span>
);
};

const VideoPlayer = ({ item }) => (

  <div className="bg-black aspect-video relative flex flex-col justify-center items-center overflow-hidden">
    {item.thumbnail ? (
      <img src={item.thumbnail} className="absolute inset-0 w-full h-full object-cover opacity-40 blur-sm" alt="Video" />
    ) : (
      <div className="absolute inset-0 w-full h-full bg-slate-800 opacity-40 blur-sm" />
    )}
    <div className="z-10 text-white flex flex-col items-center p-6 text-center">
      <div 
        onClick={() => {
          if (item.youtubeId) window.open(`https://www.youtube.com/watch?v=${item.youtubeId}`, '_blank');
        }}
        className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center animate-pulse cursor-pointer hover:scale-110 transition-transform"
      >
        <Youtube className="w-8 h-8 fill-current" />
      </div>
      <p className="mt-4 font-bold text-lg">Streaming {item.title}...</p>
      <p className="text-sm opacity-70">Source: {item.source}</p>
    </div>
  </div>
);

const DetailView = ({ item, onClose, isSaved, onToggleSave }) => {
const [isPlaying, setIsPlaying] = useState(false);
const handleOpenSource = () => {
if (!item.externalUrl) return;
const url = item.externalUrl.startsWith('http') ? item.externalUrl : `https://${item.externalUrl}`;
window.open(url, '\_blank', 'noopener,noreferrer');
};

return (
<div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
<div className="bg-slate-900 w-full max-w-3xl sm:rounded-3xl overflow-hidden shadow-2xl relative h-full sm:h-auto max-h-screen overflow-y-auto border border-slate-800">
<button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-800/90 hover:bg-slate-700 rounded-full shadow-lg z-30 transition-colors">
<X className="w-5 h-5 text-white" />
</button>
<div className="relative">
{isPlaying ? <VideoPlayer item={item} /> : (
<div className="h-64 sm:h-96 relative bg-slate-800 overflow-hidden">
{item.thumbnail ? (
<img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
) : (
<div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
<PlayCircle className="w-16 h-16 mb-2 opacity-20" />
<span className="text-sm font-medium">Educational Resource</span>
</div>
)}
<div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent flex items-end p-6">
<div className="w-full">
<div className="flex gap-2 mb-2">
<Badge type={item.type} />
{item.level && <span className="text-[10px] font-bold bg-slate-800/80 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full uppercase tracking-wider">{item.level}</span>}
</div>
<h2 className="text-2xl sm:text-4xl font-black text-white mt-2 leading-tight drop-shadow-md">{item.title}</h2>
</div>
</div>
</div>
)}
</div>
<div className="p-6 sm:p-10 space-y-8 text-white">
<div className="flex items-center justify-between border-b border-slate-800 pb-6">
<div className="flex items-center space-x-3">
<div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center">
<ShieldCheck className="w-6 h-6 text-green-500" />
</div>
<div>
<span className="text-sm font-bold block text-slate-100">Trusted Source</span>
<span className="text-xs text-slate-400">{item.source}</span>
</div>
</div>
<button
onClick={() => onToggleSave(item.id)}
className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all border ${
                isSaved ? 'bg-blue-900/20 border-blue-800 text-blue-400' : 'border-slate-700 text-slate-400 hover:bg-slate-800'
              }`} >
{isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
<span className="text-sm font-bold">{isSaved ? 'Saved' : 'Save'}</span>
</button>
</div>
<div className="grid md:grid-cols-3 gap-8 text-white">
<div className="md:col-span-2 space-y-6">
<div>
<h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Context & Background</h4>
<p className="text-slate-300 leading-relaxed text-lg">{item.description}</p>
</div>
<div className="bg-blue-900/10 p-6 rounded-2xl border border-blue-900/30">
<h4 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center"><Info className="w-4 h-4 mr-2" /> Educator's Note</h4>
<p className="text-blue-300/80 text-sm leading-relaxed font-medium italic">"{item.why}"</p>
</div>
</div>
<div className="space-y-4">
<div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
<p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Resource Info</p>
<div className="space-y-3">
<div className="flex justify-between text-sm"><span className="text-slate-500">Format</span><span className="font-bold text-slate-200 capitalize">{item.type}</span></div>
<div className="flex justify-between text-sm"><span className="text-slate-500">Time</span><span className="font-bold text-slate-200">{item.duration || item.readTime || 'Varies'}</span></div>
<div className="flex justify-between text-sm"><span className="text-slate-500">Audience</span><span className="font-bold text-slate-200">{item.audience || 'Patients'}</span></div>
<div className="flex justify-between text-sm"><span className="text-slate-500">Level</span><span className="font-bold text-slate-200">{item.level || 'Beginner'}</span></div>
</div>
</div>
{!isPlaying && item.type === 'video' ? (
<button onClick={() => setIsPlaying(true)} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center space-x-2">
<PlayCircle className="w-5 h-5" /><span>Watch Now</span>
</button>
) : (
<button onClick={handleOpenSource} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center space-x-2">
<BookOpen className="w-5 h-5" /><span>Start Reading</span>
</button>
)}
<button onClick={handleOpenSource} className="w-full flex items-center justify-center p-4 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors text-slate-300 font-bold text-sm">
<ExternalLink className="w-4 h-4 mr-2" /> Open Source
</button>
</div>
</div>
</div>
</div>
</div>
);
};

export default function App() {
const [resources, setResources] = useState(() => {
const saved = localStorage.getItem(STORAGE_KEY);
return saved ? JSON.parse(saved) : [];
});

const [adminPassword, setAdminPassword] = useState(() => {
return localStorage.getItem(PASS_KEY) || DEFAULT_PASSWORD;
});

const [selectedCategory, setSelectedCategory] = useState('all');
const [searchQuery, setSearchQuery] = useState('');
const [selectedItem, setSelectedItem] = useState(null);
const [savedIds, setSavedIds] = useState([]);
const [showSavedOnly, setShowSavedOnly] = useState(false);
const [currentView, setCurrentView] = useState('user');
const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
const [passwordInput, setPasswordInput] = useState('');
const [isGeneratingImage, setIsGeneratingImage] = useState(false);
const [isChangingPass, setIsChangingPass] = useState(false);
const [newPassInput, setNewPassInput] = useState('');

const [newResource, setNewResource] = useState({
title: '', category: 'heart', type: 'video', source: '', duration: '', readTime: '',
description: '', why: '', thumbnail: '', externalUrl: '', youtubeId: '',
audience: 'Patients', level: 'Beginner', language: 'English'
});

useEffect(() => {
localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
}, [resources]);

useEffect(() => {
localStorage.setItem(PASS_KEY, adminPassword);
}, [adminPassword]);

const toggleSave = (id) => {
setSavedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
};

const handleAdminAuth = (e) => {
e.preventDefault();
if (passwordInput === adminPassword) {
setIsAdminAuthenticated(true);
setPasswordInput('');
} else {
alert("Incorrect admin password.");
}
};

const handleChangePassword = (e) => {
e.preventDefault();
if (newPassInput.length < 4) {
alert("Password must be at least 4 characters.");
return;
}
setAdminPassword(newPassInput);
setNewPassInput('');
setIsChangingPass(false);
alert("Password updated successfully.");
};

const lockSession = () => {
setIsAdminAuthenticated(false);
setIsChangingPass(false);
};

const generateAIImage = async () => {
if (!newResource.title) return;
setIsGeneratingImage(true);
try {
const prompt = `A clean, professional medical illustration or minimalist high-quality health lifestyle visual for: ${newResource.title}. Modern healthcare style.`;
const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ instances: [{ prompt }], parameters: { sampleCount: 1 } })
});
const result = await response.json();
if (result.predictions?.[0]?.bytesBase64Encoded) {
setNewResource(prev => ({ ...prev, thumbnail: `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}` }));
}
} catch (err) { console.error("Image Gen Error", err); }
finally { setIsGeneratingImage(false); }
};

const handleAddResource = async (e) => {
e.preventDefault();
const id = Date.now().toString();
setResources(prev => [{ ...newResource, id, createdAt: new Date().toISOString() }, ...prev]);
setNewResource({
title: '', category: 'heart', type: 'video', source: '', duration: '', readTime: '',
description: '', why: '', thumbnail: '', externalUrl: '', youtubeId: '',
audience: 'Patients', level: 'Beginner', language: 'English'
});
setCurrentView('user');
};

const deleteResource = (id) => {
setResources(prev => prev.filter(r => r.id !== id));
};

const filteredContent = useMemo(() => {
return resources.filter(item => {
const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
item.source.toLowerCase().includes(searchQuery.toLowerCase());
const matchesSaved = !showSavedOnly || savedIds.includes(item.id);
return matchesCategory && matchesSearch && matchesSaved;
});
}, [resources, selectedCategory, searchQuery, showSavedOnly, savedIds]);

const dashboardStats = useMemo(() => {
const total = resources.length;
const videos = resources.filter(r => r.type === 'video').length;
const articles = resources.filter(r => r.type === 'article').length;
const topCat = resources.reduce((acc, curr) => {
acc[curr.category] = (acc[curr.category] || 0) + 1;
return acc;
}, {});
return { total, videos, articles, categories: topCat };
}, [resources]);

return (
<div className="dark">
<div className="min-h-screen bg-slate-950 font-sans text-slate-100 pb-20 transition-colors">

        {/* Navigation */}
        <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 h-20 flex items-center">
          <div className="max-w-7xl mx-auto px-4 w-full flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => { setCurrentView('user'); window.scrollTo(0, 0); }}
                className="flex items-center space-x-2 text-slate-400 hover:text-white transition-all bg-slate-800 px-4 py-2.5 rounded-xl"
              >
                <Home className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Home</span>
              </button>
              <div className="flex items-center space-x-3 hidden sm:flex">
                <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/20">
                  <Activity className="w-5 h-5" />
                </div>
                <h1 className="text-lg font-black tracking-tight leading-none">Health Hub</h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCurrentView('admin')}
                className={`p-2.5 rounded-xl transition-all border flex items-center space-x-2 ${currentView === 'admin' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
              >
                <Settings className="w-5 h-5" />
                <span className="text-xs font-bold hidden md:inline">Admin</span>
              </button>
              <button
                onClick={() => { setShowSavedOnly(!showSavedOnly); setCurrentView('user'); }}
                className={`p-2.5 rounded-xl border transition-all ${showSavedOnly ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
              >
                <Bookmark className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {currentView === 'admin' ? (
          <div className="max-w-6xl mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {!isAdminAuthenticated ? (
              <div className="max-w-md mx-auto bg-slate-900 p-8 rounded-[2rem] border border-slate-800 text-center shadow-2xl mt-12">
                <div className="inline-flex p-4 bg-blue-500/10 rounded-full mb-6">
                  <Lock className="w-10 h-10 text-blue-400" />
                </div>
                <h2 className="text-2xl font-black mb-2">Restricted Access</h2>
                <p className="text-slate-500 text-sm mb-8">Please enter the admin password to manage health hub content.</p>
                <form onSubmit={handleAdminAuth} className="space-y-4">
                  <input
                    type="password"
                    placeholder="Admin Password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none focus:border-blue-500 text-center text-lg tracking-[0.5em]"
                  />
                  <button type="submit" className="w-full bg-blue-600 py-4 rounded-xl font-black hover:bg-blue-700 transition-all">Unlock Dashboard</button>
                </form>
              </div>
            ) : (
              <div className="space-y-10">
                {/* Header & Stats */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <h2 className="text-4xl font-black tracking-tight">Management Dashboard</h2>
                    <p className="text-slate-500 font-medium">Monitoring {resources.length} verified health resources</p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <div className="bg-slate-900 border border-slate-800 px-6 py-4 rounded-2xl flex items-center space-x-4 shadow-xl">
                      <BarChart3 className="text-blue-500 w-6 h-6" />
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Total Data</p>
                        <p className="text-xl font-black">{dashboardStats.total}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsChangingPass(!isChangingPass)}
                        className="bg-slate-900 border border-slate-800 px-6 py-4 rounded-2xl flex items-center space-x-4 hover:border-blue-500 transition-all shadow-xl"
                      >
                        <KeyRound className="text-amber-500 w-6 h-6" />
                        <div className="text-left">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Security</p>
                          <p className="text-sm font-black">Update Password</p>
                        </div>
                      </button>
                      <button
                        onClick={lockSession}
                        className="bg-slate-900 border border-red-900/30 px-6 py-4 rounded-2xl flex items-center space-x-4 hover:border-red-500 hover:bg-red-500/10 transition-all shadow-xl"
                        title="Lock Dashboard"
                      >
                        <LogOut className="text-red-500 w-6 h-6" />
                        <div className="text-left">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Session</p>
                          <p className="text-sm font-black text-red-500">Lock Hub</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Change Sub-Form */}
                {isChangingPass && (
                  <div className="bg-slate-900/50 border border-amber-900/30 p-6 rounded-2xl animate-in slide-in-from-top-2 duration-300">
                    <h4 className="text-sm font-black uppercase tracking-widest mb-4 text-amber-500 flex items-center">
                      <ShieldAlert className="w-4 h-4 mr-2" /> Change Admin Access Key
                    </h4>
                    <form onSubmit={handleChangePassword} className="flex flex-col sm:flex-row gap-4">
                      <input
                        required
                        type="password"
                        placeholder="Enter New Password"
                        value={newPassInput}
                        onChange={(e) => setNewPassInput(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 p-3 rounded-xl outline-none focus:border-blue-500 transition-all font-bold"
                      />
                      <div className="flex gap-2">
                        <button type="submit" className="bg-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">Save Key</button>
                        <button type="button" onClick={() => setIsChangingPass(false)} className="bg-slate-800 px-6 py-3 rounded-xl font-bold hover:bg-slate-700 transition-all">Cancel</button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Main Grid: Form and Item List */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  {/* Left: Add Form */}
                  <div className="lg:col-span-5">
                    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] sticky top-28 shadow-xl">
                      <h3 className="text-xl font-black mb-6 flex items-center"><PlusCircle className="mr-2 w-5 h-5 text-blue-400" /> Publish Content</h3>
                      <form onSubmit={handleAddResource} className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase px-2">Basic Information</label>
                          <input required type="text" placeholder="Content Title" value={newResource.title} onChange={e => setNewResource({...newResource, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none focus:border-blue-500 transition-all font-bold" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase px-2">Category</label>
                            <select value={newResource.category} onChange={e => setNewResource({...newResource, category: e.target.value})} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none appearance-none cursor-pointer focus:border-blue-500 font-bold">
                              {CATEGORIES.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase px-2">Format</label>
                            <select value={newResource.type} onChange={e => setNewResource({...newResource, type: e.target.value})} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none appearance-none cursor-pointer focus:border-blue-500 font-bold">
                              <option value="video">Video</option><option value="article">Article</option><option value="link">Resource Link</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase px-2 flex items-center gap-1"><Users className="w-3 h-3" /> Audience</label>
                            <select value={newResource.audience} onChange={e => setNewResource({...newResource, audience: e.target.value})} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none appearance-none cursor-pointer focus:border-blue-500 font-bold">
                              <option value="Patients">Patients</option>
                              <option value="Caregivers">Caregivers</option>
                              <option value="Professionals">Medical Pros</option>
                              <option value="General">General Public</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase px-2 flex items-center gap-1"><Layers className="w-3 h-3" /> Level</label>
                            <select value={newResource.level} onChange={e => setNewResource({...newResource, level: e.target.value})} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none appearance-none cursor-pointer focus:border-blue-500 font-bold">
                              <option value="Beginner">Beginner</option>
                              <option value="Intermediate">Intermediate</option>
                              <option value="Advanced">Advanced</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase px-2 flex items-center gap-1"><Globe className="w-3 h-3" /> Language</label>
                          <input type="text" placeholder="Language (e.g., English)" value={newResource.language} onChange={e => setNewResource({...newResource, language: e.target.value})} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none focus:border-blue-500 font-bold" />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase px-2">Visual Asset</label>
                          <div className="relative">
                            <input type="text" placeholder="Thumbnail URL" value={newResource.thumbnail} onChange={e => setNewResource({...newResource, thumbnail: e.target.value})} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none focus:border-blue-500 pr-14 font-bold" />
                            <button type="button" disabled={isGeneratingImage || !newResource.title} onClick={generateAIImage} className="absolute right-2 top-2 p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white rounded-lg transition-all">
                              {isGeneratingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase px-2">Source & Media</label>
                          <input type="text" placeholder="Organization (e.g., Mayo Clinic)" value={newResource.source} onChange={e => setNewResource({...newResource, source: e.target.value})} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none focus:border-blue-500 mb-2 font-bold" />
                          <input type="text" placeholder="External URL / YouTube ID" value={newResource.externalUrl || newResource.youtubeId} onChange={e => setNewResource({...newResource, externalUrl: e.target.value, youtubeId: e.target.value})} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none focus:border-blue-500 font-bold" />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase px-2">Educational Details</label>
                          <textarea required placeholder="Brief Summary" rows="2" value={newResource.description} onChange={e => setNewResource({...newResource, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none focus:border-blue-500 resize-none mb-2 text-sm" />
                          <textarea required placeholder="Why it's useful?" rows="2" value={newResource.why} onChange={e => setNewResource({...newResource, why: e.target.value})} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none focus:border-blue-500 resize-none text-sm" />
                        </div>

                        <button type="submit" className="w-full bg-blue-600 py-5 rounded-2xl font-black text-lg hover:bg-blue-700 shadow-xl shadow-blue-900/10 transition-all">Push to Live Hub</button>
                      </form>
                    </div>
                  </div>

                  {/* Right: Library with Delete */}
                  <div className="lg:col-span-7 space-y-4">
                    <h3 className="text-xl font-black mb-6 flex items-center px-4"><LayoutDashboard className="mr-2 w-5 h-5 text-blue-400" /> Active Library</h3>
                    <div className="space-y-4">
                      {resources.map(item => (
                        <div key={item.id} className="bg-slate-900 p-5 rounded-[1.5rem] border border-slate-800 flex items-center justify-between group hover:border-slate-700 transition-all shadow-sm">
                          <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0">
                              {item.thumbnail ? <img src={item.thumbnail} className="w-full h-full object-cover" alt="" /> : <ImageIcon className="w-full h-full p-3 text-slate-700" />}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${item.type === 'video' ? 'bg-red-900/30 text-red-400' : 'bg-blue-900/30 text-blue-400'}`}>{item.type}</span>
                                <span className="text-[10px] font-black uppercase text-slate-500">{item.audience || 'Patients'} • {item.level || 'Beginner'}</span>
                              </div>
                              <h4 className="font-bold text-slate-100 line-clamp-1">{item.title}</h4>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteResource(item.id)}
                            className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-95"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                      {resources.length === 0 && <div className="text-center py-20 text-slate-600 font-bold border-2 border-dashed border-slate-800 rounded-3xl">No resources in library yet.</div>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Main User View */
          <>
            <section className="px-4 py-16 text-center max-w-4xl mx-auto animate-in fade-in duration-700">
              <span className="inline-block py-1 px-3 bg-blue-900/30 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-6">Expert Vetted Hub</span>
              <h2 className="text-4xl sm:text-7xl font-black mb-6 tracking-tight leading-[1.1]">Your Health, <span className="text-blue-500 underline decoration-blue-800 underline-offset-[12px]">Visualized.</span></h2>
              <p className="text-slate-400 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto font-medium">Verified educational resources to master your wellness journey.</p>
              <div className="mt-12 relative max-w-2xl mx-auto group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 w-6 h-6 group-focus-within:text-blue-500 transition-colors" />
                <input type="text" placeholder="Search topics..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-16 pr-8 py-6 bg-slate-900 border-2 border-slate-800 rounded-[2rem] shadow-2xl focus:border-blue-500 outline-none transition-all text-xl font-medium text-white placeholder:text-slate-600 focus:ring-4 focus:ring-blue-500/10" />
              </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 mb-12 sticky top-20 z-30 py-2 bg-slate-950/80 backdrop-blur-sm">
              <div className="flex flex-wrap gap-3 pb-4">
                {CATEGORIES.map((cat) => (
                  <button key={cat.id} onClick={() => {setSelectedCategory(cat.id); setShowSavedOnly(false); window.scrollTo({ top: 400, behavior: 'smooth' });}} className={`flex items-center space-x-2 px-6 py-3 rounded-2xl whitespace-nowrap font-bold text-sm transition-all border-2 ${selectedCategory === cat.id && !showSavedOnly ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-blue-700'}`}>
                    {cat.icon}<span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <main className="max-w-7xl mx-auto px-4">
              {showSavedOnly && <div className="flex items-center space-x-3 mb-8 text-blue-400"><BookmarkCheck className="w-6 h-6" /><h3 className="font-black uppercase tracking-widest text-lg">Your Saved Resources ({savedIds.length})</h3></div>}
              {filteredContent.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredContent.map(item => (
                    <div key={item.id} onClick={() => setSelectedItem(item)} className="group bg-slate-900 rounded-[2.5rem] border-2 border-slate-800 overflow-hidden shadow-sm hover:shadow-2xl hover:border-blue-500 transition-all duration-500 cursor-pointer relative">
                      <div className="relative h-60 overflow-hidden bg-slate-800">
                        {item.thumbnail ? <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" /> : <div className="w-full h-full flex flex-col items-center justify-center text-slate-700"><ImageIcon className="w-12 h-12 mb-2 opacity-30" /></div>}
                        <div className="absolute top-5 left-5">
                          <div className="flex flex-col gap-1">
                            <Badge type={item.type} />
                            {item.level && <span className="text-[8px] font-black bg-slate-900/80 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded-full uppercase tracking-tighter self-start">{item.level}</span>}
                          </div>
                        </div>
                        {(item.duration || item.readTime) && <div className="absolute bottom-5 right-5 bg-slate-950/90 backdrop-blur-md text-white text-[10px] px-3 py-1.5 rounded-xl font-black flex items-center border border-slate-800"><Clock className="w-3.5 h-3.5 mr-1.5 text-blue-400" /> {item.duration || item.readTime}</div>}
                        {savedIds.includes(item.id) && <div className="absolute top-5 right-5 bg-blue-600 text-white p-2 rounded-full shadow-lg scale-110 border border-blue-400"><BookmarkCheck className="w-4 h-4" /></div>}
                      </div>
                      <div className="p-7">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 border-l-2 border-blue-500 pl-2">{item.source} • {item.audience || 'Patients'}</p>
                        <h3 className="text-xl font-black text-slate-100 leading-tight group-hover:text-blue-400 transition-colors line-clamp-2 min-h-[3rem]">{item.title}</h3>
                        <div className="mt-8 pt-5 border-t border-slate-800 flex items-center justify-between text-blue-400 font-black text-xs uppercase tracking-tighter">
                          <span>Explore Details</span>
                          <div className="w-10 h-10 rounded-full bg-blue-900/20 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg"><ChevronRight className="w-5 h-5" /></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-40 bg-slate-900/30 rounded-[4rem] border-4 border-dashed border-slate-800/50">
                  <div className="inline-flex items-center justify-center p-8 bg-slate-800 rounded-full mb-8 text-slate-600"><Search className="w-12 h-12" /></div>
                  <h3 className="text-3xl font-black text-slate-300">No resources found</h3>
                  <button onClick={() => {setSelectedCategory('all'); setSearchQuery(''); setShowSavedOnly(false);}} className="mt-10 px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl">Reset Filters</button>
                </div>
              )}
            </main>
          </>
        )}

        {selectedItem && <DetailView item={selectedItem} isSaved={savedIds.includes(selectedItem.id)} onToggleSave={toggleSave} onClose={() => setSelectedItem(null)} />}
      </div>
    </div>

);
}
