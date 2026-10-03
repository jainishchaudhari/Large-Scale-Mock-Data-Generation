import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { animate, motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

// Fonts + effects shared with the other pages
const css = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=JetBrains+Mono:wght@400;500&display=swap');
.font-display { font-family: 'Bricolage Grotesque', system-ui, -apple-system, 'Segoe UI', sans-serif; }
.font-code { font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace; }
.mg-spot {
  opacity: 0;
  transition: opacity 0.3s ease;
  background: radial-gradient(360px circle at var(--x, 50%) var(--y, 0%), rgba(252, 211, 77, 0.07), transparent 60%);
}
.mg-card:hover .mg-spot { opacity: 1; }
`;

const ICONS = {
  user: (<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>),
  mail: (<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>),
  calendar: (<><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>),
  logout: (<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>),
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
  database: (<><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></>),
  activity: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
  arrow: (<><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>),
};

const Icon = ({ name, className = "h-4 w-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    {ICONS[name]}
  </svg>
);

const onCardMove = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--x", `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty("--y", `${e.clientY - rect.top}px`);
};

const cardCls =
  "mg-card relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/40 backdrop-blur-xl";

const CardFx = () => (
  <>
    <div className="pointer-events-none absolute -top-px left-1/2 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />
    <div className="mg-spot pointer-events-none absolute inset-0" />
  </>
);

