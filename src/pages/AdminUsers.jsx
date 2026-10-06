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
const relativeFmt = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const plural = (n, one, many = `${one}s`) => (n === 1 ? one : many);

const NO_USERS = [];
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

// Same colour roles as the dashboard: red = admin identity + actions, everything else neutral.
const TONES = {
  neutral: { tile: "border-white/10 bg-white/[0.04] text-slate-300", value: "text-white" },
  red: { tile: "border-red-400/20 bg-red-400/[0.08] text-red-300", value: "text-red-300" },
};

const ICONS = {
  users: (<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>),
  user: (<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>),
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
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
  { title: "Total Users", icon: "users", tone: "neutral", hint: "Registered accounts", pick: (c) => c.total },
  { title: "Admins", icon: "shield", tone: "red", hint: "Full admin panel access", pick: (c) => c.admins },
  { title: "Standard Users", icon: "user", tone: "neutral", hint: "Regular accounts", pick: (c) => c.members },
];

const FILTERS = [
  { key: "all", label: "All", count: (c) => c.total },
  { key: "admin", label: "Admins", count: (c) => c.admins },
  { key: "user", label: "Users", count: (c) => c.members },
];

const btn =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300/50 disabled:cursor-not-allowed disabled:opacity-50";
const BTN = {
  ghost: `${btn} border-white/10 text-slate-300 hover:border-white/25 hover:bg-white/[0.05] hover:text-white`,
  danger: `${btn} border-red-400/20 text-red-300 hover:border-red-400/40 hover:bg-red-400/10`,
  primary: `${btn} border-transparent bg-white text-slate-950 hover:bg-slate-200`,
  destructive: `${btn} border-transparent bg-red-500 text-white hover:bg-red-400`,
};

/* ───────────────────────── Helpers ───────────────────────── */

const label = (u) => u.name || u.email || "this user";

const parseDate = (value) => {
  const d = value ? new Date(value) : null;
  return d && !Number.isNaN(d.getTime()) ? d : null;
};

const formatDate = (value) => {
  const d = parseDate(value);
  return d ? dateFmt.format(d) : "—";
};

const formatDateTime = (value) => {
  const d = parseDate(value);
  return d ? dateTimeFmt.format(d) : undefined;
};

// "3 weeks ago", "yesterday", "just now"
const timeAgo = (value) => {
  const d = parseDate(value);
  if (!d) return "";

  const seconds = (d.getTime() - Date.now()) / 1000; // negative = in the past
  const units = [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]];

  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return relativeFmt.format(Math.trunc(seconds / size), unit);
  }
  return "just now";
};

const readCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

// Is this table row the signed-in admin? (They can't demote or delete themselves.)
const isSelf = (me, user) => {
  if (!me) return false;
  const myId = me._id ?? me.id;
  return Boolean((myId && myId === user._id) || (me.email && me.email === user.email));
};

const errorMessage = (err) =>
  err instanceof TypeError ? "Can’t reach the server. Check that the API is running, then try again." : err.message || "Something went wrong.";

// ── Sorting ──
// First click sorts in the "natural" direction, second reverses it, third clears the sort.
const FIRST_DIR = { name: "asc", role: "asc", joined: "desc" };

const nextSort = (sort, key) => {
  if (sort?.key !== key) return { key, dir: FIRST_DIR[key] };
  if (sort.dir === FIRST_DIR[key]) return { key, dir: sort.dir === "asc" ? "desc" : "asc" };
  return null;
};

const sortName = (u) => u.name || u.email || "";
const timeOf = (u) => parseDate(u.createdAt)?.getTime() ?? 0;

const SORTERS = {
  name: (a, b) => sortName(a).localeCompare(sortName(b), undefined, { sensitivity: "base" }),
  role: (a, b) => Number(b.role === "admin") - Number(a.role === "admin"), // admins first
  joined: (a, b) => timeOf(a) - timeOf(b),
};

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

const dialogCopy = ({ type, user }) => {
  const name = label(user);

  if (type === "delete") {
    return {
      title: `Delete ${name}?`,
      body: "This permanently deletes the account and all generation history linked to it. This can’t be undone.",
      confirm: "Delete User",
      busy: "Deleting…",
      icon: "trash",
      tone: "red",
      destructive: true,
    };
  }
  if (user.role === "admin") {
    return {
      title: `Make ${name} a standard user?`,
      body: "They’ll lose access to the admin panel but keep their account and data.",
      confirm: "Make User",
      busy: "Updating…",
      icon: "user",
      tone: "neutral",
      destructive: false,
    };
  }
  return {
    title: `Make ${name} an admin?`,
    body: "They’ll get full access to the admin panel, including user management.",
    confirm: "Make Admin",
    busy: "Updating…",
    icon: "shield",
    tone: "red",
    destructive: false,
  };
};

