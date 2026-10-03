import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { animate, motion, useReducedMotion } from "framer-motion";

/* ───────────────────────── Config ───────────────────────── */

// Vite: put VITE_API_URL in .env. Falls back to the local dev server.
const API_BASE = import.meta.env?.VITE_API_URL ?? "http://localhost:5000";
const LOGIN_ROUTE = "/login";

const EASE = [0.22, 1, 0.36, 1];
const RING_R = 52;
const RING_C = 2 * Math.PI * RING_R;
const RING_GAP = 2; // visual gap between donut segments

const numberFmt = new Intl.NumberFormat();
const timeFmt = new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
const plural = (n, one, many = `${one}s`) => (n === 1 ? one : many);

const SURFACE = "border border-white/10 bg-[#0b0e15]";
const DOT_MASK = "radial-gradient(ellipse 80% 55% at 50% 10%, black, transparent)";

// Fonts + hover spotlight shared with the rest of MockGen (can live in index.css instead)
const css = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=JetBrains+Mono:wght@400;500&display=swap');
.font-display { font-family: 'Bricolage Grotesque', system-ui, -apple-system, 'Segoe UI', sans-serif; }
.font-code { font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace; }
.mg-spot {
  opacity: 0;
  transition: opacity 0.3s ease;
  background: radial-gradient(360px circle at var(--x, 50%) var(--y, 0%), rgba(248, 113, 113, 0.08), transparent 60%);
}
.mg-card:hover .mg-spot { opacity: 1; }
@media (hover: none) { .mg-spot { display: none; } }
`;

// Every colour has one job: red = admin identity + actions, amber = batch, sky = streaming. Rest is neutral.
const TONES = {
  neutral: { tile: "border-white/10 bg-white/[0.04] text-slate-300", value: "text-white" },
  amber: { tile: "border-amber-300/20 bg-amber-300/[0.08] text-amber-300", value: "text-amber-300" },
  sky: { tile: "border-sky-300/20 bg-sky-300/[0.08] text-sky-300", value: "text-sky-300" },
};

const ICONS = {
  users: (<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>),
  layers: (<><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></>),
  database: (<><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></>),
  box: (<><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></>),
  activity: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
  refresh: (<><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></>),
  arrow: (<><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>),
  alert: (<><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>),
};

const STAT_CARDS = [
  { title: "Total Users", icon: "users", tone: "neutral", hint: "Registered accounts", pick: (m) => m.totalUsers },
  { title: "Total Generations", icon: "layers", tone: "neutral", hint: "All-time runs", pick: (m) => m.totalGenerations },
  { title: "Total Records", icon: "database", tone: "neutral", hint: "Mock records produced", pick: (m) => m.totalRecords },
  { title: "Batch Generations", icon: "box", tone: "amber", hint: "Mini-batch runs", pick: (m) => m.batchCount },
  { title: "Streaming Generations", icon: "activity", tone: "sky", hint: "Stream runs", pick: (m) => m.streamCount },
];

const MODULES = [
  {
    title: "User Management",
    text: "View and monitor registered MockGen users.",
    icon: "users",
    to: "/admin/users",
    cta: "Manage Users",
    meta: (m) => `${numberFmt.format(m.totalUsers)} registered ${plural(m.totalUsers, "user")}`,
  },
  {
    title: "Generation Monitoring",
    text: "Monitor generation activity across all users.",
    icon: "layers",
    to: "/admin/generations",
    cta: "View Generations",
    meta: (m) =>
      `${numberFmt.format(m.totalRecords)} ${plural(m.totalRecords, "record")} across ${numberFmt.format(m.totalGenerations)} ${plural(m.totalGenerations, "generation")}`,
  },
];

/* ───────────────────────── Data ───────────────────────── */

const readAdminUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

// Pure function: raw API stats -> everything the UI displays
const deriveMetrics = (stats) => {
  const totalUsers = stats?.totalUsers ?? 0;
  const totalGenerations = stats?.totalGenerations ?? 0;
  const totalRecords = stats?.totalRecords ?? 0;
  const batchCount = stats?.batchGenerations ?? 0;
  const streamCount = stats?.streamingGenerations ?? 0;

  const methodTotal = batchCount + streamCount;
  const batchPct = methodTotal ? Math.round((batchCount / methodTotal) * 100) : 0;
  const streamPct = methodTotal ? 100 - batchPct : 0;

  const methods = [
    { name: "Batch", count: batchCount, pct: batchPct, stroke: "#fcd34d", dot: "bg-amber-300", tone: "text-amber-200" },
    { name: "Streaming", count: streamCount, pct: streamPct, stroke: "#7dd3fc", dot: "bg-sky-300", tone: "text-sky-200" },
  ];

  // Donut geometry: cumulative offsets, with a small gap only when both segments exist
  const gap = methods.filter((s) => s.count > 0).length > 1 ? RING_GAP : 0;
  let offset = 0;
  const segments = methods.map((s) => {
    const full = methodTotal ? (s.count / methodTotal) * RING_C : 0;
    const segment = { ...s, len: Math.max(full - gap, 0), offset };
    offset += full;
    return segment;
  });

  return {
    totalUsers,
    totalGenerations,
    totalRecords,
    batchCount,
    streamCount,
    methodTotal,
    segments,
    avgRecords: totalGenerations ? Math.round(totalRecords / totalGenerations) : 0,
    genPerUser: totalUsers ? (totalGenerations / totalUsers).toFixed(1) : "0.0",
    recordsPerUser: totalUsers ? Math.round(totalRecords / totalUsers) : 0,
    dominant: !methodTotal ? "None yet" : batchCount === streamCount ? "Balanced" : batchCount > streamCount ? "Batch" : "Streaming",
  };
};

const useAdminStats = () => {
  const [state, setState] = useState({ stats: null, loading: true, refreshing: false, error: "", authError: false, updatedAt: null });
  const controllerRef = useRef(null);

  const load = useCallback(async (isRefresh = false) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    // With no data yet (first load, or retry after a failure) show the skeleton, not a blank page
    setState((s) => ({ ...s, loading: !s.stats, refreshing: isRefresh && Boolean(s.stats), error: "", authError: false }));

    try {
      const res = await fetch(`${API_BASE}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (controller.signal.aborted) return;

      if (!res.ok) {
        const err = new Error(data.message || "Failed to fetch admin statistics");
        err.status = res.status;
        throw err;
      }
      if (!data.stats) throw new Error("The server returned an unexpected response.");

      setState({ stats: data.stats, loading: false, refreshing: false, error: "", authError: false, updatedAt: new Date() });
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("Admin Dashboard Error:", err);
      setState((s) => ({
        ...s,
        loading: false,
        refreshing: false,
        error: err instanceof TypeError ? "Can’t reach the server. Check that the API is running, then try again." : err.message,
        authError: err.status === 401 || err.status === 403,
      }));
    }
  }, []);

  useEffect(() => {
    load();
    return () => controllerRef.current?.abort();
  }, [load]);

  return { ...state, reload: () => load(true) };
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

