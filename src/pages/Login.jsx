import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AnimatePresence,
  animate,
  motion,
  useReducedMotion,
} from "framer-motion";

const API_URL = "http://localhost:5000/api/auth/login";
const EASE = [0.22, 1, 0.36, 1];

// =========================================================
// FONTS + CSS ANIMATIONS
// =========================================================

const css = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=JetBrains+Mono:wght@400;500&display=swap');

.font-display {
  font-family: 'Bricolage Grotesque', system-ui, -apple-system, 'Segoe UI', sans-serif;
}
.font-code {
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
}

@keyframes mgCaret {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
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

.mg-caret { animation: mgCaret 1s steps(1) infinite; }
.mg-drift {
  opacity: 0;
  animation: mgDrift var(--dur, 10s) ease-in-out var(--delay, 0s) infinite;
}
.mg-stream-up { animation: mgStreamUp 50s linear infinite; }
.mg-stream-down { animation: mgStreamDown 56s linear infinite; }
.mg-shimmer { animation: mgShimmer 1.8s ease-in-out infinite; }

/* Soft spotlight that follows the cursor inside the form card */
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

@media (prefers-reduced-motion: reduce) {
  .mg-caret, .mg-shimmer { animation: none; }
}
`;

// =========================================================
// STATIC DATA
// =========================================================

const SAMPLES = [
  {
    file: "users.json",
    data: {
      id: 1042,
      name: "Aarav Patel",
      email: "aarav.patel@example.com",
      city: "Surat",
      active: true,
    },
  },
  {
    file: "orders.json",
    data: {
      orderId: "ORD-88213",
      customer: "Meera Shah",
      total: 2499.5,
      status: "shipped",
      paid: true,
    },
  },
  {
    file: "products.json",
    data: {
      sku: "MG-2041",
      title: "Wireless Keyboard",
      price: 1899,
      inStock: true,
      rating: 4.6,
    },
  },
];

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

const CHIPS = ["Realistic data", "Large scale", "Performance"];

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

// =========================================================
// MOTION VARIANTS (page load cascade)
// =========================================================

const pageV = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const itemV = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

const cardV = {
  hidden: { opacity: 0, y: 24, scale: 0.985 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: EASE,
      staggerChildren: 0.07,
      delayChildren: 0.2,
    },
  },
};

// =========================================================
// ICONS
// =========================================================

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

const MailIcon = () => (
  <Svg>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </Svg>
);

const LockIcon = () => (
  <Svg>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Svg>
);

const EyeIcon = () => (
  <Svg>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);

const EyeOffIcon = () => (
  <Svg>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </Svg>
);

const ChevronLeftIcon = () => (
  <Svg className="h-3.5 w-3.5" strokeWidth={2}>
    <polyline points="15 18 9 12 15 6" />
  </Svg>
);

// =========================================================
// FORM PIECES
// =========================================================

const Field = ({ id, label, icon, right, footer, ...props }) => (
  <motion.div variants={itemV}>
    <label
      htmlFor={id}
      className="mb-1.5 block text-sm font-medium text-slate-300"
    >
      {label}
    </label>

    <div className="group relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 transition-colors duration-200 group-focus-within:text-amber-300">
        {icon}
      </span>

      <input
        id={id}
        required
        {...props}
        className={`w-full rounded-lg border border-white/10 bg-white/[0.03] py-2.5 pl-10 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-white/20 focus:border-amber-300/50 focus:bg-white/[0.05] focus:ring-2 focus:ring-amber-300/10 ${
          right ? "pr-11" : "pr-3.5"
        }`}
      />

      {right && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">{right}</div>
      )}
    </div>

    {footer}
  </motion.div>
);

// =========================================================
// JSON SYNTAX HIGHLIGHT (for the typing panel)
// =========================================================

const VALUE_TOKEN =
  /(\s*"(?:[^"\\]|\\.)*"?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?)/;
const KEY_LINE = /^(\s*)("(?:[^"\\]|\\.)*"?)(\s*:\s?)?(.*)$/;

const Caret = () => (
  <span className="mg-caret ml-0.5 inline-block h-4 w-[7px] translate-y-[3px] bg-amber-300" />
);

const renderValue = (value) =>
  value.split(VALUE_TOKEN).map((part, i) => {
    if (!part) return null;
    const t = part.trim();
    let cls = "text-slate-500";
    if (t.startsWith('"')) cls = "text-emerald-300";
    else if (/^(true|false|null)$/.test(t)) cls = "text-sky-300";
    else if (/^-?\d/.test(t)) cls = "text-amber-300";
    return (
      <span key={i} className={cls}>
        {part}
      </span>
    );
  });

const renderLine = (line, i, isLast) => {
  const m = line.match(KEY_LINE);

  if (!m) {
    return (
      <div key={i} className="text-slate-500">
        {line || "\u00A0"}
        {isLast && <Caret />}
      </div>
    );
  }

  const [, indent, key, colon = "", rest = ""] = m;

  return (
    <div key={i}>
      <span>{indent}</span>
      <span className="text-sky-300">{key}</span>
      <span className="text-slate-500">{colon}</span>
      {renderValue(rest)}
      {isLast && <Caret />}
    </div>
  );
};

// =========================================================
// LIVE GENERATOR PANEL (the one "hero" animation)
// =========================================================

const useRecordCounter = (reduce) => {
  const [count, setCount] = useState(reduce ? 1000000 : 0);

  useEffect(() => {
    if (reduce) {
      setCount(1000000);
      return undefined;
    }

    const controls = animate(0, 1000000, {
      duration: 2.6,
      delay: 0.9,
      ease: "easeOut",
      onUpdate: (v) => setCount(Math.round(v)),
      onComplete: () => setCount(1000000),
    });

    return () => controls.stop();
  }, [reduce]);

  return count;
};

const GeneratorPanel = ({ reduce }) => {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState(0);
  const records = useRecordCounter(reduce);

  const sample = SAMPLES[index];
  const text = useMemo(() => JSON.stringify(sample.data, null, 2), [sample]);

  useEffect(() => {
    if (reduce) {
      setTyped(text.length);
      return undefined;
    }

    setTyped(0);
    let i = 0;
    let hold;

    const timer = setInterval(() => {
      i += 1;
      // show indentation / new lines together with the previous character
      while (i < text.length && /\s/.test(text[i])) i += 1;
      setTyped(i);

      if (i >= text.length) {
        clearInterval(timer);
        hold = setTimeout(() => {
          setTyped(0);
          setIndex((p) => (p + 1) % SAMPLES.length);
        }, 2400);
      }
    }, 28);

    return () => {
      clearInterval(timer);
      clearTimeout(hold);
    };
  }, [text, reduce]);

  const lines = text.slice(0, typed).split("\n");
  const progress = text.length ? typed / text.length : 0;

  return (
    <div className="relative isolate">
      {/* glow + depth layers */}
      <div className="absolute -inset-10 -z-10 rounded-full bg-sky-400/10 blur-3xl" />
      <div className="absolute -bottom-3 left-6 right-6 -z-10 h-full rounded-2xl border border-white/5 bg-white/[0.02]" />

      <motion.div
        animate={reduce ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e15]/80 shadow-2xl shadow-black/50 backdrop-blur-xl">
          {/* window header */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
            </div>

            <div className="relative h-4 w-32 font-code text-[11px] text-slate-400">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={sample.file}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 text-center"
                >
                  {sample.file}
                </motion.span>
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Live
            </div>
          </div>

          {/* typed JSON */}
          <div className="h-[13rem] overflow-hidden whitespace-pre px-5 py-4 font-code text-[12.5px] leading-6">
            {lines.map((line, i) => renderLine(line, i, i === lines.length - 1))}
          </div>

          {/* footer: counter + progress */}
          <div className="border-t border-white/10 px-5 py-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs text-slate-500">Records generated</p>
                <p className="mt-0.5 font-code text-2xl font-medium tabular-nums text-white">
                  {records.toLocaleString("en-US")}
                </p>
              </div>
              <p className="pb-1 text-xs text-slate-500">
                Generating{" "}
                <span className="font-code text-slate-300">{sample.file}</span>
              </p>
            </div>

            <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="relative h-full overflow-hidden rounded-full bg-amber-300 transition-[width] duration-100 ease-linear"
                style={{
                  width: `${progress * 100}%`,
                  boxShadow: "0 0 10px rgba(252,211,77,0.6)",
                }}
              >
                {!reduce && (
                  <span className="mg-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* feature chips */}
      <div className="mt-8 flex flex-wrap gap-2">
        {CHIPS.map((chip, i) => (
          <motion.span
            key={chip}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 + i * 0.12, ease: EASE }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-400"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
            {chip}
          </motion.span>
        ))}
      </div>
    </div>
  );
};

// =========================================================
// BACKGROUND DECOR
// =========================================================

const DataStream = ({ side }) => {
  const left = side === "left";
  const rows = useMemo(
    () => Array.from({ length: 8 }, () => STREAM_ROWS).flat(),
    []
  );
  const fade =
    "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute top-0 hidden h-full w-52 overflow-hidden xl:block ${
        left ? "left-0" : "right-0"
      }`}
      style={{ maskImage: fade, WebkitMaskImage: fade }}
    >
      <div
        className={`${
          left ? "mg-stream-down text-left" : "mg-stream-up text-right"
        } space-y-3 px-5 font-code text-[10px] text-slate-600`}
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

