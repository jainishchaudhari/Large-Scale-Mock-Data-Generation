import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import {
  AnimatePresence,
  animate,
  motion,
  useReducedMotion,
} from "framer-motion";

import {
  getBatch,
  getGeneratedRecordCount,
  readBatchesSequentially,
} from "../utils/dataStorage";

const EASE = [0.22, 1, 0.36, 1];

// ======================================================
// Fonts + CSS animations (same system as the other pages)
// ======================================================

const css = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=JetBrains+Mono:wght@400;500&display=swap');

.font-display {
  font-family: 'Bricolage Grotesque', system-ui, -apple-system, 'Segoe UI', sans-serif;
}
.font-code {
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
}

@keyframes mgDrift {
  0% { transform: translate3d(0, 30px, 0); opacity: 0; }
  20% { opacity: 0.9; }
  80% { opacity: 0.5; }
  100% { transform: translate3d(14px, -170px, 0); opacity: 0; }
}
@keyframes mgStreamUp {
  from { transform: translateY(0); }
  to { transform: translateY(-50%); }
}
@keyframes mgStreamDown {
  from { transform: translateY(-50%); }
  to { transform: translateY(0); }
}
@keyframes mgShimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}

.mg-drift {
  opacity: 0;
  animation: mgDrift var(--dur, 10s) ease-in-out var(--delay, 0s) infinite;
}
.mg-stream-up { animation: mgStreamUp 50s linear infinite; }
.mg-stream-down { animation: mgStreamDown 56s linear infinite; }
.mg-shimmer { animation: mgShimmer 1.8s ease-in-out infinite; }

/* Cursor spotlight inside cards */
.mg-spot {
  opacity: 0;
  transition: opacity 0.3s ease;
  background: radial-gradient(
    360px circle at var(--x, 50%) var(--y, 0%),
    rgba(252, 211, 77, 0.07),
    transparent 60%
  );
}
.mg-card:hover .mg-spot { opacity: 1; }
`;

// ======================================================
// Decorative data
// ======================================================

const STREAM_ROWS = [
  '{"id":1043,"age":29}',
  '{"city":"Surat"}',
  '{"sku":"MG-2041"}',
  '{"qty":2,"paid":true}',
  '{"id":1044,"role":"admin"}',
  '{"zip":395007}',
  '{"price":1899}',
  '{"id":1045,"active":true}',
  '{"order":"ORD-88214"}',
  '{"rating":4.6}',
  '{"id":1046,"age":34}',
  '{"stock":120}',
];

const PARTICLES = [
  { left: "6%", top: "78%", size: 5, rgb: "125,211,252", dur: "9s", delay: "0s" },
  { left: "14%", top: "52%", size: 4, rgb: "252,211,77", dur: "11s", delay: "2s" },
  { left: "27%", top: "86%", size: 5, rgb: "252,211,77", dur: "10s", delay: "4s" },
  { left: "41%", top: "70%", size: 4, rgb: "125,211,252", dur: "12s", delay: "1s" },
  { left: "58%", top: "90%", size: 5, rgb: "125,211,252", dur: "9s", delay: "5s" },
  { left: "69%", top: "62%", size: 4, rgb: "252,211,77", dur: "13s", delay: "3s" },
  { left: "82%", top: "80%", size: 5, rgb: "252,211,77", dur: "10s", delay: "6s" },
  { left: "93%", top: "58%", size: 4, rgb: "125,211,252", dur: "11s", delay: "1.5s" },
];

const HISTORY_COLUMNS = [
  "Records",
  "Method",
  "Format",
  "Generation Time",
  "Memory",
  "Date & Time",
  "Action",
];

// ======================================================
// Helpers
// ======================================================

const onCardMove = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--x", `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty("--y", `${e.clientY - rect.top}px`);
};

const formatDate = (createdAt) =>
  createdAt
    ? new Date(createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";

const formatTime = (createdAt) =>
  createdAt
    ? new Date(createdAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "";

// Custom Monaco theme that matches the page palette
const defineMockGenTheme = (monaco) => {
  monaco.editor.defineTheme("mockgen", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "string.key.json", foreground: "7dd3fc" },
      { token: "string.value.json", foreground: "6ee7b7" },
      { token: "number", foreground: "fcd34d" },
      { token: "keyword", foreground: "fda4af" },
      { token: "delimiter", foreground: "64748b" },
    ],
    colors: {
      "editor.background": "#0b0e15",
      "editorGutter.background": "#0b0e15",
      "editor.lineHighlightBackground": "#ffffff08",
      "editor.lineHighlightBorder": "#00000000",
      "editor.selectionBackground": "#fcd34d33",
      "editor.inactiveSelectionBackground": "#fcd34d1a",
      "editorCursor.foreground": "#fcd34d",
      "editorLineNumber.foreground": "#475569",
      "editorLineNumber.activeForeground": "#cbd5e1",
      "editorIndentGuide.background1": "#ffffff0d",
      "editorIndentGuide.activeBackground1": "#ffffff26",
      "scrollbarSlider.background": "#ffffff14",
      "scrollbarSlider.hoverBackground": "#ffffff26",
      "scrollbarSlider.activeBackground": "#ffffff33",
    },
  });
};