const SectionTitle = ({ title, text, aside }) => (
  <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
    <div>
      <h2 className="text-lg font-semibold">{title}</h2>
      {text && <p className="mt-0.5 text-sm text-slate-400">{text}</p>}
    </div>
    {aside}
  </div>
);

const Backdrop = () => (
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
    <div className="absolute -left-40 top-[-160px] h-[420px] w-[620px] rounded-full bg-red-500/[0.09] blur-[140px]" />
  </div>
);

/* ───────────────────────── Sections ───────────────────────── */

const StatCell = ({ title, value, icon, tone, hint }) => {
  const t = TONES[tone];
  return (
    <div className="bg-[#0b0e15] p-5">
      <span className={`mb-5 grid h-10 w-10 place-items-center rounded-lg border ${t.tile}`}>
        <Icon name={icon} className="h-[18px] w-[18px]" />
      </span>
      <p className="text-sm text-slate-300">{title}</p>
      <p className={`mt-1.5 font-code text-3xl font-medium tabular-nums tracking-tight ${t.value}`}>
        <CountUp value={value} />
      </p>
      <p className="mt-2 text-xs text-slate-400">{hint}</p>
    </div>
  );
};

const GenerationMix = ({ metrics }) => {
  const reduce = useReducedMotion();
  const { segments, methodTotal } = metrics;
  const label = `Generation mix, ${numberFmt.format(methodTotal)} total: ${segments.map((s) => `${s.name} ${s.pct}%`).join(", ")}`;

  return (
    <section className={`h-full rounded-2xl p-6 ${SURFACE}`}>
      <SectionTitle title="Generation Mix" text="Share of runs by generation method." />

      <div className="flex flex-col items-center gap-8 sm:flex-row">
        <div role="img" aria-label={label} className="relative h-40 w-40 shrink-0">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
            <circle cx="60" cy="60" r={RING_R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
            {methodTotal > 0 &&
              segments.map((s, i) => (
                <motion.circle
                  key={s.name}
                  cx="60"
                  cy="60"
                  r={RING_R}
                  fill="none"
                  stroke={s.stroke}
                  strokeWidth="10"
                  strokeDashoffset={-s.offset}
                  initial={reduce ? false : { strokeDasharray: `0 ${RING_C}` }}
                  animate={{ strokeDasharray: `${s.len} ${RING_C - s.len}` }}
                  transition={{ duration: 1, ease: EASE, delay: 0.3 + i * 0.2 }}
                />
              ))}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="font-code text-2xl font-medium tabular-nums">
              <CountUp value={methodTotal} />
            </p>
            <p className="text-xs text-slate-400">generations</p>
          </div>
        </div>

        <div className="w-full space-y-3">
          {segments.map((s) => (
            <div key={s.name} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-4 py-3">
              <span className="flex items-center gap-3 text-sm text-slate-300">
                <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
                {s.name}
              </span>
              <span className="text-right">
                <span className={`font-code text-sm font-medium ${s.tone}`}>{s.pct}%</span>
                <span className="ml-3 text-xs text-slate-400">
                  <span className="font-code">{numberFmt.format(s.count)}</span> {plural(s.count, "run")}
                </span>
              </span>
            </div>
          ))}
          {!methodTotal && <p className="text-sm text-slate-400">No generations yet. Runs appear here once users start generating data.</p>}
        </div>
      </div>
    </section>
  );
};

const PlatformInsights = ({ metrics }) => {
  const rows = [
    { label: "Avg. records per generation", hint: "Total records ÷ generations", node: <CountUp value={metrics.avgRecords} /> },
    { label: "Generations per user", hint: "Total generations ÷ users", node: metrics.genPerUser },
    { label: "Records per user", hint: "Total records ÷ users", node: <CountUp value={metrics.recordsPerUser} /> },
    { label: "Most used method", hint: "By number of runs", node: metrics.dominant },
  ];

  return (
    <section className={`h-full rounded-2xl p-6 ${SURFACE}`}>
      <SectionTitle title="Platform Insights" text="Calculated from the statistics above." />

      <dl>
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-4 border-b border-white/5 py-4 last:border-b-0">
            <dt className="text-sm font-medium text-slate-100">
              {r.label}
              <span className="mt-0.5 block text-xs font-normal text-slate-400">{r.hint}</span>
            </dt>
            <dd className="font-code text-xl font-medium tabular-nums text-white">{r.node}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

// The only hoverable cards: they are links, so they get the spotlight
const ModuleLink = ({ title, text, icon, to, cta, meta }) => {
  const onMove = (e) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - top}px`);
  };

  return (
    <Link
      to={to}
      onMouseMove={onMove}
      className={`mg-card group relative flex h-full flex-col overflow-hidden rounded-xl p-6 transition-colors hover:border-red-400/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300/50 ${SURFACE}`}
    >
      <span aria-hidden="true" className="mg-spot pointer-events-none absolute inset-0" />

      <div className="relative flex h-full flex-col">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-red-400/20 bg-red-400/[0.08] text-red-300">
          <Icon name={icon} className="h-5 w-5" />
        </span>

        <h3 className="mt-5 text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-slate-400">{text}</p>

        <div className="mt-auto pt-6">
          <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4">
            <span className="text-xs text-slate-400">{meta}</span>
            <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-red-300 transition-colors group-hover:text-red-200">
              {cta}
              <Icon name="arrow" className="h-4 w-4 motion-safe:transition-transform motion-safe:group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const DashboardSkeleton = () => {
  const block = "rounded-2xl border border-white/10 bg-white/[0.03] motion-safe:animate-pulse";
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-36 ${block}`} style={{ animationDelay: `${i * 0.12}s` }} />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className={`h-72 ${block}`} />
        <div className={`h-72 ${block}`} />
      </div>
      <p className="text-center text-sm text-slate-400">Loading admin statistics…</p>
    </div>
  );
};

