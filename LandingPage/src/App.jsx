import React, { useState, useEffect } from "react";
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
  Scale,
  Eye,
  Database,
} from "lucide-react";

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  badge,
  className = "",
}) => (
  <div
    className={`premium-border-wrapper-card group bg-black/40 transition-all duration-700 hover:-translate-y-3 hover:shadow-[0_40px_80px_-15px_rgba(56,189,248,0.3)] ${className}`}
  >
    <div className="premium-border-anim-card" />
    <div className="premium-border-content-card bg-[#000] p-10 h-full flex flex-col relative overflow-hidden">
      {/* Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Glossy Reflection */}
      <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

      <div className="flex items-center justify-between relative z-10 mb-8">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-white/[0.08] to-transparent border border-white/[0.1] text-sky-400 group-hover:text-white group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(56,189,248,0.5)] transition-all duration-500">
          <Icon size={32} strokeWidth={1.5} />
        </div>
        {badge && (
          <span className="text-[10px] font-black uppercase tracking-[0.25em] px-4 py-1.5 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-xl shadow-sky-500/20">
            {badge}
          </span>
        )}
      </div>

      <div className="relative z-10 flex-1">
        <h3 className="text-2xl font-bold text-white group-hover:text-sky-400 transition-colors tracking-tighter mb-4">
          {title}
        </h3>
        <p className="text-base leading-relaxed text-slate-500 font-medium group-hover:text-slate-300 transition-colors">
          {description}
        </p>
      </div>

      <div className="pt-8 flex items-center text-sky-400 text-xs font-black tracking-[0.3em] uppercase opacity-40 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
        Access Module <ChevronRight size={16} className="ml-2" />
      </div>
    </div>
  </div>
);