const Reveal = ({ children, reduce, delay = 0, className = "" }) => (
  <motion.div
    className={className}
    initial={reduce ? false : { opacity: 0, y: 18 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "0px 0px -50px 0px" }}
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

// Calmer than the generator pages: grid + two soft glows only (no particles / data streams)
const Shell = ({ reduce, children }) => (
  <div className="font-display relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#080a10] text-white antialiased">
    <style>{css}</style>

    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: "radial-gradient(rgba(148,163,184,0.18) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 80% 55% at 50% 15%, black, transparent)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 55% at 50% 15%, black, transparent)",
        }}
      />
      <motion.div
        className="absolute inset-x-0 top-[-200px] mx-auto h-[420px] w-[720px] rounded-full bg-sky-500/10 blur-[140px]"
        animate={reduce ? undefined : { opacity: [0.55, 1, 0.55], scale: [1, 1.08, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-x-0 bottom-[-220px] mx-auto h-[360px] w-[560px] rounded-full bg-amber-300/[0.06] blur-[140px]"
        animate={reduce ? undefined : { opacity: [1, 0.5, 1], scale: [1.05, 1, 1.05] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>

    <main className="relative z-10 mx-auto max-w-6xl px-6 py-10">{children}</main>
  </div>
);

const SectionTitle = ({ title, text }) => (
  <div className="mb-5">
    <h2 className="text-xl font-semibold">{title}</h2>
    {text && <p className="mt-1 text-sm text-slate-500">{text}</p>}
  </div>
);

const Profile = () => {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch("http://localhost:5000/api/auth/profile", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch profile");
        }

        setProfile(data);
      } catch (error) {
        console.error("Profile Fetch Error:", error);
        setError(error.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // ===========================================
  // Logout
  // ===========================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ===========================================
  // Loading
  // ===========================================

  if (loading) {
    return (
      <Shell reduce={reduce}>
        <div className="space-y-6" aria-busy="true">
          <div className="h-60 rounded-2xl border border-white/10 bg-white/[0.03] motion-safe:animate-pulse" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 rounded-xl border border-white/10 bg-white/[0.03] motion-safe:animate-pulse"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-slate-400">Loading profile...</p>
      </Shell>
    );
  }

  // ===========================================
  // Error
  // ===========================================

  if (error) {
    return (
      <Shell reduce={reduce}>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          role="alert"
          className="rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-8"
        >
          <h2 className="text-lg font-semibold text-red-300">Unable to load profile</h2>
          <p className="mt-2 text-sm text-slate-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-lg bg-amber-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080a10]"
          >
            Try Again
          </button>
        </motion.div>
      </Shell>
    );
  }

  const user = profile?.user;
  const stats = profile?.stats;

  // ===========================================
  // Format Joined Date
  // ===========================================

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  // Derived numbers for the activity section
  const totalGenerations = stats?.totalGenerations || 0;
  const totalRecords = stats?.totalRecords || 0;
  const batchCount = stats?.batchGenerations || 0;
  const streamCount = stats?.streamingGenerations || 0;
  const methodTotal = batchCount + streamCount;
  const batchPct = methodTotal ? Math.round((batchCount / methodTotal) * 100) : 0;
  const streamPct = methodTotal ? 100 - batchPct : 0;
  const avgRecords = totalGenerations ? Math.round(totalRecords / totalGenerations) : 0;

  const STAT_TILES = [
    { label: "Total Generations", value: totalGenerations, hint: "Runs completed", tone: "text-white" },
    { label: "Total Records", value: totalRecords, hint: "Mock records produced", tone: "text-white" },
    { label: "Batch Generations", value: batchCount, hint: "Mini-batch runs", tone: "text-amber-300" },
    { label: "Streaming Generations", value: streamCount, hint: "Stream runs", tone: "text-sky-300" },
  ];

  const DETAILS = [
    { icon: "user", label: "Full Name", value: user?.name || "N/A" },
    { icon: "mail", label: "Email Address", value: user?.email || "N/A" },
    { icon: "calendar", label: "Account Created", value: joinedDate },
  ];

  const ACTIONS = [
    { icon: "zap", title: "Generate Data", text: "Define a schema and create a new dataset.", to: "/generate", primary: true },
    { icon: "database", title: "View Results", text: "Browse your previous generations.", to: "/results" },
    { icon: "activity", title: "Performance", text: "Compare Batch and Streaming benchmarks.", to: "/performance" },
  ];

  // ===========================================
  // Profile UI
  // ===========================================

  return (
    <Shell reduce={reduce}>
      {/* Header */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE }}
        className="mb-8"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/[0.06] px-3 py-1 text-xs font-medium text-amber-200">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
          Account
        </span>

        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">My Profile</h1>

        <p className="mt-3 max-w-2xl text-slate-400">
          View your account information and generation activity.
        </p>
      </motion.div>

      {/* Identity card */}
      <Reveal reduce={reduce} className="mb-6">
        <section onMouseMove={onCardMove} className={cardCls}>
          <CardFx />

          <div className="relative h-28 overflow-hidden border-b border-white/10 bg-gradient-to-r from-amber-300/15 via-white/[0.02] to-sky-300/15">
            <div
              className="absolute inset-0 opacity-60"
              style={{
                backgroundImage: "radial-gradient(rgba(148,163,184,0.25) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
          </div>

          <div className="relative px-6 pb-7 sm:px-8">
            <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-5">
                <motion.div
                  initial={reduce ? false : { scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                  className="rounded-2xl bg-gradient-to-br from-amber-300 to-sky-300 p-px ring-4 ring-[#080a10]"
                >
                  <div className="grid h-24 w-24 place-items-center rounded-[15px] bg-[#0b0e15] text-4xl font-bold text-amber-200">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                </motion.div>

                <div className="pb-1">
                  <h2 className="text-2xl font-semibold tracking-tight">{user?.name || "User"}</h2>
                  <p className="mt-1 text-sm text-slate-400">{user?.email || "N/A"}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-medium text-amber-200">
                  <Icon name="shield" className="h-3.5 w-3.5" />
                  {user?.role === "admin" ? "Administrator" : "MockGen User"}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-300">
                  <Icon name="calendar" className="h-3.5 w-3.5" />
                  Member since {joinedDate}
                </span>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Details + session */}
      <section className="mb-10 grid gap-6 lg:grid-cols-[1fr_320px]">
        <Reveal reduce={reduce} className="h-full">
          <div onMouseMove={onCardMove} className={`${cardCls} h-full p-6`}>
            <CardFx />
            <div className="relative">
              <SectionTitle title="Account Details" text="Information linked to your MockGen account." />
              <div>
                {DETAILS.map((item) => (
                  <div key={item.label} className="flex items-center gap-4 border-b border-white/5 py-4 last:border-b-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400">
                      <Icon name={item.icon} className="h-[18px] w-[18px]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">{item.label}</p>
                      <p className="mt-0.5 truncate text-sm font-medium text-slate-100">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal reduce={reduce} delay={0.08} className="h-full">
          <div onMouseMove={onCardMove} className={`${cardCls} flex h-full flex-col p-6`}>
            <CardFx />
            <div className="relative flex h-full flex-col">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300">
                <Icon name="shield" className="h-5 w-5" />
              </div>

              <h2 className="mt-4 text-lg font-semibold">Session</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Manage your current session and account access.
              </p>

              <div className="mt-auto pt-6">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-400/30 bg-red-400/[0.07] px-4 py-3 text-sm font-semibold text-red-300 transition-colors hover:bg-red-400/15 hover:text-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300/50"
                >
                  <Icon name="logout" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Generation activity */}
      <section className="mb-10">
        <Reveal reduce={reduce}>
          <SectionTitle title="Generation Activity" text="A summary of everything you have generated so far." />
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAT_TILES.map((tile, i) => (
            <Reveal key={tile.label} reduce={reduce} delay={i * 0.06} className="h-full">
              <div className="h-full rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/20">
                <p className="text-sm text-slate-400">{tile.label}</p>
                <p className={`mt-3 font-code text-3xl font-medium tabular-nums tracking-tight ${tile.tone}`}>
                  <CountUp value={tile.value} reduce={reduce} />
                </p>
                <p className="mt-2 text-xs text-slate-500">{tile.hint}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal reduce={reduce} delay={0.1} className="mt-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm text-slate-400">Method split</p>
                <p className="mt-1 text-xs text-slate-500">
                  {methodTotal ? "Share of runs by generation method." : "No generations yet. Your split will appear here."}
                </p>
              </div>

              <div className="sm:text-right">
                <p className="text-xs text-slate-500">Avg. records per generation</p>
                <p className="mt-1 font-code text-lg font-medium tabular-nums text-white">
                  <CountUp value={avgRecords} reduce={reduce} />
                </p>
              </div>
            </div>

            <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={reduce ? false : { width: 0 }}
                whileInView={{ width: `${batchPct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
                className="h-full bg-amber-300"
                style={{ boxShadow: "0 0 10px rgba(252,211,77,0.5)" }}
              />
              <motion.div
                initial={reduce ? false : { width: 0 }}
                whileInView={{ width: `${streamPct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.3 }}
                className="h-full bg-sky-300"
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-300" />
                Batch <span className="font-code text-slate-200">{batchPct}%</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-300" />
                Streaming <span className="font-code text-slate-200">{streamPct}%</span>
              </span>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Quick actions */}
      <section>
        <Reveal reduce={reduce}>
          <SectionTitle title="Quick Actions" text="Continue working with MockGen." />
        </Reveal>

        <div className="grid gap-4 md:grid-cols-3">
          {ACTIONS.map((action, i) => (
            <Reveal key={action.title} reduce={reduce} delay={i * 0.06} className="h-full">
              <motion.button
                type="button"
                onClick={() => navigate(action.to)}
                whileHover={reduce ? undefined : { y: -3 }}
                whileTap={reduce ? undefined : { scale: 0.98 }}
                className={`group flex h-full w-full flex-col rounded-2xl border p-5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60 ${
                  action.primary
                    ? "border-amber-300/30 bg-amber-300/[0.07] hover:bg-amber-300/[0.11]"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg border ${
                      action.primary
                        ? "border-amber-300/30 bg-amber-300 text-slate-950"
                        : "border-white/10 bg-white/[0.03] text-slate-300"
                    }`}
                  >
                    <Icon name={action.icon} className="h-[18px] w-[18px]" />
                  </div>
                  <span className="text-slate-500 transition-all duration-200 group-hover:translate-x-1 group-hover:text-amber-200">
                    <Icon name="arrow" />
                  </span>
                </div>

                <h3 className="mt-4 font-semibold text-white">{action.title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">{action.text}</p>
              </motion.button>
            </Reveal>
          ))}
        </div>
      </section>
    </Shell>
  );
};

export default Profile;