const onEditorMount = (editor, monaco) => {
  // Re-measure once the web font is ready so the cursor stays aligned
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => monaco.editor.remeasureFonts());
  }
};

// ======================================================
// Icons
// ======================================================

const Svg = ({ children, className = "h-4 w-4", strokeWidth = 1.8 }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

const ChevronLeftIcon = () => (
  <Svg className="h-3.5 w-3.5" strokeWidth={2}>
    <polyline points="15 18 9 12 15 6" />
  </Svg>
);

const ChevronRightIcon = () => (
  <Svg className="h-3.5 w-3.5" strokeWidth={2}>
    <polyline points="9 18 15 12 9 6" />
  </Svg>
);

const CheckIcon = ({ className = "h-4 w-4" }) => (
  <Svg className={className} strokeWidth={2.4}>
    <polyline points="20 6 9 17 4 12" />
  </Svg>
);

const CopyIcon = () => (
  <Svg>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Svg>
);

const DownloadIcon = () => (
  <Svg>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </Svg>
);

const DatabaseIcon = () => (
  <Svg className="h-5 w-5">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </Svg>
);

const CpuIcon = () => (
  <Svg className="h-5 w-5">
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
    <rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" />
    <line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" />
    <line x1="15" y1="20" x2="15" y2="23" />
    <line x1="20" y1="9" x2="23" y2="9" />
    <line x1="20" y1="14" x2="23" y2="14" />
    <line x1="1" y1="9" x2="4" y2="9" />
    <line x1="1" y1="14" x2="4" y2="14" />
  </Svg>
);

const InfoIcon = ({ className = "h-5 w-5" }) => (
  <Svg className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </Svg>
);

// ======================================================
// Small UI pieces
// ======================================================

const cardCls =
  "mg-card relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/40 backdrop-blur-xl";

// Top highlight line + cursor spotlight used inside every big card
const CardFx = () => (
  <>
    <div className="pointer-events-none absolute -top-px left-1/2 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />
    <div className="mg-spot pointer-events-none absolute inset-0" />
  </>
);

// Fades / slides a block in when it scrolls into view
const Reveal = ({ children, reduce, delay = 0, className = "" }) => (
  <motion.div
    className={className}
    initial={reduce ? false : { opacity: 0, y: 18 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "0px 0px -60px 0px" }}
    transition={{ duration: 0.55, ease: EASE, delay }}
  >
    {children}
  </motion.div>
);

// Number that counts up from 0 once
const CountUp = ({ value, reduce }) => {
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return undefined;
    }

    const controls = animate(0, value, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
      onComplete: () => setDisplay(value),
    });

    return () => controls.stop();
  }, [value, reduce]);

  return <>{Number(display).toLocaleString()}</>;
};

const StatTile = ({ label, hint, tone = "text-white", children }) => (
  <div className="h-full rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/20">
    <p className="text-sm text-slate-400">{label}</p>

    <p className={`mt-2 text-2xl font-bold tracking-tight ${tone}`}>
      {children}
    </p>

    <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
  </div>
);

const MiniStat = ({ label, tone = "text-white", children }) => (
  <div className="rounded-lg border border-white/10 bg-black/20 px-4 py-3">
    <p className="text-xs text-slate-500">{label}</p>
    <p className={`mt-1 font-semibold ${tone}`}>{children}</p>
  </div>
);

const SectionTitle = ({ title, text, children }) => (
  <div className="mb-5">
    <div className="flex flex-wrap items-center gap-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </div>

    {text && <p className="mt-1 text-sm text-slate-500">{text}</p>}
  </div>
);

