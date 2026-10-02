import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  animate,
  useReducedMotion,
  useMotionValue,
  useMotionTemplate,
} from "framer-motion";

// =========================================================
// FONTS + TINY CSS (display font + code font)
// =========================================================

const css = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=JetBrains+Mono:wght@400;500&display=swap');
.font-display{font-family:'Bricolage Grotesque',system-ui,-apple-system,'Segoe UI',sans-serif}
.font-code{font-family:'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace}
`;

// =========================================================
// DATA
// =========================================================

const names = [
  "Aarav Mehta",
  "Isha Patel",
  "Kabir Shah",
  "Meera Joshi",
  "Dev Trivedi",
  "Anaya Desai",
  "Rohan Modi",
  "Tara Bhatt",
];
const cities = [
  "Ahmedabad",
  "Surat",
  "Vadodara",
  "Rajkot",
  "Gandhinagar",
  "Bhavnagar",
];
const companies = [
  "Nimbus Labs",
  "Kite Systems",
  "Orbit Works",
  "Lumen Retail",
  "Tapas Cloud",
];

const fields = [
  { key: "id", type: "num", get: (i) => 2000 + i },
  { key: "name", type: "str", get: (i) => names[i % names.length] },
  {
    key: "email",
    type: "str",
    get: (i) =>
      names[i % names.length].toLowerCase().replace(" ", ".") + "@mail.com",
  },
  { key: "city", type: "str", get: (i) => cities[(i * 2 + 1) % cities.length] },
  {
    key: "company",
    type: "str",
    get: (i) => companies[(i * 3) % companies.length],
  },
  {
    key: "phone",
    type: "str",
    get: (i) => "+91 98" + String(10000000 + (((i + 3) * 48271) % 89999999)),
  },
  { key: "active", type: "bool", get: (i) => i % 3 !== 0 },
];

const sizes = [
  { label: "1K", value: 1000 },
  { label: "100K", value: 100000 },
  { label: "1M", value: 1000000 },
];

const fakerTypes = [
  "person.fullName",
  "internet.email",
  "location.city",
  "phone.number",
  "company.name",
  "string.uuid",
  "date.recent",
  "number.int",
  "datatype.boolean",
  "finance.amount",
  "lorem.sentence",
  "image.avatar",
];

const bars = [
  { label: "Sequential loop", pct: 100, tone: "from-slate-500 to-slate-400" },
  { label: "Batched inserts", pct: 58, tone: "from-sky-500 to-sky-300" },
  { label: "Streaming", pct: 34, tone: "from-amber-400 to-amber-200" },
];

const valueColor = {
  num: "text-sky-300",
  str: "text-emerald-200",
  bool: "text-amber-300",
};

// =========================================================
// PLAYGROUND (the memorable moment)
// =========================================================

const Playground = ({ reduce }) => {
  const [active, setActive] = useState([
    "id",
    "name",
    "email",
    "city",
    "active",
  ]);
  const [size, setSize] = useState(100000);
  const [row, setRow] = useState(0);
  const [done, setDone] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setRow((r) => r + 1), 2800);
    return () => clearInterval(t);
  }, [reduce]);

  const toggle = (key) =>
    setActive((a) =>
      a.includes(key)
        ? a.length > 1
          ? a.filter((k) => k !== key)
          : a
        : [...a, key],
    );

  const run = () => {
    if (running) return;
    setRunning(true);
    setDone(0);
    animate(0, size, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDone(Math.round(v)),
      onComplete: () => setRunning(false),
    });
  };

  const shown = fields.filter((f) => active.includes(f.key));
  const pct = size ? (done / size) * 100 : 0;

  return (
    <div className="relative mx-auto w-full max-w-5xl">
      <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-amber-200/30 via-white/5 to-sky-300/20 opacity-70 blur-[1px]" />
      <div className="relative grid overflow-hidden rounded-3xl border border-white/10 bg-[#0d1019]/90 shadow-2xl shadow-black/60 backdrop-blur-xl md:grid-cols-[300px_1fr]">
        {/* ---- controls ---- */}
        <div className="border-b border-white/10 p-6 md:border-b-0 md:border-r">
          <p className="text-sm font-medium text-slate-300">Fields</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {fields.map((f) => {
              const on = active.includes(f.key);
              return (
                <button
                  key={f.key}
                  onClick={() => toggle(f.key)}
                  aria-pressed={on}
                  className={`font-code rounded-full border px-3 py-1.5 text-xs transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 ${
                    on
                      ? "border-amber-300/50 bg-amber-300/15 text-amber-100"
                      : "border-white/10 bg-white/[0.02] text-slate-500 hover:border-white/25 hover:text-slate-300"
                  }`}
                >
                  {f.key}
                </button>
              );
            })}
          </div>

          <p className="mt-7 text-sm font-medium text-slate-300">Records</p>
          <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl border border-white/10 bg-black/30 p-1">
            {sizes.map((s) => (
              <button
                key={s.value}
                onClick={() => setSize(s.value)}
                className="relative rounded-lg py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
              >
                {size === s.value && (
                  <motion.span
                    layoutId="size-pill"
                    className="absolute inset-0 rounded-lg bg-white/10"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span
                  className={`relative ${size === s.value ? "text-white" : "text-slate-500"}`}
                >
                  {s.label}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={run}
            disabled={running}
            className="mt-7 w-full rounded-xl bg-amber-300 py-3 font-semibold text-slate-950 shadow-lg shadow-amber-400/20 transition hover:bg-amber-200 disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-100 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1019]"
          >
            {running ? "Generating…" : "Generate preview"}
          </button>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            Simulated in your browser. Real runs happen on the Generate page.
          </p>
        </div>

        {/* ---- output ---- */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-3">
            <span className="font-code text-xs text-slate-500">
              output.json
            </span>
            <span className="flex items-center gap-2 text-xs text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />{" "}
              schema valid
            </span>
          </div>

          <div className="font-code flex-1 px-6 py-6 text-[13px] leading-7">
            <span className="text-slate-500">{"{"}</span>
            <AnimatePresence initial={false}>
              {shown.map((f, idx) => {
                const v = f.get(row);
                const text = f.type === "str" ? `"${v}"` : String(v);
                return (
                  <motion.div
                    key={f.key}
                    layout={!reduce}
                    initial={reduce ? false : { opacity: 0, x: -12, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: "auto" }}
                    exit={{ opacity: 0, x: 12, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden pl-5"
                  >
                    <span className="text-slate-300">"{f.key}"</span>
                    <span className="text-slate-500">: </span>
                    <motion.span
                      key={row}
                      initial={
                        reduce ? false : { opacity: 0, filter: "blur(4px)" }
                      }
                      animate={{ opacity: 1, filter: "blur(0px)" }}
                      transition={{ duration: 0.5, delay: idx * 0.04 }}
                      className={valueColor[f.type]}
                    >
                      {text}
                    </motion.span>
                    {idx < shown.length - 1 && (
                      <span className="text-slate-500">,</span>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <span className="text-slate-500">{"}"}</span>
          </div>

          <div className="border-t border-white/10 px-6 py-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-slate-500">Records generated</p>
                <p className="font-code text-2xl font-medium text-white">
                  {done.toLocaleString()}
                </p>
              </div>
              <p className="font-code text-xs text-slate-500">
                of {size.toLocaleString()}
              </p>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 to-sky-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================
// SPOTLIGHT CARD
// =========================================================

const Card = ({ className = "", children, delay = 0 }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const bg = useMotionTemplate`radial-gradient(320px circle at ${x}px ${y}px, rgba(252,211,77,0.10), transparent 70%)`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - r.left);
        y.set(e.clientY - r.top);
      }}
      className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-8 transition-colors duration-300 hover:border-white/20 ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: bg }}
      />
      <div className="relative h-full">{children}</div>
    </motion.div>
  );
};

// =========================================================
// PAGE
// =========================================================

const Home = () => {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  // cursor spotlight for hero
  const mx = useMotionValue(600);
  const my = useMotionValue(220);
  const spot = useMotionTemplate`radial-gradient(520px circle at ${mx}px ${my}px, rgba(252,211,77,0.08), transparent 65%)`;

  const headline = ["Generate", "large-scale"];
  const headline2 = ["JSON", "mock", "data."];

  const word = (w, i, tone) => (
    <span
      key={w}
      className="mr-[0.25em] inline-block overflow-hidden pb-[0.12em] align-bottom"
    >
      <motion.span
        className={`inline-block ${tone}`}
        initial={reduce ? false : { y: "110%" }}
        animate={{ y: 0 }}
        transition={{
          duration: 0.8,
          delay: 0.1 + i * 0.09,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {w}
      </motion.span>
    </span>
  );

  return (
    <div className="font-display min-h-screen overflow-hidden bg-[#080a10] text-white antialiased">
      <style>{css}</style>

      {/* =====================================================
          HERO
      ===================================================== */}
      <section
        className="relative isolate px-6 pb-28 pt-24 lg:pt-32"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set(e.clientX - r.left);
          my.set(e.clientY - r.top);
        }}
      >
        <motion.div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: spot }}
        />
        <div
          className="pointer-events-none absolute inset-0 -z-20"
          style={{
            backgroundImage:
              "radial-gradient(rgba(148,163,184,0.18) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage:
              "radial-gradient(ellipse 60% 55% at 50% 30%, black, transparent)",
            WebkitMaskImage:
              "radial-gradient(ellipse 60% 55% at 50% 30%, black, transparent)",
          }}
        />
        <motion.div
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-sky-500/10 blur-[150px]"
          animate={reduce ? undefined : { opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="mx-auto max-w-4xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm text-slate-300"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-300" />
            </span>
            Built with the MERN stack and Faker.js
          </motion.p>

          <h1 className="text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            {headline.map((w, i) => word(w, i, "text-white"))}
            <br />
            {headline2.map((w, i) => word(w, i + 2, "text-slate-500"))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-400"
          >
            Design a schema, generate up to a million realistic records, and
            compare how different generation techniques perform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.85 }}
            className="mt-9 flex flex-wrap justify-center gap-4"
          >
            <motion.button
              onClick={() => navigate("/generate")}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-xl bg-white px-7 py-3.5 font-semibold text-slate-950 transition hover:bg-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080a10]"
            >
              Start generating
            </motion.button>
            <motion.button
              onClick={() => navigate("/performance")}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-xl border border-white/15 px-7 py-3.5 font-semibold text-slate-200 transition hover:border-white/30 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080a10]"
            >
              View performance
            </motion.button>
          </motion.div>
        </div>

        <motion.div
          className="mt-20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <Playground reduce={reduce} />
        </motion.div>
      </section>

      {/* =====================================================
          FIELD TYPE MARQUEE
      ===================================================== */}
      <section className="relative border-y border-white/5 py-6">
        <div
          className="overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
          }}
        >
          <motion.div
            className="font-code flex w-max gap-10 text-sm text-slate-500"
            animate={reduce ? undefined : { x: ["0%", "-50%"] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          >
            {[...fakerTypes, ...fakerTypes].map((t, i) => (
              <span key={i} className="whitespace-nowrap">
                faker.{t}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          FEATURES (bento)
      ===================================================== */}
      <section className="px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <motion.h2
            className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7 }}
          >
            Everything you need to generate, manage and analyze mock data.
          </motion.h2>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {/* schemas */}
            <Card className="md:col-span-2">
              <h3 className="text-xl font-semibold">Flexible schemas</h3>
              <p className="mt-3 max-w-md leading-7 text-slate-400">
                Define custom JSON schemas with different field types and
                constraints.
              </p>
              <div className="font-code mt-8 flex flex-wrap gap-2 text-xs">
                {[
                  "string",
                  "number",
                  "boolean",
                  "date",
                  "uuid",
                  "email",
                  "enum",
                  "array",
                  "nested object",
                ].map((t, i) => (
                  <motion.span
                    key={t}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-slate-300"
                  >
                    {t}
                  </motion.span>
                ))}
              </div>
            </Card>

            {/* fast */}
            <Card delay={0.1}>
              <h3 className="text-xl font-semibold">Fast generation</h3>
              <p className="mt-3 leading-7 text-slate-400">
                Thousands or millions of realistic records, efficiently, using
                Faker.js.
              </p>
              <p className="font-code mt-8 text-5xl font-medium tracking-tight text-amber-200">
                1M+
              </p>
              <p className="mt-1 text-sm text-slate-500">
                records in a single run
              </p>
            </Card>

            {/* performance */}
            <Card className="md:col-span-3" delay={0.1}>
              <div className="grid items-center gap-10 md:grid-cols-2">
                <div>
                  <h3 className="text-xl font-semibold">
                    Performance analysis
                  </h3>
                  <p className="mt-3 max-w-md leading-7 text-slate-400">
                    Compare execution time, memory usage and throughput across
                    generation techniques.
                  </p>
                  <button
                    onClick={() => navigate("/performance")}
                    className="mt-6 text-sm font-medium text-amber-200 underline decoration-amber-200/30 underline-offset-4 transition hover:decoration-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                  >
                    Open performance page
                  </button>
                </div>

                <div className="space-y-5">
                  {bars.map((b, i) => (
                    <div key={b.label}>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-slate-300">{b.label}</span>
                        <span className="font-code text-xs text-slate-500">
                          {b.pct}%
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-white/5">
                        <motion.div
                          className={`h-full rounded-full bg-gradient-to-r ${b.tone}`}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${b.pct}%` }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 1.2,
                            delay: 0.3 + i * 0.15,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-slate-600">
                    Relative time, shown for illustration.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA
      ===================================================== */}
      <section className="px-6 pb-28">
        <motion.div
          className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.01] px-8 py-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8 }}
        >
          <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-amber-300/20 blur-[100px]" />
          <h2 className="relative text-3xl font-bold tracking-tight sm:text-4xl">
            Generate your first dataset
          </h2>
          <p className="relative mx-auto mt-4 max-w-lg text-slate-400">
            Pick your fields, choose a size and download the JSON.
          </p>
          <motion.button
            onClick={() => navigate("/generate")}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="relative mt-8 rounded-xl bg-amber-300 px-8 py-3.5 font-semibold text-slate-950 shadow-lg shadow-amber-400/20 transition hover:bg-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-100 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080a10]"
          >
            Start generating
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
