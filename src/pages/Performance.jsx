import { motion, useReducedMotion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const EASE = [0.22, 1, 0.36, 1];
const AMBER = "#fcd34d"; // Batch
const SKY = "#7dd3fc"; // Streaming

// ======================================================
// Fonts + CSS animations (same system as the other pages)
// ======================================================

const css = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=JetBrains+Mono:wght@400;500&display=swap');
.font-display { font-family: 'Bricolage Grotesque', system-ui, -apple-system, 'Segoe UI', sans-serif; }
.font-code { font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace; }
@keyframes mgDrift {
  0% { transform: translate3d(0, 30px, 0); opacity: 0; }
  20% { opacity: 0.9; }
  80% { opacity: 0.5; }
  100% { transform: translate3d(14px, -170px, 0); opacity: 0; }
}
@keyframes mgStreamUp { from { transform: translateY(0); } to { transform: translateY(-50%); } }
@keyframes mgStreamDown { from { transform: translateY(-50%); } to { transform: translateY(0); } }
.mg-drift { opacity: 0; animation: mgDrift var(--dur, 10s) ease-in-out var(--delay, 0s) infinite; }
.mg-stream-up { animation: mgStreamUp 50s linear infinite; }
.mg-stream-down { animation: mgStreamDown 56s linear infinite; }
.mg-spot {
  opacity: 0;
  transition: opacity 0.3s ease;
  background: radial-gradient(360px circle at var(--x, 50%) var(--y, 0%), rgba(252, 211, 77, 0.07), transparent 60%);
}
.mg-card:hover .mg-spot { opacity: 1; }
`;

// ======================================================
// Benchmark data
// ======================================================

const benchmarkData = [
  {
    size: 1000,
    dataset: "1K",
    batchTime: 48.66,
    streamingTime: 103.92,
    batchMemory: 3.01,
    streamingMemory: 0.54,
    batchThroughput: 20552,
    streamingThroughput: 9623,
  },
  {
    size: 10000,
    dataset: "10K",
    batchTime: 454.92,
    streamingTime: 527.39,
    batchMemory: 17.17,
    streamingMemory: 0.98,
    batchThroughput: 21982,
    streamingThroughput: 18961,
  },
  {
    size: 100000,
    dataset: "100K",
    batchTime: 6014.89,
    streamingTime: 6495.92,
    batchMemory: 13.53,
    streamingMemory: 1.0,
    batchThroughput: 16625,
    streamingThroughput: 15394,
  },
  {
    size: 1000000,
    dataset: "1M",
    batchTime: 37448.92,
    streamingTime: 47573.4,
    batchMemory: 309.9,
    streamingMemory: 7.25,
    batchThroughput: 26703,
    streamingThroughput: 21020,
  },
];

const formatTime = (time) =>
  time < 1000 ? `${time.toFixed(2)} ms` : `${(time / 1000).toFixed(2)} s`;
const formatMemory = (memory) => `${memory.toFixed(2)} MB`;
const formatThroughput = (throughput) => `${throughput.toLocaleString()} records/s`;
const compact = (v) => (v >= 1000 ? `${+(v / 1000).toFixed(1)}k` : `${v}`);

const largest = benchmarkData[benchmarkData.length - 1];

const CHARTS = [
  {
    title: "Generation Time",
    text: "Average backend generation time across three independent runs.",
    unit: "Time (ms)",
    batch: "batchTime",
    streaming: "streamingTime",
    fmt: formatTime,
  },
  {
    title: "Observed Memory Delta",
    text: "Average measured peak memory reported during backend generation. Memory values are environment-dependent and may vary because of Node.js runtime allocation and garbage collection.",
    unit: "Memory (MB)",
    batch: "batchMemory",
    streaming: "streamingMemory",
    fmt: formatMemory,
  },
  {
    title: "Throughput",
    text: "Number of records generated per second.",
    unit: "Records/sec",
    batch: "batchThroughput",
    streaming: "streamingThroughput",
    fmt: formatThroughput,
  },
];

const HIGHLIGHTS = [
  { label: "Maximum Dataset", value: largest.dataset, hint: "Records tested", tone: "text-white" },
  { label: `${largest.dataset} Batch Time`, value: formatTime(largest.batchTime), hint: "Average generation time", tone: "text-amber-300" },
  { label: `${largest.dataset} Streaming Time`, value: formatTime(largest.streamingTime), hint: "Average generation time", tone: "text-sky-300" },
  { label: `${largest.dataset} Streaming Memory`, value: formatMemory(largest.streamingMemory), hint: "Average measured peak memory", tone: "text-sky-300" },
];

const TABLE_ROWS = benchmarkData.flatMap((item) => [
  { size: item.dataset, method: "Batch", time: item.batchTime, memory: item.batchMemory, throughput: item.batchThroughput },
  { size: item.dataset, method: "Streaming", time: item.streamingTime, memory: item.streamingMemory, throughput: item.streamingThroughput },
]);

const COMPARISON = [
  {
    name: "Batch",
    box: "border-amber-300/20 bg-amber-300/[0.04]",
    title: "text-amber-200",
    pill: "border-amber-300/20 bg-amber-300/10 text-amber-200",
    time: largest.batchTime,
    memory: largest.batchMemory,
    throughput: largest.batchThroughput,
  },
  {
    name: "Streaming",
    box: "border-sky-300/20 bg-sky-300/[0.04]",
    title: "text-sky-200",
    pill: "border-sky-300/20 bg-sky-300/10 text-sky-200",
    time: largest.streamingTime,
    memory: largest.streamingMemory,
    throughput: largest.streamingThroughput,
  },
];

// ======================================================
// Decorative data
// ======================================================

const STREAM_ROWS = [
  '{"id":1043,"age":29}', '{"city":"Surat"}', '{"sku":"MG-2041"}', '{"qty":2,"paid":true}',
  '{"id":1044,"role":"admin"}', '{"zip":395007}', '{"price":1899}', '{"id":1045,"active":true}',
  '{"order":"ORD-88214"}', '{"rating":4.6}', '{"id":1046,"age":34}', '{"stock":120}',
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

// ======================================================
// Helpers + small UI pieces
// ======================================================

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
    viewport={{ once: true, margin: "0px 0px -60px 0px" }}
    transition={{ duration: 0.55, ease: EASE, delay }}
  >
    {children}
  </motion.div>
);

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const LegendChips = () => (
  <div className="flex shrink-0 items-center gap-2">
    {[["Batch", AMBER], ["Streaming", SKY]].map(([name, color]) => (
      <span key={name} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-300">
        <span className="h-2 w-2 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
        {name}
      </span>
    ))}
  </div>
);

const DataStream = ({ side }) => {
  const left = side === "left";
  const rows = Array.from({ length: 8 }, () => STREAM_ROWS).flat();
  const fade = "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute top-0 hidden h-full w-32 overflow-hidden 2xl:block ${left ? "left-0" : "right-0"}`}
      style={{ maskImage: fade, WebkitMaskImage: fade }}
    >
      <div className={`${left ? "mg-stream-down text-left" : "mg-stream-up text-right"} space-y-3 px-4 font-code text-[10px] text-slate-600`}>
        {rows.map((row, i) => (
          <div key={i} className="whitespace-nowrap">{row}</div>
        ))}
      </div>
      <div className={`absolute inset-0 from-transparent to-[#080a10] ${left ? "bg-gradient-to-r" : "bg-gradient-to-l"}`} />
    </div>
  );
};