const useAdminUsers = () => {
  const [state, setState] = useState({ users: null, loading: true, refreshing: false, error: "", authError: false, updatedAt: null });
  const controllerRef = useRef(null);

  const load = useCallback(async (isRefresh = false) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    // No data yet (first load or retry after a failure): show the skeleton, not a blank page
    setState((s) => ({ ...s, loading: !s.users, refreshing: isRefresh && Boolean(s.users), error: "", authError: false }));

    try {
      const data = await adminFetch("/users", { signal: controller.signal });
      if (controller.signal.aborted) return;
      setState({ users: data?.users ?? [], loading: false, refreshing: false, error: "", authError: false, updatedAt: new Date() });
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("Admin Users Error:", err);
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

  // Local list updates after a successful role change / delete (no refetch needed)
  const setUsers = useCallback((update) => setState((s) => ({ ...s, users: update(s.users ?? []) })), []);

  return { ...state, reload: () => load(true), setUsers };
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

const SummaryCell = ({ title, value, icon, tone, hint }) => {
  const t = TONES[tone];
  return (
    <div className="flex items-center gap-4 bg-[#0b0e15] p-5">
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg border ${t.tile}`}>
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm text-slate-300">{title}</p>
        <p className={`font-code text-2xl font-medium tabular-nums tracking-tight ${t.value}`}>
          <CountUp value={value} />
        </p>
        <p className="text-xs text-slate-400">{hint}</p>
      </div>
    </div>
  );
};

const Avatar = ({ name, admin }) => (
  <span
    aria-hidden="true"
    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border text-sm font-semibold ${
      admin ? "border-red-400/30 bg-red-400/10 text-red-300" : "border-white/10 bg-white/[0.05] text-slate-300"
    }`}
  >
    {name?.trim()?.charAt(0)?.toUpperCase() || "?"}
  </span>
);

const RoleBadge = ({ role }) => {
  const admin = role === "admin";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${
        admin ? "border-red-400/30 bg-red-400/10 text-red-300" : "border-white/10 bg-white/[0.04] text-slate-300"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${admin ? "bg-red-400" : "bg-slate-500"}`} />
      {role || "user"}
    </span>
  );
};

const SortIcon = ({ dir }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
    <path d="M8 9l4-4 4 4" className={dir === "asc" ? "opacity-100" : "opacity-30"} />
    <path d="M16 15l-4 4-4-4" className={dir === "desc" ? "opacity-100" : "opacity-30"} />
  </svg>
);

const SortHeader = ({ title, sortKey, sort, onSort }) => {
  const active = sort?.key === sortKey;
  const ariaSort = active ? (sort.dir === "asc" ? "ascending" : "descending") : "none";

  return (
    <th scope="col" aria-sort={ariaSort} className="px-5 py-3 font-medium">
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`-mx-1 inline-flex items-center gap-1.5 rounded px-1 transition hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300/50 ${
          active ? "text-slate-100" : ""
        }`}
      >
        {title}
        <SortIcon dir={active ? sort.dir : null} />
      </button>
    </th>
  );
};

const UserRow = ({ user, index, self, pendingType, onRole, onDelete }) => {
  const isAdmin = user.role === "admin";
  const busy = Boolean(pendingType);
  const name = label(user);
  const ago = timeAgo(user.createdAt);

  return (
    <tr className={`mg-row transition-colors hover:bg-white/[0.03] ${self ? "bg-white/[0.02]" : ""}`} style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}>
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <Avatar name={user.name} admin={isAdmin} />
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-slate-100">
              <span className="max-w-[16rem] truncate">{user.name}</span>
              {self && <span className="rounded bg-white/10 px-1.5 py-0.5 text-[11px] font-medium text-slate-300">You</span>}
            </p>
            <p className="max-w-[18rem] truncate text-xs text-slate-400">{user.email}</p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <RoleBadge role={user.role} />
      </td>

      <td className="whitespace-nowrap px-5 py-4">
        <p className="text-sm text-slate-300" title={formatDateTime(user.createdAt)}>
          {formatDate(user.createdAt)}
        </p>
        {ago && <p className="text-xs text-slate-400">{ago}</p>}
      </td>

      <td className="px-5 py-4">
        <div className="flex justify-end gap-2">
          {self ? (
            <span className="text-xs text-slate-400">Your account</span>
          ) : (
            <>
              <button type="button" onClick={onRole} disabled={busy} className={`${BTN.ghost} px-3 py-2 text-xs`}>
                {pendingType === "role" ? "Updating…" : isAdmin ? "Make User" : "Make Admin"}
                <span className="sr-only"> for {name}</span>
              </button>
              <button type="button" onClick={onDelete} disabled={busy} className={`${BTN.danger} px-3 py-2 text-xs`}>
                <Icon name="trash" className="h-3.5 w-3.5" />
                {pendingType === "delete" ? "Deleting…" : "Delete"}
                <span className="sr-only"> {name}</span>
              </button>
            </>
          )}
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
      <span className="sr-only">Loading users…</span>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-[104px] rounded-xl border border-white/10 bg-white/[0.03] ${pulse}`} style={{ animationDelay: `${i * 0.12}s` }} />
        ))}
      </div>

      <div className={`overflow-hidden rounded-2xl ${SURFACE}`}>
        <div className="divide-y divide-white/5">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`flex items-center gap-4 px-5 py-4 ${pulse}`} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="h-9 w-9 rounded-full bg-white/[0.06]" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-40 rounded bg-white/[0.06]" />
                <div className="h-3 w-56 max-w-full rounded bg-white/[0.04]" />
              </div>
              <div className="h-6 w-16 rounded-full bg-white/[0.06]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Native <dialog>: Escape, focus trap and inert background come for free
