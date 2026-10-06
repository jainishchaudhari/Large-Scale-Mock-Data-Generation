import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, animate, motion, useReducedMotion } from "framer-motion";

/* ───────────────────────── Config ───────────────────────── */

// Vite: put VITE_API_URL in .env. Falls back to the local dev server.
const API_BASE = import.meta.env?.VITE_API_URL ?? "http://localhost:5000";
const LOGIN_ROUTE = "/login";
const EASE = [0.22, 1, 0.36, 1];
const PAGE_SIZES = [10, 25, 50];

const numberFmt = new Intl.NumberFormat();
const dateFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" });
const timeFmt = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" });
const plural = (n, one, many = `${one}s`) => (n === 1 ? one : many);

const NO_RUNS = [];
const SURFACE = "border border-white/10 bg-[#0b0e15]";
const DOT_MASK = "radial-gradient(ellipse 80% 55% at 50% 10%, black, transparent)";

// Fonts shared with the rest of MockGen (can live in index.css instead)
const css = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=JetBrains+Mono:wght@400;500&display=swap');
.font-display { font-family: 'Bricolage Grotesque', system-ui, -apple-system, 'Segoe UI', sans-serif; }
.font-code { font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace; }

@keyframes mgRowIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes mgPop { from { opacity: 0; transform: translateY(8px) scale(0.97); } to { opacity: 1; transform: none; } }
@keyframes mgFade { from { opacity: 0; } to { opacity: 1; } }

.mg-row { animation: mgRowIn 0.35s ease-out both; }

.mg-dialog::backdrop { background: rgba(3, 5, 10, 0.72); backdrop-filter: blur(4px); }
.mg-dialog[open] { animation: mgPop 0.2s ease-out; }
.mg-dialog[open]::backdrop { animation: mgFade 0.2s ease-out; }