export default function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: Stethoscope,
      title: "Symptom Logic",
      description:
        "Convert descriptive patient feelings into clinical-grade diagnostic roadmaps for your doctor.",
      className: "md:col-span-2 lg:col-span-2",
    },
    {
      icon: BrainCircuit,
      title: "Medical Synthesis",
      description:
        "Peer-reviewed AI intelligence mapping symptoms to the latest clinical research.",
      className: "md:col-span-1 lg:col-span-1",
    },
    {
      icon: Microscope,
      title: "MedScan Vision",
      description:
        "OCR intelligence that decodes bloodwork and imaging results into plain language.",
      className: "md:col-span-1 lg:col-span-1",
    },
    {
      icon: Lock,
      title: "Biometric Vault",
      description:
        "Zero-knowledge encryption for your sensitive clinical history and genetic records.",
      className: "md:col-span-2 lg:col-span-2",
    },
    {
      icon: Mic,
      title: "Direct Voice-AI",
      description:
        "High-speed, voice-activated medical consultation assistant for hands-free support.",
      badge: "Beta",
      className: "md:col-span-3 lg:col-span-3",
    },
  ];

  return (
    <div className="min-h-screen bg-[#000] text-slate-300 font-sans selection:bg-sky-500/30 overflow-x-hidden">
      <style>
        {`
          @keyframes border-rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }

          .premium-border-wrapper {
            position: relative;
            padding: 2.5px;
            overflow: hidden;
            border-radius: 9999px;
            display: inline-block;
          }
          
          .premium-border-anim {
            position: absolute;
            inset: -200%;
            background: conic-gradient(from 0deg, transparent 40%, #0ea5e9 60%, #6366f1 80%, #fff 100%);
            animation: border-rotate 2.5s linear infinite;
          }

          .premium-border-content {
            position: relative;
            z-index: 10;
            background: inherit;
            border-radius: inherit;
          }

          .premium-border-wrapper-card {
            position: relative;
            padding: 3px; 
            overflow: hidden;
            border-radius: 2.5rem;
            height: 100%;
          }
          
          .premium-border-anim-card {
            position: absolute;
            inset: -150%;
            background: conic-gradient(from 0deg, transparent 80%, rgba(14, 165, 233, 0.4) 90%, #fff 100%);
            animation: border-rotate 8s linear infinite;
            opacity: 0.3;
          }
          
          .group:hover .premium-border-anim-card {
            opacity: 1;
            animation-duration: 3s;
            background: conic-gradient(from 0deg, transparent 60%, #0ea5e9 80%, #6366f1 90%, #fff 100%);
          }

          .premium-border-content-card {
            position: relative;
            z-index: 10;
            background: #000;
            border-radius: calc(2.5rem - 3px);
            height: 100%;
            width: 100%;
          }

          .apple-blur {
            backdrop-filter: saturate(180%) blur(20px);
          }
          
          .text-shadow-glow {
            text-shadow: 0 0 50px rgba(14, 165, 233, 0.5);
          }
        `}
      </style>

      {/* Atmospheric Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px]" />
        <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-700 ${
          scrolled
            ? "apple-blur bg-black/80 border-b border-white/10 py-4"
            : "bg-transparent py-8"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-10 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-11 h-11 bg-white text-black rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)] group-hover:rotate-12 transition-transform duration-500">
              <Zap className="fill-current" size={24} />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">
              ClineXa
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-12 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">
            <a href="#" className="hover:text-white transition-colors">
              Intelligence
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Safety Protocol
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Clinician Portal
            </a>
          </div>

          <div className="flex items-center gap-8">
            <button className="hidden sm:block text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">
              Member Access
            </button>
            <div className="premium-border-wrapper bg-black hover:scale-105 transition-transform duration-500">
              <div className="premium-border-anim" />
              <button className="premium-border-content bg-white text-black px-8 py-3 text-xs font-black uppercase tracking-[0.2em]">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Ultra-Hero Section */}
      <section className="relative pt-64 pb-40 px-10 z-10">
        <div className="max-w-[1400px] mx-auto text-center">
          <div className="premium-border-wrapper bg-black mb-12">
            <div className="premium-border-anim" />
            <div className="premium-border-content bg-sky-500/5 text-sky-400 text-[10px] font-black uppercase tracking-[0.4em] px-8 py-2.5 flex items-center gap-3">
              <Sparkles size={16} className="animate-pulse" /> Global Standard
              v4.0
            </div>
          </div>

          <h1 className="text-[5rem] md:text-[8rem] lg:text-[12rem] font-black text-white tracking-[-0.06em] leading-[0.8] mb-16 select-none">
            Prepared
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-400 to-slate-700 text-shadow-glow">
              Intelligence.
            </span>
          </h1>

          <p className="max-w-4xl mx-auto text-xl md:text-3xl text-slate-400 font-medium leading-snug mb-20 tracking-tight">
            ClineXa is the professional AI interface for modern health
            navigation. We convert raw clinical complexity into human clarity.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-10">
            <div className="premium-border-wrapper bg-sky-500 hover:scale-110 transition-all duration-700 group">
              <div className="premium-border-anim" />
              <button className="premium-border-content px-12 py-6 bg-sky-500 text-white font-black text-xl uppercase tracking-widest flex items-center gap-4">
                Begin Assessment{" "}
                <ArrowRight
                  size={24}
                  className="group-hover:translate-x-2 transition-transform"
                />
              </button>
            </div>
            <button className="group flex items-center gap-4 text-white font-black uppercase tracking-[0.4em] text-xs hover:text-sky-400 transition-colors">
              <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center group-hover:border-sky-400 transition-colors">
                <Eye size={20} />
              </div>
              Platform Tour
            </button>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="py-40 px-10 relative bg-[#000]">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-24 gap-10">
            <div className="max-w-2xl">
              <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none mb-8">
                Clinical grade. <br />
                Patient focus.
              </h2>
              <p className="text-xl text-slate-500 font-medium">
                The most advanced health intelligence ecosystem ever assembled.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="w-1/2 h-full bg-sky-500" />
              </div>
              <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">
                System Status: Optimal
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <FeatureCard key={idx} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Vault Simulation Section */}
      <section className="py-40 px-10 bg-[#000]">
        <div className="max-w-[1400px] mx-auto">
          <div className="rounded-[4rem] bg-gradient-to-br from-[#0a0a0a] to-[#000] border border-white/5 p-12 md:p-24 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-2/3 h-full bg-sky-600/5 blur-[120px] group-hover:bg-sky-600/10 transition-colors duration-1000" />

            <div className="grid lg:grid-cols-2 gap-24 items-center relative z-10">
              <div>
                <div className="w-20 h-20 rounded-3xl bg-white text-black flex items-center justify-center mb-10 shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                  <Database size={40} />
                </div>
                <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-10 leading-[0.9]">
                  Universal
                  <br />
                  Health Record.
                </h2>
                <p className="text-xl text-slate-400 font-medium leading-relaxed mb-12">
                  Own your data. ClineXa provides an immutable, encrypted ledger
                  for your lifelong medical history, instantly accessible but
                  entirely private.
                </p>
                <button className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-white hover:text-black transition-all">
                  Initialize Vault
                </button>
              </div>

              <div className="relative">
                <div className="absolute -inset-10 bg-sky-500/10 blur-[100px] rounded-full animate-pulse-soft" />
                <div className="bg-black/80 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 shadow-2xl">
                  <div className="space-y-8">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.03] border border-white/5 group/row hover:bg-white/[0.06] transition-colors"
                      >
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                            <FileText className="text-slate-400" size={20} />
                          </div>
                          <div>
                            <div className="text-white font-black text-sm tracking-tight">
                              Record_Entry_04{i}
                            </div>
                            <div className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mt-1">
                              Encrypted • 2.4 MB
                            </div>
                          </div>
                        </div>
                        <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Ultra CTA */}
      <section className="py-64 px-10 relative">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-20 inline-block animate-float">
            <Zap
              className="text-sky-400 mx-auto mb-16 drop-shadow-[0_0_30px_rgba(56,189,248,0.8)]"
              size={100}
            />
            <h2 className="text-6xl md:text-9xl font-black text-white tracking-tighter leading-[0.85] mb-16 select-none">
              The Standard <br />
              for Humanity.
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-12">
            <div className="premium-border-wrapper bg-white shadow-[0_0_50px_rgba(255,255,255,0.1)] hover:scale-110 transition-transform duration-700">
              <div className="premium-border-anim" />
              <button className="premium-border-content px-16 py-8 bg-white text-black text-2xl font-black tracking-tight uppercase">
                Reserve Access
              </button>
            </div>
          </div>

          <div className="mt-20 flex items-center justify-center gap-12 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
            <span>ISO 27001</span>
            <div className="w-1 h-1 bg-slate-800 rounded-full" />
            <span>HIPAA Compliant</span>
            <div className="w-1 h-1 bg-slate-800 rounded-full" />
            <span>GDPR Ready</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 border-t border-white/5 px-10 bg-black">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row justify-between items-start gap-20">
          <div className="max-w-sm">
            <div className="flex items-center gap-4 mb-10">
              <Zap className="text-sky-400" size={32} />
              <span className="text-3xl font-black tracking-tighter text-white">
                ClineXa
              </span>
            </div>
            <p className="text-slate-500 font-medium leading-relaxed">
              Designing the future of health intelligence through transparent AI
              and sovereign data ownership.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-24">
            <div className="space-y-6">
              <div className="text-white font-black text-[10px] uppercase tracking-[0.3em] mb-4">
                Architecture
              </div>
              <a
                href="#"
                className="block text-slate-500 hover:text-white transition-colors text-sm font-bold"
              >
                Engine
              </a>
              <a
                href="#"
                className="block text-slate-500 hover:text-white transition-colors text-sm font-bold"
              >
                Privacy
              </a>
              <a
                href="#"
                className="block text-slate-500 hover:text-white transition-colors text-sm font-bold"
              >
                Safety
              </a>
            </div>
            <div className="space-y-6">
              <div className="text-white font-black text-[10px] uppercase tracking-[0.3em] mb-4">
                Foundation
              </div>
              <a
                href="#"
                className="block text-slate-500 hover:text-white transition-colors text-sm font-bold"
              >
                Ethics
              </a>
              <a
                href="#"
                className="block text-slate-500 hover:text-white transition-colors text-sm font-bold"
              >
                Manifesto
              </a>
              <a
                href="#"
                className="block text-slate-500 hover:text-white transition-colors text-sm font-bold"
              >
                Labs
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">
            © 2024 CLINEXA SYSTEMS AG. ALL RIGHTS RESERVED.
          </div>
          <div className="flex gap-10">
            <div className="w-6 h-6 rounded-full border border-white/10 hover:bg-white transition-colors group cursor-pointer flex items-center justify-center">
              <div className="w-1 h-1 bg-white group-hover:bg-black rounded-full" />
            </div>
            <div className="w-6 h-6 rounded-full border border-white/10 hover:bg-white transition-colors group cursor-pointer flex items-center justify-center">
              <div className="w-1 h-1 bg-white group-hover:bg-black rounded-full" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
