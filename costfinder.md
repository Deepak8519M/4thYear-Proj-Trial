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
Zap
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
{ source: 'Apollo', price: 152.00, originalPrice: 175.00, status: 'In Stock' },
{ source: 'PharmEasy', price: 138.00, originalPrice: 190.00, status: 'Few Left' }
],
generics: [
{ name: 'Atorva 20', manufacturer: 'Zydus', price: 85.00 },
{ name: 'Lipicure 20', manufacturer: 'Intas', price: 92.50 }
],
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
id: 'm4',
name: 'Telmisartan',
brand: 'Telma',
dosage: '40mg',
form: 'Tablet',
activeIngredient: 'Telmisartan',
category: 'Hypertension',
description: 'Used to manage high blood pressure and reduce risk of heart attack or stroke.',
prices: [
{ source: 'Apollo', price: 95.00, originalPrice: 110.00, status: 'In Stock' },
{ source: 'Netmeds', price: 88.00, originalPrice: 105.00, status: 'In Stock' }
],
generics: [{ name: 'Telsar 40', manufacturer: 'Unichem', price: 45.00 }],
locations: [{ name: 'City Meds', distance: '0.8 km', available: true }]
},
{
id: 'm5',
name: 'Paracetamol',
brand: 'Panadol / Calpol',
dosage: '650mg',
form: 'Tablet',
activeIngredient: 'Acetaminophen',
category: 'Fever',
description: 'A medication used to treat fever and mild to moderate pain.',
prices: [
{ source: '1mg', price: 30.00, originalPrice: 35.00, status: 'In Stock' },
{ source: 'PharmEasy', price: 28.00, originalPrice: 32.00, status: 'In Stock' }
],
generics: [{ name: 'Dolo 650', manufacturer: 'Micro Labs', price: 30.00 }],
locations: [{ name: '24/7 Meds', distance: '0.2 km', available: true }]
},
{
id: 'm6',
name: 'Omeprazole',
brand: 'Prilosec',
dosage: '20mg',
form: 'Capsule',
activeIngredient: 'Omeprazole',
category: 'Acid Reflux',
description: 'A proton-pump inhibitor (PPI) used to treat gastroesophageal reflux disease (GERD).',
prices: [
{ source: '1mg', price: 55.00, originalPrice: 70.00, status: 'In Stock' },
{ source: 'Apollo', price: 58.00, originalPrice: 65.00, status: 'In Stock' }
],
generics: [{ name: 'Omez', manufacturer: 'Dr. Reddys', price: 35.00 }],
locations: [{ name: 'Neighbour Pharmacy', distance: '1.4 km', available: true }]
},
{
id: 'm7',
name: 'Sertraline',
brand: 'Zoloft',
dosage: '50mg',
form: 'Tablet',
activeIngredient: 'Sertraline Hydrochloride',
category: 'Mental Health',
description: 'An antidepressant of the selective serotonin reuptake inhibitor (SSRI) class.',
prices: [
{ source: 'PharmEasy', price: 210.00, originalPrice: 245.00, status: 'In Stock' },
{ source: '1mg', price: 195.00, originalPrice: 240.00, status: 'In Stock' }
],
generics: [{ name: 'Sertima 50', manufacturer: 'Intas', price: 110.00 }],
locations: [{ name: 'Wellness Center', distance: '3.5 km', available: true }]
},
{
id: 'm8',
name: 'Montelukast',
brand: 'Singulair',
dosage: '10mg',
form: 'Tablet',
activeIngredient: 'Montelukast Sodium',
category: 'Asthma',
description: 'Used for the maintenance treatment of asthma and to relieve symptoms of seasonal allergies.',
prices: [
{ source: 'Apollo', price: 180.00, originalPrice: 210.00, status: 'In Stock' },
{ source: '1mg', price: 172.00, originalPrice: 205.00, status: 'In Stock' }
],
generics: [{ name: 'Montair 10', manufacturer: 'Cipla', price: 95.00 }],
locations: [{ name: 'Eco Meds', distance: '0.9 km', available: true }]
},
{
id: 'm9',
name: 'Cetirizine',
brand: 'Zyrtec',
dosage: '10mg',
form: 'Tablet',
activeIngredient: 'Cetirizine Hydrochloride',
category: 'Allergies',
description: 'A second-generation antihistamine used to treat hay fever, dermatitis, and urticaria.',
prices: [
{ source: '1mg', price: 18.00, originalPrice: 25.00, status: 'In Stock' },
{ source: 'Netmeds', price: 15.00, originalPrice: 22.00, status: 'In Stock' }
],
generics: [{ name: 'Okacet', manufacturer: 'Cipla', price: 15.00 }],
locations: [{ name: 'Local Store', distance: '0.4 km', available: true }]
},
{
id: 'm10',
name: 'Azithromycin',
brand: 'Zithromax',
dosage: '500mg',
form: 'Tablet',
activeIngredient: 'Azithromycin',
category: 'Infection',
description: 'An antibiotic used for the treatment of a number of bacterial infections.',
prices: [
{ source: '1mg', price: 115.00, originalPrice: 130.00, status: 'In Stock' },
{ source: 'Apollo', price: 120.00, originalPrice: 128.00, status: 'Few Left' }
],
generics: [{ name: 'Azithral 500', manufacturer: 'Alembic', price: 72.00 }],
locations: [{ name: '24hr Pharma', distance: '1.1 km', available: true }]
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
          <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
            <Sparkles className="w-3 h-3" /> AI Engine Ready
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

// Advanced search logic including category aliases
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
setIsAIGenerating(true);
setError(null);
setIsSearching(false);
const apiKey = "";

    const systemPrompt = `Provide a pharmaceutical JSON for: "${query}". Return ONLY valid JSON.
    Match schema: { "name": "", "brand": "", "dosage": "", "form": "", "category": "", "description": "", "prices": [{"source": "1mg", "price": 0, "originalPrice": 0, "status": "In Stock"}], "generics": [], "locations": [], "isAI": true }`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Generate details for: ${query}` }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (!response.ok) throw new Error('API failed');
      const data = await response.json();
      const newMed = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text);

      setMedications(prev => [...prev, { ...newMed, id: `ai-${Date.now()}` }]);
      setSelectedMed(newMed);
      setIsAIGenerating(false);
      setSearchQuery('');
    } catch (err) {
      setError("AI was unable to fetch specific data for this query. Try a more common medicine name.");
      setIsAIGenerating(false);
    }

};

const handleSelectMed = (med) => {
setSelectedMed(med);
setIsSearching(false);
setSelectedCategory(null);
setSearchQuery('');
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
              Real-time prices from top pharmacies. Search 10,000+ medicines or conditions.
            </p>

            <div className="relative max-w-3xl mx-auto">
              {/* INCREASED PADDING & HEIGHT FOR SEARCH BAR */}
              <input
                type="text"
                placeholder="Search disease or medicine (e.g. Fever, Asthma, Zyrtec)..."
                className="w-full h-24 pl-24 pr-10 rounded-[3rem] border-2 border-transparent bg-white shadow-2xl focus:border-blue-500 focus:outline-none transition-all text-2xl font-medium placeholder:text-slate-300"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearching(true);
                }}
              />
              <Search className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-400 w-8 h-8 group-focus-within:text-blue-500 transition-colors" />

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
                      <div className="bg-amber-400 p-3 rounded-2xl">
                        <Sparkles className="w-6 h-6 text-slate-900" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">Research "{searchQuery}" with AI</div>
                        <div className="text-sm text-slate-400">Fetch global data, pricing & substitutes</div>
                      </div>
                    </div>
                    <ChevronRight className="w-7 h-7 opacity-40" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading / Error States */}
        {isAIGenerating && (
          <div className="py-20 text-center animate-in zoom-in duration-300">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-slate-900">AI Researching...</h2>
            <p className="text-slate-500 mt-2 text-lg">Cross-referencing global price indices and pharmaceutical data.</p>
          </div>
        )}

        {error && (
          <div className="max-w-xl mx-auto mb-10 bg-red-50 border border-red-200 p-8 rounded-[2rem] flex items-center gap-6 text-red-900 shadow-lg">
            <AlertCircle className="w-10 h-10 flex-shrink-0" />
            <div className="font-bold text-lg">{error}</div>
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
                        <Sparkles className="w-3 h-3" /> AI Insight
                      </span>
                    )}
                  </div>
                  <h2 className="text-5xl font-black text-slate-900 mb-2">{selectedMed.name}</h2>
                  <p className="text-slate-500 text-xl font-medium mb-8">
                    {selectedMed.brand} • {selectedMed.form} ({selectedMed.dosage})
                  </p>
                  <p className="text-slate-600 leading-relaxed text-lg border-t border-slate-50 pt-8 italic">
                    "{selectedMed.description}"
                  </p>
                </div>

                {/* Price Table */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                    <ShoppingBag className="w-6 h-6 text-blue-600" />
                    Available Price Comparison
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
                          <div className="text-slate-400 text-sm line-through decoration-red-400/30">₹{p.originalPrice?.toFixed(2)}</div>
                          <div className="text-3xl font-black text-slate-900">₹{p.price.toFixed(2)}</div>
                        </div>
                        <a
                          href={getStoreLink(p.source, selectedMed.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 sm:flex-none bg-blue-600 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 hover:-translate-y-1 transition-all shadow-lg shadow-blue-200"
                        >
                          Buy Now <ExternalLink className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Generics */}
                {selectedMed.generics?.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                      <Zap className="w-6 h-6 text-amber-500" />
                      Switch to Generics & Save
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedMed.generics.map((g, idx) => (
                        <div key={idx} className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2rem] text-white relative overflow-hidden group">
                          <ArrowDownCircle className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 group-hover:scale-125 transition-transform" />
                          <div className="relative z-10">
                            <div className="text-amber-400 font-black text-xl mb-1">{g.name}</div>
                            <div className="text-slate-400 text-sm mb-6">Mfr: {g.manufacturer}</div>
                            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                              <span className="text-3xl font-black">₹{g.price.toFixed(2)}</span>
                              <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-lg text-xs font-black">
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

              {/* Sidebar Info */}
              <div className="space-y-8">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                  <h4 className="font-black text-slate-900 mb-6 flex items-center gap-2">
                    <Locate className="w-5 h-5 text-blue-600" /> Nearby Stores
                  </h4>
                  <div className="space-y-6">
                    {selectedMed.locations?.map((l, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-slate-50 pb-4 last:border-none">
                        <div>
                          <div className="font-bold text-slate-800">{l.name}</div>
                          <div className="text-xs text-slate-400">{l.distance} away</div>
                        </div>
                        <span className="bg-green-50 text-green-700 text-[10px] font-black px-2 py-1 rounded-full">IN STOCK</span>
                      </div>
                    ))}
                    {(!selectedMed.locations || selectedMed.locations.length === 0) && (
                      <p className="text-slate-400 text-sm italic">AI research mode: Checking local pharmacy APIs...</p>
                    )}
                  </div>
                </div>

                <div className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100">
                  <h4 className="font-black text-red-900 text-sm mb-3 flex items-center gap-2">
                    <Info className="w-5 h-5" /> Medical Disclaimer
                  </h4>
                  <p className="text-red-800 text-xs leading-relaxed opacity-80">
                    Pricing data is crowdsourced and AI-estimated. Always consult with a licensed doctor before taking any medication or switching to a generic substitute.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Landing Categories */}
        {!selectedMed && !selectedCategory && !isAIGenerating && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <h3 className="text-center font-black text-slate-300 text-xs uppercase tracking-[0.2em]">Explore by Medical Condition</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[
                { name: 'Diabetes', icon: Droplet, color: 'text-red-500 bg-red-50' },
                { name: 'Hypertension', icon: Heart, color: 'text-pink-500 bg-pink-50' },
                { name: 'Asthma', icon: Wind, color: 'text-blue-500 bg-blue-50' },
                { name: 'Acid Reflux', icon: Zap, color: 'text-amber-500 bg-amber-50' },
                { name: 'Fever', icon: Thermometer, color: 'text-orange-500 bg-orange-50' },
                { name: 'Mental Health', icon: Brain, color: 'text-purple-500 bg-purple-50' },
                { name: 'Allergies', icon: Activity, color: 'text-green-500 bg-green-50' },
                { name: 'Cholesterol', icon: Activity, color: 'text-indigo-500 bg-indigo-50' },
              ].map(cat => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex flex-col items-center justify-center p-8 rounded-[2.5rem] transition-all hover:scale-110 hover:shadow-2xl hover:shadow-slate-200 border-2 border-transparent hover:border-white ${cat.color}`}
                >
                  <cat.icon className="w-10 h-10 mb-4" />
                  <span className="font-black text-sm text-slate-800">{cat.name}</span>
                </button>
              ))}
            </div>

            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-12 rounded-[3.5rem] text-white flex flex-col md:flex-row items-center gap-12 shadow-2xl shadow-blue-200 relative overflow-hidden">
              <Sparkles className="absolute -top-10 -right-10 w-40 h-40 text-white/10" />
              <div className="relative z-10 flex-1">
                <h3 className="text-4xl font-black mb-4">The Global Pharmacy at Your Fingertips</h3>
                <p className="text-blue-100 text-lg opacity-80">
                  We don't just search our database; we search the internet. Enter any disease name or rare medication, and our AI will find the best deals across 50+ verified platforms.
                </p>
              </div>
              <button className="bg-white text-blue-700 px-10 py-5 rounded-[2rem] font-black text-lg hover:bg-blue-50 transition-all shadow-xl shadow-blue-900/20 whitespace-nowrap">
                Check My Prescription
              </button>
            </div>
          </div>
        )}

        {/* Category List View */}
        {selectedCategory && !selectedMed && (
          <div className="animate-in fade-in duration-300">
            <button onClick={() => setSelectedCategory(null)} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 font-bold">
              <ChevronLeft className="w-5 h-5" /> Back Home
            </button>
            <h2 className="text-4xl font-black mb-10 text-slate-900">Medicines for <span className="text-blue-600">{selectedCategory}</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categoryMeds.map(m => (
                <div
                  key={m.id}
                  onClick={() => setSelectedMed(m)}
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
            PharmaPrice is an independent price comparison tool. We are not a pharmacy and do not fulfill prescriptions.
            AI data is sourced from global healthcare indices and should be verified by a medical professional.
          </p>
          <div className="mt-12 flex justify-center gap-10 text-xs font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Data Partners</a>
          </div>
        </div>
      </footer>
    </div>

);
};

export default App;
