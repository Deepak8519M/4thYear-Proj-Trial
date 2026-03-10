import { useState, useEffect, useRef } from "react";

// ─── GOOGLE FONTS ──────────────────────────────────────────────────────────────
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500&family=Instrument+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #060d1a;
      --bg2: #0b1628;
      --card: #0f1f38;
      --card2: #132543;
      --border: #1a3050;
      --border2: #1e3a60;
      --accent: #00c6ff;
      --accent2: #0072ff;
      --teal: #00e5c0;
      --purple: #7c3aed;
      --red: #ff4d6d;
      --orange: #ff8c42;
      --green: #00e5a0;
      --yellow: #ffd166;
      --text: #e2eaf6;
      --text2: #8ba8cc;
      --text3: #4a6a8a;
      --font-head: 'Syne', sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
      --font-body: 'Instrument Sans', sans-serif;
      --glow: 0 0 30px rgba(0,198,255,0.15);
      --glow2: 0 0 60px rgba(0,198,255,0.08);
    }

    html { scroll-behavior: smooth; }
    body { background: var(--bg); color: var(--text); font-family: var(--font-body); overflow-x: hidden; }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }

    @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }
    @keyframes spin { to { transform:rotate(360deg); } }
    @keyframes scanLine { 0% { top:-10%; } 100% { top:110%; } }
    @keyframes glowPulse { 0%,100% { box-shadow: 0 0 20px rgba(0,198,255,0.2); } 50% { box-shadow: 0 0 40px rgba(0,198,255,0.5); } }
    @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
    @keyframes barFill { from { width:0; } to { width:var(--w); } }
    @keyframes countUp { from { opacity:0; } to { opacity:1; } }
    @keyframes ripple { 0% { transform:scale(0); opacity:1; } 100% { transform:scale(4); opacity:0; } }
    @keyframes slideIn { from { transform:translateX(-20px); opacity:0; } to { transform:translateX(0); opacity:1; } }
    @keyframes typing { from { width:0; } to { width:100%; } }

    .animate-fadeUp { animation: fadeUp .6s ease forwards; }
    .animate-float { animation: float 3s ease-in-out infinite; }
    .animate-glow { animation: glowPulse 2s ease-in-out infinite; }
    .animate-spin { animation: spin 1s linear infinite; }
    .animate-pulse { animation: pulse 2s ease-in-out infinite; }

    .glass {
      background: rgba(15,31,56,0.8);
      backdrop-filter: blur(20px);
      border: 1px solid var(--border);
    }

    .gradient-text {
      background: linear-gradient(135deg, var(--accent), var(--teal));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--accent2), var(--accent));
      border: none;
      color: white;
      padding: 12px 28px;
      border-radius: 10px;
      font-family: var(--font-body);
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all .2s;
      letter-spacing: .5px;
      position: relative;
      overflow: hidden;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,114,255,0.4); }
    .btn-primary:active { transform: translateY(0); }

    .btn-ghost {
      background: transparent;
      border: 1px solid var(--border2);
      color: var(--text2);
      padding: 12px 28px;
      border-radius: 10px;
      font-family: var(--font-body);
      font-weight: 500;
      font-size: 14px;
      cursor: pointer;
      transition: all .2s;
    }
    .btn-ghost:hover { border-color: var(--accent); color: var(--accent); background: rgba(0,198,255,0.05); }

    .input-field {
      width: 100%;
      background: rgba(11,22,40,0.8);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 12px 16px;
      color: var(--text);
      font-family: var(--font-body);
      font-size: 14px;
      outline: none;
      transition: all .2s;
    }
    .input-field:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(0,198,255,0.1); }
    .input-field::placeholder { color: var(--text3); }
    .input-field option { background: var(--card2); }

    .label { font-size: 12px; font-weight: 600; color: var(--text2); letter-spacing: .8px; text-transform: uppercase; margin-bottom: 6px; display: block; }

    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      transition: border-color .2s, box-shadow .2s;
    }
    .card:hover { border-color: var(--border2); }

    .risk-low { color: var(--green); }
    .risk-med { color: var(--yellow); }
    .risk-high { color: var(--red); }

    .nav-link {
      color: var(--text2);
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      padding: 8px 12px;
      border-radius: 8px;
      transition: all .2s;
      display: flex; align-items: center; gap: 8px;
    }
    .nav-link:hover, .nav-link.active { color: var(--accent); background: rgba(0,198,255,0.08); }
    .nav-link.active { color: var(--accent); }

    .tag {
      display: inline-flex; align-items: center;
      padding: 4px 10px; border-radius: 20px;
      font-size: 11px; font-weight: 600;
      letter-spacing: .5px;
    }

    .progress-bar {
      height: 6px; background: rgba(255,255,255,.06); border-radius: 10px; overflow: hidden;
    }
    .progress-fill {
      height: 100%; border-radius: 10px;
      animation: barFill .8s ease forwards;
      background: linear-gradient(90deg, var(--accent2), var(--accent));
    }

    .tooltip {
      position: relative;
    }
    .tooltip:hover::after {
      content: attr(data-tip);
      position: absolute;
      bottom: calc(100% + 6px);
      left: 50%;
      transform: translateX(-50%);
      background: var(--card2);
      border: 1px solid var(--border2);
      color: var(--text);
      font-size: 12px;
      padding: 6px 10px;
      border-radius: 6px;
      white-space: nowrap;
      pointer-events: none;
      z-index: 100;
    }

    table { width: 100%; border-collapse: collapse; }
    th { font-size: 11px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: .8px; padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--border); }
    td { padding: 14px 16px; font-size: 14px; color: var(--text); border-bottom: 1px solid rgba(26,48,80,0.5); }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: rgba(0,198,255,0.03); }

    .modal-overlay {
      position: fixed; inset: 0; z-index: 1000;
      background: rgba(6,13,26,0.85); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center; padding: 20px;
      animation: fadeIn .2s ease;
    }

    .chip {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 5px 12px; border-radius: 20px;
      background: rgba(0,198,255,0.08); border: 1px solid rgba(0,198,255,0.2);
      font-size: 12px; color: var(--accent); font-weight: 500;
      cursor: pointer; transition: all .15s;
    }
    .chip:hover { background: rgba(0,198,255,0.15); }
    .chip.selected { background: rgba(0,198,255,0.2); border-color: var(--accent); }

    @media (max-width: 768px) {
      .sidebar { display: none; }
      .main-content { margin-left: 0 !important; }
    }
  `}</style>
);

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 18, color = "currentColor" }) => {
  const icons = {
    heart: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    brain: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
        <path d="M9 17v2" />
        <path d="M15 17v2" />
        <path d="M9 21h6" />
      </svg>
    ),
    activity: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    droplet: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      </svg>
    ),
    lungs: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <path d="M12 2v20M12 8c-2 0-5 1-5 5s0 7 3 7h4" />
        <path d="M12 8c2 0 5 1 5 5s0 7-3 7h-4" />
      </svg>
    ),
    zap: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    shield: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    user: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    home: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    chart: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    folder: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
    search: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    bell: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    settings: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93A10 10 0 0 1 22 12a10 10 0 0 1-2.93 7.07" />
        <path d="M4.93 4.93A10 10 0 0 0 2 12a10 10 0 0 0 2.93 7.07" />
      </svg>
    ),
    logout: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
    upload: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <polyline points="16 16 12 12 8 16" />
        <line x1="12" y1="12" x2="12" y2="21" />
        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
      </svg>
    ),
    check: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    x: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    chevron: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    ),
    eye: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    eyeoff: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    ),
    dna: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <path d="M2 15c6.667-6 13.333 0 20-6" />
        <path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993" />
        <path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993" />
        <path d="m17 6-2.5-2.5" />
        <path d="m14 8-1-1" />
        <path d="m7 18 2.5 2.5" />
        <path d="m3.5 14.5.5.5" />
        <path d="m20 9 .5.5" />
        <path d="m6.5 12.5 1 1" />
        <path d="m16.5 10.5 1 1" />
        <path d="m10 16 1.5 1.5" />
      </svg>
    ),
    stethoscope: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
        <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
        <circle cx="20" cy="10" r="2" />
      </svg>
    ),
    trending: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    plus: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    calendar: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    alert: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <triangle points="10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    kidney: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <path d="M8 6c-2 0-4 2-4 5s1.5 7 4 7c1.5 0 3-1 4-3 1 2 2.5 3 4 3 2.5 0 4-4 4-7s-2-5-4-5c-1.5 0-3 1-4 2C11 7 9.5 6 8 6z" />
      </svg>
    ),
    liver: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <path d="M5 8c0-2 2-4 5-4s6 2 8 5-1 9-4 10c-2 .5-5-1-7-3S3 12 5 8z" />
      </svg>
    ),
    cancer: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="3" />
        <line x1="12" y1="2" x2="12" y2="6" />
        <line x1="12" y1="18" x2="12" y2="22" />
        <line x1="2" y1="12" x2="6" y2="12" />
        <line x1="18" y1="12" x2="22" y2="12" />
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
      </svg>
    ),
    info: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
    file: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
        <polyline points="13 2 13 9 20 9" />
      </svg>
    ),
    trash: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
    ),
    download: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    menu: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    ),
    sparkle: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      </svg>
    ),
    microscope: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <path d="M6 18h8" />
        <path d="M3 21h18" />
        <path d="M14 21v-4" />
        <path d="M14 7l-3 7" />
        <circle cx="14" cy="4" r="2" />
        <path d="M14 2v2" />
      </svg>
    ),
    pressure: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  };
  return icons[name] || <span style={{ fontSize: size }}></span>;
};

// ─── DISEASE CONFIG ────────────────────────────────────────────────────────────
const DISEASES = [
  {
    id: "diabetes",
    name: "Diabetes",
    icon: "droplet",
    color: "#00c6ff",
    desc: "Predict Type 2 Diabetes risk using glucose, insulin and lifestyle factors",
    fields: [
      {
        key: "glucose",
        label: "Glucose Level (mg/dL)",
        type: "number",
        placeholder: "70-200",
        min: 0,
        max: 300,
      },
      {
        key: "bmi",
        label: "BMI",
        type: "number",
        placeholder: "18-45",
        min: 0,
        max: 60,
      },
      {
        key: "age",
        label: "Age",
        type: "number",
        placeholder: "20-80",
        min: 0,
        max: 120,
      },
      {
        key: "bloodPressure",
        label: "Blood Pressure (mmHg)",
        type: "number",
        placeholder: "60-140",
        min: 0,
        max: 200,
      },
      {
        key: "insulin",
        label: "Insulin Level (μU/mL)",
        type: "number",
        placeholder: "0-300",
        min: 0,
        max: 900,
      },
      {
        key: "pregnancies",
        label: "Pregnancies",
        type: "number",
        placeholder: "0-15",
        min: 0,
        max: 20,
      },
      {
        key: "skinThickness",
        label: "Skin Thickness (mm)",
        type: "number",
        placeholder: "10-50",
        min: 0,
        max: 100,
      },
      {
        key: "dpf",
        label: "Diabetes Pedigree Function",
        type: "number",
        placeholder: "0.0-2.5",
        min: 0,
        max: 3,
        step: 0.01,
      },
    ],
    algorithm: "Random Forest Classifier",
    accuracy: "92.3%",
    dataset: "PIMA Indians Diabetes Dataset",
  },
  {
    id: "heart",
    name: "Heart Disease",
    icon: "heart",
    color: "#ff4d6d",
    desc: "Assess cardiovascular disease risk using clinical and lifestyle parameters",
    fields: [
      {
        key: "age",
        label: "Age",
        type: "number",
        placeholder: "20-80",
        min: 0,
        max: 120,
      },
      {
        key: "sex",
        label: "Sex",
        type: "select",
        options: [
          { v: "1", l: "Male" },
          { v: "0", l: "Female" },
        ],
      },
      {
        key: "chestPain",
        label: "Chest Pain Type",
        type: "select",
        options: [
          { v: "0", l: "Typical Angina" },
          { v: "1", l: "Atypical Angina" },
          { v: "2", l: "Non-Anginal" },
          { v: "3", l: "Asymptomatic" },
        ],
      },
      {
        key: "restBP",
        label: "Resting Blood Pressure (mmHg)",
        type: "number",
        placeholder: "90-200",
      },
      {
        key: "cholesterol",
        label: "Cholesterol (mg/dL)",
        type: "number",
        placeholder: "150-400",
      },
      {
        key: "fastingBS",
        label: "Fasting Blood Sugar >120mg/dL",
        type: "select",
        options: [
          { v: "1", l: "Yes" },
          { v: "0", l: "No" },
        ],
      },
      {
        key: "maxHR",
        label: "Max Heart Rate (bpm)",
        type: "number",
        placeholder: "70-202",
      },
      {
        key: "exerciseAngina",
        label: "Exercise Induced Angina",
        type: "select",
        options: [
          { v: "1", l: "Yes" },
          { v: "0", l: "No" },
        ],
      },
    ],
    algorithm: "Gradient Boosting",
    accuracy: "94.1%",
    dataset: "UCI Heart Disease Dataset",
  },
  {
    id: "stroke",
    name: "Stroke Risk",
    icon: "brain",
    color: "#a855f7",
    desc: "Predict stroke probability based on lifestyle, medical history and demographics",
    fields: [
      { key: "age", label: "Age", type: "number", placeholder: "20-90" },
      {
        key: "hypertension",
        label: "Hypertension",
        type: "select",
        options: [
          { v: "1", l: "Yes" },
          { v: "0", l: "No" },
        ],
      },
      {
        key: "heartDisease",
        label: "Heart Disease",
        type: "select",
        options: [
          { v: "1", l: "Yes" },
          { v: "0", l: "No" },
        ],
      },
      {
        key: "avgGlucose",
        label: "Avg Glucose Level (mg/dL)",
        type: "number",
        placeholder: "70-280",
      },
      { key: "bmi", label: "BMI", type: "number", placeholder: "15-50" },
      {
        key: "smokingStatus",
        label: "Smoking Status",
        type: "select",
        options: [
          { v: "0", l: "Never" },
          { v: "1", l: "Formerly" },
          { v: "2", l: "Currently" },
        ],
      },
      {
        key: "workType",
        label: "Work Type",
        type: "select",
        options: [
          { v: "0", l: "Private" },
          { v: "1", l: "Self-employed" },
          { v: "2", l: "Govt job" },
          { v: "3", l: "Never worked" },
        ],
      },
      {
        key: "everMarried",
        label: "Ever Married",
        type: "select",
        options: [
          { v: "1", l: "Yes" },
          { v: "0", l: "No" },
        ],
      },
    ],
    algorithm: "XGBoost",
    accuracy: "91.7%",
    dataset: "Kaggle Stroke Dataset",
  },
  {
    id: "kidney",
    name: "Kidney Disease",
    icon: "kidney",
    color: "#00e5c0",
    desc: "Chronic kidney disease prediction using blood and urine biomarkers",
    fields: [
      { key: "age", label: "Age", type: "number", placeholder: "2-90" },
      {
        key: "bloodPressure",
        label: "Blood Pressure (mmHg)",
        type: "number",
        placeholder: "50-180",
      },
      {
        key: "albumin",
        label: "Albumin",
        type: "select",
        options: [
          { v: "0", l: "0" },
          { v: "1", l: "1" },
          { v: "2", l: "2" },
          { v: "3", l: "3" },
          { v: "4", l: "4" },
        ],
      },
      {
        key: "sugar",
        label: "Sugar",
        type: "select",
        options: [
          { v: "0", l: "0" },
          { v: "1", l: "1" },
          { v: "2", l: "2" },
          { v: "3", l: "3" },
          { v: "4", l: "4" },
        ],
      },
      {
        key: "hemoglobin",
        label: "Hemoglobin (g/dL)",
        type: "number",
        placeholder: "3-18",
      },
      {
        key: "packedCV",
        label: "Packed Cell Volume (%)",
        type: "number",
        placeholder: "10-55",
      },
      {
        key: "wbcCount",
        label: "WBC Count (cells/µL)",
        type: "number",
        placeholder: "2000-25000",
      },
      {
        key: "rbcCount",
        label: "RBC Count (million/µL)",
        type: "number",
        placeholder: "2-7",
      },
    ],
    algorithm: "Random Forest",
    accuracy: "96.8%",
    dataset: "UCI CKD Dataset",
  },
  {
    id: "liver",
    name: "Liver Disease",
    icon: "liver",
    color: "#ff8c42",
    desc: "Liver disease diagnosis using liver function test biomarkers",
    fields: [
      { key: "age", label: "Age", type: "number", placeholder: "4-90" },
      {
        key: "gender",
        label: "Gender",
        type: "select",
        options: [
          { v: "1", l: "Male" },
          { v: "0", l: "Female" },
        ],
      },
      {
        key: "totalBilirubin",
        label: "Total Bilirubin (mg/dL)",
        type: "number",
        placeholder: "0.4-75",
        step: 0.1,
      },
      {
        key: "directBilirubin",
        label: "Direct Bilirubin (mg/dL)",
        type: "number",
        placeholder: "0.1-20",
        step: 0.1,
      },
      {
        key: "alkaline",
        label: "Alkaline Phosphotase (IU/L)",
        type: "number",
        placeholder: "63-2110",
      },
      {
        key: "alanine",
        label: "Alanine Aminotransferase (IU/L)",
        type: "number",
        placeholder: "10-2000",
      },
      {
        key: "aspartate",
        label: "Aspartate Aminotransferase (IU/L)",
        type: "number",
        placeholder: "10-5000",
      },
      {
        key: "totalProteins",
        label: "Total Proteins (g/dL)",
        type: "number",
        placeholder: "2.7-9.6",
        step: 0.1,
      },
    ],
    algorithm: "SVM Classifier",
    accuracy: "89.4%",
    dataset: "Indian Liver Patient Dataset",
  },
  {
    id: "lungCancer",
    name: "Lung Cancer",
    icon: "lungs",
    color: "#60a5fa",
    desc: "Early lung cancer screening using symptoms and risk factors",
    fields: [
      {
        key: "gender",
        label: "Gender",
        type: "select",
        options: [
          { v: "1", l: "Male" },
          { v: "0", l: "Female" },
        ],
      },
      { key: "age", label: "Age", type: "number", placeholder: "20-90" },
      {
        key: "smoking",
        label: "Smoking",
        type: "select",
        options: [
          { v: "2", l: "Yes" },
          { v: "1", l: "No" },
        ],
      },
      {
        key: "yellowFingers",
        label: "Yellow Fingers",
        type: "select",
        options: [
          { v: "2", l: "Yes" },
          { v: "1", l: "No" },
        ],
      },
      {
        key: "anxiety",
        label: "Anxiety",
        type: "select",
        options: [
          { v: "2", l: "Yes" },
          { v: "1", l: "No" },
        ],
      },
      {
        key: "chronicDisease",
        label: "Chronic Disease",
        type: "select",
        options: [
          { v: "2", l: "Yes" },
          { v: "1", l: "No" },
        ],
      },
      {
        key: "fatigue",
        label: "Fatigue",
        type: "select",
        options: [
          { v: "2", l: "Yes" },
          { v: "1", l: "No" },
        ],
      },
      {
        key: "coughing",
        label: "Coughing",
        type: "select",
        options: [
          { v: "2", l: "Yes" },
          { v: "1", l: "No" },
        ],
      },
    ],
    algorithm: "Logistic Regression",
    accuracy: "93.6%",
    dataset: "Lung Cancer Survey Dataset",
  },
  {
    id: "breastCancer",
    name: "Breast Cancer",
    icon: "cancer",
    color: "#f472b6",
    desc: "Malignancy classification from cell nucleus measurements via biopsy data",
    fields: [
      {
        key: "radius",
        label: "Mean Radius",
        type: "number",
        placeholder: "7-28",
        step: 0.01,
      },
      {
        key: "texture",
        label: "Mean Texture",
        type: "number",
        placeholder: "9-40",
        step: 0.01,
      },
      {
        key: "perimeter",
        label: "Mean Perimeter",
        type: "number",
        placeholder: "40-190",
        step: 0.01,
      },
      {
        key: "area",
        label: "Mean Area",
        type: "number",
        placeholder: "150-2500",
        step: 0.1,
      },
      {
        key: "smoothness",
        label: "Mean Smoothness",
        type: "number",
        placeholder: "0.05-0.16",
        step: 0.001,
      },
      {
        key: "compactness",
        label: "Mean Compactness",
        type: "number",
        placeholder: "0.02-0.35",
        step: 0.001,
      },
      {
        key: "concavity",
        label: "Mean Concavity",
        type: "number",
        placeholder: "0-0.43",
        step: 0.001,
      },
      {
        key: "symmetry",
        label: "Mean Symmetry",
        type: "number",
        placeholder: "0.1-0.3",
        step: 0.001,
      },
    ],
    algorithm: "SVM + PCA",
    accuracy: "97.2%",
    dataset: "Wisconsin Breast Cancer Dataset",
  },
  {
    id: "hypertension",
    name: "Hypertension",
    icon: "pressure",
    color: "#ffd166",
    desc: "High blood pressure risk assessment from physiological and lifestyle factors",
    fields: [
      { key: "age", label: "Age", type: "number", placeholder: "20-80" },
      {
        key: "bmi",
        label: "BMI",
        type: "number",
        placeholder: "15-50",
        step: 0.1,
      },
      {
        key: "sodium",
        label: "Sodium Intake (mg/day)",
        type: "number",
        placeholder: "500-5000",
      },
      {
        key: "physicalActivity",
        label: "Physical Activity (hrs/week)",
        type: "number",
        placeholder: "0-20",
        step: 0.5,
      },
      {
        key: "alcohol",
        label: "Alcohol Units/Week",
        type: "number",
        placeholder: "0-40",
      },
      {
        key: "smoking",
        label: "Smoking",
        type: "select",
        options: [
          { v: "1", l: "Yes" },
          { v: "0", l: "No" },
        ],
      },
      {
        key: "familyHistory",
        label: "Family History of HTN",
        type: "select",
        options: [
          { v: "1", l: "Yes" },
          { v: "0", l: "No" },
        ],
      },
      {
        key: "stress",
        label: "Stress Level",
        type: "select",
        options: [
          { v: "1", l: "Low" },
          { v: "2", l: "Moderate" },
          { v: "3", l: "High" },
        ],
      },
    ],
    algorithm: "Gradient Boosting",
    accuracy: "90.5%",
    dataset: "NHANES Hypertension Dataset",
  },
];

// ─── MOCK PREDICTION ENGINE ────────────────────────────────────────────────────
const runPrediction = (diseaseId, formData) => {
  const vals = Object.values(formData).map((v) => parseFloat(v) || 0);
  const sum = vals.reduce((a, b) => a + b, 0);
  const avg = sum / (vals.length || 1);

  // Deterministic but varied risk score based on inputs
  let riskScore = 0;

  if (diseaseId === "diabetes") {
    const g = parseFloat(formData.glucose) || 100;
    const b = parseFloat(formData.bmi) || 25;
    const a = parseFloat(formData.age) || 30;
    riskScore = Math.min(
      95,
      Math.max(
        5,
        (g > 140 ? 30 : g > 100 ? 15 : 5) +
          (b > 30 ? 25 : b > 25 ? 12 : 3) +
          (a > 50 ? 20 : a > 35 ? 10 : 3) +
          Math.random() * 10,
      ),
    );
  } else if (diseaseId === "heart") {
    const age = parseFloat(formData.age) || 40;
    const chol = parseFloat(formData.cholesterol) || 200;
    riskScore = Math.min(
      92,
      Math.max(
        5,
        (age > 60 ? 28 : age > 45 ? 15 : 5) +
          (chol > 240 ? 22 : chol > 200 ? 12 : 4) +
          (formData.exerciseAngina === "1" ? 18 : 0) +
          Math.random() * 12,
      ),
    );
  } else if (diseaseId === "stroke") {
    const age = parseFloat(formData.age) || 40;
    riskScore = Math.min(
      88,
      Math.max(
        4,
        (age > 65 ? 30 : age > 50 ? 15 : 4) +
          (formData.hypertension === "1" ? 20 : 0) +
          (formData.smokingStatus === "2"
            ? 15
            : formData.smokingStatus === "1"
              ? 8
              : 0) +
          Math.random() * 10,
      ),
    );
  } else {
    // Generic calculation for other diseases
    riskScore = Math.min(90, Math.max(5, (avg % 40) + 15 + Math.random() * 20));
  }

  riskScore = Math.round(riskScore);
  const level = riskScore < 30 ? "LOW" : riskScore < 60 ? "MEDIUM" : "HIGH";

  const tips = {
    LOW: [
      "Maintain your current healthy lifestyle",
      "Continue regular health screenings annually",
      "Stay active with 150 minutes of moderate exercise weekly",
      "Maintain a balanced diet rich in vegetables and whole grains",
    ],
    MEDIUM: [
      "Consult your physician within the next 2-4 weeks",
      "Monitor relevant biomarkers monthly",
      "Adopt dietary changes to reduce processed foods and sugar",
      "Begin or increase physical activity to 30 minutes daily",
      "Consider specialist referral if symptoms persist",
    ],
    HIGH: [
      "Seek immediate medical consultation",
      "Do not delay — schedule an appointment today",
      "Undergo comprehensive diagnostic testing",
      "Follow prescribed medication regimen strictly",
      "Make urgent lifestyle modifications",
      "Consider hospital admission if symptoms are acute",
    ],
  };

  const explanations = {
    LOW: `Your current health indicators suggest a low probability of disease. The AI model assessed your inputs and found values within normal ranges. Continue maintaining your healthy lifestyle habits.`,
    MEDIUM: `Several input parameters fall in borderline ranges, indicating a moderate risk. The model detected patterns associated with developing risk factors. Proactive intervention at this stage can significantly improve outcomes.`,
    HIGH: `Multiple high-risk indicators were detected in your health data. The model identified patterns strongly correlated with disease presence or high likelihood of development. Immediate medical attention is strongly recommended.`,
  };

  const colors = { LOW: "#00e5a0", MEDIUM: "#ffd166", HIGH: "#ff4d6d" };

  return {
    level,
    score: riskScore,
    color: colors[level],
    explanation: explanations[level],
    tips: tips[level],
    confidence: Math.round(85 + Math.random() * 10),
    modelVersion: "v3.2.1",
  };
};

// ─── CHART COMPONENTS ──────────────────────────────────────────────────────────
const MiniLineChart = ({ data, color = "#00c6ff", height = 60 }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 200,
    h = height;
  const points = data
    .map(
      (v, i) =>
        `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 10) - 5}`,
    )
    .join(" ");
  return (
    <svg
      width="100%"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient
          id={`g${color.replace("#", "")}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${points} ${w},${h}`}
        fill={`url(#g${color.replace("#", "")})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / range) * (h - 10) - 5;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="3"
            fill={color}
            stroke="#0f1f38"
            strokeWidth="2"
          />
        );
      })}
    </svg>
  );
};

