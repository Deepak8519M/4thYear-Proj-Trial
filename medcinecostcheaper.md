import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  ExternalLink, 
  ShieldCheck, 
  ShoppingBag, 
  Info, 
  ChevronRight, 
  Filter,
  DollarSign,
  Locate,
  ArrowDownCircle,
  Stethoscope,
  ChevronLeft,
  Activity,
  Sparkles,
  Loader2,
  AlertCircle,
  Thermometer,
  Heart,
  Wind,
  Droplet,
  Brain,
  Zap,
  Eye,
  Sun,
  Baby,
  Sticker,
  Coffee,
  Moon
} from 'lucide-react';

// --- Utility: Generate Real Search Links ---
const getStoreLink = (source, medName) => {
  const query = encodeURIComponent(medName);
  switch (source) {
    case '1mg': return `https://www.1mg.com/search/all?name=${query}`;
    case 'Apollo': return `https://www.apollopharmacy.in/search-medicines/${query}`;
    case 'PharmEasy': return `https://pharmeasy.in/search/all?searchtext=${query}`;
    case 'Netmeds': return `https://www.netmeds.com/catalogsearch/result?q=${query}`;
    default: return `https://www.google.com/search?q=buy+${query}+online`;
  }
};

// --- Comprehensive Initial Database ---
const INITIAL_DATABASE = [
  {
    id: 'm1',
    name: 'Atorvastatin',
    brand: 'Lipitor',
    dosage: '20mg',
    form: 'Tablet',
    activeIngredient: 'Atorvastatin Calcium',
    category: 'Cholesterol',
    description: 'A statin medication used to prevent cardiovascular disease and treat abnormal lipid levels.',
    prices: [
      { source: '1mg', price: 145.50, originalPrice: 180.00, status: 'In Stock' },
      { source: 'Apollo', price: 152.00, originalPrice: 175.00, status: 'In Stock' }
    ],
    generics: [{ name: 'Atorva 20', manufacturer: 'Zydus', price: 85.00 }],
    locations: [{ name: 'Central Pharmacy', distance: '1.2 km', available: true }]
  },
  {
    id: 'm2',
    name: 'Metformin',
    brand: 'Glucophage',
    dosage: '500mg',
    form: 'Tablet',
    activeIngredient: 'Metformin Hydrochloride',
    category: 'Diabetes',
    description: 'The first-line medication for the treatment of type 2 diabetes.',
    prices: [
      { source: '1mg', price: 45.00, originalPrice: 55.00, status: 'In Stock' },
      { source: 'Netmeds', price: 42.00, originalPrice: 60.00, status: 'In Stock' }
    ],
    generics: [{ name: 'Glycomet 500', manufacturer: 'USV', price: 15.00 }],
    locations: [{ name: 'Apollo Pharmacy', distance: '0.5 km', available: true }]
  },
  {
    id: 'm3',
    name: 'Amlodipine',
    brand: 'Norvasc',
    dosage: '5mg',
    form: 'Tablet',
    activeIngredient: 'Amlodipine Besylate',
    category: 'Hypertension',
    description: 'Used to treat high blood pressure and chest pain (angina).',
    prices: [
      { source: 'PharmEasy', price: 62.00, originalPrice: 75.00, status: 'In Stock' },
      { source: '1mg', price: 58.00, originalPrice: 72.00, status: 'In Stock' }
    ],
    generics: [{ name: 'Amlokind 5', manufacturer: 'Mankind', price: 20.00 }],
    locations: [{ name: 'HealthFirst', distance: '2.1 km', available: true }]
  },
  {
    id: 'm11',
    name: 'Ibuprofen',
    brand: 'Advil / Motrin',
    dosage: '400mg',
    form: 'Tablet',
    activeIngredient: 'Ibuprofen',
    category: 'Pain Relief',
    description: 'A nonsteroidal anti-inflammatory drug (NSAID) used for treating pain, fever, and inflammation.',
    prices: [
      { source: '1mg', price: 25.00, originalPrice: 30.00, status: 'In Stock' },
      { source: 'PharmEasy', price: 22.00, originalPrice: 28.00, status: 'In Stock' }
    ],
    generics: [{ name: 'Brufen 400', manufacturer: 'Abbott', price: 18.00 }],
    locations: [{ name: 'Neighborhood Meds', distance: '0.4 km', available: true }]
  },
  {
    id: 'm12',
    name: 'Pantoprazole',
    brand: 'Protonix',
    dosage: '40mg',
    form: 'Tablet',
    activeIngredient: 'Pantoprazole Sodium',
    category: 'Stomach Care',
    description: 'Used for the short-term treatment of erosion and ulceration of the esophagus caused by GERD.',
    prices: [
      { source: 'Apollo', price: 110.00, originalPrice: 135.00, status: 'In Stock' }
    ],
    generics: [{ name: 'Pan 40', manufacturer: 'Alkem', price: 65.00 }],
    locations: [{ name: 'City Wellness', distance: '1.8 km', available: true }]
  },
  {
    id: 'm13',
    name: 'Adapalene',
    brand: 'Differin',
    dosage: '0.1%',
    form: 'Gel',
    activeIngredient: 'Adapalene',
    category: 'Skin Care',
    description: 'A topical retinoid used in the treatment of mild-to-moderate acne.',
    prices: [
      { source: 'Netmeds', price: 280.00, originalPrice: 320.00, status: 'In Stock' }
    ],
    generics: [{ name: 'Adaferin', manufacturer: 'Galderma', price: 195.00 }],
    locations: [{ name: 'Derma Hub', distance: '3.2 km', available: true }]
  }
];