// =========================================================
// LOGIN PAGE
// =========================================================

const Login = () => {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(0);

  const redirectTimer = useRef();
  useEffect(() => () => clearTimeout(redirectTimer.current), []);

  const update = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const fail = (message) => {
    setError(message);
    setShake((n) => n + 1);
  };

  const onCardMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - rect.top}px`);
  };

  // -------------------------------------------------------
  // LOGIN
  // -------------------------------------------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        fail(result.message || "Login failed. Please try again.");
        return;
      }

      // Save JWT token + user information
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      setDone(true);

      // Role based redirect: admin -> Admin Panel, user -> Home
      const target = result.user.role === "admin" ? "/admin" : "/";
      redirectTimer.current = setTimeout(() => navigate(target), 900);
    } catch (err) {
      console.error("Login error:", err);
      fail("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-display relative flex min-h-screen flex-col overflow-hidden bg-[#080a10] text-white antialiased">
      <style>{css}</style>

      {/* ---------- Background ---------- */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(rgba(148,163,184,0.18) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage:
              "radial-gradient(ellipse 70% 70% at 50% 45%, black, transparent)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 70% at 50% 45%, black, transparent)",
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

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(8,10,16,0.15)_55%,rgba(8,10,16,0.75)_100%)]" />
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

      {/* ---------- Top bar ---------- */}
      <motion.header
        initial={reduce ? false : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 pt-6 lg:px-12"
      >
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-300 font-code text-sm font-semibold text-slate-950">
            {"{}"}
          </span>
          <span className="text-xl font-bold tracking-tight">
            Mock<span className="text-amber-300">Gen</span>
          </span>
        </Link>

        <Link
          to="/"
          className="group inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-200"
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-0.5">
            <ChevronLeftIcon />
          </span>
          Back to home
        </Link>
      </motion.header>

      {/* ---------- Main ---------- */}
      <main className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 items-center gap-12 px-6 py-10 lg:grid-cols-2 lg:gap-20 lg:px-12">
        {/* ===== LEFT: form ===== */}
        <motion.div
          variants={pageV}
          initial={reduce ? "show" : "hidden"}
          animate="show"
          className="w-full max-w-md justify-self-center lg:justify-self-end"
        >
          <motion.div variants={itemV}>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Welcome back
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
              Log in to your MockGen account.
            </p>
          </motion.div>

          <motion.div
            variants={cardV}
            onMouseMove={onCardMove}
            className="mg-card relative mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8"
          >
            <div className="pointer-events-none absolute -top-px left-1/2 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />
            <div className="mg-spot pointer-events-none absolute inset-0" />

            <form onSubmit={handleLogin} className="relative space-y-4">
              <Field
                id="email"
                label="Email"
                icon={<MailIcon />}
                type="email"
                value={form.email}
                onChange={update("email")}
                placeholder="you@example.com"
                autoComplete="email"
              />

              <Field
                id="password"
                label="Password"
                icon={<LockIcon />}
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={update("password")}
                placeholder="Enter your password"
                autoComplete="current-password"
                right={
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                    aria-pressed={showPw}
                    className="grid h-7 w-7 place-items-center rounded-md text-slate-500 transition hover:bg-white/5 hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60"
                  >
                    {showPw ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                }
              />

              {/* Error */}
              {error && (
                <motion.p
                  key={shake}
                  role="alert"
                  initial={reduce ? false : { opacity: 0, y: -6 }}
                  animate={
                    reduce
                      ? { opacity: 1 }
                      : { opacity: 1, y: 0, x: [0, -6, 6, -4, 4, 0] }
                  }
                  transition={{ duration: 0.4 }}
                  className="rounded-lg border border-red-400/20 bg-red-400/[0.06] px-3.5 py-2.5 text-sm text-red-300"
                >
                  {error}
                </motion.p>
              )}

              {/* Submit */}
              <motion.div variants={itemV}>
                <motion.button
                  type="submit"
                  disabled={loading || done}
                  whileHover={reduce || loading || done ? undefined : { y: -1 }}
                  whileTap={reduce || loading || done ? undefined : { scale: 0.98 }}
                  className={`group relative mt-1 w-full overflow-hidden rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-400/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080a10] disabled:cursor-not-allowed ${
                    done
                      ? "bg-emerald-300 disabled:opacity-100"
                      : "bg-amber-300 hover:bg-amber-200 disabled:opacity-70"
                  }`}
                >
                  {/* shine sweep */}
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={done ? "done" : loading ? "loading" : "idle"}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                      className="relative flex items-center justify-center gap-2"
                    >
                      {done ? (
                        <>
                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <motion.path
                              d="M5 12.5l4.5 4.5L19 7.5"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 0.4, ease: "easeOut" }}
                            />
                          </svg>
                          Logged in
                        </>
                      ) : loading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                          Logging in…
                        </>
                      ) : (
                        "Log in"
                      )}
                    </motion.span>
                  </AnimatePresence>
                </motion.button>
              </motion.div>
            </form>

            <motion.p
              variants={itemV}
              className="relative mt-6 border-t border-white/10 pt-5 text-center text-sm text-slate-500"
            >
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-amber-200 underline decoration-amber-200/30 underline-offset-4 transition hover:text-amber-100 hover:decoration-amber-200"
              >
                Create account
              </Link>
            </motion.p>
          </motion.div>
        </motion.div>

        {/* ===== RIGHT: live generator ===== */}
        <motion.aside
          aria-hidden="true"
          initial={reduce ? false : { opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
          className="hidden w-full max-w-lg justify-self-start lg:block"
        >
          <GeneratorPanel reduce={reduce} />
        </motion.aside>
      </main>
    </div>
  );
};

export default Login;