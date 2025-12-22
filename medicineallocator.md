import React, { useState, useMemo } from 'react';
import {
Search,
AlertTriangle,
Info,
Activity,
Thermometer,
Wind,
ShieldCheck,
ExternalLink,
Droplets,
HeartPulse,
Moon,
Eye,
LifeBuoy,
Zap
} from 'lucide-react';

const MEDICINE_DATA = [
{
category: "Pain & Fever",
id: "pain-fever",
icon: <Thermometer className="w-5 h-5 text-red-500" />,
symptoms: ["Headache", "Fever", "Muscle Aches", "Toothache", "Menstrual Cramps"],
options: [
{
generic: "Acetaminophen",
brands: ["Tylenol", "Panadol"],
type: "Analgesic/Antipyretic",
use: "Best for fever and pain. Easier on the stomach than NSAIDs.",
precautions: "Do not exceed 4,000mg/day. Avoid with alcohol."
},
{
generic: "Ibuprofen",
brands: ["Advil", "Motrin"],
type: "NSAID",
use: "Reduces inflammation, pain, and fever.",
precautions: "Take with food. Use caution if you have kidney issues or asthma."
},
{
generic: "Naproxen Sodium",
brands: ["Aleve"],
type: "NSAID",
use: "Long-lasting pain relief (up to 12 hours).",
precautions: "Do not take with other NSAIDs like Ibuprofen."
}
],
safeAlternatives: [
"Cool compress for head/neck",
"Hydration (water/electrolytes)",
"Dark, quiet room for migraines",
"Magnesium-rich foods"
]
},
{
category: "Cold, Cough & Flu",
id: "cold-cough",
icon: <Wind className="w-5 h-5 text-blue-500" />,
symptoms: ["Cough", "Congestion", "Runny Nose", "Sore Throat", "Mucus"],
options: [
{
generic: "Dextromethorphan",
brands: ["Delsym", "Robitussin"],
type: "Cough Suppressant",
use: "Blocks cough reflex. Best for dry, hacking coughs.",
precautions: "Check label for combination ingredients."
},
{
generic: "Guaifenesin",
brands: ["Mucinex"],
type: "Expectorant",
use: "Thins mucus. Best for wet/chesty coughs.",
precautions: "Drink plenty of water to help the medicine work."
},
{
generic: "Pseudoephedrine",
brands: ["Sudafed (Original)"],
type: "Decongestant",
use: "Clears sinus congestion and ear pressure.",
precautions: "Can increase heart rate and blood pressure. Avoid late at night."
}
],
safeAlternatives: [
"Honey (1 tsp) for cough (ages 1+)",
"Steam inhalation or hot shower",
"Saline nasal rinse (Neti pot)",
"Gargling warm salt water"
]
},
{
category: "Allergies",
id: "allergies",
icon: <Droplets className="w-5 h-5 text-purple-500" />,
symptoms: ["Sneezing", "Itchy Eyes", "Hives", "Hay Fever"],
options: [
{
generic: "Loratadine",
brands: ["Claritin"],
type: "Antihistamine",
use: "Non-drowsy relief for 24 hours.",
precautions: "Take daily for best results during allergy season."
},
{
generic: "Cetirizine",
brands: ["Zyrtec"],
type: "Antihistamine",
use: "Fast-acting relief. Potentially more effective for skin allergies.",
precautions: "May cause slight drowsiness in some users."
},
{
generic: "Diphenhydramine",
brands: ["Benadryl"],
type: "1st Gen Antihistamine",
use: "Strong relief for acute allergic reactions or hives.",
precautions: "Causes significant drowsiness. Do not drive."
}
],
safeAlternatives: [
"Keep windows closed during high pollen",
"Air purifiers with HEPA filters",
"Shower after coming indoors",
"Quercetin supplements"
]
},
{
category: "Digestive Health",
id: "digestive",
icon: <Activity className="w-5 h-5 text-green-500" />,
symptoms: ["Heartburn", "Indigestion", "Diarrhea", "Constipation", "Nausea"],
options: [
{
generic: "Calcium Carbonate",
brands: ["Tums", "Rolaids"],
type: "Antacid",
use: "Neutralizes stomach acid instantly.",
precautions: "Do not use for more than 2 weeks without consulting a doctor."
},
{
generic: "Loperamide",
brands: ["Imodium"],
type: "Anti-diarrheal",
use: "Slows digestion to stop diarrhea.",
precautions: "Do not use if you have a high fever or bloody stool."
},
{
generic: "Famotidine",
brands: ["Pepcid AC"],
type: "H2 Blocker",
use: "Prevents and relieves heartburn for up to 12 hours.",
precautions: "Best taken 15-60 minutes before trigger meals."
}
],
safeAlternatives: [
"Ginger tea for nausea",
"Probiotic-rich foods (yogurt)",
"Fiber (psyllium husk/oats)",
"Peppermint oil for bloating"
]
},
{
category: "Skin & First Aid",
id: "skin-aid",
icon: <LifeBuoy className="w-5 h-5 text-orange-500" />,
symptoms: ["Itching", "Rashes", "Minor Cuts", "Insect Bites", "Sunburn"],
options: [
{
generic: "Hydrocortisone 1%",
brands: ["Cortizone-10"],
type: "Topical Steroid",
use: "Relieves itching and inflammation from rashes or bites.",
precautions: "Do not use on broken skin or face without advice."
},
{
generic: "Bacitracin / Polymyxin B",
brands: ["Neosporin", "Polysporin"],
type: "Antibiotic Ointment",
use: "Prevents infection in minor cuts, scrapes, and burns.",
precautions: "Clean the wound before applying. Watch for allergic reactions."
},
{
generic: "Colloidal Oatmeal",
brands: ["Aveeno"],
type: "Skin Protectant",
use: "Soothes dry, itchy, or irritated skin.",
precautions: "Safe for sensitive skin; use in baths or as a lotion."
}
],
safeAlternatives: [
"Aloe vera gel for cooling burns",
"Witch hazel for minor irritation",
"Cold water compresses",
"Loose cotton clothing"
]
},
{
category: "Sleep Support",
id: "sleep-aid",
icon: <Moon className="w-5 h-5 text-indigo-500" />,
symptoms: ["Sleeplessness", "Jet Lag", "Difficulty Falling Asleep"],
options: [
{
generic: "Melatonin",
brands: ["Natrol", "Nature Made"],
type: "Hormone Supplement",
use: "Helps regulate sleep-wake cycles and manage jet lag.",
precautions: "Start with a low dose (1-3mg). May cause vivid dreams."
},
{
generic: "Doxylamine Succinate",
brands: ["Unisom SleepTabs"],
type: "Sedating Antihistamine",
use: "Short-term relief of occasional sleeplessness.",
precautions: "Expect grogginess the next morning. Do not mix with alcohol."
}
],
safeAlternatives: [
"Limit screen time 1 hour before bed",
"Maintain a cool, dark bedroom",
"Chamomile or Valerian root tea",
"Guided progressive muscle relaxation"
]
},
{
category: "Eye & Ear Care",
id: "eye-ear",
icon: <Eye className="w-5 h-5 text-cyan-500" />,
symptoms: ["Dry Eyes", "Eye Allergy", "Ear Wax Buildup", "Swimmer's Ear"],
options: [
{
generic: "Carboxymethylcellulose",
brands: ["Refresh", "Systane"],
type: "Lubricant Eye Drops",
use: "Relieves dryness and irritation (Artificial Tears).",
precautions: "If using frequently, look for preservative-free vials."
},
{
generic: "Ketotifen",
brands: ["Zaditor", "Alaway"],
type: "Antihistamine Eye Drops",
use: "Relieves itchy eyes due to pollen or pet dander.",
precautions: "Remove contact lenses before use."
},
{
generic: "Carbamide Peroxide",
brands: ["Debrox"],
type: "Earwax Removal Aid",
use: "Softens and loosens stubborn earwax.",
precautions: "Do not use if you have a perforated eardrum."
}
],
safeAlternatives: [
"20-20-20 rule for digital eye strain",
"Warm compress for clogged tear ducts",
"Keeping ears dry after swimming",
"Humidifier for dry environments"
]
}
];