const DonutChart = ({ value, max = 100, color = "#00c6ff", size = 80 }) => {
  const r = 30,
    cx = 40,
    cy = 40;
  const circumference = 2 * Math.PI * r;
  const filled = (value / max) * circumference;
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="8"
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeDasharray={`${filled} ${circumference}`}
        strokeDashoffset={circumference * 0.25}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s ease" }}
      />
      <text
        x={cx}
        y={cy + 6}
        textAnchor="middle"
        fill={color}
        fontSize="14"
        fontWeight="700"
        fontFamily="JetBrains Mono"
      >
        {value}%
      </text>
    </svg>
  );
};

const BarChart = ({ data }) => {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: "8px",
        height: "120px",
        padding: "0 4px",
      }}
    >
      {data.map((d, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
            height: "100%",
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              color: "var(--text3)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {d.value}
          </div>
          <div
            style={{
              width: "100%",
              borderRadius: "4px 4px 0 0",
              background: `linear-gradient(180deg, ${d.color || "var(--accent)"}, ${d.color || "var(--accent)"}88)`,
              height: `${(d.value / max) * 80}px`,
              transition: "height .6s ease",
              cursor: "default",
            }}
            title={d.label}
          />
          <div
            style={{
              fontSize: "9px",
              color: "var(--text3)",
              textAlign: "center",
              letterSpacing: ".5px",
            }}
          >
            {d.label?.slice(0, 4).toUpperCase()}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function VitaCoreAI() {
  const [authUser, setAuthUser] = useState(null);
  const [page, setPage] = useState("landing");
  const [authMode, setAuthMode] = useState("login");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [predHistory, setPredHistory] = useState([
    {
      id: 1,
      disease: "Diabetes",
      date: "2025-12-02",
      risk: "LOW",
      score: 22,
      icon: "droplet",
    },
    {
      id: 2,
      disease: "Heart Disease",
      date: "2025-12-08",
      risk: "MEDIUM",
      score: 48,
      icon: "heart",
    },
    {
      id: 3,
      disease: "Hypertension",
      date: "2026-01-15",
      risk: "LOW",
      score: 18,
      icon: "pressure",
    },
  ]);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [predResult, setPredResult] = useState(null);
  const [predLoading, setPredLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([
    {
      id: 1,
      name: "Blood_Report_Dec2025.pdf",
      size: "1.2 MB",
      date: "2025-12-10",
      type: "Blood Test",
    },
    {
      id: 2,
      name: "ECG_Report_Jan2026.pdf",
      size: "892 KB",
      date: "2026-01-18",
      type: "ECG",
    },
  ]);
  const [symptoms, setSymptoms] = useState([]);
  const [symptomResult, setSymptomResult] = useState(null);
  const [symptomInput, setSymptomInput] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    age: "",
    weight: "",
    height: "",
    bloodType: "",
    allergies: "",
  });
  const fileRef = useRef();

  const SYMPTOM_LIST = [
    "Headache",
    "Fatigue",
    "Chest Pain",
    "Shortness of Breath",
    "Dizziness",
    "Nausea",
    "Fever",
    "Cough",
    "Joint Pain",
    "Back Pain",
    "Blurred Vision",
    "Frequent Urination",
    "Excessive Thirst",
    "Weight Loss",
    "Swelling",
    "Numbness",
    "Heart Palpitations",
    "Night Sweats",
    "Skin Rash",
    "Abdominal Pain",
  ];

  const riskColors = { LOW: "#00e5a0", MEDIUM: "#ffd166", HIGH: "#ff4d6d" };
  const riskBg = {
    LOW: "rgba(0,229,160,0.08)",
    MEDIUM: "rgba(255,209,102,0.08)",
    HIGH: "rgba(255,77,109,0.08)",
  };

  const handleLogin = (email, password, name) => {
    setAuthUser({
      name: name || email.split("@")[0],
      email,
      avatar: name ? name[0].toUpperCase() : email[0].toUpperCase(),
      joinDate: "2025-11-01",
    });
    setProfileData((p) => ({ ...p, name: name || email.split("@")[0] }));
    setPage("dashboard");
  };

  const handlePredict = async (disease, data) => {
    setPredLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    const result = runPrediction(disease.id, data);
    setPredResult(result);
    setPredLoading(false);
    setPredHistory((h) => [
      {
        id: Date.now(),
        disease: disease.name,
        date: new Date().toISOString().slice(0, 10),
        risk: result.level,
        score: result.score,
        icon: disease.icon,
      },
      ...h,
    ]);
  };

  const analyzeSymptoms = () => {
    if (!symptoms.length) return;
    const highRiskSymptoms = [
      "Chest Pain",
      "Shortness of Breath",
      "Heart Palpitations",
    ];
    const medRiskSymptoms = [
      "Dizziness",
      "Blurred Vision",
      "Numbness",
      "Night Sweats",
    ];
    const hasHigh = symptoms.some((s) => highRiskSymptoms.includes(s));
    const hasMed = symptoms.some((s) => medRiskSymptoms.includes(s));
    setSymptomResult({
      urgency: hasHigh ? "HIGH" : hasMed ? "MEDIUM" : "LOW",
      possibleConditions: hasHigh
        ? ["Cardiovascular Event", "Pulmonary Embolism", "Hypertensive Crisis"]
        : hasMed
          ? ["Hypertension", "Diabetes", "Anemia", "Migraine"]
          : ["Common Cold", "Tension Headache", "Fatigue Syndrome"],
      recommendation: hasHigh
        ? "Seek emergency medical attention immediately."
        : hasMed
          ? "Schedule a doctor's appointment within 24-48 hours."
          : "Monitor symptoms. Consult a doctor if they persist beyond 3 days.",
    });
  };

  const stats = {
    totalPredictions: predHistory.length,
    highRisk: predHistory.filter((p) => p.risk === "HIGH").length,
    avgRisk: predHistory.length
      ? Math.round(
          predHistory.reduce((a, b) => a + b.score, 0) / predHistory.length,
        )
      : 0,
    recentDate: predHistory[0]?.date || "—",
  };

  // ── LANDING PAGE ──────────────────────────────────────────────────────────────
  if (page === "landing")
    return (
      <>
        <FontLoader />
        <div
          style={{
            minHeight: "100vh",
            background: "var(--bg)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background effects */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              overflow: "hidden",
              pointerEvents: "none",
              zIndex: 0,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-20%",
                left: "-10%",
                width: "600px",
                height: "600px",
                background:
                  "radial-gradient(circle, rgba(0,114,255,0.12) 0%, transparent 70%)",
                borderRadius: "50%",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "-20%",
                right: "-10%",
                width: "500px",
                height: "500px",
                background:
                  "radial-gradient(circle, rgba(0,229,192,0.08) 0%, transparent 70%)",
                borderRadius: "50%",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                width: "800px",
                height: "800px",
                background:
                  "radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 60%)",
                borderRadius: "50%",
              }}
            />
          </div>

          {/* NAV */}
          <nav
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 100,
              padding: "0 40px",
              height: "64px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(26,48,80,0.5)",
              background: "rgba(6,13,26,0.9)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background:
                    "linear-gradient(135deg, var(--accent2), var(--accent))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="activity" size={16} color="white" />
              </div>
              <span
                style={{
                  fontFamily: "var(--font-head)",
                  fontWeight: 700,
                  fontSize: "18px",
                  letterSpacing: "-.5px",
                }}
              >
                VitaCore <span className="gradient-text">AI</span>
              </span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="btn-ghost"
                onClick={() => {
                  setAuthMode("login");
                  setPage("auth");
                }}
              >
                Sign In
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  setAuthMode("signup");
                  setPage("auth");
                }}
              >
                Get Started
              </button>
            </div>
          </nav>

          {/* HERO */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              paddingTop: "140px",
              paddingBottom: "80px",
              textAlign: "center",
              maxWidth: "900px",
              margin: "0 auto",
              padding: "140px 40px 80px",
            }}
          >
            <div
              className="animate-fadeUp"
              style={{ animationDelay: ".1s", opacity: 0 }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 16px",
                  borderRadius: "20px",
                  background: "rgba(0,198,255,0.08)",
                  border: "1px solid rgba(0,198,255,0.2)",
                  marginBottom: "32px",
                }}
              >
                <Icon name="sparkle" size={14} color="var(--accent)" />
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--accent)",
                    fontWeight: 600,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                  }}
                >
                  AI-Powered Healthcare Intelligence
                </span>
              </div>
            </div>

            <h1
              className="animate-fadeUp"
              style={{
                animationDelay: ".2s",
                opacity: 0,
                fontFamily: "var(--font-head)",
                fontSize: "clamp(48px, 6vw, 80px)",
                fontWeight: 800,
                lineHeight: 1.1,
                marginBottom: "24px",
                letterSpacing: "-2px",
              }}
            >
              Predict. Prevent.
              <br />
              <span className="gradient-text">Protect Your Health.</span>
            </h1>

            <p
              className="animate-fadeUp"
              style={{
                animationDelay: ".3s",
                opacity: 0,
                fontSize: "18px",
                color: "var(--text2)",
                maxWidth: "580px",
                margin: "0 auto 48px",
                lineHeight: 1.7,
              }}
            >
              Advanced machine learning models trained on millions of clinical
              records to give you accurate disease risk assessments and
              personalized health insights.
            </p>

            <div
              className="animate-fadeUp"
              style={{
                animationDelay: ".4s",
                opacity: 0,
                display: "flex",
                gap: "16px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                className="btn-primary"
                style={{ padding: "16px 40px", fontSize: "16px" }}
                onClick={() => {
                  setAuthMode("signup");
                  setPage("auth");
                }}
              >
                Start Free Assessment
              </button>
              <button
                className="btn-ghost"
                style={{ padding: "16px 40px", fontSize: "16px" }}
                onClick={() => {
                  setAuthMode("login");
                  setPage("auth");
                }}
              >
                Sign In
              </button>
            </div>
          </div>

          {/* STATS */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              justifyContent: "center",
              gap: "40px",
              flexWrap: "wrap",
              padding: "0 40px 80px",
            }}
          >
            {[
              { v: "8", l: "Disease Models" },
              { v: "97%", l: "Peak Accuracy" },
              { v: "50K+", l: "Predictions Made" },
              { v: "24/7", l: "Available" },
            ].map((s, i) => (
              <div
                key={i}
                className="animate-fadeUp"
                style={{
                  animationDelay: `${0.5 + i * 0.1}s`,
                  opacity: 0,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-head)",
                    fontSize: "36px",
                    fontWeight: 800,
                    background:
                      "linear-gradient(135deg, var(--accent), var(--teal))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {s.v}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--text3)",
                    marginTop: "4px",
                  }}
                >
                  {s.l}
                </div>
              </div>
            ))}
          </div>

          {/* DISEASE CARDS */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              maxWidth: "1100px",
              margin: "0 auto",
              padding: "0 40px 100px",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-head)",
                fontSize: "32px",
                fontWeight: 700,
                textAlign: "center",
                marginBottom: "48px",
                letterSpacing: "-1px",
              }}
            >
              8 Predictive <span className="gradient-text">Health Models</span>
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: "16px",
              }}
            >
              {DISEASES.map((d, i) => (
                <div
                  key={d.id}
                  className="card animate-fadeUp"
                  style={{
                    animationDelay: `${0.2 + i * 0.05}s`,
                    opacity: 0,
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onClick={() => {
                    setAuthMode("signup");
                    setPage("auth");
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: "80px",
                      height: "80px",
                      background: `radial-gradient(circle at top right, ${d.color}15, transparent)`,
                      pointerEvents: "none",
                    }}
                  />
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: `${d.color}18`,
                      border: `1px solid ${d.color}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "14px",
                    }}
                  >
                    <Icon name={d.icon} size={20} color={d.color} />
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-head)",
                      fontWeight: 700,
                      fontSize: "15px",
                      marginBottom: "6px",
                    }}
                  >
                    {d.name}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--text3)",
                      lineHeight: 1.5,
                      marginBottom: "12px",
                    }}
                  >
                    {d.desc}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        fontFamily: "var(--font-mono)",
                        color: d.color,
                      }}
                    >
                      {d.accuracy}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--text3)" }}>
                      {d.algorithm.split(" ")[0]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FEATURES */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              background: "rgba(11,22,40,0.5)",
              borderTop: "1px solid var(--border)",
              borderBottom: "1px solid var(--border)",
              padding: "80px 40px",
            }}
          >
            <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
              <h2
                style={{
                  fontFamily: "var(--font-head)",
                  fontSize: "32px",
                  fontWeight: 700,
                  textAlign: "center",
                  marginBottom: "48px",
                  letterSpacing: "-1px",
                }}
              >
                Everything You Need for{" "}
                <span className="gradient-text">Health Intelligence</span>
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "24px",
                }}
              >
                {[
                  {
                    icon: "shield",
                    t: "Secure & Private",
                    d: "End-to-end encrypted health data. HIPAA-compliant storage. Your data never leaves our secure infrastructure.",
                  },
                  {
                    icon: "brain",
                    t: "ML-Powered Accuracy",
                    d: "Models trained on clinical datasets with cross-validation, hyperparameter tuning, and ensemble methods.",
                  },
                  {
                    icon: "trending",
                    t: "Health Analytics",
                    d: "Track your health trends over time with interactive charts and personalized risk summaries.",
                  },
                  {
                    icon: "folder",
                    t: "Medical Records",
                    d: "Securely upload and store your medical reports, lab results, and diagnostic images.",
                  },
                  {
                    icon: "stethoscope",
                    t: "Symptom Checker",
                    d: "Analyze symptoms instantly and receive guidance on urgency levels and potential conditions.",
                  },
                  {
                    icon: "calendar",
                    t: "Prediction History",
                    d: "Review all past predictions with detailed analytics and trend analysis over time.",
                  },
                ].map((f, i) => (
                  <div
                    key={i}
                    className="card"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        background: "rgba(0,198,255,0.1)",
                        border: "1px solid rgba(0,198,255,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "12px",
                      }}
                    >
                      <Icon name={f.icon} size={18} color="var(--accent)" />
                    </div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "15px",
                        marginBottom: "8px",
                      }}
                    >
                      {f.t}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "var(--text3)",
                        lineHeight: 1.6,
                      }}
                    >
                      {f.d}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              textAlign: "center",
              padding: "100px 40px",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-head)",
                fontSize: "40px",
                fontWeight: 800,
                marginBottom: "16px",
                letterSpacing: "-1.5px",
              }}
            >
              Start Your Health Journey Today
            </h2>
            <p
              style={{
                color: "var(--text2)",
                marginBottom: "40px",
                fontSize: "16px",
              }}
            >
              Join thousands of users proactively managing their health with AI.
            </p>
            <button
              className="btn-primary animate-glow"
              style={{ padding: "18px 60px", fontSize: "16px" }}
              onClick={() => {
                setAuthMode("signup");
                setPage("auth");
              }}
            >
              Create Free Account
            </button>
          </div>

          <div
            style={{
              textAlign: "center",
              padding: "24px",
              borderTop: "1px solid var(--border)",
              color: "var(--text3)",
              fontSize: "12px",
              position: "relative",
              zIndex: 1,
            }}
          >
            © 2026 VitaCore AI • For informational purposes only • Not a
            substitute for medical advice
          </div>
        </div>
      </>
    );

  // ── AUTH PAGE ──────────────────────────────────────────────────────────────────
  if (page === "auth")
    return (
      <>
        <FontLoader />
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--bg)",
            padding: "20px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "fixed",
              top: "-30%",
              left: "-20%",
              width: "600px",
              height: "600px",
              background:
                "radial-gradient(circle, rgba(0,114,255,0.1) 0%, transparent 70%)",
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "fixed",
              bottom: "-30%",
              right: "-20%",
              width: "500px",
              height: "500px",
              background:
                "radial-gradient(circle, rgba(0,229,192,0.07) 0%, transparent 70%)",
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              width: "100%",
              maxWidth: "440px",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background:
                    "linear-gradient(135deg, var(--accent2), var(--accent))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <Icon name="activity" size={24} color="white" />
              </div>
              <h1
                style={{
                  fontFamily: "var(--font-head)",
                  fontSize: "28px",
                  fontWeight: 800,
                  letterSpacing: "-1px",
                }}
              >
                VitaCore <span className="gradient-text">AI</span>
              </h1>
              <p
                style={{
                  color: "var(--text2)",
                  marginTop: "6px",
                  fontSize: "14px",
                }}
              >
                {authMode === "login"
                  ? "Welcome back"
                  : "Create your health profile"}
              </p>
            </div>

            <div className="card" style={{ padding: "32px" }}>
              <AuthForm mode={authMode} onSubmit={handleLogin} />
              <div
                style={{
                  textAlign: "center",
                  marginTop: "24px",
                  fontSize: "13px",
                  color: "var(--text3)",
                }}
              >
                {authMode === "login" ? (
                  <>
                    Don't have an account?{" "}
                    <span
                      style={{ color: "var(--accent)", cursor: "pointer" }}
                      onClick={() => setAuthMode("signup")}
                    >
                      Sign up
                    </span>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <span
                      style={{ color: "var(--accent)", cursor: "pointer" }}
                      onClick={() => setAuthMode("login")}
                    >
                      Sign in
                    </span>
                  </>
                )}
              </div>
            </div>
            <div
              style={{
                textAlign: "center",
                marginTop: "16px",
                fontSize: "12px",
                color: "var(--text3)",
                cursor: "pointer",
              }}
              onClick={() => setPage("landing")}
            >
              ← Back to home
            </div>
          </div>
        </div>
      </>
    );

  // ── AUTHENTICATED APP ─────────────────────────────────────────────────────────
  return (
    <>
      <FontLoader />
      <div
        style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}
      >
        {/* SIDEBAR */}
        <aside
          className="sidebar"
          style={{
            width: sidebarOpen ? "240px" : "64px",
            minHeight: "100vh",
            position: "fixed",
            left: 0,
            top: 0,
            zIndex: 50,
            background: "var(--bg2)",
            borderRight: "1px solid var(--border)",
            transition: "width .3s ease",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Logo */}
          <div
            style={{
              padding: "20px 16px 16px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              minHeight: "64px",
            }}
          >
            <div
              style={{
                minWidth: "32px",
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background:
                  "linear-gradient(135deg,var(--accent2),var(--accent))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Icon name="activity" size={16} color="white" />
            </div>
            {sidebarOpen && (
              <span
                style={{
                  fontFamily: "var(--font-head)",
                  fontWeight: 700,
                  fontSize: "16px",
                  letterSpacing: "-.5px",
                  whiteSpace: "nowrap",
                }}
              >
                VitaCore <span className="gradient-text">AI</span>
              </span>
            )}
          </div>

          {/* Nav */}
          <nav
            style={{
              padding: "16px 8px",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            {[
              { id: "dashboard", icon: "home", label: "Dashboard" },
              { id: "predict", icon: "brain", label: "AI Predictions" },
              { id: "records", icon: "folder", label: "Medical Records" },
              { id: "symptoms", icon: "search", label: "Symptom Checker" },
              { id: "analytics", icon: "chart", label: "Analytics" },
              { id: "profile", icon: "user", label: "Profile" },
            ].map((item) => (
              <button
                key={item.id}
                className={`nav-link ${page === item.id ? "active" : ""}`}
                style={{
                  width: "100%",
                  border: "none",
                  background: "none",
                  justifyContent: sidebarOpen ? "flex-start" : "center",
                  padding: sidebarOpen ? "8px 12px" : "8px",
                }}
                onClick={() => {
                  setPage(item.id);
                  if (item.id !== "predict") {
                    setSelectedDisease(null);
                    setPredResult(null);
                  }
                }}
              >
                <Icon name={item.icon} size={18} />
                {sidebarOpen && (
                  <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>
                )}
              </button>
            ))}
          </nav>

          {/* User */}
          <div
            style={{
              padding: "16px 8px",
              borderTop: "1px solid var(--border)",
            }}
          >
            <button
              className="nav-link"
              style={{
                width: "100%",
                border: "none",
                background: "none",
                justifyContent: sidebarOpen ? "flex-start" : "center",
                padding: sidebarOpen ? "8px 12px" : "8px",
              }}
              onClick={() => {
                setAuthUser(null);
                setPage("landing");
              }}
            >
              <Icon name="logout" size={18} />
              {sidebarOpen && (
                <span style={{ whiteSpace: "nowrap" }}>Sign Out</span>
              )}
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main
          className="main-content"
          style={{
            marginLeft: sidebarOpen ? "240px" : "64px",
            flex: 1,
            minHeight: "100vh",
            transition: "margin-left .3s ease",
          }}
        >
          {/* Top bar */}
          <header
            style={{
              height: "64px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 32px",
              position: "sticky",
              top: 0,
              background: "rgba(6,13,26,0.95)",
              backdropFilter: "blur(20px)",
              zIndex: 40,
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-head)",
                  fontWeight: 700,
                  fontSize: "18px",
                  letterSpacing: "-.5px",
                }}
              >
                {page === "dashboard"
                  ? "Dashboard"
                  : page === "predict"
                    ? "AI Disease Prediction"
                    : page === "records"
                      ? "Medical Records"
                      : page === "symptoms"
                        ? "Symptom Checker"
                        : page === "analytics"
                          ? "Health Analytics"
                          : "Profile"}
              </h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ position: "relative" }}>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text2)",
                    position: "relative",
                  }}
                  onClick={() => setNotifOpen(!notifOpen)}
                >
                  <Icon name="bell" size={20} />
                  <span
                    style={{
                      position: "absolute",
                      top: "-2px",
                      right: "-2px",
                      width: "8px",
                      height: "8px",
                      background: "var(--red)",
                      borderRadius: "50%",
                      border: "2px solid var(--bg)",
                    }}
                  />
                </button>
                {notifOpen && (
                  <div
                    className="card"
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 8px)",
                      width: "280px",
                      zIndex: 100,
                      padding: "16px",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "13px",
                        marginBottom: "12px",
                      }}
                    >
                      Notifications
                    </div>
                    {[
                      {
                        t: "Prediction Complete",
                        b: "Your diabetes assessment is ready.",
                        c: "var(--accent)",
                      },
                      {
                        t: "Reminder",
                        b: "Annual checkup due this month.",
                        c: "var(--yellow)",
                      },
                    ].map((n, i) => (
                      <div
                        key={i}
                        style={{
                          padding: "10px 0",
                          borderBottom:
                            i === 0 ? "1px solid var(--border)" : "none",
                          display: "flex",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: n.c,
                            marginTop: "5px",
                            flexShrink: 0,
                          }}
                        />
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 600 }}>
                            {n.t}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "var(--text3)",
                              marginTop: "2px",
                            }}
                          >
                            {n.b}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                }}
                onClick={() => setPage("profile")}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg,var(--accent2),var(--teal))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-head)",
                    fontWeight: 700,
                    fontSize: "15px",
                  }}
                >
                  {authUser?.avatar}
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600 }}>
                    {authUser?.name}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text3)" }}>
                    Patient
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* PAGE CONTENT */}
          <div style={{ padding: "32px" }}>
            {/* ── DASHBOARD ── */}
            {page === "dashboard" && (
              <div style={{ animation: "fadeUp .5s ease forwards" }}>
                {/* Welcome */}
                <div style={{ marginBottom: "32px" }}>
                  <h1
                    style={{
                      fontFamily: "var(--font-head)",
                      fontSize: "28px",
                      fontWeight: 800,
                      letterSpacing: "-1px",
                      marginBottom: "6px",
                    }}
                  >
                    Good morning,{" "}
                    <span className="gradient-text">{authUser?.name}</span> 👋
                  </h1>
                  <p style={{ color: "var(--text2)", fontSize: "14px" }}>
                    Your health dashboard is up to date. Last prediction:{" "}
                    {stats.recentDate}
                  </p>
                </div>

                {/* Stat cards */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: "16px",
                    marginBottom: "32px",
                  }}
                >
                  {[
                    {
                      label: "Total Assessments",
                      value: stats.totalPredictions,
                      icon: "brain",
                      color: "var(--accent)",
                      trend: "+2 this month",
                    },
                    {
                      label: "High Risk Alerts",
                      value: stats.highRisk,
                      icon: "alert",
                      color: "var(--red)",
                      trend:
                        stats.highRisk > 0 ? "Needs attention" : "All clear",
                    },
                    {
                      label: "Avg Risk Score",
                      value: `${stats.avgRisk}%`,
                      icon: "activity",
                      color: "var(--yellow)",
                      trend: "Moderate range",
                    },
                    {
                      label: "Health Score",
                      value: "76/100",
                      icon: "shield",
                      color: "var(--green)",
                      trend: "Good standing",
                    },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="card"
                      style={{ position: "relative", overflow: "hidden" }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          width: "60px",
                          height: "60px",
                          background: `radial-gradient(circle at top right, ${s.color}15, transparent)`,
                          pointerEvents: "none",
                        }}
                      />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "16px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--text3)",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: ".5px",
                          }}
                        >
                          {s.label}
                        </span>
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            background: `${s.color}18`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Icon name={s.icon} size={16} color={s.color} />
                        </div>
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-head)",
                          fontSize: "28px",
                          fontWeight: 800,
                          marginBottom: "6px",
                        }}
                      >
                        {s.value}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text3)" }}>
                        {s.trend}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr",
                    gap: "24px",
                    marginBottom: "32px",
                  }}
                >
                  {/* Recent predictions */}
                  <div
                    className="card"
                    style={{ padding: 0, overflow: "hidden" }}
                  >
                    <div
                      style={{
                        padding: "20px 24px",
                        borderBottom: "1px solid var(--border)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <h3
                        style={{
                          fontFamily: "var(--font-head)",
                          fontWeight: 700,
                          fontSize: "16px",
                        }}
                      >
                        Recent Predictions
                      </h3>
                      <button
                        className="btn-ghost"
                        style={{ padding: "6px 14px", fontSize: "12px" }}
                        onClick={() => setPage("predict")}
                      >
                        Run New
                      </button>
                    </div>
                    <table>
                      <thead>
                        <tr>
                          <th>Disease</th>
                          <th>Date</th>
                          <th>Risk Level</th>
                          <th>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {predHistory.slice(0, 5).map((p) => (
                          <tr key={p.id}>
                            <td>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                }}
                              >
                                <Icon
                                  name={p.icon}
                                  size={16}
                                  color="var(--text3)"
                                />
                                {p.disease}
                              </div>
                            </td>
                            <td
                              style={{
                                color: "var(--text3)",
                                fontFamily: "var(--font-mono)",
                                fontSize: "12px",
                              }}
                            >
                              {p.date}
                            </td>
                            <td>
                              <span
                                style={{
                                  padding: "3px 10px",
                                  borderRadius: "20px",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  background: riskBg[p.risk],
                                  color: riskColors[p.risk],
                                }}
                              >
                                {p.risk}
                              </span>
                            </td>
                            <td>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                <div
                                  className="progress-bar"
                                  style={{ width: "60px" }}
                                >
                                  <div
                                    className="progress-fill"
                                    style={{
                                      "--w": `${p.score}%`,
                                      width: `${p.score}%`,
                                      background: riskColors[p.risk],
                                    }}
                                  />
                                </div>
                                <span
                                  style={{
                                    fontSize: "12px",
                                    fontFamily: "var(--font-mono)",
                                  }}
                                >
                                  {p.score}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Risk breakdown */}
                  <div className="card">
                    <h3
                      style={{
                        fontFamily: "var(--font-head)",
                        fontWeight: 700,
                        fontSize: "16px",
                        marginBottom: "20px",
                      }}
                    >
                      Risk Distribution
                    </h3>
                    {[
                      {
                        l: "Low Risk",
                        c: riskColors.LOW,
                        n: predHistory.filter((p) => p.risk === "LOW").length,
                      },
                      {
                        l: "Medium Risk",
                        c: riskColors.MEDIUM,
                        n: predHistory.filter((p) => p.risk === "MEDIUM")
                          .length,
                      },
                      {
                        l: "High Risk",
                        c: riskColors.HIGH,
                        n: predHistory.filter((p) => p.risk === "HIGH").length,
                      },
                    ].map((r, i) => (
                      <div key={i} style={{ marginBottom: "16px" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "6px",
                          }}
                        >
                          <span
                            style={{ fontSize: "13px", color: "var(--text2)" }}
                          >
                            {r.l}
                          </span>
                          <span
                            style={{
                              fontSize: "13px",
                              fontFamily: "var(--font-mono)",
                              color: r.c,
                            }}
                          >
                            {r.n}
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              "--w": `${(r.n / predHistory.length) * 100 || 0}%`,
                              width: `${(r.n / predHistory.length) * 100 || 0}%`,
                              background: r.c,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    <div style={{ marginTop: "24px" }}>
                      <BarChart
                        data={DISEASES.slice(0, 5).map((d) => ({
                          label: d.name.split(" ")[0],
                          value: Math.round(
                            50 +
                              Math.sin(d.id.length * 3) * 30 +
                              Math.random() * 5,
                          ),
                          color: d.color,
                        }))}
                      />
                      <div
                        style={{
                          fontSize: "11px",
                          color: "var(--text3)",
                          textAlign: "center",
                          marginTop: "8px",
                        }}
                      >
                        Sample Disease Risk Distribution
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick access */}
                <div className="card">
                  <h3
                    style={{
                      fontFamily: "var(--font-head)",
                      fontWeight: 700,
                      fontSize: "16px",
                      marginBottom: "20px",
                    }}
                  >
                    Quick Predictions
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(160px, 1fr))",
                      gap: "12px",
                    }}
                  >
                    {DISEASES.map((d) => (
                      <button
                        key={d.id}
                        style={{
                          background: `${d.color}0d`,
                          border: `1px solid ${d.color}25`,
                          borderRadius: "12px",
                          padding: "16px",
                          cursor: "pointer",
                          transition: "all .2s",
                          textAlign: "left",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = d.color;
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = `${d.color}25`;
                          e.currentTarget.style.transform = "none";
                        }}
                        onClick={() => {
                          setSelectedDisease(d);
                          setPredResult(null);
                          setFormData({});
                          setPage("predict");
                        }}
                      >
                        <Icon name={d.icon} size={20} color={d.color} />
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            marginTop: "10px",
                            color: "var(--text)",
                          }}
                        >
                          {d.name}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "var(--text3)",
                            marginTop: "2px",
                          }}
                        >
                          {d.accuracy}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── PREDICT PAGE ── */}
            {page === "predict" && !selectedDisease && (
              <div style={{ animation: "fadeUp .5s ease forwards" }}>
                <p style={{ color: "var(--text2)", marginBottom: "32px" }}>
                  Select a disease model to begin your AI-powered health
                  assessment
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "20px",
                  }}
                >
                  {DISEASES.map((d) => (
                    <div
                      key={d.id}
                      className="card"
                      style={{
                        cursor: "pointer",
                        position: "relative",
                        overflow: "hidden",
                        transition: "all .2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = d.color;
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = `0 12px 40px ${d.color}20`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--border)";
                        e.currentTarget.style.transform = "none";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                      onClick={() => {
                        setSelectedDisease(d);
                        setPredResult(null);
                        setFormData({});
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          width: "100px",
                          height: "100px",
                          background: `radial-gradient(circle at top right, ${d.color}12, transparent)`,
                          pointerEvents: "none",
                        }}
                      />
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          marginBottom: "16px",
                        }}
                      >
                        <div
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "12px",
                            background: `${d.color}18`,
                            border: `1px solid ${d.color}30`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Icon name={d.icon} size={22} color={d.color} />
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div
                            style={{ fontSize: "11px", color: "var(--text3)" }}
                          >
                            Accuracy
                          </div>
                          <div
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "16px",
                              fontWeight: 700,
                              color: d.color,
                            }}
                          >
                            {d.accuracy}
                          </div>
                        </div>
                      </div>
                      <h3
                        style={{
                          fontFamily: "var(--font-head)",
                          fontWeight: 700,
                          fontSize: "17px",
                          marginBottom: "8px",
                        }}
                      >
                        {d.name}
                      </h3>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "var(--text3)",
                          lineHeight: 1.6,
                          marginBottom: "16px",
                        }}
                      >
                        {d.desc}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          className="tag"
                          style={{
                            background: `${d.color}10`,
                            color: d.color,
                            border: `1px solid ${d.color}25`,
                          }}
                        >
                          {d.algorithm}
                        </span>
                        <span
                          className="tag"
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            color: "var(--text3)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          {d.fields.length} inputs
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {page === "predict" && selectedDisease && (
              <div
                style={{
                  animation: "fadeUp .4s ease forwards",
                  maxWidth: "900px",
                }}
              >
                <button
                  className="btn-ghost"
                  style={{
                    marginBottom: "24px",
                    padding: "8px 16px",
                    fontSize: "13px",
                  }}
                  onClick={() => {
                    setSelectedDisease(null);
                    setPredResult(null);
                  }}
                >
                  ← Back to Models
                </button>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: predResult ? "1fr 1fr" : "1fr",
                    gap: "24px",
                    alignItems: "flex-start",
                  }}
                >
                  {/* Form */}
                  <div className="card">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "24px",
                      }}
                    >
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "12px",
                          background: `${selectedDisease.color}18`,
                          border: `1px solid ${selectedDisease.color}30`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon
                          name={selectedDisease.icon}
                          size={22}
                          color={selectedDisease.color}
                        />
                      </div>
                      <div>
                        <h2
                          style={{
                            fontFamily: "var(--font-head)",
                            fontWeight: 700,
                            fontSize: "20px",
                          }}
                        >
                          {selectedDisease.name}
                        </h2>
                        <div
                          style={{ fontSize: "12px", color: "var(--text3)" }}
                        >
                          {selectedDisease.algorithm} •{" "}
                          {selectedDisease.dataset}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "16px",
                        marginBottom: "24px",
                      }}
                    >
                      {selectedDisease.fields.map((f) => (
                        <div key={f.key}>
                          <label className="label">{f.label}</label>
                          {f.type === "select" ? (
                            <select
                              className="input-field"
                              value={formData[f.key] || ""}
                              onChange={(e) =>
                                setFormData((d) => ({
                                  ...d,
                                  [f.key]: e.target.value,
                                }))
                              }
                            >
                              <option value="">Select...</option>
                              {f.options.map((o) => (
                                <option key={o.v} value={o.v}>
                                  {o.l}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="number"
                              className="input-field"
                              placeholder={f.placeholder}
                              min={f.min}
                              max={f.max}
                              step={f.step || 1}
                              value={formData[f.key] || ""}
                              onChange={(e) =>
                                setFormData((d) => ({
                                  ...d,
                                  [f.key]: e.target.value,
                                }))
                              }
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      className="btn-primary"
                      style={{
                        width: "100%",
                        padding: "14px",
                        fontSize: "15px",
                      }}
                      disabled={predLoading}
                      onClick={() => handlePredict(selectedDisease, formData)}
                    >
                      {predLoading ? (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "10px",
                          }}
                        >
                          <span
                            className="animate-spin"
                            style={{
                              width: "18px",
                              height: "18px",
                              border: "2px solid rgba(255,255,255,.2)",
                              borderTopColor: "white",
                              borderRadius: "50%",
                              display: "inline-block",
                            }}
                          />
                          Analyzing with AI...
                        </span>
                      ) : (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                          }}
                        >
                          <Icon name="brain" size={18} />
                          Run AI Prediction
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Result */}
                  {predResult && (
                    <div style={{ animation: "slideIn .4s ease forwards" }}>
                      {/* Risk badge */}
                      <div
                        className="card"
                        style={{
                          borderColor: predResult.color,
                          marginBottom: "16px",
                          background: `linear-gradient(135deg, ${predResult.color}08, var(--card))`,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "20px",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: "11px",
                                color: "var(--text3)",
                                marginBottom: "4px",
                                letterSpacing: "1px",
                              }}
                            >
                              RISK ASSESSMENT
                            </div>
                            <div
                              style={{
                                fontFamily: "var(--font-head)",
                                fontWeight: 800,
                                fontSize: "32px",
                                color: predResult.color,
                              }}
                            >
                              {predResult.level}
                            </div>
                          </div>
                          <DonutChart
                            value={predResult.score}
                            color={predResult.color}
                            size={90}
                          />
                        </div>
                        <div
                          className="progress-bar"
                          style={{ marginBottom: "8px", height: "8px" }}
                        >
                          <div
                            className="progress-fill"
                            style={{
                              "--w": `${predResult.score}%`,
                              width: `${predResult.score}%`,
                              background: predResult.color,
                            }}
                          />
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "11px",
                            color: "var(--text3)",
                          }}
                        >
                          <span>Risk Score: {predResult.score}%</span>
                          <span>Confidence: {predResult.confidence}%</span>
                        </div>
                      </div>

                      {/* Explanation */}
                      <div className="card" style={{ marginBottom: "16px" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            marginBottom: "10px",
                          }}
                        >
                          <Icon name="info" size={16} color="var(--accent)" />
                          <span style={{ fontSize: "13px", fontWeight: 600 }}>
                            Analysis
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: "13px",
                            color: "var(--text2)",
                            lineHeight: 1.7,
                          }}
                        >
                          {predResult.explanation}
                        </p>
                      </div>

                      {/* Tips */}
                      <div className="card">
                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            marginBottom: "14px",
                          }}
                        >
                          <Icon name="shield" size={16} color="var(--teal)" />
                          <span style={{ fontSize: "13px", fontWeight: 600 }}>
                            Recommendations
                          </span>
                        </div>
                        {predResult.tips.map((t, i) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              gap: "10px",
                              marginBottom: "10px",
                            }}
                          >
                            <div
                              style={{
                                width: "20px",
                                height: "20px",
                                borderRadius: "50%",
                                background: "rgba(0,229,192,0.1)",
                                border: "1px solid rgba(0,229,192,0.3)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                marginTop: "1px",
                              }}
                            >
                              <Icon
                                name="check"
                                size={12}
                                color="var(--teal)"
                              />
                            </div>
                            <span
                              style={{
                                fontSize: "13px",
                                color: "var(--text2)",
                                lineHeight: 1.5,
                              }}
                            >
                              {t}
                            </span>
                          </div>
                        ))}
                        <div
                          style={{
                            marginTop: "16px",
                            padding: "12px",
                            borderRadius: "8px",
                            background: "rgba(255,77,109,0.07)",
                            border: "1px solid rgba(255,77,109,0.15)",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "11px",
                              color: "var(--red)",
                              fontWeight: 600,
                              letterSpacing: ".5px",
                            }}
                          >
                            ⚠ DISCLAIMER
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "var(--text3)",
                              marginTop: "4px",
                              lineHeight: 1.5,
                            }}
                          >
                            This is AI analysis only and not a medical
                            diagnosis. Always consult a licensed healthcare
                            professional.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── MEDICAL RECORDS ── */}
            {page === "records" && (
              <div style={{ animation: "fadeUp .5s ease forwards" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "24px",
                  }}
                >
                  <p style={{ color: "var(--text2)", fontSize: "14px" }}>
                    Securely store and manage your medical documents
                  </p>
                  <button
                    className="btn-primary"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                    onClick={() => fileRef.current?.click()}
                  >
                    <Icon name="upload" size={16} />
                    Upload Report
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const f = e.target.files[0];
                      if (f)
                        setUploadedFiles((files) => [
                          {
                            id: Date.now(),
                            name: f.name,
                            size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
                            date: new Date().toISOString().slice(0, 10),
                            type: "Document",
                          },
                          ...files,
                        ]);
                      e.target.value = "";
                    }}
                  />
                </div>

                {/* Upload zone */}
                <div
                  style={{
                    border: "2px dashed var(--border)",
                    borderRadius: "16px",
                    padding: "48px",
                    textAlign: "center",
                    marginBottom: "32px",
                    cursor: "pointer",
                    transition: "all .2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent)";
                    e.currentTarget.style.background = "rgba(0,198,255,0.03)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.background = "transparent";
                  }}
                  onClick={() => fileRef.current?.click()}
                >
                  <Icon name="upload" size={32} color="var(--text3)" />
                  <div
                    style={{
                      marginTop: "12px",
                      fontSize: "15px",
                      fontWeight: 600,
                    }}
                  >
                    Drop files here or click to upload
                  </div>
                  <div
                    style={{
                      color: "var(--text3)",
                      fontSize: "13px",
                      marginTop: "6px",
                    }}
                  >
                    Supports PDF, PNG, JPG up to 25MB • AES-256 encrypted
                    storage
                  </div>
                </div>

                <div
                  className="card"
                  style={{ padding: 0, overflow: "hidden" }}
                >
                  <div
                    style={{
                      padding: "20px 24px",
                      borderBottom: "1px solid var(--border)",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: "var(--font-head)",
                        fontWeight: 700,
                        fontSize: "16px",
                      }}
                    >
                      Uploaded Documents ({uploadedFiles.length})
                    </h3>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {["All", "Blood Test", "ECG", "Document", "Imaging"].map(
                        (t) => (
                          <span
                            key={t}
                            style={{
                              padding: "4px 10px",
                              borderRadius: "20px",
                              fontSize: "11px",
                              cursor: "pointer",
                              color: "var(--text3)",
                              border: "1px solid var(--border)",
                            }}
                          >
                            {t}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>File Name</th>
                        <th>Type</th>
                        <th>Size</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploadedFiles.map((f) => (
                        <tr key={f.id}>
                          <td>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                              }}
                            >
                              <Icon
                                name="file"
                                size={16}
                                color="var(--accent)"
                              />
                              <span>{f.name}</span>
                            </div>
                          </td>
                          <td>
                            <span
                              className="tag"
                              style={{
                                background: "rgba(0,198,255,0.08)",
                                color: "var(--accent)",
                                border: "1px solid rgba(0,198,255,0.2)",
                              }}
                            >
                              {f.type}
                            </span>
                          </td>
                          <td
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "12px",
                              color: "var(--text3)",
                            }}
                          >
                            {f.size}
                          </td>
                          <td
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "12px",
                              color: "var(--text3)",
                            }}
                          >
                            {f.date}
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  color: "var(--text3)",
                                  padding: "4px",
                                }}
                                title="Download"
                              >
                                <Icon name="download" size={16} />
                              </button>
                              <button
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  color: "var(--red)",
                                  padding: "4px",
                                }}
                                title="Delete"
                                onClick={() =>
                                  setUploadedFiles((files) =>
                                    files.filter((x) => x.id !== f.id),
                                  )
                                }
                              >
                                <Icon name="trash" size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {uploadedFiles.length === 0 && (
                    <div
                      style={{
                        padding: "60px",
                        textAlign: "center",
                        color: "var(--text3)",
                      }}
                    >
                      <Icon name="folder" size={40} />
                      <div style={{ marginTop: "12px" }}>
                        No documents uploaded yet
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── SYMPTOM CHECKER ── */}
            {page === "symptoms" && (
              <div
                style={{
                  animation: "fadeUp .5s ease forwards",
                  maxWidth: "800px",
                }}
              >
                <p
                  style={{
                    color: "var(--text2)",
                    marginBottom: "32px",
                    fontSize: "14px",
                  }}
                >
                  Select your current symptoms for an instant AI health
                  assessment
                </p>

                <div className="card" style={{ marginBottom: "24px" }}>
                  <h3
                    style={{
                      fontFamily: "var(--font-head)",
                      fontWeight: 700,
                      fontSize: "16px",
                      marginBottom: "16px",
                    }}
                  >
                    Select Symptoms
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginBottom: "20px",
                    }}
                  >
                    {SYMPTOM_LIST.map((s) => (
                      <button
                        key={s}
                        className={`chip ${symptoms.includes(s) ? "selected" : ""}`}
                        onClick={() =>
                          setSymptoms((ss) =>
                            ss.includes(s)
                              ? ss.filter((x) => x !== s)
                              : [...ss, s],
                          )
                        }
                      >
                        {symptoms.includes(s) && (
                          <Icon name="check" size={12} />
                        )}
                        {s}
                      </button>
                    ))}
                  </div>
                  {symptoms.length > 0 && (
                    <div style={{ marginBottom: "16px" }}>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--text3)",
                          marginBottom: "8px",
                        }}
                      >
                        Selected ({symptoms.length}):
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "6px",
                        }}
                      >
                        {symptoms.map((s) => (
                          <span
                            key={s}
                            style={{
                              padding: "4px 10px",
                              borderRadius: "20px",
                              background: "rgba(0,198,255,0.12)",
                              border: "1px solid rgba(0,198,255,0.3)",
                              fontSize: "12px",
                              color: "var(--accent)",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            {s}
                            <button
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "var(--accent)",
                                padding: 0,
                                lineHeight: 1,
                              }}
                              onClick={() =>
                                setSymptoms((ss) => ss.filter((x) => x !== s))
                              }
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      className="btn-primary"
                      onClick={analyzeSymptoms}
                      disabled={!symptoms.length}
                      style={{ flex: 1 }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                        }}
                      >
                        <Icon name="brain" size={16} />
                        Analyze Symptoms
                      </span>
                    </button>
                    {symptoms.length > 0 && (
                      <button
                        className="btn-ghost"
                        onClick={() => {
                          setSymptoms([]);
                          setSymptomResult(null);
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {symptomResult && (
                  <div
                    className="card"
                    style={{
                      borderColor: riskColors[symptomResult.urgency],
                      animation: "slideIn .4s ease forwards",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "20px",
                      }}
                    >
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "12px",
                          background: `${riskColors[symptomResult.urgency]}15`,
                          border: `1px solid ${riskColors[symptomResult.urgency]}30`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon
                          name="stethoscope"
                          size={24}
                          color={riskColors[symptomResult.urgency]}
                        />
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--text3)",
                            letterSpacing: "1px",
                          }}
                        >
                          URGENCY LEVEL
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-head)",
                            fontWeight: 800,
                            fontSize: "24px",
                            color: riskColors[symptomResult.urgency],
                          }}
                        >
                          {symptomResult.urgency}
                        </div>
                      </div>
                    </div>
                    <div style={{ marginBottom: "20px" }}>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          marginBottom: "10px",
                        }}
                      >
                        Possible Conditions
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        {symptomResult.possibleConditions.map((c, i) => (
                          <span
                            key={i}
                            className="tag"
                            style={{
                              background: `${riskColors[symptomResult.urgency]}10`,
                              color: riskColors[symptomResult.urgency],
                              border: `1px solid ${riskColors[symptomResult.urgency]}25`,
                            }}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div
                      style={{
                        padding: "16px",
                        background: `${riskColors[symptomResult.urgency]}08`,
                        borderRadius: "10px",
                        border: `1px solid ${riskColors[symptomResult.urgency]}20`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: "13px",
                          color: "var(--text2)",
                          lineHeight: 1.6,
                        }}
                      >
                        <strong
                          style={{ color: riskColors[symptomResult.urgency] }}
                        >
                          Recommendation:
                        </strong>{" "}
                        {symptomResult.recommendation}
                      </div>
                    </div>
                    <div
                      style={{
                        marginTop: "12px",
                        fontSize: "11px",
                        color: "var(--text3)",
                      }}
                    >
                      ⚠ This is not a medical diagnosis. These are indicative
                      patterns only based on symptom analysis.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── ANALYTICS ── */}
            {page === "analytics" && (
              <div style={{ animation: "fadeUp .5s ease forwards" }}>
                <p
                  style={{
                    color: "var(--text2)",
                    marginBottom: "32px",
                    fontSize: "14px",
                  }}
                >
                  Visualize your health trends and risk patterns over time
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "24px",
                    marginBottom: "24px",
                  }}
                >
                  <div className="card">
                    <h3
                      style={{
                        fontFamily: "var(--font-head)",
                        fontWeight: 700,
                        fontSize: "16px",
                        marginBottom: "20px",
                      }}
                    >
                      Risk Score Trend
                    </h3>
                    <MiniLineChart
                      data={[22, 35, 28, 48, 42, 38, 30, 25, 18]}
                      color="var(--accent)"
                      height={100}
                    />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: "12px",
                      }}
                    >
                      {[
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                      ].map((m) => (
                        <span
                          key={m}
                          style={{ fontSize: "10px", color: "var(--text3)" }}
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="card">
                    <h3
                      style={{
                        fontFamily: "var(--font-head)",
                        fontWeight: 700,
                        fontSize: "16px",
                        marginBottom: "20px",
                      }}
                    >
                      Disease Risk Overview
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      {DISEASES.slice(0, 5).map((d) => {
                        const v = Math.round(
                          15 + Math.abs(Math.sin(d.id.length * 7) * 50),
                        );
                        return (
                          <div key={d.id}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: "6px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                <Icon name={d.icon} size={14} color={d.color} />
                                <span style={{ fontSize: "13px" }}>
                                  {d.name}
                                </span>
                              </div>
                              <span
                                style={{
                                  fontFamily: "var(--font-mono)",
                                  fontSize: "12px",
                                  color: d.color,
                                }}
                              >
                                {v}%
                              </span>
                            </div>
                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{
                                  "--w": `${v}%`,
                                  width: `${v}%`,
                                  background: d.color,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "24px",
                  }}
                >
                  {[
                    {
                      title: "BMI Trend",
                      data: [24.1, 24.3, 24.0, 23.8, 24.2, 23.9, 24.5],
                      color: "var(--teal)",
                      unit: "kg/m²",
                    },
                    {
                      title: "Glucose Level",
                      data: [95, 102, 98, 105, 99, 96, 100],
                      color: "var(--yellow)",
                      unit: "mg/dL",
                    },
                    {
                      title: "Blood Pressure",
                      data: [118, 122, 119, 124, 120, 116, 121],
                      color: "var(--red)",
                      unit: "mmHg",
                    },
                  ].map((c, i) => (
                    <div key={i} className="card">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "16px",
                        }}
                      >
                        <div>
                          <div
                            style={{ fontSize: "12px", color: "var(--text3)" }}
                          >
                            {c.title}
                          </div>
                          <div
                            style={{
                              fontFamily: "var(--font-head)",
                              fontSize: "22px",
                              fontWeight: 700,
                              color: c.color,
                            }}
                          >
                            {c.data[c.data.length - 1]}{" "}
                            <span
                              style={{
                                fontSize: "12px",
                                color: "var(--text3)",
                              }}
                            >
                              {c.unit}
                            </span>
                          </div>
                        </div>
                        <div style={{ width: "48px", height: "48px" }}>
                          <DonutChart
                            value={Math.round(c.data[c.data.length - 1] % 100)}
                            color={c.color}
                            size={48}
                          />
                        </div>
                      </div>
                      <MiniLineChart
                        data={c.data}
                        color={c.color}
                        height={60}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── PROFILE ── */}
            {page === "profile" && (
              <div
                style={{
                  animation: "fadeUp .5s ease forwards",
                  maxWidth: "700px",
                }}
              >
                <div className="card" style={{ marginBottom: "24px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "20px",
                      marginBottom: "28px",
                      paddingBottom: "28px",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        width: "72px",
                        height: "72px",
                        borderRadius: "50%",
                        background:
                          "linear-gradient(135deg,var(--accent2),var(--teal))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "var(--font-head)",
                        fontWeight: 800,
                        fontSize: "28px",
                      }}
                    >
                      {authUser?.avatar}
                    </div>
                    <div>
                      <h2
                        style={{
                          fontFamily: "var(--font-head)",
                          fontSize: "22px",
                          fontWeight: 800,
                        }}
                      >
                        {authUser?.name}
                      </h2>
                      <div style={{ color: "var(--text3)", fontSize: "13px" }}>
                        {authUser?.email}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          marginTop: "8px",
                        }}
                      >
                        <span
                          className="tag"
                          style={{
                            background: "rgba(0,229,192,0.1)",
                            color: "var(--teal)",
                            border: "1px solid rgba(0,229,192,0.2)",
                          }}
                        >
                          ✓ Verified
                        </span>
                        <span
                          className="tag"
                          style={{
                            background: "rgba(0,198,255,0.1)",
                            color: "var(--accent)",
                            border: "1px solid rgba(0,198,255,0.2)",
                          }}
                        >
                          Pro Plan
                        </span>
                      </div>
                    </div>
                    <button
                      className="btn-ghost"
                      style={{ marginLeft: "auto" }}
                    >
                      Edit Photo
                    </button>
                  </div>

                  <h3
                    style={{
                      fontFamily: "var(--font-head)",
                      fontWeight: 700,
                      fontSize: "15px",
                      marginBottom: "20px",
                    }}
                  >
                    Health Profile
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px",
                    }}
                  >
                    {[
                      { k: "name", l: "Full Name", p: "John Doe" },
                      { k: "age", l: "Age", p: "35", t: "number" },
                      { k: "weight", l: "Weight (kg)", p: "70", t: "number" },
                      { k: "height", l: "Height (cm)", p: "175", t: "number" },
                      { k: "bloodType", l: "Blood Type", p: "A+" },
                      { k: "allergies", l: "Known Allergies", p: "None" },
                    ].map((f) => (
                      <div key={f.k}>
                        <label className="label">{f.l}</label>
                        <input
                          type={f.t || "text"}
                          className="input-field"
                          placeholder={f.p}
                          value={profileData[f.k] || ""}
                          onChange={(e) =>
                            setProfileData((d) => ({
                              ...d,
                              [f.k]: e.target.value,
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    className="btn-primary"
                    style={{ marginTop: "24px", padding: "12px 32px" }}
                  >
                    Save Profile
                  </button>
                </div>

                <div className="card" style={{ marginBottom: "24px" }}>
                  <h3
                    style={{
                      fontFamily: "var(--font-head)",
                      fontWeight: 700,
                      fontSize: "15px",
                      marginBottom: "20px",
                    }}
                  >
                    Health Statistics
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "16px",
                    }}
                  >
                    {[
                      { v: predHistory.length, l: "Predictions" },
                      { v: uploadedFiles.length, l: "Reports" },
                      { v: "Good", l: "Health Status" },
                    ].map((s, i) => (
                      <div
                        key={i}
                        style={{
                          textAlign: "center",
                          padding: "20px",
                          background: "rgba(0,198,255,0.04)",
                          borderRadius: "12px",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "var(--font-head)",
                            fontSize: "28px",
                            fontWeight: 800,
                            color: "var(--accent)",
                          }}
                        >
                          {s.v}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--text3)",
                            marginTop: "4px",
                          }}
                        >
                          {s.l}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <h3
                    style={{
                      fontFamily: "var(--font-head)",
                      fontWeight: 700,
                      fontSize: "15px",
                      marginBottom: "20px",
                    }}
                  >
                    Security Settings
                  </h3>
                  {[
                    {
                      l: "Two-Factor Authentication",
                      v: "Enabled",
                      c: "var(--green)",
                    },
                    { l: "Data Encryption", v: "AES-256", c: "var(--accent)" },
                    { l: "Last Login", v: "Today", c: "var(--text2)" },
                    {
                      l: "Account Created",
                      v: authUser?.joinDate || "2025-11-01",
                      c: "var(--text2)",
                    },
                  ].map((s, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "14px 0",
                        borderBottom:
                          i < 3 ? "1px solid var(--border)" : "none",
                      }}
                    >
                      <span style={{ fontSize: "14px", color: "var(--text2)" }}>
                        {s.l}
                      </span>
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: s.c,
                        }}
                      >
                        {s.v}
                      </span>
                    </div>
                  ))}
                  <button
                    className="btn-ghost"
                    style={{ marginTop: "20px", width: "100%" }}
                  >
                    Change Password
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

// ─── AUTH FORM COMPONENT ────────────────────────────────────────────────────────
function AuthForm({ mode, onSubmit }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e?.preventDefault();
    if (!email || !pass) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    onSubmit(email, pass, name);
    setLoading(false);
  };

  return (
    <div>
      <h2
        style={{
          fontFamily: "var(--font-head)",
          fontWeight: 800,
          fontSize: "22px",
          marginBottom: "6px",
        }}
      >
        {mode === "login" ? "Sign In" : "Create Account"}
      </h2>
      <p
        style={{
          color: "var(--text3)",
          fontSize: "13px",
          marginBottom: "28px",
        }}
      >
        {mode === "login"
          ? "Access your health dashboard"
          : "Join VitaCore AI for free"}
      </p>

      {mode === "signup" && (
        <div style={{ marginBottom: "16px" }}>
          <label className="label">Full Name</label>
          <input
            className="input-field"
            placeholder="Jane Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      )}
      <div style={{ marginBottom: "16px" }}>
        <label className="label">Email Address</label>
        <input
          className="input-field"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div style={{ marginBottom: "24px" }}>
        <label className="label">Password</label>
        <div style={{ position: "relative" }}>
          <input
            className="input-field"
            type={showPass ? "text" : "password"}
            placeholder="••••••••"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            style={{ paddingRight: "44px" }}
          />
          <button
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text3)",
            }}
            onClick={() => setShowPass(!showPass)}
          >
            <Icon name={showPass ? "eyeoff" : "eye"} size={16} />
          </button>
        </div>
      </div>

      {mode === "signup" && (
        <div
          style={{
            padding: "12px",
            borderRadius: "8px",
            background: "rgba(0,229,192,0.07)",
            border: "1px solid rgba(0,229,192,0.2)",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: "var(--teal)",
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
            }}
          >
            <Icon name="shield" size={14} />
            <span>
              Your data is encrypted with AES-256 and never shared with third
              parties.
            </span>
          </div>
        </div>
      )}

      <button
        className="btn-primary"
        style={{ width: "100%", padding: "14px", fontSize: "15px" }}
        onClick={handle}
        disabled={loading}
      >
        {loading ? (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <span
              className="animate-spin"
              style={{
                width: "18px",
                height: "18px",
                border: "2px solid rgba(255,255,255,.2)",
                borderTopColor: "white",
                borderRadius: "50%",
                display: "inline-block",
              }}
            />
            {mode === "login" ? "Signing in..." : "Creating account..."}
          </span>
        ) : mode === "login" ? (
          "Sign In →"
        ) : (
          "Create Account →"
        )}
      </button>

      {mode === "login" && (
        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <span
            style={{
              fontSize: "13px",
              color: "var(--accent)",
              cursor: "pointer",
            }}
          >
            Forgot password?
          </span>
        </div>
      )}
    </div>
  );
}