const DataTable = ({ columns, children }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-white/10 text-xs text-slate-500">
          {columns.map((column) => (
            <th key={column} className="px-4 py-3.5 font-medium">
              {column}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>{children}</tbody>
    </table>
  </div>
);

const pill = (tone) =>
  `inline-block rounded-md px-2.5 py-1 text-xs font-semibold ${tone}`;

// ------------------------------------------------------
// History table (used in both views)
// ------------------------------------------------------

const HistoryTable = ({ history, onOpen, reduce }) => (
  <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/40 backdrop-blur-xl">
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="border-b border-white/10 bg-black/20">
          <tr>
            {HISTORY_COLUMNS.map((column) => (
              <th
                key={column}
                className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-400"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {history.map((item, i) => (
            <motion.tr
              key={item._id}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                ease: EASE,
                delay: Math.min(i, 12) * 0.04,
              }}
              className="border-b border-white/5 transition-colors last:border-b-0 hover:bg-white/[0.03]"
            >
              <td className="px-6 py-4 font-code text-sm text-white">
                {Number(item.records || 0).toLocaleString()}
              </td>

              <td className="px-6 py-4">
                <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-medium text-amber-200">
                  {item.method}
                </span>
              </td>

              <td className="px-6 py-4">
                <span className="rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-xs font-medium text-sky-200">
                  {item.outputFormat || "JSON"}
                </span>
              </td>

              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                {item.generationTime} ms
              </td>

              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                {item.memoryUsed} MB
              </td>

              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="whitespace-nowrap text-sm font-medium text-white">
                    {formatDate(item.createdAt)}
                  </span>

                  <span className="mt-1 text-xs text-slate-500">
                    {formatTime(item.createdAt)}
                  </span>
                </div>
              </td>

              <td className="px-6 py-4">
                <button
                  type="button"
                  onClick={() => onOpen(item)}
                  className="whitespace-nowrap rounded-lg border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-xs font-semibold text-amber-200 transition hover:border-amber-300/50 hover:bg-amber-300/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60"
                >
                  View Result
                </button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const LoadingHistory = () => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
    <div className="space-y-3" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-10 rounded-lg bg-white/[0.05] motion-safe:animate-pulse"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>

    <p className="mt-4 text-sm text-slate-400">Loading generation history...</p>
  </div>
);

// ------------------------------------------------------
// Page shell: background + decorative layers + container
// ------------------------------------------------------

const DataStream = ({ side }) => {
  const left = side === "left";
  const rows = Array.from({ length: 8 }, () => STREAM_ROWS).flat();
  const fade =
    "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute top-0 hidden h-full w-32 overflow-hidden 2xl:block ${
        left ? "left-0" : "right-0"
      }`}
      style={{ maskImage: fade, WebkitMaskImage: fade }}
    >
      <div
        className={`${
          left ? "mg-stream-down text-left" : "mg-stream-up text-right"
        } space-y-3 px-4 font-code text-[10px] text-slate-600`}
      >
        {rows.map((row, i) => (
          <div key={i} className="whitespace-nowrap">
            {row}
          </div>
        ))}
      </div>

      <div
        className={`absolute inset-0 from-transparent to-[#080a10] ${
          left ? "bg-gradient-to-r" : "bg-gradient-to-l"
        }`}
      />
    </div>
  );
};

const Shell = ({ reduce, children }) => (
  <div className="font-display relative min-h-screen overflow-hidden bg-[#080a10] text-white antialiased">
    <style>{css}</style>

    {/* Background */}
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(rgba(148,163,184,0.18) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 20%, black, transparent)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 20%, black, transparent)",
        }}
      />

      <motion.div
        className="absolute inset-x-0 top-[-180px] mx-auto h-[420px] w-[720px] rounded-full bg-sky-500/10 blur-[140px]"
        animate={
          reduce ? undefined : { opacity: [0.55, 1, 0.55], scale: [1, 1.08, 1] }
        }
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute inset-x-0 bottom-[-200px] mx-auto h-[360px] w-[560px] rounded-full bg-amber-300/[0.06] blur-[140px]"
        animate={
          reduce ? undefined : { opacity: [1, 0.5, 1], scale: [1.05, 1, 1.05] }
        }
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>

    {!reduce && (
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="mg-drift absolute rounded-full"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              background: `rgb(${p.rgb})`,
              boxShadow: `0 0 12px rgba(${p.rgb}, 0.9)`,
              "--dur": p.dur,
              "--delay": p.delay,
            }}
          />
        ))}
      </div>
    )}

    {!reduce && <DataStream side="left" />}
    {!reduce && <DataStream side="right" />}

    <main className="relative z-10 mx-auto max-w-7xl px-6 py-10">
      {children}
    </main>
  </div>
);

// ======================================================
// Results Component
// ======================================================

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [selectedResult, setSelectedResult] = useState(location.state || null);

  // --------------------------------
  // IndexedDB State
  // --------------------------------

  const [currentBatchNumber, setCurrentBatchNumber] = useState(1);
  const [currentBatchData, setCurrentBatchData] = useState([]);
  const [loadingBatch, setLoadingBatch] = useState(false);
  const [storedRecordCount, setStoredRecordCount] = useState(0);

  // --------------------------------
  // Format Date and Time
  // --------------------------------

  const formatDateTime = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // --------------------------------
  // Fetch Generation History
  // --------------------------------

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:5000/api/generator/results",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (data.success) {
          setHistory(data.results);

          if (!location.state && data.results.length > 0) {
            setSelectedResult(data.results[0]);
          }
        } else {
          console.error("History fetch failed:", data.message);
        }
      } catch (error) {
        console.error("Failed to fetch generation history:", error);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [location.state]);

  // --------------------------------
  // Load Current Batch from IndexedDB
  // --------------------------------

  useEffect(() => {
    const loadBatch = async () => {
      if (!selectedResult) {
        return;
      }

      try {
        setLoadingBatch(true);

        const batch = await getBatch(currentBatchNumber);

        if (Array.isArray(batch)) {
          setCurrentBatchData(batch);
        } else {
          setCurrentBatchData([]);
        }
      } catch (error) {
        console.error("Failed to load batch from IndexedDB:", error);

        setCurrentBatchData([]);
      } finally {
        setLoadingBatch(false);
      }
    };

    loadBatch();
  }, [selectedResult, currentBatchNumber]);

  // --------------------------------
  // Get Stored Record Count
  // --------------------------------

  useEffect(() => {
    const loadStoredCount = async () => {
      if (!selectedResult) {
        return;
      }

      try {
        const count = await getGeneratedRecordCount();

        setStoredRecordCount(count);
      } catch (error) {
        console.error("Failed to calculate IndexedDB record count:", error);
      }
    };

    loadStoredCount();
  }, [selectedResult]);

  // --------------------------------
  // Open Previous Result
  // --------------------------------

  const handleOpenHistory = (item) => {
    setSelectedResult({
      ...item,

      data: [],

      originalSchema: item.originalSchema || null,

      normalizedSchema: item.normalizedSchema || null,

      country: item.country || "India",

      batchSize: item.batchSize || 1000,

      totalBatches: item.totalBatches || 0,

      dataStored: item.dataStored,

      dataReturned: item.dataReturned,

      // New field
      outputFormat: item.outputFormat || "JSON",
    });

    setCurrentBatchNumber(1);
    setCurrentBatchData([]);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // --------------------------------
  // No Current Result
  // --------------------------------

  if (!selectedResult) {
    return (
      <Shell reduce={reduce}>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="mb-10"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/[0.06] px-3 py-1 text-xs font-medium text-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
            Generation history
          </span>

          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Results
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            View your previous mock data generations.
          </p>
        </motion.div>

        {loadingHistory ? (
          <LoadingHistory />
        ) : history.length === 0 ? (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.1 }}
            onMouseMove={onCardMove}
            className={`${cardCls} p-10 text-center`}
          >
            <CardFx />

            <div className="relative">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-amber-300/20 bg-amber-300/[0.07] text-amber-300">
                <InfoIcon className="h-6 w-6" />
              </div>

              <h2 className="mt-5 text-2xl font-bold">No Generation History</h2>

              <p className="mt-3 text-slate-400">
                Generate mock data first to create a generation history.
              </p>

              <motion.button
                type="button"
                onClick={() => navigate("/generate")}
                whileHover={reduce ? undefined : { y: -1 }}
                whileTap={reduce ? undefined : { scale: 0.98 }}
                className="group relative mt-6 overflow-hidden rounded-lg bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-400/10 transition-colors hover:bg-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080a10]"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative">Go to Generator</span>
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <section>
            <SectionTitle
              title="Previous Generations"
              text="Select a generation to view its results."
            />

            <HistoryTable
              history={history}
              onOpen={handleOpenHistory}
              reduce={reduce}
            />
          </section>
        )}
      </Shell>
    );
  }

  // --------------------------------
  // Current Result
  // --------------------------------

  const result = selectedResult;

  const outputFormat = result.outputFormat || "JSON";

  const recordCount = Number(result.records || storedRecordCount || 0);

  const batchSize = Number(result.batchSize || 1000);

  const totalBatches =
    result.method === "Batch"
      ? Number(result.totalBatches || Math.ceil(recordCount / batchSize))
      : Number(result.totalBatches || 0);

  const previewAvailable = currentBatchData.length > 0;

  const isBatch = result.method === "Batch";

  const storedPercent =
    recordCount > 0
      ? Math.min(100, Math.round((storedRecordCount / recordCount) * 100))
      : 0;

  // --------------------------------
  // Format Current Batch
  // --------------------------------

  const displayData =
    outputFormat === "JSONL"
      ? currentBatchData.map((record) => JSON.stringify(record)).join("\n")
      : JSON.stringify(currentBatchData, null, 2);

  // --------------------------------
  // Schema Helper
  // --------------------------------

  const formatSchemaValue = (value) => {
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value);
    }

    return String(value);
  };

  // --------------------------------
  // Copy Current Batch
  // --------------------------------

  const handleCopy = async () => {
    if (!previewAvailable) {
      return;
    }

    try {
      await navigator.clipboard.writeText(displayData);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  // --------------------------------
  // Download Current Batch
  // --------------------------------

  const handleDownloadCurrentBatch = async () => {
    if (!previewAvailable) {
      return;
    }

    try {
      const isJSONL = outputFormat === "JSONL";

      const content = isJSONL
        ? currentBatchData.map((record) => JSON.stringify(record)).join("\n")
        : JSON.stringify(currentBatchData, null, 2);

      const blob = new Blob([content], {
        type: isJSONL ? "application/x-ndjson" : "application/json",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = `mock-data-batch-${currentBatchNumber}.${isJSONL ? "jsonl" : "json"}`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Current batch download failed:", error);

      alert("Failed to download the current batch.");
    }
  };

  // --------------------------------
  // Download Full Dataset
  // --------------------------------

  const handleDownloadFullDataset = async () => {
    if (!selectedResult) {
      return;
    }

    try {
      setLoadingBatch(true);

      const isJSONL = outputFormat === "JSONL";

      const chunks = [];

      let firstRecord = true;

      // --------------------------------
      // JSONL
      // --------------------------------

      if (isJSONL) {
        await readBatchesSequentially(async (batch) => {
          const batchData = Array.isArray(batch.data) ? batch.data : [];

          for (const record of batchData) {
            chunks.push(JSON.stringify(record) + "\n");
          }
        });
      }

      // --------------------------------
      // JSON
      // --------------------------------
      else {
        chunks.push("[\n");

        await readBatchesSequentially(async (batch) => {
          const batchData = Array.isArray(batch.data) ? batch.data : [];

          for (const record of batchData) {
            if (!firstRecord) {
              chunks.push(",\n");
            }

            chunks.push(JSON.stringify(record, null, 2));

            firstRecord = false;
          }
        });

        chunks.push("\n]");
      }

      const blob = new Blob(chunks, {
        type: isJSONL ? "application/x-ndjson" : "application/json",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = `mock-data-${selectedResult.records}.${isJSONL ? "jsonl" : "json"}`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Full dataset download failed:", error);

      alert("Failed to download the complete dataset.");
    } finally {
      setLoadingBatch(false);
    }
  };

  // --------------------------------
  // Batch Navigation
  // --------------------------------

  const handlePreviousBatch = () => {
    if (currentBatchNumber <= 1) {
      return;
    }

    setCurrentBatchNumber(currentBatchNumber - 1);
  };

  const handleNextBatch = () => {
    if (currentBatchNumber >= totalBatches) {
      return;
    }

    setCurrentBatchNumber(currentBatchNumber + 1);
  };

  // --------------------------------
  // Preview Message
  // --------------------------------

  const getPreviewMessage = () => {
    if (recordCount > 10000) {
      return `The dataset contains ${recordCount.toLocaleString()} records. The complete dataset is stored in IndexedDB in smaller batches. Only the currently selected batch is loaded into the editor to avoid excessive browser memory usage.`;
    }

    return "No generated data is available for preview.";
  };

  const secondaryBtn =
    "inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-amber-300/40 hover:text-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/10 disabled:hover:text-slate-300";

  return (
    <Shell reduce={reduce}>
      {/* ==============================
          Header
      ============================== */}

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE }}
        className="mb-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"
      >
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-1 text-xs font-medium text-emerald-300">
            <CheckIcon className="h-3 w-3" />
            Generation complete
          </span>

          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Generated Results
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Your mock dataset has been successfully generated and is ready for
            inspection or performance analysis.
          </p>

          <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
            <span className="text-slate-600">Generated on</span>

            <span className="font-medium text-slate-300">
              {formatDateTime(result.createdAt)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/generate")}
          className={`${secondaryBtn} shrink-0`}
        >
          <ChevronLeftIcon />
          Generate Again
        </button>
      </motion.div>

      {/* ==============================
          Statistics
      ============================== */}

      <section className="mb-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        {/* Records (hero) */}
        <Reveal reduce={reduce} className="h-full">
          <div
            onMouseMove={onCardMove}
            className={`${cardCls} flex h-full min-h-[200px] flex-col justify-center p-7`}
          >
            <CardFx />

            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-amber-300/[0.07] blur-[70px]" />

            <div className="relative">
              <p className="text-sm text-slate-400">Records Generated</p>

              <p className="mt-3 font-code text-5xl font-medium tabular-nums tracking-tight text-white xl:text-6xl">
                <CountUp value={recordCount} reduce={reduce} />
              </p>

              <p className="mt-3 text-xs text-slate-500">Total mock records</p>
            </div>
          </div>
        </Reveal>

        {/* Other stats */}
        <div
          className={`grid grid-cols-2 gap-4 ${
            isBatch ? "sm:grid-cols-3" : ""
          }`}
        >
          <Reveal reduce={reduce} delay={0.05} className="h-full">
            <StatTile
              label="Generation Method"
              hint="Selected generation strategy"
            >
              {result.method || "Batch"}
            </StatTile>
          </Reveal>

          <Reveal reduce={reduce} delay={0.1} className="h-full">
            <StatTile
              label="Output Format"
              hint="Selected export format"
              tone="text-sky-300"
            >
              {outputFormat}
            </StatTile>
          </Reveal>

          {isBatch && (
            <Reveal reduce={reduce} delay={0.15} className="h-full">
              <StatTile
                label="Mini-Batch Size"
                hint="Records per batch"
                tone="text-amber-300"
              >
                <CountUp value={batchSize} reduce={reduce} />
              </StatTile>
            </Reveal>
          )}

          {isBatch && (
            <Reveal reduce={reduce} delay={0.2} className="h-full">
              <StatTile
                label="Total Batches"
                hint="Mini-batches generated"
                tone="text-amber-300"
              >
                <CountUp value={totalBatches} reduce={reduce} />
              </StatTile>
            </Reveal>
          )}

          <Reveal reduce={reduce} delay={0.25} className="h-full">
            <StatTile
              label="Generation Time"
              hint="Time required to generate data"
            >
              {result.generationTime || "N/A"} ms
            </StatTile>
          </Reveal>

          <Reveal reduce={reduce} delay={0.3} className="h-full">
            <StatTile label="Memory Delta" hint="Observed RSS memory change">
              {result.memoryUsed || "N/A"} MB
            </StatTile>
          </Reveal>
        </div>
      </section>

      {/* ==============================
          IndexedDB Storage Notice
      ============================== */}

      <Reveal reduce={reduce} className="mb-8">
        <section
          onMouseMove={onCardMove}
          className={`${cardCls} border-emerald-400/20 p-6`}
        >
          <CardFx />

          <div className="relative flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300">
              <DatabaseIcon />
            </div>

            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white">
                Large Dataset Stored in IndexedDB
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Generated records are stored locally in IndexedDB as separate
                batches. This prevents the complete dataset from being loaded
                into React state or stored as a large MongoDB document.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <MiniStat label="Expected Records">
                  {recordCount.toLocaleString()}
                </MiniStat>

                <MiniStat label="Stored Records" tone="text-emerald-300">
                  {storedRecordCount.toLocaleString()}
                </MiniStat>

                <MiniStat label="Storage" tone="text-amber-300">
                  IndexedDB
                </MiniStat>
              </div>

              {recordCount > 0 && (
                <div className="mt-4">
                  <div className="h-1 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      initial={reduce ? false : { width: 0 }}
                      animate={{ width: `${storedPercent}%` }}
                      transition={{ duration: 0.9, ease: EASE, delay: 0.3 }}
                      className="relative h-full overflow-hidden rounded-full bg-emerald-400"
                      style={{ boxShadow: "0 0 10px rgba(52,211,153,0.5)" }}
                    >
                      {!reduce && (
                        <span className="mg-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                      )}
                    </motion.div>
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    {storedPercent}% of the expected records are available in
                    IndexedDB.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </Reveal>

      {/* ==============================
          Mini-Batch Information
      ============================== */}

      {isBatch && (
        <Reveal reduce={reduce} className="mb-8">
          <section
            onMouseMove={onCardMove}
            className={`${cardCls} border-amber-300/20 p-6`}
          >
            <CardFx />

            <div className="relative flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-300/20 bg-amber-300/[0.07] text-amber-300">
                <CpuIcon />
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white">
                  Mini-Batch Generation
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  The dataset was generated in smaller user-defined batches
                  instead of processing all records as one batch.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <MiniStat label="Total Records">
                    {recordCount.toLocaleString()}
                  </MiniStat>

                  <MiniStat label="Batch Size" tone="text-amber-300">
                    {batchSize.toLocaleString()}
                  </MiniStat>

                  <MiniStat label="Total Batches" tone="text-amber-300">
                    {totalBatches.toLocaleString()}
                  </MiniStat>
                </div>
              </div>
            </div>
          </section>
        </Reveal>
      )}

      {/* ==============================
          AI Schema Interpretation
      ============================== */}

      {result.originalSchema && result.normalizedSchema && (
        <Reveal reduce={reduce} className="mb-8">
          <section onMouseMove={onCardMove} className={`${cardCls} p-6`}>
            <CardFx />

            <div className="relative">
              <SectionTitle
                title="AI Schema Interpretation"
                text="Gemini analyzed the input fields and identified their semantic meaning before mock data generation."
              >
                <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-200">
                  GEMINI AI
                </span>
              </SectionTitle>

              <DataTable
                columns={["Original Field", "Input Type", "AI Interpretation"]}
              >
                {Object.entries(result.originalSchema).map(([field, type]) => (
                  <tr
                    key={field}
                    className="border-b border-white/5 transition-colors last:border-b-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3.5 font-medium text-white">
                      {field}
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={pill(
                          "bg-white/[0.06] font-code text-slate-300",
                        )}
                      >
                        {formatSchemaValue(type)}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={pill(
                          "border border-amber-300/20 bg-amber-300/10 font-code text-amber-200",
                        )}
                      >
                        {formatSchemaValue(
                          result.normalizedSchema[field] || "text",
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </DataTable>
            </div>
          </section>
        </Reveal>
      )}

      {/* ==============================
          Data Preview
      ============================== */}

      <Reveal reduce={reduce} className="mb-8">
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e15]/80 shadow-2xl shadow-black/40">
          <div className="flex flex-col justify-between gap-4 border-b border-white/10 p-6 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold">
                  {outputFormat === "JSONL"
                    ? "JSONL Data Preview"
                    : "JSON Data Preview"}
                </h2>

                <span className="rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-xs font-semibold text-sky-200">
                  {outputFormat}
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Viewing one generated batch at a time.
              </p>
            </div>

            {previewAvailable && (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleCopy}
                  className={secondaryBtn}
                >
                  {copied ? <CheckIcon /> : <CopyIcon />}
                  {copied ? "Copied!" : "Copy Batch"}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadCurrentBatch}
                  disabled={!previewAvailable}
                  className="inline-flex items-center gap-2 rounded-lg border border-amber-300/30 bg-amber-300/10 px-4 py-2.5 text-sm font-semibold text-amber-200 transition hover:border-amber-300/50 hover:bg-amber-300/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <DownloadIcon />
                  Download Current Batch
                </button>

                <button
                  type="button"
                  onClick={handleDownloadFullDataset}
                  disabled={loadingBatch}
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-amber-300 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-400/10 transition-colors hover:bg-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0e15] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                  <span className="relative flex items-center gap-2">
                    {loadingBatch ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                    ) : (
                      <DownloadIcon />
                    )}

                    {loadingBatch
                      ? "Preparing Download..."
                      : "Download Full Dataset"}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Batch Navigation */}

          {isBatch && totalBatches > 0 && (
            <div className="border-b border-white/10 bg-black/20">
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={handlePreviousBatch}
                  disabled={currentBatchNumber <= 1 || loadingBatch}
                  className={secondaryBtn}
                >
                  <ChevronLeftIcon />
                  Previous Batch
                </button>

                <div className="text-center">
                  <p className="text-xs text-slate-500">Current Batch</p>

                  <div className="relative mt-1 h-7 overflow-hidden">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.p
                        key={currentBatchNumber}
                        initial={reduce ? false : { y: 14, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -14, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="font-code text-lg font-medium tabular-nums text-amber-300"
                      >
                        {currentBatchNumber.toLocaleString()}

                        {" / "}

                        {totalBatches.toLocaleString()}
                      </motion.p>
                    </AnimatePresence>
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    {currentBatchData.length.toLocaleString()}

                    {" records loaded"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleNextBatch}
                  disabled={currentBatchNumber >= totalBatches || loadingBatch}
                  className={secondaryBtn}
                >
                  Next Batch
                  <ChevronRightIcon />
                </button>
              </div>

              {/* position within the dataset */}
              <div className="h-0.5 w-full bg-white/[0.06]">
                <div
                  className="h-full bg-amber-300 transition-[width] duration-300 ease-out"
                  style={{
                    width: `${Math.min(
                      100,
                      (currentBatchNumber / totalBatches) * 100,
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}

          <div className="p-6">
            {loadingBatch ? (
              <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-white/10 bg-black/20">
                <div className="text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-amber-300" />

                  <p className="mt-4 text-sm text-slate-400">
                    Loading batch from IndexedDB...
                  </p>
                </div>
              </div>
            ) : previewAvailable ? (
              <div className="overflow-hidden rounded-xl border border-white/10">
                <Editor
                  height="600px"
                  language="json"
                  theme="mockgen"
                  beforeMount={defineMockGenTheme}
                  onMount={onEditorMount}
                  loading={
                    <span className="text-sm text-slate-500">
                      Loading editor…
                    </span>
                  }
                  value={displayData}
                  options={{
                    readOnly: true,

                    minimap: {
                      enabled: false,
                    },

                    fontFamily:
                      "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",

                    fontSize: 14,

                    lineHeight: 24,

                    padding: {
                      top: 18,
                      bottom: 18,
                    },

                    wordWrap: "on",

                    automaticLayout: true,

                    scrollBeyondLastLine: false,

                    folding: true,

                    renderLineHighlight: "line",

                    renderWhitespace: "selection",

                    contextmenu: true,

                    overviewRulerBorder: false,
                  }}
                />
              </div>
            ) : (
              <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-white/10 bg-black/20 p-8 text-center">
                <div className="max-w-xl">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-amber-300/20 bg-amber-300/[0.07] text-amber-300">
                    <InfoIcon className="h-6 w-6" />
                  </div>

                  <h3 className="mt-5 text-xl font-semibold text-white">
                    No Batch Data Available
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {getPreviewMessage()}
                  </p>

                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    Try selecting another batch or generate a new dataset.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </Reveal>

      {/* ==============================
          Schema Used
      ============================== */}

      {result.schema && (
        <Reveal reduce={reduce} className="mb-8">
          <section onMouseMove={onCardMove} className={`${cardCls} p-6`}>
            <CardFx />

            <div className="relative">
              <SectionTitle
                title="Schema Used"
                text="Fields and data types submitted for generation."
              />

              <DataTable columns={["Field", "Data Type"]}>
                {Object.entries(result.schema).map(([field, type]) => (
                  <tr
                    key={field}
                    className="border-b border-white/5 transition-colors last:border-b-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3.5 font-medium text-white">
                      {field}
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={pill(
                          "bg-white/[0.06] font-code text-slate-300",
                        )}
                      >
                        {formatSchemaValue(type)}
                      </span>
                    </td>
                  </tr>
                ))}
              </DataTable>
            </div>
          </section>
        </Reveal>
      )}

      {/* ==============================
          Generation History
      ============================== */}

      <Reveal reduce={reduce} className="mb-8">
        <section>
          <SectionTitle
            title="Generation History"
            text="Previous generation metadata stored in MongoDB."
          />

          {loadingHistory ? (
            <LoadingHistory />
          ) : history.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
              <p className="text-sm text-slate-400">
                No generation history found.
              </p>
            </div>
          ) : (
            <HistoryTable
              history={history}
              onOpen={handleOpenHistory}
              reduce={reduce}
            />
          )}
        </section>
      </Reveal>

      {/* ==============================
          Research Note
      ============================== */}

      <Reveal reduce={reduce}>
        <section
          onMouseMove={onCardMove}
          className={`${cardCls} border-amber-300/20 p-6`}
        >
          <CardFx />

          <div className="relative flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-300/20 bg-amber-300/[0.07] text-amber-300">
              <InfoIcon />
            </div>

            <div>
              <h2 className="text-lg font-semibold">Generation Summary</h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                {result.method === "Streaming"
                  ? "The dataset was generated progressively using the streaming approach. Records are produced and transmitted incrementally and stored in IndexedDB batches."
                  : `The dataset was generated using the mini-batch approach. ${recordCount.toLocaleString()} records were divided into batches of ${batchSize.toLocaleString()} records and processed sequentially.`}
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Performance measurements are environment-dependent. Memory
                values represent observed RSS changes during execution and may
                vary because of Node.js runtime allocation and garbage
                collection.
              </p>
            </div>
          </div>
        </section>
      </Reveal>
    </Shell>
  );
};

export default Results;