const Disclaimer = () => (

  <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg">
    <div className="flex items-start">
      <AlertTriangle className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
      <div>
        <h3 className="text-amber-800 font-bold text-sm uppercase tracking-wide">Medical Disclaimer</h3>
        <p className="text-amber-700 text-xs mt-1 leading-relaxed">
          This platform is for <strong>informational purposes only</strong>. It does not provide medical diagnosis or professional advice. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. <strong>In case of a medical emergency, call 911 or your local emergency services immediately.</strong>
        </p>
      </div>
    </div>
  </div>
);

export default function App() {
const [searchQuery, setSearchQuery] = useState("");
const [selectedCategory, setSelectedCategory] = useState(null);

const filteredData = useMemo(() => {
const query = searchQuery.toLowerCase().trim();
if (!query) return MEDICINE_DATA;

    return MEDICINE_DATA.map(cat => ({
      ...cat,
      options: cat.options.filter(opt =>
        opt.generic.toLowerCase().includes(query) ||
        opt.brands.some(b => b.toLowerCase().includes(query)) ||
        cat.symptoms.some(s => s.toLowerCase().includes(query)) ||
        cat.category.toLowerCase().includes(query)
      )
    })).filter(cat => cat.options.length > 0);

}, [searchQuery]);

return (
<div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
{/_ Header _/}
<header className="bg-white border-b sticky top-0 z-10">
<div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
<div className="flex items-center gap-2">
<ShieldCheck className="w-8 h-8 text-indigo-600" />
<h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
SafeMeds Guide
</h1>
</div>
<nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
<a href="#" className="hover:text-indigo-600">Home</a>
<a href="#" className="hover:text-indigo-600">Find Symptoms</a>
<a href="#" className="hover:text-indigo-600">Safety Check</a>
</nav>
</div>
</header>

      <main className="max-w-4xl mx-auto px-4 pt-8">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            How are you feeling?
          </h2>
          <p className="text-slate-500 mt-2">
            Find generic OTC medication suggestions and natural alternatives.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-4 border-none bg-white rounded-2xl shadow-lg ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all text-lg"
            placeholder="Search symptoms (e.g. Itch, Sleep, Fever)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Disclaimer />

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-10">
          {MEDICINE_DATA.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all border-2 text-center h-full ${
                selectedCategory === cat.id
                ? 'bg-indigo-50 border-indigo-500 shadow-md ring-2 ring-indigo-200 ring-offset-2'
                : 'bg-white border-transparent hover:border-slate-200 hover:shadow-sm'
              }`}
            >
              <div className={`p-2.5 rounded-full ${selectedCategory === cat.id ? 'bg-white shadow-inner' : 'bg-slate-50'}`}>
                {cat.icon}
              </div>
              <span className="text-[10px] font-bold text-slate-700 leading-tight uppercase tracking-tighter">
                {cat.category}
              </span>
            </button>
          ))}
        </div>

        {/* Results Container */}
        <div className="space-y-8">
          {filteredData
            .filter(cat => !selectedCategory || cat.id === selectedCategory)
            .map((cat) => (
            <section key={cat.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">{cat.icon}</div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{cat.category}</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {cat.symptoms.map(s => (
                        <span key={s} className="text-[10px] bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-indigo-500" />
                    Pharmacological Options
                  </h4>
                  {cat.options.map((opt, i) => (
                    <div key={i} className="group p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-bold text-indigo-700 leading-tight">{opt.generic}</h5>
                        <span className="text-[9px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-md font-bold shrink-0 ml-2">OTC</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mb-2">
                        Common brands: <span className="text-slate-700 font-semibold">{opt.brands.join(", ")}</span>
                      </div>
                      <p className="text-xs text-slate-600 mb-3 leading-relaxed">{opt.use}</p>
                      <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm">
                        <Info className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span className="text-[10.5px] text-slate-500 italic leading-tight">{opt.precautions}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <HeartPulse className="w-3.5 h-3.5 text-emerald-500" />
                    Non-Drug Relief
                  </h4>
                  <div className="bg-emerald-50/40 rounded-xl p-5 border border-emerald-100/50 h-full">
                    <ul className="space-y-3">
                      {cat.safeAlternatives.map((alt, i) => (
                        <li key={i} className="flex items-start gap-3 text-xs text-slate-600 font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                          {alt}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 p-4 bg-white/80 rounded-lg border border-emerald-100 text-[11px] text-slate-500 leading-normal">
                      <strong>Pro-Tip:</strong> Addressing lifestyle factors like hydration, light, and humidity can often provide relief without the side effects of medication.
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ))}

          {filteredData.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
              <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-slate-800 font-bold">No results found</h3>
              <p className="text-slate-500 text-sm">Try searching for simple terms like "rashes" or "jet lag".</p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 text-indigo-600 text-sm font-bold hover:underline"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        {/* Emergency Footnote */}
        <div className="mt-12 bg-slate-900 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="p-4 bg-red-500 rounded-2xl shadow-lg shadow-red-500/20">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold">When is it an emergency?</h3>
              <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                Seek professional help if you experience sudden chest pain, severe allergic reactions (difficulty breathing/swollen throat), extreme abdominal pain, or a fever that doesn't break for 3 days.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <button className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors">
                Emergency Guide
              </button>
              <span className="text-[10px] text-slate-500 text-center uppercase tracking-widest font-bold">Call 911 for emergencies</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-4xl mx-auto px-4 mt-16 pt-10 border-t border-slate-200">
        <div className="grid md:grid-cols-3 gap-10">
          <div>
            <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Trusted Sources</h4>
            <ul className="space-y-3 text-xs text-slate-500">
              <li><a href="#" className="hover:text-indigo-600 flex items-center gap-1">FDA Over-the-Counter Database <ExternalLink className="w-3 h-3" /></a></li>
              <li><a href="#" className="hover:text-indigo-600 flex items-center gap-1">WHO Model List of Essential Meds <ExternalLink className="w-3 h-3" /></a></li>
              <li><a href="#" className="hover:text-indigo-600 flex items-center gap-1">Mayo Clinic Symptom Checker <ExternalLink className="w-3 h-3" /></a></li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Storage & Safety</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
              Keep all medications out of reach of children. Store in a cool, dry place away from direct sunlight.
              <strong> Accidental drug overlap</strong> is a common danger: checking the 'Active Ingredients' on different brand labels can prevent double-dosing.
            </p>
            <div className="flex gap-4">
              <div className="text-[10px] bg-slate-100 px-3 py-1 rounded text-slate-600 font-bold uppercase">Version 1.2 Growing Database</div>
              <div className="text-[10px] bg-indigo-50 px-3 py-1 rounded text-indigo-600 font-bold uppercase">Verified OTC List</div>
            </div>
          </div>
        </div>
        <div className="mt-12 text-center text-[10px] text-slate-400 font-medium pb-8 uppercase tracking-widest">
          &copy; 2025 SafeMeds Guide. Education platform. No diagnostic intent.
        </div>
      </footer>
    </div>

);
}