const Navbar = () => (
  <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-200">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">PharmaPrice</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <span className="hover:text-blue-600 cursor-pointer">Drug Search</span>
          <span className="hover:text-blue-600 cursor-pointer">Store Map</span>
          <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">
            <Sparkles className="w-3 h-3" /> AI Powered
          </div>
          <button className="bg-slate-900 text-white px-5 py-2 rounded-full font-semibold hover:bg-slate-800 transition-all">
            My List
          </button>
        </div>
      </div>
    </div>
  </nav>
);

const App = () => {
  const [medications, setMedications] = useState(INITIAL_DATABASE);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMed, setSelectedMed] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Search filter
  const filteredResults = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (query.length < 2) return [];
    return medications.filter(m => 
      m.name.toLowerCase().includes(query) || 
      m.brand.toLowerCase().includes(query) ||
      m.category.toLowerCase().includes(query) ||
      (query === 'bp' && m.category === 'Hypertension') ||
      (query === 'sugar' && m.category === 'Diabetes')
    );
  }, [searchQuery, medications]);

  const categoryMeds = useMemo(() => {
    if (!selectedCategory) return [];
    return medications.filter(m => m.category === selectedCategory);
  }, [selectedCategory, medications]);

  const fetchWithAI = async (query) => {
    if (!query || query.length < 2) return;
    
    setIsAIGenerating(true);
    setError(null);
    setIsSearching(false);
    const apiKey = ""; 

    const systemPrompt = `Provide a pharmaceutical JSON for: "${query}". Return ONLY valid JSON.
    If it's a disease, provide details for the most common medication used to treat it.
    Match schema: { 
      "name": "Generic Name", 
      "brand": "Popular Brand", 
      "dosage": "Typical Dose", 
      "form": "Tablet/Liquid", 
      "category": "Main Category", 
      "description": "Medical description", 
      "prices": [{"source": "1mg", "price": 0, "originalPrice": 0, "status": "In Stock"}], 
      "generics": [{"name": "", "manufacturer": "", "price": 0}], 
      "locations": [{"name": "Pharma Local", "distance": "1km", "available": true}], 
      "isAI": true 
    }`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Generate pharmaceutical details for: ${query}` }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const newMed = JSON.parse(rawText);
      const finalMed = { ...newMed, id: `ai-${Date.now()}` };

      setMedications(prev => {
        // Prevent duplicates in the searchable list
        if (prev.find(m => m.name.toLowerCase() === finalMed.name.toLowerCase())) return prev;
        return [...prev, finalMed];
      });
      
      setSelectedMed(finalMed);
      setIsAIGenerating(false);
      setSearchQuery('');
    } catch (err) {
      console.error(err);
      setError("AI was unable to fetch data for this query. Please try a different name or common condition.");
      setIsAIGenerating(false);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (filteredResults.length === 1) {
        handleSelectMed(filteredResults[0]);
      } else if (searchQuery.length >= 2) {
        fetchWithAI(searchQuery);
      }
    }
  };

  const handleSelectMed = (med) => {
    setSelectedMed(med);
    setIsSearching(false);
    setSelectedCategory(null);
    setSearchQuery('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Search Header */}
        {!selectedMed && !selectedCategory && !isAIGenerating && (
          <div className="text-center mb-16">
            <h1 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
              Compare & Save on <span className="text-blue-600">Health</span>
            </h1>
            <p className="text-slate-500 text-xl mb-12 max-w-2xl mx-auto">
              Real-time prices from top pharmacies. Search any medicine or condition.
            </p>

            <div className="relative max-w-3xl mx-auto">
              <input
                type="text"
                placeholder="Search disease or medicine (Press Enter for AI Research)..."
                className="w-full h-24 pl-24 pr-10 rounded-[3rem] border-2 border-transparent bg-white shadow-2xl focus:border-blue-500 focus:outline-none transition-all text-2xl font-medium placeholder:text-slate-300"
                value={searchQuery}
                onKeyDown={handleSearchKeyPress}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearching(true);
                }}
              />
              <Search className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-400 w-8 h-8" />
              
              {isSearching && searchQuery.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-6 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden z-40 text-left animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-5 bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-widest border-b">
                    {filteredResults.length > 0 ? 'Verified Database Results' : 'No local matches found'}
                  </div>
                  
                  {filteredResults.map(res => (
                    <button
                      key={res.id}
                      onClick={() => handleSelectMed(res)}
                      className="w-full flex items-center justify-between p-6 hover:bg-blue-50 transition-colors border-b last:border-none border-slate-50"
                    >
                      <div className="flex items-center gap-5">
                        <div className="bg-blue-600/10 p-3 rounded-2xl">
                          <Activity className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-xl">{res.name} <span className="text-slate-400 text-sm font-normal">({res.brand})</span></div>
                          <div className="text-sm text-blue-600 font-semibold">{res.category}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-7 h-7 text-slate-300" />
                    </button>
                  ))}

                  <button
                    onClick={() => fetchWithAI(searchQuery)}
                    className="w-full flex items-center justify-between p-8 bg-slate-900 text-white hover:bg-black transition-colors"
                  >
                    <div className="flex items-center gap-5 text-left">
                      <div className="bg-amber-400 p-3 rounded-2xl text-slate-900">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">Research "{searchQuery}" with AI</div>
                        <div className="text-sm text-slate-400">Search global pricing, descriptions & generics</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mr-2">
                      Press Enter <ChevronRight className="w-5 h-5 opacity-40" />
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isAIGenerating && (
          <div className="py-20 text-center animate-in zoom-in duration-300">
            <div className="relative inline-block mb-8">
              <Loader2 className="w-20 h-20 text-blue-600 animate-spin mx-auto" />
              <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-amber-400 animate-bounce" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">AI Researching...</h2>
            <p className="text-slate-500 mt-2 text-lg">Cross-referencing global price indices and medical records.</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-xl mx-auto mb-10 bg-red-50 border border-red-200 p-8 rounded-[2rem] flex items-center gap-6 text-red-900 shadow-lg">
            <AlertCircle className="w-10 h-10 flex-shrink-0" />
            <div>
              <div className="font-bold text-lg">Research Failed</div>
              <p className="text-sm opacity-80">{error}</p>
            </div>
          </div>
        )}

        {/* Selected Medicine View */}
        {selectedMed && !isAIGenerating && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            <button onClick={() => setSelectedMed(null)} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 font-bold">
              <ChevronLeft className="w-5 h-5" /> Back to Search
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-8">
                {/* Header Card */}
                <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-4 py-1.5 bg-blue-600 text-white text-xs font-black rounded-full uppercase tracking-widest">
                      {selectedMed.category}
                    </span>
                    {selectedMed.isAI && (
                      <span className="px-4 py-1.5 bg-amber-400 text-slate-900 text-xs font-black rounded-full uppercase tracking-widest flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> AI Discovery
                      </span>
                    )}
                  </div>
                  <h2 className="text-5xl font-black text-slate-900 mb-2">{selectedMed.name}</h2>
                  <p className="text-slate-500 text-xl font-medium mb-8">
                    {selectedMed.brand} • {selectedMed.form} ({selectedMed.dosage})
                  </p>
                  <p className="text-slate-600 leading-relaxed text-lg border-t border-slate-50 pt-8">
                    {selectedMed.description}
                  </p>
                </div>

                {/* Price Table */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                    <ShoppingBag className="w-6 h-6 text-blue-600" />
                    Live Price Comparison
                  </h3>
                  {selectedMed.prices.map((p, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-md hover:border-blue-100 transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl font-black text-slate-300">
                          {p.source[0]}
                        </div>
                        <div>
                          <div className="font-black text-slate-900 text-xl">{p.source}</div>
                          <div className="text-green-600 font-bold flex items-center gap-1.5 text-sm">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> {p.status}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-10 w-full sm:w-auto">
                        <div className="text-right">
                          <div className="text-slate-400 text-sm line-through">₹{p.originalPrice?.toFixed(2)}</div>
                          <div className="text-3xl font-black text-slate-900">₹{p.price.toFixed(2)}</div>
                        </div>
                        <a 
                          href={getStoreLink(p.source, selectedMed.name)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 sm:flex-none bg-blue-600 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 hover:-translate-y-1 transition-all shadow-lg shadow-blue-200"
                        >
                          Shop Now <ExternalLink className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Generics */}
                {selectedMed.generics?.length > 0 && selectedMed.generics[0].name && (
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                      <Zap className="w-6 h-6 text-amber-500" />
                      Save with Generic Substitutes
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedMed.generics.map((g, idx) => (
                        <div key={idx} className="bg-slate-900 p-8 rounded-[2rem] text-white relative overflow-hidden group">
                          <ArrowDownCircle className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 group-hover:scale-125 transition-transform" />
                          <div className="relative z-10">
                            <div className="text-amber-400 font-black text-xl mb-1">{g.name}</div>
                            <div className="text-slate-400 text-sm mb-6">Mfr: {g.manufacturer || 'Verified Generic'}</div>
                            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                              <span className="text-3xl font-black">₹{g.price.toFixed(2)}</span>
                              <span className="bg-green-500 text-white px-3 py-1 rounded-lg text-xs font-black">
                                UP TO -{Math.round((1 - g.price / selectedMed.prices[0].price) * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                  <h4 className="font-black text-slate-900 mb-6 flex items-center gap-2">
                    <Locate className="w-5 h-5 text-blue-600" /> Availability
                  </h4>
                  <div className="space-y-6">
                    {selectedMed.locations?.map((l, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-slate-50 pb-4 last:border-none">
                        <div>
                          <div className="font-bold text-slate-800">{l.name}</div>
                          <div className="text-xs text-slate-400">{l.distance} away</div>
                        </div>
                        <span className="bg-green-50 text-green-700 text-[10px] font-black px-2 py-1 rounded-full">STOCK OK</span>
                      </div>
                    ))}
                    {(!selectedMed.locations || selectedMed.locations.length === 0) && (
                      <p className="text-slate-400 text-sm italic">Researching regional pharmacy inventory...</p>
                    )}
                  </div>
                </div>

                <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100">
                  <h4 className="font-black text-amber-900 text-sm mb-3 flex items-center gap-2">
                    <Info className="w-5 h-5" /> Professional Note
                  </h4>
                  <p className="text-amber-800 text-xs leading-relaxed">
                    Always consult with a licensed healthcare professional before starting or switching medications. Data provided is for research purposes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Home View */}
        {!selectedMed && !selectedCategory && !isAIGenerating && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <h3 className="text-center font-black text-slate-300 text-xs uppercase tracking-[0.2em]">Explore by Medical Condition</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[
                { name: 'Diabetes', icon: Droplet, color: 'text-red-500 bg-red-50' },
                { name: 'Hypertension', icon: Heart, color: 'text-pink-500 bg-pink-50' },
                { name: 'Pain Relief', icon: Zap, color: 'text-orange-500 bg-orange-50' },
                { name: 'Asthma', icon: Wind, color: 'text-blue-500 bg-blue-50' },
                { name: 'Stomach Care', icon: Coffee, color: 'text-amber-600 bg-amber-50' },
                { name: 'Skin Care', icon: Sun, color: 'text-yellow-600 bg-yellow-50' },
                { name: 'Mental Health', icon: Brain, color: 'text-purple-500 bg-purple-50' },
                { name: 'Vitamins', icon: Activity, color: 'text-emerald-500 bg-emerald-50' },
                { name: 'Eye Care', icon: Eye, color: 'text-indigo-500 bg-indigo-50' },
                { name: 'First Aid', icon: Sticker, color: 'text-red-600 bg-red-50' },
                { name: "Women's Health", icon: Baby, color: 'text-rose-500 bg-rose-50' },
                { name: 'Sleep Aid', icon: Moon, color: 'text-slate-600 bg-slate-100' },
              ].map(cat => (
                <button 
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex flex-col items-center justify-center p-8 rounded-[2.5rem] transition-all hover:scale-110 hover:shadow-2xl hover:shadow-slate-200 border-2 border-transparent hover:border-white ${cat.color}`}
                >
                  <cat.icon className="w-10 h-10 mb-4" />
                  <span className="font-black text-[11px] uppercase tracking-wider text-slate-800 text-center">{cat.name}</span>
                </button>
              ))}
            </div>

            <div className="bg-gradient-to-br from-blue-700 to-blue-900 p-12 rounded-[3.5rem] text-white flex flex-col md:flex-row items-center gap-12 shadow-2xl shadow-blue-200 relative overflow-hidden">
              <Sparkles className="absolute -top-10 -right-10 w-40 h-40 text-white/10" />
              <div className="relative z-10 flex-1">
                <h3 className="text-4xl font-black mb-4">Unlimited Medical Database</h3>
                <p className="text-blue-100 text-lg opacity-80">
                  Search any medicine (e.g., "Aspirin") or condition (e.g., "Flu"). If it's not in our list, our AI will instantly research price data and local stock for you.
                </p>
              </div>
              <button 
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  document.querySelector('input')?.focus();
                }}
                className="bg-white text-blue-700 px-10 py-5 rounded-[2rem] font-black text-lg hover:bg-blue-50 transition-all shadow-xl shadow-blue-900/20 whitespace-nowrap"
              >
                Start Searching
              </button>
            </div>
          </div>
        )}

        {/* Category List */}
        {selectedCategory && !selectedMed && (
          <div className="animate-in fade-in duration-300">
            <button onClick={() => setSelectedCategory(null)} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 font-bold">
              <ChevronLeft className="w-5 h-5" /> Back Home
            </button>
            <h2 className="text-4xl font-black mb-10 text-slate-900">Treatments for <span className="text-blue-600">{selectedCategory}</span></h2>
            {categoryMeds.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categoryMeds.map(m => (
                  <div 
                    key={m.id}
                    onClick={() => handleSelectMed(m)}
                    className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 cursor-pointer transition-all group"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <h4 className="font-black text-2xl group-hover:text-blue-600 transition-colors">{m.name}</h4>
                      <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-black">₹{m.prices[0].price}</span>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-3">{m.description}</p>
                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                      <span className="text-xs font-bold text-slate-400">Brand: {m.brand}</span>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-2 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-20 rounded-[3.5rem] text-center border-2 border-dashed border-slate-200">
                <Sparkles className="w-12 h-12 text-blue-600 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-slate-800 mb-2">No local results</h3>
                <p className="text-slate-500 mb-8">Click below to let our AI find the most popular treatments for {selectedCategory}.</p>
                <button 
                  onClick={() => fetchWithAI(selectedCategory)}
                  className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-black transition-all"
                >
                  Research "{selectedCategory}" with AI
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="py-20 bg-slate-900 text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-8 text-white opacity-40">
            <ShieldCheck className="w-8 h-8" />
            <span className="text-2xl font-black">PharmaPrice</span>
          </div>
          <p className="max-w-xl mx-auto text-sm leading-loose">
            PharmaPrice is an independent research platform. Prices and stock data are estimates. 
            AI data is generated for informational purposes and should be verified with a healthcare provider.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;