const ConfirmDialog = ({ dialog, busy, onConfirm, onClose }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (dialog && !el.open) el.showModal();
    if (!dialog && el.open) el.close();
  }, [dialog]);

  const copy = dialog ? dialogCopy(dialog) : null;

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
      {copy && (
        <div className="p-6">
          <span className={`mb-4 grid h-10 w-10 place-items-center rounded-lg border ${TONES[copy.tone].tile}`}>
            <Icon name={copy.icon} className="h-[18px] w-[18px]" />
          </span>

          <h2 id="confirm-title" className="text-lg font-semibold">
            {copy.title}
          </h2>
          <p id="confirm-body" className="mt-1.5 text-sm text-slate-400">
            {copy.body}
          </p>

          {/* Who this action applies to */}
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <Avatar name={dialog.user.name} admin={dialog.user.role === "admin"} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-100">{dialog.user.name}</p>
              <p className="truncate text-xs text-slate-400">{dialog.user.email}</p>
            </div>
            <RoleBadge role={dialog.user.role} />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={busy} className={`${BTN.ghost} px-4 py-2.5 text-sm`}>
              Cancel
            </button>
            <button type="button" onClick={onConfirm} disabled={busy} className={`${copy.destructive ? BTN.destructive : BTN.primary} px-4 py-2.5 text-sm`}>
              {busy ? copy.busy : copy.confirm}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
};

/* ───────────────────────── Page ───────────────────────── */

const AdminUsers = () => {
  const reduce = useReducedMotion();
  const { users, loading, refreshing, error, authError, updatedAt, reload, setUsers } = useAdminUsers();
  const [me] = useState(readCurrentUser);

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sort, setSort] = useState(null); // { key: "name" | "role" | "joined", dir: "asc" | "desc" } | null
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState(null); // { type: "role" | "delete", user }
  const [pending, setPending] = useState(null); // { id, type }
  const [notice, setNotice] = useState(null); // { id, type: "success" | "error", text }
  const searchRef = useRef(null);

  const list = users ?? NO_USERS;

  // Fade-and-rise entrance (skipped when the user prefers reduced motion)
  const rise = (delay = 0) =>
    reduce ? {} : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: EASE, delay } };

  const counts = useMemo(() => {
    const admins = list.filter((u) => u.role === "admin").length;
    return { total: list.length, admins, members: list.length - admins };
  }, [list]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((u) => {
      if (roleFilter === "admin" && u.role !== "admin") return false;
      if (roleFilter === "user" && u.role === "admin") return false;
      return !q || `${u.name ?? ""} ${u.email ?? ""}`.toLowerCase().includes(q);
    });
  }, [list, query, roleFilter]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const compare = SORTERS[sort.key];
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => dir * compare(a, b));
  }, [filtered, sort]);

  // Pagination (page is clamped, so deleting the last row of a page can't strand you on an empty page)
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  const rows = sorted.slice(start, start + pageSize);

  const summaryText =
    sorted.length === 0
      ? `No matching users · ${numberFmt.format(list.length)} total`
      : `Showing ${numberFmt.format(start + 1)}–${numberFmt.format(start + rows.length)} of ${numberFmt.format(sorted.length)} ${plural(sorted.length, "user")}${
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

  const confirmAction = async () => {
    const { type, user } = dialog;
    const name = label(user);
    setPending({ id: user._id, type });

    try {
      if (type === "delete") {
        await adminFetch(`/users/${encodeURIComponent(user._id)}`, { method: "DELETE" });
        setUsers((prev) => prev.filter((u) => u._id !== user._id));
        showNotice("success", `Deleted ${name}.`);
      } else {
        const role = user.role === "admin" ? "user" : "admin";
        await adminFetch(`/users/${encodeURIComponent(user._id)}/role`, { method: "PATCH", body: { role } });
        setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, role } : u)));
        showNotice("success", `${name} is now ${role === "admin" ? "an admin" : "a standard user"}.`);
      }
    } catch (err) {
      console.error("Admin Users Action Error:", err);
      showNotice("error", errorMessage(err));
    } finally {
      setPending(null);
      setDialog(null);
    }
  };

  // Any change to what's shown sends you back to the first page
  const updateQuery = (value) => {
    setQuery(value);
    setPage(1);
  };
  const updateFilter = (key) => {
    setRoleFilter(key);
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
    setRoleFilter("all");
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
            <span className="mb-3 inline-flex items-center gap-2 rounded-md border border-red-400/30 bg-red-400/10 px-2.5 py-1 text-xs font-medium text-red-300">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              Admin Panel
            </span>
            <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Users
              {users && (
                <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-0.5 font-code text-sm font-medium tabular-nums text-slate-300">
                  {numberFmt.format(counts.total)}
                </span>
              )}
            </h1>
            <p className="mt-1.5 text-sm text-slate-400">View and manage registered MockGen users.</p>
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
              <ErrorBanner what="users" message={error} authError={authError} onRetry={reload} />
            </Collapse>
          )}
        </AnimatePresence>

        {loading && <PageSkeleton />}

        {!loading && users && (
          <>
            {/* Ledger strip: 1px gaps over a tinted background draw the dividers */}
            <motion.div {...rise(0)} className="mb-8 grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-3">
              {SUMMARY.map(({ pick, ...card }) => (
                <SummaryCell key={card.title} {...card} value={pick(counts)} />
              ))}
            </motion.div>

            <motion.section {...rise(0.08)} aria-label="Registered users" className={`overflow-hidden rounded-2xl ${SURFACE}`}>
              <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                <label className="relative block w-full sm:max-w-xs">
                  <span className="sr-only">Search users</span>
                  <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    ref={searchRef}
                    type="search"
                    value={query}
                    onChange={(e) => updateQuery(e.target.value)}
                    placeholder="Search by name or email"
                    className="w-full rounded-lg border border-white/10 bg-black/20 py-2 pl-9 pr-9 text-sm text-white transition placeholder:text-slate-400 focus:border-red-400/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300/50"
                  />
                  {!query && (
                    <kbd aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-white/10 px-1.5 font-code text-[11px] text-slate-400">
                      /
                    </kbd>
                  )}
                </label>

                <div role="group" aria-label="Filter by role" className="inline-flex self-start rounded-lg border border-white/10 bg-black/20 p-1 sm:self-auto">
                  {FILTERS.map((f) => {
                    const active = roleFilter === f.key;
                    return (
                      <button
                        key={f.key}
                        type="button"
                        aria-pressed={active}
                        onClick={() => updateFilter(f.key)}
                        className={`relative rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300/50 ${
                          active ? "text-white" : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="role-filter"
                            className="absolute inset-0 rounded-md bg-white/10"
                            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 36 }}
                          />
                        )}
                        <span className="relative">{f.label}</span>
                        <span className="relative ml-1.5 font-code text-[11px] tabular-nums text-slate-400">{numberFmt.format(f.count(counts))}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {rows.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left">
                    <caption className="sr-only">Registered users</caption>
                    <thead className="bg-black/20 text-xs text-slate-400">
                      <tr>
                        <SortHeader title="User" sortKey="name" sort={sort} onSort={updateSort} />
                        <SortHeader title="Role" sortKey="role" sort={sort} onSort={updateSort} />
                        <SortHeader title="Joined" sortKey="joined" sort={sort} onSort={updateSort} />
                        <th scope="col" className="px-5 py-3 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {rows.map((user, index) => (
                        <UserRow
                          key={user._id}
                          user={user}
                          index={index}
                          self={isSelf(me, user)}
                          pendingType={pending?.id === user._id ? pending.type : null}
                          onRole={() => setDialog({ type: "role", user })}
                          onDelete={() => setDialog({ type: "delete", user })}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {sorted.length === 0 && list.length === 0 && (
                <EmptyState icon="users" title="No users yet" text="Registered accounts will appear here." />
              )}

              {sorted.length === 0 && list.length > 0 && (
                <EmptyState
                  icon="search"
                  title="No matching users"
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

      <ConfirmDialog dialog={dialog} busy={Boolean(pending)} onConfirm={confirmAction} onClose={closeDialog} />
    </div>
  );
};

export default AdminUsers;