const ErrorBanner = ({ message, authError, onRetry }) => {
  const action =
    "shrink-0 rounded-lg border border-red-400/30 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-400/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300/50";

  return (
    <div role="alert" className="mb-8 flex flex-col justify-between gap-4 rounded-xl border border-red-400/25 bg-red-400/[0.07] p-5 sm:flex-row sm:items-center">
      <div className="flex items-start gap-3">
        <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
        <div>
          <p className="text-sm font-medium text-red-200">{authError ? "You can’t view these statistics" : "Couldn’t load admin statistics"}</p>
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

/* ───────────────────────── Page ───────────────────────── */

const AdminDashboard = () => {
  const { stats, loading, refreshing, error, authError, updatedAt, reload } = useAdminStats();
  const [adminUser] = useState(readAdminUser);
  const metrics = useMemo(() => deriveMetrics(stats), [stats]);

  const adminName = adminUser?.name || "Administrator";

  return (
    <div className="font-display relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#080a10] text-white antialiased">
      <style>{css}</style>
      <Backdrop />

      <header className="relative z-10 border-b border-red-400/15 bg-[#0b0e15]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-6 py-6 lg:flex-row lg:items-center">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 rounded-md border border-red-400/30 bg-red-400/10 px-2.5 py-1 text-xs font-medium text-red-300">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              Admin Panel
            </span>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Admin Dashboard</h1>
            <p className="mt-1.5 text-sm text-slate-400">Monitor users, generations and system activity.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] py-2 pl-2 pr-4">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-red-300 to-amber-300 text-sm font-bold text-slate-950">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium leading-tight">{adminName}</p>
                <p className="text-xs leading-tight text-slate-400">Signed in as admin</p>
              </div>
            </div>

            <button
              type="button"
              onClick={reload}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-red-400/40 hover:text-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className={refreshing ? "motion-safe:animate-spin" : ""}>
                <Icon name="refresh" />
              </span>
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-8">
        {loading && <DashboardSkeleton />}
        {error && <ErrorBanner message={error} authError={authError} onRetry={reload} />}

        {!loading && stats && (
          <>
            <section className="mb-10">
              <SectionTitle
                title="System Overview"
                aside={updatedAt && <p className="text-xs text-slate-400">Updated {timeFmt.format(updatedAt)}</p>}
              />
              {/* One ledger strip: 1px gaps over a tinted background draw the dividers at every breakpoint */}
              <div className="grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-5 sm:[&>:last-child]:col-span-2 lg:[&>:last-child]:col-span-1">
                {STAT_CARDS.map(({ pick, ...card }) => (
                  <StatCell key={card.title} {...card} value={pick(metrics)} />
                ))}
              </div>
            </section>

            <div className="mb-10 grid gap-5 lg:grid-cols-2">
              <GenerationMix metrics={metrics} />
              <PlatformInsights metrics={metrics} />
            </div>

            <section>
              <SectionTitle title="Management" />
              <div className="grid gap-4 md:grid-cols-2">
                {MODULES.map(({ meta, ...mod }) => (
                  <ModuleLink key={mod.title} {...mod} meta={meta(metrics)} />
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;