const Shell = ({ reduce, children }) => (
  <div className="font-display relative min-h-screen overflow-hidden bg-[#080a10] text-white antialiased">
    <style>{css}</style>

    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: "radial-gradient(rgba(148,163,184,0.18) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 20%, black, transparent)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 20%, black, transparent)",
        }}
      />
      <motion.div
        className="absolute inset-x-0 top-[-180px] mx-auto h-[420px] w-[720px] rounded-full bg-sky-500/10 blur-[140px]"
        animate={reduce ? undefined : { opacity: [0.55, 1, 0.55], scale: [1, 1.08, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-x-0 bottom-[-200px] mx-auto h-[360px] w-[560px] rounded-full bg-amber-300/[0.06] blur-[140px]"
        animate={reduce ? undefined : { opacity: [1, 0.5, 1], scale: [1.05, 1, 1.05] }}
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

    <main className="relative z-10 mx-auto max-w-7xl px-6 py-10">{children}</main>
  </div>
);

const tick = { fill: "#94a3b8", fontSize: 12, fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

const ChartCard = ({ chart, reduce, delay }) => (
  <Reveal reduce={reduce} delay={delay} className="mb-8">
    <section onMouseMove={onCardMove} className={`${cardCls} p-6`}>
      <CardFx />
      <div className="relative">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h2 className="text-xl font-semibold">{chart.title}</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">{chart.text}</p>
          </div>
          <LegendChips />
        </div>

        <div className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={benchmarkData} margin={{ top: 8, right: 16, bottom: 4, left: 4 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="dataset" stroke="rgba(255,255,255,0.12)" tick={tick} tickLine={false} />
              <YAxis
                stroke="rgba(255,255,255,0.12)"
                tick={tick}
                tickLine={false}
                tickFormatter={compact}
                width={58}
                label={{ value: chart.unit, angle: -90, position: "insideLeft", fill: "#64748b", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ stroke: "rgba(255,255,255,0.12)" }}
                contentStyle={{
                  backgroundColor: "#0b0e15",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#fff",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                }}
                labelStyle={{ color: "#94a3b8", marginBottom: 4 }}
                labelFormatter={(label) => `${label} records`}
                formatter={(value, name) => [chart.fmt(Number(value)), name]}
              />
              <Line
                type="monotone"
                dataKey={chart.batch}
                name="Batch"
                stroke={AMBER}
                strokeWidth={3}
                dot={{ r: 4, fill: "#080a10", stroke: AMBER, strokeWidth: 2 }}
                activeDot={{ r: 6, fill: AMBER, stroke: "#080a10", strokeWidth: 2 }}
                isAnimationActive={!reduce}
                animationDuration={1200}
              />
              <Line
                type="monotone"
                dataKey={chart.streaming}
                name="Streaming"
                stroke={SKY}
                strokeWidth={3}
                dot={{ r: 4, fill: "#080a10", stroke: SKY, strokeWidth: 2 }}
                activeDot={{ r: 6, fill: SKY, stroke: "#080a10", strokeWidth: 2 }}
                isAnimationActive={!reduce}
                animationDuration={1200}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  </Reveal>
);

// ======================================================
// Performance Component
// ======================================================

const Performance = () => {
  const reduce = useReducedMotion();

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
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/[0.06] px-3 py-1 text-xs font-medium text-amber-200">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-60 motion-safe:animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-300" />
              </span>
              Performance analysis
            </span>

            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-slate-300">
              3 Runs Average
            </span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Performance Dashboard</h1>

          <p className="mt-3 max-w-3xl text-slate-400">
            Comparative performance analysis of Batch and Streaming JSON mock data generation across different
            dataset sizes.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-xl">
          <p className="text-xs text-slate-500">Test Configuration</p>
          <p className="mt-1 font-code text-sm font-medium text-white">
            {benchmarkData.map((d) => d.dataset).join(" · ")} Records
          </p>
        </div>
      </motion.div>

      {/* ==============================
          Benchmark Highlights
      ============================== */}

      <section className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {HIGHLIGHTS.map((item, i) => (
          <Reveal key={item.label} reduce={reduce} delay={i * 0.06} className="h-full">
            <div className="h-full rounded-xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-white/20">
              <p className="text-sm text-slate-400">{item.label}</p>
              <p className={`mt-3 font-code text-3xl font-medium tracking-tight ${item.tone}`}>{item.value}</p>
              <p className="mt-2 text-xs text-slate-500">{item.hint}</p>
            </div>
          </Reveal>
        ))}
      </section>

      {/* ==============================
          Charts
      ============================== */}

      {CHARTS.map((chart) => (
        <ChartCard key={chart.title} chart={chart} reduce={reduce} delay={0} />
      ))}

      {/* ==============================
          Detailed Benchmark Table
      ============================== */}

      <Reveal reduce={reduce} className="mb-8">
        <section onMouseMove={onCardMove} className={`${cardCls} p-6`}>
          <CardFx />
          <div className="relative">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Detailed Benchmark Results</h2>
              <p className="mt-1 text-sm text-slate-500">
                Average values calculated from three independent benchmark runs for each configuration.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-slate-500">
                    {["Dataset", "Method", "Generation Time", "Peak Memory", "Throughput"].map((column) => (
                      <th key={column} className="whitespace-nowrap px-4 py-3.5 font-medium">{column}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {TABLE_ROWS.map((row, index) => (
                    <motion.tr
                      key={`${row.size}-${row.method}`}
                      initial={reduce ? false : { opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "0px 0px -40px 0px" }}
                      transition={{ duration: 0.4, ease: EASE, delay: (index % 4) * 0.04 }}
                      className="border-b border-white/5 transition-colors last:border-b-0 hover:bg-white/[0.03]"
                    >
                      <td className="px-4 py-4 font-code font-medium text-white">{row.size}</td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${
                            row.method === "Batch"
                              ? "border-amber-300/20 bg-amber-300/10 text-amber-200"
                              : "border-sky-300/20 bg-sky-300/10 text-sky-200"
                          }`}
                        >
                          {row.method}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 font-code text-slate-300">{formatTime(row.time)}</td>
                      <td className="whitespace-nowrap px-4 py-4 font-code text-slate-300">{formatMemory(row.memory)}</td>
                      <td className="whitespace-nowrap px-4 py-4 font-code text-slate-300">{formatThroughput(row.throughput)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ==============================
          Largest Dataset Comparison
      ============================== */}

      <Reveal reduce={reduce} className="mb-8">
        <section onMouseMove={onCardMove} className={`${cardCls} p-6`}>
          <CardFx />
          <div className="relative">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">{largest.dataset} Record Comparison</h2>
              <p className="mt-1 text-sm text-slate-500">
                Large-scale benchmark comparison at the maximum tested dataset size.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {COMPARISON.map((item) => (
                <motion.div
                  key={item.name}
                  whileHover={reduce ? undefined : { y: -3 }}
                  transition={{ duration: 0.2 }}
                  className={`rounded-xl border p-5 ${item.box}`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className={`text-lg font-semibold ${item.title}`}>{item.name}</h3>
                    <span className={`rounded-full border px-3 py-1 text-xs ${item.pill}`}>
                      {largest.dataset} Records
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    {[
                      ["Time", formatTime(item.time)],
                      ["Memory", formatMemory(item.memory)],
                      ["Throughput", formatThroughput(item.throughput)],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-lg border border-white/10 bg-black/20 px-3 py-3">
                        <p className="text-xs text-slate-500">{label}</p>
                        <p className="mt-1 font-code text-sm font-medium text-white">{value}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* ==============================
          Research Observation
      ============================== */}

      <Reveal reduce={reduce}>
        <section onMouseMove={onCardMove} className={`${cardCls} border-amber-300/20 p-6`}>
          <CardFx />

          <div className="relative flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-300/20 bg-amber-300/[0.07] text-amber-300">
              <InfoIcon />
            </div>

            <div>
              <h2 className="text-lg font-semibold">Research Observation</h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Across the tested dataset sizes, Batch generation recorded lower average generation time than
                Streaming at 1M records. Streaming recorded substantially lower measured peak memory at the same
                dataset size. Throughput varied across dataset sizes, showing that performance characteristics
                depend on workload size and generation strategy.
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                The benchmark values represent averages from three independent backend runs. Memory measurements
                are runtime-dependent and can vary because of Node.js memory allocation and garbage collection.
                Generation time represents backend generation time and does not include frontend IndexedDB storage
                time.
              </p>
            </div>
          </div>
        </section>
      </Reveal>
    </Shell>
  );
};

export default Performance;