/* Dark native select with custom chevron */
.mg-select {
  color-scheme: dark;
  -webkit-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
  background-repeat: no-repeat;
  background-position: right 8px center;
  padding-right: 28px;
}
.mg-select option { background: #0b0e15; color: #fff; }

@media (prefers-reduced-motion: reduce) {
  .mg-row, .mg-dialog[open], .mg-dialog[open]::backdrop { animation: none; }
}
`;

// Colour roles match the Users page: red = admin identity + destructive actions.
// Method gets its own categorical colours so Batch vs Streaming is readable at a glance.
const TONES = {
  neutral: { tile: "border-white/10 bg-white/[0.04] text-slate-300", value: "text-white" },
  red: { tile: "border-red-400/20 bg-red-400/[0.08] text-red-300", value: "text-red-300" },
};

const METHOD_STYLES = {
  Batch: "border-amber-300/25 bg-amber-300/10 text-amber-200",
  Streaming: "border-sky-300/25 bg-sky-300/10 text-sky-200",
};

const ICONS = {
  activity: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
  database: (<><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></>),
  clock: (<><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>),
  layers: (<><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></>),
  refresh: (<><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></>),
  search: (<><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>),
  trash: (<><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></>),
  check: <polyline points="20 6 9 17 4 12" />,
  x: (<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>),
  alert: (<><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>),
  chevronLeft: <polyline points="15 18 9 12 15 6" />,
  chevronRight: <polyline points="9 18 15 12 9 6" />,
};

const SUMMARY = [
  { title: "Total Runs", icon: "activity", hint: "Generations on record", pick: (s) => s.runs },
  { title: "Records Generated", icon: "database", hint: "Across all runs", pick: (s) => s.records },
  { title: "Avg. Generation Time", icon: "clock", hint: "Mean time per run", unit: " ms", pick: (s) => s.avgTime },
];

const METHOD_FILTERS = [
  { key: "all", label: "All", count: (s) => s.runs },
  { key: "Batch", label: "Batch", count: (s) => s.batch },
  { key: "Streaming", label: "Streaming", count: (s) => s.streaming },
];

const FORMAT_FILTERS = [
  { key: "all", label: "All", count: (s) => s.runs },
  { key: "JSON", label: "JSON", count: (s) => s.json },
  { key: "JSONL", label: "JSONL", count: (s) => s.jsonl },
];

const btn =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300/50 disabled:cursor-not-allowed disabled:opacity-50";
const BTN = {
  ghost: `${btn} border-white/10 text-slate-300 hover:border-white/25 hover:bg-white/[0.05] hover:text-white`,
  danger: `${btn} border-red-400/20 text-red-300 hover:border-red-400/40 hover:bg-red-400/10`,
  destructive: `${btn} border-transparent bg-red-500 text-white hover:bg-red-400`,
};

/* ───────────────────────── Helpers ───────────────────────── */

const userName = (g) => g.userId?.name || "Unknown User";

const num = (v) => {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const parseDate = (value) => {
  const d = value ? new Date(value) : null;
  return d && !Number.isNaN(d.getTime()) ? d : null;
};

const formatDate = (value) => {
  const d = parseDate(value);
  return d ? dateFmt.format(d) : "—";
};

const formatTime = (value) => {
  const d = parseDate(value);
  return d ? timeFmt.format(d) : "";
};

const formatDateTime = (value) => {
  const d = parseDate(value);
  return d ? dateTimeFmt.format(d) : undefined;
};

const errorMessage = (err) =>
  err instanceof TypeError ? "Can’t reach the server. Check that the API is running, then try again." : err.message || "Something went wrong.";

// ── Sorting ──
// "first" is the direction of the first click; the second click reverses it and the third clears the sort.
// Rows with a missing value always sort last.
const SORT_FIELDS = {
  user: { get: (g) => g.userId?.name || g.userId?.email || null, text: true, first: "asc" },
  records: { get: (g) => num(g.records), first: "desc" },
  method: { get: (g) => g.method || null, text: true, first: "asc" },
  format: { get: (g) => g.outputFormat || null, text: true, first: "asc" },
  time: { get: (g) => num(g.generationTime), first: "desc" },
  memory: { get: (g) => num(g.memoryUsed), first: "desc" },
  date: { get: (g) => parseDate(g.createdAt)?.getTime() ?? null, first: "desc" },
};

const nextSort = (sort, key) => {
  const first = SORT_FIELDS[key].first;
  if (sort?.key !== key) return { key, dir: first };
  if (sort.dir === first) return { key, dir: first === "asc" ? "desc" : "asc" };
  return null;
};

const compareValues = (a, b, text) => (text ? String(a).localeCompare(String(b), undefined, { sensitivity: "base" }) : a - b);

// One place for token + JSON + error handling (could move to a shared api file)
const adminFetch = async (path, { method = "GET", body, signal } = {}) => {
  const res = await fetch(`${API_BASE}/api/admin${path}`, {
    method,
    signal,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data?.message || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
};

const useAdminGenerations = () => {
  const [state, setState] = useState({ items: null, loading: true, refreshing: false, error: "", authError: false, updatedAt: null });
  const controllerRef = useRef(null);

  const load = useCallback(async (isRefresh = false) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    // No data yet (first load or retry after a failure): show the skeleton, not a blank page
    setState((s) => ({ ...s, loading: !s.items, refreshing: isRefresh && Boolean(s.items), error: "", authError: false }));

    try {
      const data = await adminFetch("/generations", { signal: controller.signal });
      if (controller.signal.aborted) return;
      setState({ items: data?.generations ?? [], loading: false, refreshing: false, error: "", authError: false, updatedAt: new Date() });
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("Admin Generations Error:", err);
      setState((s) => ({
        ...s,
        loading: false,
        refreshing: false,
        error: errorMessage(err),
        authError: err.status === 401 || err.status === 403,
      }));
    }
  }, []);

  useEffect(() => {
    load();
    return () => controllerRef.current?.abort();
  }, [load]);

  // Local list update after a successful delete (no refetch needed)
  const setItems = useCallback((update) => setState((s) => ({ ...s, items: update(s.items ?? []) })), []);

  return { ...state, reload: () => load(true), setItems };
};

/* ───────────────────────── Primitives ───────────────────────── */

const Icon = ({ name, className = "h-4 w-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    {ICONS[name]}
  </svg>
);

// Counts up from the previous value (0 on first render) and respects reduced motion
const CountUp = ({ value }) => {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);
  const from = useRef(reduce ? value : 0);

  useEffect(() => {
    if (reduce) {
      from.current = value;
      setDisplay(value);
      return undefined;
    }
    const controls = animate(from.current, value, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (v) => {
        from.current = v;
        setDisplay(Math.round(v));
      },
      onComplete: () => {
        from.current = value;
        setDisplay(value);
      },
    });
    return () => controls.stop();
  }, [value, reduce]);

  return <>{numberFmt.format(display)}</>;
};

const Backdrop = () => {
  const reduce = useReducedMotion();

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: "radial-gradient(rgba(148,163,184,0.18) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: DOT_MASK,
          WebkitMaskImage: DOT_MASK,
        }}
      />
      <motion.div
        className="absolute -left-40 top-[-160px] h-[420px] w-[620px] rounded-full bg-red-500/[0.09] blur-[140px]"
        animate={reduce ? undefined : { opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute -right-40 top-[-200px] h-[360px] w-[520px] rounded-full bg-sky-500/[0.05] blur-[140px]" />
    </div>
  );
};

// Smoothly expands / collapses a block so banners don't make the page jump
const Collapse = ({ children, reduce, pad = "pb-6" }) => (
  <motion.div
    initial={reduce ? false : { height: 0, opacity: 0 }}
    animate={{ height: "auto", opacity: 1 }}
    exit={{ height: 0, opacity: 0 }}
    transition={{ duration: 0.25, ease: EASE }}
    className="overflow-hidden"
  >
    <div className={pad}>{children}</div>
  </motion.div>
);

/* ───────────────────────── Pieces ───────────────────────── */

const SummaryCell = ({ title, value, unit = "", icon, hint }) => (
  <div className="flex items-center gap-4 bg-[#0b0e15] p-5">
    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg border ${TONES.neutral.tile}`}>
      <Icon name={icon} className="h-5 w-5" />
    </span>
    <div>
      <p className="text-sm text-slate-300">{title}</p>
      <p className={`font-code text-2xl font-medium tabular-nums tracking-tight ${TONES.neutral.value}`}>
        {value == null ? (
          "—"
        ) : (
          <>
            <CountUp value={value} />
            {unit && <span className="ml-1 text-sm font-normal text-slate-400">{unit.trim()}</span>}
          </>
        )}
      </p>
      <p className="text-xs text-slate-400">{hint}</p>
    </div>
  </div>
);

