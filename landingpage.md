import React, { useState, useEffect } from 'react';
import {
Stethoscope,
Search,
MapPin,
Pill,
TrendingDown,
ShieldCheck,
FileText,
Clock,
Zap,
Microscope,
Activity,
BrainCircuit,
History,
MessageSquare,
Mic,
ChevronRight,
ArrowRight,
Sparkles,
Lock,
HeartPulse,
Scale
} from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, badge }) => (

  <div className="group relative p-6 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-xl transition-all duration-300 hover:border-sky-500/50 hover:bg-slate-900/60 hover:-translate-y-1 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 group-hover:scale-110 transition-transform">
          <Icon size={24} />
        </div>
        {badge && (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            {badge}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white group-hover:text-sky-400 transition-colors">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
      </div>
    </div>
  </div>
);

const SectionHeader = ({ title, subtitle, centered = true }) => (

  <div className={`mb-16 ${centered ? 'text-center' : ''}`}>
    <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
      {title}
    </h2>
    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
      {subtitle}
    </p>
  </div>
);

export default function App() {
const [scrolled, setScrolled] = useState(false);

useEffect(() => {
const handleScroll = () => setScrolled(window.scrollY > 20);
window.addEventListener('scroll', handleScroll);
return () => window.removeEventListener('scroll', handleScroll);
}, []);

const features = [
{ icon: Stethoscope, title: "Symptom Analysis", description: "Structured data conversion from vague symptoms to clinical-grade summaries." },
{ icon: BrainCircuit, title: "Knowledge Library", description: "Vast repository of diseases and conditions, explained with peer-reviewed accuracy." },
{ icon: MapPin, title: "Hospital Locator", description: "Real-time proximity mapping to specialized centers and urgent care facilities." },
{ icon: Search, title: "Pharmacy Finder", description: "Locate specific medications and compare stock availability across regions." },
{ icon: TrendingDown, title: "Price Comparator", description: "Transparency engine for medicine costs, finding you the most ethical price point." },
{ icon: Lock, title: "Health Vault", description: "Zero-knowledge encrypted storage for clinical records and medical history." },
{ icon: Sparkles, title: "Jargon Cleaner", description: "Simplifies complex medical terminology into clear, actionable language." },
{ icon: FileText, title: "Report Comparison", description: "Analyze variations between historical and current lab reports automatically." },
{ icon: Activity, title: "Memory Aid", description: "Interactive tools to help patients retain complex instructions and terminology." },
{ icon: HeartPulse, title: "Habit Explainer", description: "Visualizes the physiological impact of lifestyle changes on your biomarkers." },
{ icon: Clock, title: "Visit Planner", description: "Generates doctor visit checklists and prioritized questions for specialists." },
{ icon: Scale, title: "Form Helper", description: "Assists in understanding and filling out complex medical onboarding forms." },
{ icon: Microscope, title: "MedScan AI", description: "Optical recognition for physical reports with instant terminology breakdown." },
{ icon: ShieldCheck, title: "Specialist Finder", description: "Curated matching based on sub-specialties and clinical track records." },
{ icon: Mic, title: "Instant Clinician", description: "Voice-first AI consultation assistant for high-speed, hands-free support.", badge: "Beta" }
];

const upcoming = [
{ title: "Risk Prediction Models", description: "Probabilistic health modeling based on current biomarkers." },
{ title: "Trend Analysis", description: "Long-term trajectory mapping for chronic conditions." },
{ title: "Preventive Insights", description: "Early-warning alerts for metabolic and cardiovascular shifts." }
];

return (
<div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-sky-500/30">
{/_ Background Decor _/}
<div className="fixed inset-0 overflow-hidden pointer-events-none">
<div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-sky-600/10 rounded-full blur-[120px]" />
<div className="absolute top-[20%] -right-[10%] w-[30%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />
<div className="absolute bottom-0 left-[20%] w-[60%] h-[20%] bg-blue-600/5 rounded-full blur-[120px]" />
</div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-[#020617]/80 backdrop-blur-md border-slate-800' : 'bg-transparent border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Zap className="text-white fill-white" size={18} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">ClineXa</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#" className="hover:text-sky-400 transition-colors">Platform</a>
            <a href="#" className="hover:text-sky-400 transition-colors">Safety</a>
            <a href="#" className="hover:text-sky-400 transition-colors">Enterprise</a>
          </div>
          <div className="flex items-center gap-4">
            <button className="hidden sm:block text-sm font-medium hover:text-white transition-colors">Log In</button>
            <button className="bg-white text-slate-900 px-5 py-2 rounded-full text-sm font-bold hover:bg-sky-50 transition-colors shadow-lg shadow-white/10">
              Start Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold uppercase tracking-widest mb-8 animate-fade-in">
            <Sparkles size={14} /> Intelligence for Life
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight mb-8 leading-[1.1]">
            One Platform. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-400">
              Smarter Health Decisions.
            </span>
          </h1>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-400 leading-relaxed mb-12">
            AI-powered tools that help users understand symptoms, medicines, reports, and medical decisions — faster, clearer, and more accurately than ever before.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-8 py-4 bg-sky-500 text-white rounded-full font-bold hover:bg-sky-400 transition-all hover:scale-105 shadow-xl shadow-sky-500/20 flex items-center justify-center gap-2">
              Start Free <ArrowRight size={18} />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-slate-900 border border-slate-800 text-white rounded-full font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
              Explore Features
            </button>
          </div>
        </div>
      </section>

      {/* Platform Overview */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-sky-500 font-bold tracking-widest uppercase text-sm mb-4">The New Standard</div>
              <h2 className="text-4xl font-bold text-white mb-6">Built for clarity, not just data.</h2>
              <p className="text-lg text-slate-400 leading-relaxed mb-8">
                ClineXa is an AI-powered health intelligence system designed to empower patients with knowledge. We don't diagnose; we provide the clarity and preparation you need to have meaningful conversations with your doctor.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="text-white font-bold flex items-center gap-2"><div className="w-1 h-4 bg-sky-500 rounded-full" /> Preparation</div>
                  <p className="text-sm text-slate-500">Walk into clinic visits with organized data and checklists.</p>
                </div>
                <div className="space-y-2">
                  <div className="text-white font-bold flex items-center gap-2"><div className="w-1 h-4 bg-indigo-500 rounded-full" /> Education</div>
                  <p className="text-sm text-slate-500">Understand your medications and conditions in plain language.</p>
                </div>
              </div>
            </div>
            <div className="relative aspect-square md:aspect-video lg:aspect-square bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl border border-slate-800 p-8 flex items-center justify-center overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
               <div className="relative w-full max-w-sm space-y-4">
                 {[1,2,3].map(i => (
                   <div key={i} className={`p-4 rounded-xl bg-slate-800/50 border border-slate-700 backdrop-blur-md animate-pulse`} style={{animationDelay: `${i * 0.2}s`}}>
                     <div className="flex gap-4">
                       <div className="w-10 h-10 rounded bg-slate-700" />
                       <div className="flex-1 space-y-2">
                         <div className="h-4 bg-slate-700 rounded w-3/4" />
                         <div className="h-3 bg-slate-700/50 rounded w-1/2" />
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Ecosystem Grid */}
      <section className="py-24 px-6 bg-[#03081c]/50">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="The Health Intelligence Ecosystem"
            subtitle="A comprehensive suite of tools designed to cover every touchpoint of your medical journey."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <FeatureCard key={idx} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* AI Layer */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-[40px] bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-sky-500/5 blur-[100px]" />
            <div className="p-8 md:p-16 grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-white mb-6">Explainable AI Intelligence</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-400">
                      <ChevronRight size={20} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1">Structured Analysis</h4>
                      <p className="text-slate-400 text-sm">Our AI transforms raw notes into professional sections: Symptom Mapping, Lab Analysis, and Risk Profiles.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1">Safety Protocols</h4>
                      <p className="text-slate-400 text-sm">Every suggestion is cross-referenced with clinical literature, emphasizing that ClineXa provides education, not diagnosis.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                      <Search size={20} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1">Total Transparency</h4>
                      <p className="text-slate-400 text-sm">See the 'Why' behind every explanation. We bridge the gap between AI black-boxes and human trust.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-950/50 border border-slate-800 rounded-3xl p-6 font-mono text-xs">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  <span className="ml-2 text-slate-500">clinexa-engine-v4.log</span>
                </div>
                <div className="space-y-2 text-sky-400/80">
                  <p>&gt; Analyzing patient input: "Persistent mild cough for 3 days..."</p>
                  <p>&gt; Cross-referencing current CDC respiratory database...</p>
                  <p className="text-white">&gt; Status: Formatting results into 'Physician-Ready Summary'</p>
                  <p>&gt; [Success] Jargon filtered: 'Tussis' -&gt; 'Dry Cough'</p>
                  <p className="text-indigo-400">&gt; Safety Check: Completed. No life-threatening red flags detected.</p>
                  <div className="h-4 w-1 bg-sky-500 animate-pulse mt-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Systems */}
      <section className="py-24 px-6 bg-[#03081c]/50">
        <div className="max-w-7xl mx-auto text-center">
          <SectionHeader
            title="Future Ready"
            subtitle="The next generation of health prediction is currently in development at our labs."
          />
          <div className="grid md:grid-cols-3 gap-8">
            {upcoming.map((item, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-slate-900/30 border border-slate-800/50 text-left group">
                <div className="text-[10px] font-bold text-sky-500 uppercase tracking-widest mb-4 inline-block px-2 py-0.5 rounded bg-sky-500/5 border border-sky-500/20">
                  In Development
                </div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-sky-400 transition-colors">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Responsibility */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block p-4 rounded-full bg-slate-900 border border-slate-800 mb-8">
            <ShieldCheck className="text-sky-500" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-6">Our Responsibility</h2>
          <p className="text-lg text-slate-400 mb-12">
            ClineXa is built on a foundation of ethical AI. We believe technology should augment human expertise, not replace it. Our platform is strictly educational and designed to support the patient-provider relationship.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="text-white font-bold mb-1">Privacy First</div>
              <p className="text-xs text-slate-500">HIPAA-compliant, end-to-end encryption for all health records.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-white font-bold mb-1">Ethical AI</div>
              <p className="text-xs text-slate-500">Transparent data sourcing with clear accuracy ratings.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-white font-bold mb-1">Clinical Grade</div>
              <p className="text-xs text-slate-500">Built in consultation with practicing medical specialists.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative p-12 md:p-24 rounded-[60px] bg-sky-600 overflow-hidden text-center group">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-600 to-indigo-700" />
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">
                Understand Your Health — <br className="hidden md:block" />
                Before You Step Into the Clinic.
              </h2>
              <button className="bg-white text-sky-600 px-10 py-5 rounded-full text-lg font-bold hover:scale-105 transition-all shadow-2xl shadow-black/20">
                Get Started for Free
              </button>
              <p className="mt-8 text-sky-100/70 text-sm">Join over 50,000 users managing their health with intelligence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-900 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Zap className="text-sky-500" size={20} />
            <span className="text-lg font-bold text-white tracking-tight">ClineXa</span>
          </div>
          <div className="flex gap-8 text-xs font-medium text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Settings</a>
          </div>
          <div className="text-xs text-slate-600">
            © 2024 ClineXa Health Intelligence. All rights reserved.
          </div>
        </div>
      </footer>
    </div>

);
}