// Batch vs Streaming share of all runs
const MixCell = ({ batch, streaming }) => {
  const total = batch + streaming;
  const batchPct = total ? (batch / total) * 100 : 0;
  const streamingPct = total ? (streaming / total) * 100 : 0;

  return (
    <div className="flex items-center gap-4 bg-[#0b0e15] p-5">
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg border ${TONES.neutral.tile}`}>
        <Icon name="layers" className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-300">Method Mix</p>
        <p className="mt-0.5 flex flex-wrap gap-x-3 font-code text-sm tabular-nums">
          <span className="text-amber-200">{numberFmt.format(batch)} Batch</span>
          <span className="text-sky-200">{numberFmt.format(streaming)} Streaming</span>
        </p>
        <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
          <div className="h-full bg-amber-300 transition-[width] duration-700 ease-out" style={{ width: `${batchPct}%` }} />
          <div className="h-full bg-sky-300 transition-[width] duration-700 ease-out" style={{ width: `${streamingPct}%` }} />
        </div>
      </div>
    </div>
  );
};

const Avatar = ({ name, fallback = "?" }) => (
  <span
    aria-hidden="true"
    className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-sm font-semibold text-slate-300"
  >
    {name?.trim()?.charAt(0)?.toUpperCase() || fallback}
  </span>
);

const MethodBadge = ({ method }) => (
  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${METHOD_STYLES[method] ?? "border-white/10 bg-white/[0.04] text-slate-300"}`}>
    {method || "—"}
  </span>
);

const FormatBadge = ({ format }) => (
  <span className="inline-flex rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 font-code text-xs font-medium text-slate-300">{format || "—"}</span>
);

const SortIcon = ({ dir }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
    <path d="M8 9l4-4 4 4" className={dir === "asc" ? "opacity-100" : "opacity-30"} />
    <path d="M16 15l-4 4-4-4" className={dir === "desc" ? "opacity-100" : "opacity-30"} />
  </svg>
);

const SortHeader = ({ title, sortKey, sort, onSort, align = "left" }) => {
  const active = sort?.key === sortKey;
  const ariaSort = active ? (sort.dir === "asc" ? "ascending" : "descending") : "none";

  return (
    <th scope="col" aria-sort={ariaSort} className={`px-5 py-3 font-medium ${align === "right" ? "text-right" : ""}`}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`-mx-1 inline-flex items-center gap-1.5 whitespace-nowrap rounded px-1 transition hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300/50 ${
          active ? "text-slate-100" : ""
        }`}
      >
        {title}
        <SortIcon dir={active ? sort.dir : null} />
      </button>
    </th>
  );
};

// Segmented filter with a sliding highlight and live counts
const FilterGroup = ({ name, title, options, value, onChange, stats, reduce }) => (
  <div className="flex items-center gap-2">
    <span className="text-xs text-slate-400">{title}</span>
    <div role="group" aria-label={`Filter by ${title.toLowerCase()}`} className="inline-flex rounded-lg border border-white/10 bg-black/20 p-1">
      {options.map((o) => {
        const active = value === o.key;
        return (
          <button
            key={o.key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.key)}
            className={`relative rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300/50 ${
              active ? "text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {active && (
              <motion.span
                layoutId={`filter-${name}`}
                className="absolute inset-0 rounded-md bg-white/10"
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 36 }}
              />
            )}
            <span className="relative">{o.label}</span>
            <span className="relative ml-1.5 font-code text-[11px] tabular-nums text-slate-400">{numberFmt.format(o.count(stats))}</span>
          </button>
        );
      })}
    </div>
  </div>
);

const GenerationRow = ({ gen, number, index, deleting, onDelete }) => {
  const user = gen.userId;
  const name = userName(gen);
  const time = formatTime(gen.createdAt);

  return (
    <tr className="mg-row transition-colors hover:bg-white/[0.03]" style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}>
      <td className="px-5 py-4 font-code text-sm tabular-nums text-slate-400">{number}</td>

      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <Avatar name={user?.name} fallback="U" />
          <div>
            <p className="max-w-[16rem] truncate text-sm font-medium text-slate-100">{name}</p>
            <p className="max-w-[18rem] truncate text-xs text-slate-400">{user?.email || "No email"}</p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4 text-right font-code text-sm tabular-nums text-slate-100">{numberFmt.format(num(gen.records) ?? 0)}</td>

      <td className="px-5 py-4">
        <MethodBadge method={gen.method} />
      </td>

      <td className="px-5 py-4">
        <FormatBadge format={gen.outputFormat} />
      </td>

      <td className="whitespace-nowrap px-5 py-4 text-right font-code text-sm tabular-nums text-slate-300">
        {gen.generationTime != null ? `${gen.generationTime} ms` : "—"}
      </td>

      <td className="whitespace-nowrap px-5 py-4 text-right font-code text-sm tabular-nums text-slate-300">
        {gen.memoryUsed != null ? `${gen.memoryUsed} MB` : "—"}
      </td>

      <td className="whitespace-nowrap px-5 py-4" title={formatDateTime(gen.createdAt)}>
        <p className="text-sm text-slate-300">{formatDate(gen.createdAt)}</p>
        {time && <p className="text-xs text-slate-400">{time}</p>}
      </td>

      <td className="px-5 py-4">
        <div className="flex justify-end">
          <button type="button" onClick={onDelete} disabled={deleting} className={`${BTN.danger} px-3 py-2 text-xs`}>
            <Icon name="trash" className="h-3.5 w-3.5" />
            {deleting ? "Deleting…" : "Delete"}
            <span className="sr-only"> generation by {name}</span>
          </button>
        </div>
      </td>
    </tr>
  );
};

const EmptyState = ({ icon, title, text, action }) => (
  <div className="flex flex-col items-center px-6 py-14 text-center">
    <span className="mb-4 grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300">
      <Icon name={icon} className="h-5 w-5" />
    </span>
    <p className="text-sm font-medium text-slate-100">{title}</p>
    <p className="mt-1 text-sm text-slate-400">{text}</p>
    {action}
  </div>
);

const Notice = ({ notice, onDismiss }) => {
  const isError = notice.type === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      className={`flex items-start justify-between gap-3 rounded-xl border p-4 text-sm ${
        isError ? "border-red-400/25 bg-red-400/[0.07] text-red-200" : "border-white/10 bg-white/[0.04] text-slate-200"
      }`}
    >
      <span className="flex items-start gap-3">
        <Icon name={isError ? "alert" : "check"} className={`mt-0.5 h-4 w-4 shrink-0 ${isError ? "text-red-300" : "text-emerald-300"}`} />
        {notice.text}
      </span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss message"
        className="shrink-0 rounded text-slate-400 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300/50"
      >
        <Icon name="x" />
      </button>
    </div>
  );
};

const ErrorBanner = ({ what, message, authError, onRetry }) => {
  const action =
    "shrink-0 rounded-lg border border-red-400/30 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-400/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300/50";

  return (
    <div role="alert" className="flex flex-col justify-between gap-4 rounded-xl border border-red-400/25 bg-red-400/[0.07] p-5 sm:flex-row sm:items-center">
      <div className="flex items-start gap-3">
        <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
        <div>
          <p className="text-sm font-medium text-red-200">{authError ? `You can’t view ${what}` : `Couldn’t load ${what}`}</p>
          <p className="mt-0.5 text-sm text-red-300/90">{message}</p>
        </div>
      </div>

      {authError ? (
        <Link to={LOGIN_ROUTE} className={action}>
          Sign in again
        </Link>
      ) : (
        <button type="button" onClick={onRetry} className={action}>
          Try again
        </button>
      )}
    </div>
  );
};

const PageSkeleton = () => {
  const pulse = "motion-safe:animate-pulse";
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Loading generation history…</span>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-[104px] rounded-xl border border-white/10 bg-white/[0.03] ${pulse}`} style={{ animationDelay: `${i * 0.12}s` }} />
        ))}
      </div>

      <div className={`overflow-hidden rounded-2xl ${SURFACE}`}>
        <div className="divide-y divide-white/5">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`flex items-center gap-4 px-5 py-4 ${pulse}`} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="h-4 w-6 rounded bg-white/[0.04]" />
              <div className="h-9 w-9 rounded-full bg-white/[0.06]" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-40 rounded bg-white/[0.06]" />
                <div className="h-3 w-56 max-w-full rounded bg-white/[0.04]" />
              </div>
              <div className="h-6 w-20 rounded-full bg-white/[0.06]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Fact = ({ title, children }) => (
  <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
    <p className="text-[11px] text-slate-400">{title}</p>
    <p className="mt-0.5 truncate font-code text-sm tabular-nums text-slate-100">{children}</p>
  </div>
);

// Native <dialog>: Escape, focus trap and inert background come for free
const ConfirmDialog = ({ generation, busy, onConfirm, onClose }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (generation && !el.open) el.showModal();
    if (!generation && el.open) el.close();
  }, [generation]);

  const user = generation?.userId;

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-title"
      aria-describedby="confirm-body"
      onCancel={(e) => busy && e.preventDefault()}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
      className="mg-dialog m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-white/10 bg-[#0b0e15] p-0 text-white shadow-2xl shadow-black/60"
    >
      {generation && (
        <div className="p-6">
          <span className={`mb-4 grid h-10 w-10 place-items-center rounded-lg border ${TONES.red.tile}`}>
            <Icon name="trash" className="h-[18px] w-[18px]" />
          </span>

          <h2 id="confirm-title" className="text-lg font-semibold">
            Delete this generation record?
          </h2>
          <p id="confirm-body" className="mt-1.5 text-sm text-slate-400">
            This permanently removes the generation metadata from the database. This can’t be undone.
          </p>

          {/* Which run this applies to */}
          <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-center gap-3">
              <Avatar name={user?.name} fallback="U" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-100">{userName(generation)}</p>
                <p className="truncate text-xs text-slate-400">{user?.email || "No email"}</p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <Fact title="Records">{numberFmt.format(num(generation.records) ?? 0)}</Fact>
              <Fact title="Method">{generation.method || "—"}</Fact>
              <Fact title="Format">{generation.outputFormat || "—"}</Fact>
            </div>

            <p className="mt-3 text-xs text-slate-400">{formatDateTime(generation.createdAt) ?? "Date unknown"}</p>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={busy} className={`${BTN.ghost} px-4 py-2.5 text-sm`}>
              Cancel
            </button>
            <button type="button" onClick={onConfirm} disabled={busy} className={`${BTN.destructive} px-4 py-2.5 text-sm`}>
              {busy ? "Deleting…" : "Delete Record"}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
};

/* ───────────────────────── Page ───────────────────────── */

const AdminGenerations = () => {
  const reduce = useReducedMotion();
  const { items, loading, refreshing, error, authError, updatedAt, reload, setItems } = useAdminGenerations();

  const [query, setQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [formatFilter, setFormatFilter] = useState("all");
  const [sort, setSort] = useState(null); // { key, dir: "asc" | "desc" } | null
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState(null); // the generation being deleted
  const [pendingId, setPendingId] = useState(null);
  const [notice, setNotice] = useState(null); // { id, type: "success" | "error", text }
  const searchRef = useRef(null);

  const list = items ?? NO_RUNS;

  // Fade-and-rise entrance (skipped when the user prefers reduced motion)
  const rise = (delay = 0) =>
    reduce ? {} : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: EASE, delay } };

  const stats = useMemo(() => {
    let records = 0;
    let timeSum = 0;
    let timeCount = 0;
    let batch = 0;
    let streaming = 0;
    let json = 0;
    let jsonl = 0;

    for (const g of list) {
      records += num(g.records) ?? 0;

      const t = num(g.generationTime);
      if (t != null) {
        timeSum += t;
        timeCount += 1;
      }

      if (g.method === "Batch") batch += 1;
      if (g.method === "Streaming") streaming += 1;
      if (g.outputFormat === "JSON") json += 1;
      if (g.outputFormat === "JSONL") jsonl += 1;
    }

    return { runs: list.length, records, avgTime: timeCount ? Math.round(timeSum / timeCount) : null, batch, streaming, json, jsonl };
  }, [list]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return list.filter((g) => {
      const user = g.userId;
      const matchesSearch = !q || user?.name?.toLowerCase().includes(q) || user?.email?.toLowerCase().includes(q);
      const matchesMethod = methodFilter === "all" || g.method === methodFilter;
      const matchesFormat = formatFilter === "all" || g.outputFormat === formatFilter;
      return matchesSearch && matchesMethod && matchesFormat;
    });
  }, [list, query, methodFilter, formatFilter]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const { get, text } = SORT_FIELDS[sort.key];
    const dir = sort.dir === "asc" ? 1 : -1;

    return [...filtered].sort((a, b) => {
      const av = get(a);
      const bv = get(b);
      if (av == null && bv == null) return 0;
      if (av == null) return 1; // missing values always last
      if (bv == null) return -1;
      return dir * compareValues(av, bv, text);
    });
  }, [filtered, sort]);

  const filtersActive = Boolean(query) || methodFilter !== "all" || formatFilter !== "all";

  // Pagination (page is clamped, so deleting the last row of a page can't strand you on an empty page)
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  const rows = sorted.slice(start, start + pageSize);

  const summaryText =
    sorted.length === 0
      ? `No matching runs · ${numberFmt.format(list.length)} total`
      : `Showing ${numberFmt.format(start + 1)}–${numberFmt.format(start + rows.length)} of ${numberFmt.format(sorted.length)} ${plural(sorted.length, "run")}${
          sorted.length !== list.length ? ` · ${numberFmt.format(list.length)} total` : ""
        }`;

  // Success messages fade away on their own; errors stay until dismissed
  useEffect(() => {
    if (notice?.type !== "success") return undefined;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  // Press "/" to jump to the search box (like GitHub)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey || !searchRef.current) return;
      const el = document.activeElement;
      if (el && (["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName) || el.isContentEditable)) return;
      e.preventDefault();
      searchRef.current.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const showNotice = (type, text) => setNotice({ id: Date.now(), type, text });

  const closeDialog = useCallback(() => setDialog(null), []);

  const confirmDelete = async () => {
    const generation = dialog;
    const name = userName(generation);
    setPendingId(generation._id);

    try {
      await adminFetch(`/generations/${encodeURIComponent(generation._id)}`, { method: "DELETE" });
      // Remove it from the current table immediately
      setItems((prev) => prev.filter((g) => g._id !== generation._id));
      showNotice("success", `Deleted the generation record for ${name}.`);
    } catch (err) {
      console.error("Delete Generation Error:", err);
      showNotice("error", errorMessage(err));
    } finally {
      setPendingId(null);
      setDialog(null);
    }
  };

  // Any change to what's shown sends you back to the first page
  const updateQuery = (value) => {
    setQuery(value);
    setPage(1);
  };
  const updateMethod = (key) => {
    setMethodFilter(key);
    setPage(1);
  };
  const updateFormat = (key) => {
    setFormatFilter(key);
    setPage(1);
  };
  const updateSort = (key) => {
    setSort((current) => nextSort(current, key));
    setPage(1);
  };
  const updatePageSize = (size) => {
    setPageSize(size);
    setPage(1);
  };
  const clearFilters = () => {
    setQuery("");
    setMethodFilter("all");
    setFormatFilter("all");
    setPage(1);
  };

  return (
    <div className="font-display relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#080a10] text-white antialiased">
      <style>{css}</style>
      <Backdrop />

      <header className="relative z-10 border-b border-red-400/15 bg-[#0b0e15]/70 backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-400/50 to-transparent" />

        <motion.div {...rise(0)} className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-6 py-6 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-md border border-red-400/30 bg-red-400/10 px-2.5 py-1 text-xs font-medium text-red-300">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                Admin Panel
              </span>
              <span className="text-xs text-slate-400">Generation Monitoring</span>
            </div>
            <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Generation Activity
              {items && (
                <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-0.5 font-code text-sm font-medium tabular-nums text-slate-300">
                  {numberFmt.format(stats.runs)} {plural(stats.runs, "Run")}
                </span>
              )}
            </h1>
            <p className="mt-1.5 text-sm text-slate-400">Monitor mock data generation activity across all users.</p>
            {updatedAt && <p className="mt-1 text-xs text-slate-400">Last updated {timeFmt.format(updatedAt)}</p>}
          </div>

          <button
            type="button"
            onClick={reload}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-red-400/40 hover:text-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300/50 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
          >
            <span className={refreshing ? "motion-safe:animate-spin" : ""}>
              <Icon name="refresh" />
            </span>
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </motion.div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-8">
        <AnimatePresence initial={false}>
          {notice && (
            <Collapse key={notice.id} reduce={reduce}>
              <Notice notice={notice} onDismiss={() => setNotice(null)} />
            </Collapse>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {error && (
            <Collapse key="error" reduce={reduce} pad="pb-8">
              <ErrorBanner what="generation history" message={error} authError={authError} onRetry={reload} />
            </Collapse>
          )}
        </AnimatePresence>

        {loading && <PageSkeleton />}

        {!loading && items && (
          <>
            {/* Ledger strip: 1px gaps over a tinted background draw the dividers */}
            <motion.div {...rise(0)} className="mb-8 grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-2 xl:grid-cols-4">
              {SUMMARY.map(({ pick, ...card }) => (
                <SummaryCell key={card.title} {...card} value={pick(stats)} />
              ))}
              <MixCell batch={stats.batch} streaming={stats.streaming} />
            </motion.div>

            <motion.section {...rise(0.08)} aria-label="Generation history" className={`overflow-hidden rounded-2xl ${SURFACE}`}>
              <div className="flex flex-col gap-4 border-b border-white/10 p-4 xl:flex-row xl:items-center xl:justify-between">
                <label className="relative block w-full xl:max-w-xs">
                  <span className="sr-only">Search by user name or email</span>
                  <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    ref={searchRef}
                    type="search"
                    value={query}
                    onChange={(e) => updateQuery(e.target.value)}
                    placeholder="Search by user name or email"
                    className="w-full rounded-lg border border-white/10 bg-black/20 py-2 pl-9 pr-9 text-sm text-white transition placeholder:text-slate-400 focus:border-red-400/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300/50"
                  />
                  {!query && (
                    <kbd aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-white/10 px-1.5 font-code text-[11px] text-slate-400">
                      /
                    </kbd>
                  )}
                </label>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                  <FilterGroup name="method" title="Method" options={METHOD_FILTERS} value={methodFilter} onChange={updateMethod} stats={stats} reduce={reduce} />
                  <FilterGroup name="format" title="Format" options={FORMAT_FILTERS} value={formatFilter} onChange={updateFormat} stats={stats} reduce={reduce} />

                  {filtersActive && (
                    <button type="button" onClick={clearFilters} className={`${BTN.ghost} px-3 py-2 text-xs`}>
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {rows.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1080px] text-left">
                    <caption className="sr-only">Generation history</caption>
                    <thead className="bg-black/20 text-xs text-slate-400">
                      <tr>
                        <th scope="col" className="px-5 py-3 font-medium">#</th>
                        <SortHeader title="User" sortKey="user" sort={sort} onSort={updateSort} />
                        <SortHeader title="Records" sortKey="records" sort={sort} onSort={updateSort} align="right" />
                        <SortHeader title="Method" sortKey="method" sort={sort} onSort={updateSort} />
                        <SortHeader title="Format" sortKey="format" sort={sort} onSort={updateSort} />
                        <SortHeader title="Generation Time" sortKey="time" sort={sort} onSort={updateSort} align="right" />
                        <SortHeader title="Memory" sortKey="memory" sort={sort} onSort={updateSort} align="right" />
                        <SortHeader title="Date" sortKey="date" sort={sort} onSort={updateSort} />
                        <th scope="col" className="px-5 py-3 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {rows.map((gen, index) => (
                        <GenerationRow
                          key={gen._id}
                          gen={gen}
                          number={start + index + 1}
                          index={index}
                          deleting={pendingId === gen._id}
                          onDelete={() => setDialog(gen)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {sorted.length === 0 && list.length === 0 && (
                <EmptyState icon="activity" title="No generation records found" text="Runs will appear here as users generate mock data." />
              )}

              {sorted.length === 0 && list.length > 0 && (
                <EmptyState
                  icon="search"
                  title="No generation records found"
                  text="Try a different name or email, or clear the filters."
                  action={
                    <button type="button" onClick={clearFilters} className={`${BTN.ghost} mt-5 px-3 py-2 text-xs`}>
                      Clear Filters
                    </button>
                  }
                />
              )}

              {list.length > 0 && (
                <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-3 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                  <p aria-live="polite">{summaryText}</p>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                    {sorted.length > PAGE_SIZES[0] && (
                      <label className="flex items-center gap-2">
                        Rows per page
                        <select
                          value={pageSize}
                          onChange={(e) => updatePageSize(Number(e.target.value))}
                          className="mg-select rounded-md border border-white/10 bg-black/20 py-1 pl-2 text-xs text-slate-200 transition hover:border-white/25 focus:border-red-400/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300/50"
                        >
                          {PAGE_SIZES.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}

                    {pageCount > 1 && (
                      <nav aria-label="Pagination" className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPage(currentPage - 1)}
                          disabled={currentPage <= 1}
                          aria-label="Previous page"
                          className={`${BTN.ghost} h-8 w-8`}
                        >
                          <Icon name="chevronLeft" />
                        </button>
                        <span className="min-w-[5.5rem] text-center tabular-nums text-slate-300">
                          Page {currentPage} of {pageCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPage(currentPage + 1)}
                          disabled={currentPage >= pageCount}
                          aria-label="Next page"
                          className={`${BTN.ghost} h-8 w-8`}
                        >
                          <Icon name="chevronRight" />
                        </button>
                      </nav>
                    )}
                  </div>
                </div>
              )}
            </motion.section>
          </>
        )}
      </main>

      <ConfirmDialog generation={dialog} busy={Boolean(pendingId)} onConfirm={confirmDelete} onClose={closeDialog} />
    </div>
  );
};

export default AdminGenerations;