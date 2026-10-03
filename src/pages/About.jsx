import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  animate,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=JetBrains+Mono:wght@400;500&display=swap');
.font-display { font-family: 'Bricolage Grotesque', system-ui, -apple-system, 'Segoe UI', sans-serif; }
.font-code { font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace; }
@keyframes mg-flow { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -100; } }
.mg-flow { animation: mg-flow linear infinite; }
@media (prefers-reduced-motion: reduce) { .mg-flow { animation: none; } }
`;

const EASE = [0.22, 1, 0.36, 1];
const VIEW = { once: true, margin: "-70px" };

/* ========================= DATA ========================= */

const facts = [
  { to: 1000000, label: "records per request", prefix: "Up to " },
  { to: 4, label: "generation approaches compared" },
  { to: 5, label: "country locales, plus Global" },
  { text: "JSON / JSONL", label: "output formats" },
];

const steps = [
  [
    "Describe your data",
    "Write a JSON schema. Nested objects, arrays, min/max values and enums can define the structure.",
  ],
  [
    "Understand the schema",
    "Gemini can interpret field names and map them to meaningful data types such as name, city, email or age.",
  ],
  [
    "Use a safe fallback",
    "If AI is unavailable or returns an invalid mapping, a rule-based mapper provides a deterministic fallback.",
  ],
  [
    "Generate and measure",
    "Faker.js produces realistic records while the system measures generation time, memory usage and throughput.",
  ],
];

const features = [
  [
    "Realistic values",
    "Names, cities, phone numbers and addresses follow the selected locale: India, United States, United Kingdom, Germany, Canada or Global.",
  ],
  [
    "Constraint aware",
    "Schema constraints such as numeric ranges, string lengths and fixed choices are respected during generation.",
  ],
  [
    "Multiple approaches",
    "Batch, streaming, synchronous and asynchronous generation can be evaluated under the same experimental conditions.",
  ],
  [
    "Performance analytics",
    "Generation time, memory usage and throughput can be compared across different dataset sizes.",
  ],
  [
    "Generation history",
    "Generation metadata can be stored with the schema, dataset size, method and measured results.",
  ],
  [
    "Accounts and admin",
    "JWT-based authentication separates regular users from administrative functionality.",
  ],
];

const methods = [
  ["Batch", "Generates records in groups and returns them through the API."],
  [
    "Streaming",
    "Uses a Node.js stream so generated records can begin reaching the client without waiting for the complete dataset.",
  ],
  [
    "Synchronous",
    "Uses a straightforward blocking generation loop as a baseline approach.",
  ],
  [
    "Asynchronous",
    "Allows the event loop to regain control periodically while generation continues.",
  ],
];

const metrics = [
  ["01", "Generation time", "Milliseconds required to generate the dataset."],
  ["02", "Peak memory", "Observed memory consumption during generation."],
  ["03", "Throughput", "Records generated per second."],
];

const stack = [
  [
    "Frontend",
    [
      "React",
      "Vite",
      "Tailwind CSS",
      "Framer Motion",
      "Recharts",
      "Monaco Editor",
    ],
  ],
  ["Backend", ["Node.js", "Express", "MongoDB", "Mongoose", "JWT", "bcrypt"]],
  ["Data & AI", ["Faker.js", "Google Gemini"]],
];

const flowPaths = [
  ["M-50 520 C 250 420, 400 200, 700 260 S 1100 120, 1250 60", 9, 0],
  ["M-50 420 C 200 360, 450 120, 750 200 S 1050 280, 1250 180", 12, -4],
  ["M-50 600 C 300 560, 500 400, 800 380 S 1100 330, 1250 300", 15, -8],
];

/* ===================== PROGRESS BAR ===================== */

const ProgressBar = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });
  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-amber-300 via-yellow-200 to-sky-300"
      style={{ scaleX }}
    />
  );
};

/* ======================= BACKGROUND ======================= */

const Background = () => {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const glowA = useTransform(scrollY, [0, 3000], [0, 420]);
  const glowB = useTransform(scrollY, [0, 3000], [0, -300]);
  const flowY = useTransform(scrollY, [0, 700], [0, 170]);

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(rgba(148,163,184,0.09) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage:
              "radial-gradient(ellipse 80% 70% at 50% 35%, black, transparent)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 70% at 50% 35%, black, transparent)",
          }}
        />
        <motion.div
          className="absolute -left-40 top-10 h-[460px] w-[460px] rounded-full bg-sky-500/10 blur-[140px]"
          style={reduce ? undefined : { y: glowA }}
        />
        <motion.div
          className="absolute -right-32 top-1/2 h-[420px] w-[420px] rounded-full bg-amber-300/[0.06] blur-[140px]"
          style={reduce ? undefined : { y: glowB }}
        />
      </div>

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[640px]"
        style={{
          y: reduce ? 0 : flowY,
          maskImage: "linear-gradient(to bottom, black 35%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, black 35%, transparent)",
        }}
      >
        <svg
          className="h-full w-full"
          viewBox="0 0 1200 640"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <defs>
            <linearGradient
              id="mg-flow-grad"
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="0"
              x2="1200"
              y2="0"
            >
              <stop offset="0" stopColor="#fcd34d" />
              <stop offset="1" stopColor="#7dd3fc" />
            </linearGradient>
          </defs>
          {flowPaths.map(([d, duration, delay]) => (
            <g key={d}>
              <path d={d} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <path
                d={d}
                pathLength="100"
                stroke="url(#mg-flow-grad)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="12 88"
                opacity="0.5"
                className="mg-flow"
                style={{
                  animationDuration: `${duration}s`,
                  animationDelay: `${delay}s`,
                }}
              />
            </g>
          ))}
        </svg>
      </motion.div>
    </>
  );
};

/* ========================= REVEAL ========================= */

const Reveal = ({
  children,
  delay = 0,
  as = "div",
  className,
  x = 0,
  y = 14,
}) => {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={VIEW}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </Tag>
  );
};

/* ===================== WORD ANIMATION ===================== */

const Words = ({ text, delay = 0.15 }) => {
  const reduce = useReducedMotion();
  const words = text.split(" ");

  return (
    <span className="inline">
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className="inline-block overflow-hidden pb-[0.1em] align-bottom"
        >
          <motion.span
            className="inline-block"
            initial={reduce ? false : { y: "110%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.7,
              delay: delay + index * 0.045,
              ease: EASE,
            }}
          >
            {word}
          </motion.span>
          {index !== words.length - 1 && (
            <span className="inline-block">&nbsp;</span>
          )}
        </span>
      ))}
    </span>
  );
};

/* ===================== SECTION TITLE ===================== */

const Title = ({ children }) => {
  const reduce = useReducedMotion();
  return (
    <div className="overflow-hidden pb-1">
      <motion.h2
        className="text-2xl font-semibold tracking-tight md:text-3xl"
        initial={reduce ? false : { y: "100%" }}
        whileInView={{ y: 0 }}
        viewport={VIEW}
        transition={{ duration: 0.7, ease: EASE }}
      >
        {children}
      </motion.h2>
    </div>
  );
};

/* ========================== LINE ========================== */

const Line = ({ delay = 0, className = "" }) => {
  const reduce = useReducedMotion();
  return (
    <motion.span
      aria-hidden="true"
      className={`block h-px origin-left ${className}`}
      initial={reduce ? false : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={VIEW}
      transition={{ duration: 0.9, delay, ease: EASE }}
    />
  );
};

/* ========================= SECTION ========================= */

const Section = ({ eyebrow, title, intro, children }) => (
  <section className="mt-28">
    <Reveal>
      {eyebrow && (
        <p className="font-code mb-3 text-xs uppercase tracking-[0.2em] text-amber-300/80">
          {eyebrow}
        </p>
      )}
      <Title>{title}</Title>
      {intro && (
        <Reveal delay={0.1}>
          <p className="mt-4 max-w-2xl text-[17px] leading-8 text-slate-300">
            {intro}
          </p>
        </Reveal>
      )}
    </Reveal>
    <div className="mt-9">{children}</div>
  </section>
);

/* ======================== COUNT UP ======================== */

const CountUp = ({ to }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? to : 0);

  useEffect(() => {
    if (!inView || reduce) return undefined;
    const controls = animate(0, to, {
      duration: 1.7,
      ease: "easeOut",
      onUpdate: (value) => setN(Math.round(value)),
    });
    return () => controls.stop();
  }, [inView, to, reduce]);

  return <span ref={ref}>{n.toLocaleString("en-US")}</span>;
};

/* ======================= CODE PANEL ======================= */

const Code = ({ label, children, index = 0, active = false }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={`flex flex-col transition-colors duration-700 ${active ? "bg-white/[0.045]" : ""}`}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: index * 0.12, ease: EASE }}
    >
      <p
        className={`font-code flex items-center gap-2 border-b border-white/10 px-5 py-3 text-xs transition-colors duration-700 ${
          active ? "text-amber-200" : "text-slate-400"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full transition-colors duration-700 ${
            active
              ? "bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.7)]"
              : "bg-slate-600"
          }`}
        />
        {label}
      </p>
      <pre className="font-code min-h-[220px] flex-1 overflow-x-auto px-5 py-5 text-[13px] leading-7 text-slate-200">
        {children}
      </pre>
    </motion.div>
  );
};

/* ======================== TIMELINE ======================== */

const Timeline = () => {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 75%", "end 55%"],
  });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <ol ref={ref} className="relative max-w-3xl space-y-12 pl-14">
      <span className="absolute bottom-2 left-4 top-2 w-px bg-white/10" />
      <motion.span
        className="absolute bottom-2 left-4 top-2 w-px origin-top bg-gradient-to-b from-amber-300 to-sky-300"
        style={{ scaleY: reduce ? 1 : fill }}
      />
      {steps.map(([title, text], index) => (
        <Reveal as="li" key={title} x={28} y={0} className="relative">
          <motion.span
            className="font-code absolute -left-14 top-0 grid h-8 w-8 place-items-center rounded-full border border-amber-300/50 bg-[#080a10] text-sm text-amber-300 shadow-[0_0_20px_rgba(252,211,77,0.08)]"
            initial={reduce ? false : { scale: 0.5, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={VIEW}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 18,
              delay: 0.1,
            }}
          >
            {index + 1}
          </motion.span>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="mt-2 text-[17px] leading-8 text-slate-300">{text}</p>
        </Reveal>
      ))}
    </ol>
  );
};

/* ====================== FEATURE ROW ====================== */

const FeatureRow = ({ title, text, index }) => {
  const reduce = useReducedMotion();
  return (
    <motion.li
      className="group relative grid gap-4 py-7 md:grid-cols-[260px_1fr] md:gap-12"
      initial={reduce ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={reduce ? undefined : { x: 5 }}
      viewport={VIEW}
      transition={{ duration: 0.55, delay: (index % 3) * 0.06, ease: EASE }}
    >
      <div className="flex items-start gap-4">
        <span className="font-code pt-0.5 text-xs text-amber-300/60">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="font-semibold text-white transition-colors group-hover:text-amber-200">
          {title}
        </h3>
      </div>
      <p className="text-[17px] leading-8 text-slate-300">{text}</p>
      <Line
        delay={0.1}
        className="absolute bottom-0 left-0 w-full bg-white/10"
      />
    </motion.li>
  );
};

/* ======================= ABOUT PAGE ======================= */

const About = () => {
  const reduce = useReducedMotion();
  const flowRef = useRef(null);
  const flowVisible = useInView(flowRef);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (reduce || !flowVisible) return undefined;
    const timer = setInterval(
      () => setStage((current) => (current + 1) % 3),
      2200,
    );
    return () => clearInterval(timer);
  }, [reduce, flowVisible]);

  const tap = reduce
    ? {}
    : { whileHover: { y: -2 }, whileTap: { scale: 0.97 } };

  return (
    <div className="font-display relative isolate min-h-screen overflow-hidden bg-[#080a10] text-white antialiased">
      <style>{css}</style>
      <ProgressBar />
      <Background />

      <main className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-20 lg:pt-28">
        {/* ------------------------ HERO ------------------------ */}
        <header className="max-w-5xl">
          <Reveal>
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="font-code rounded-full border border-amber-300/20 bg-amber-300/[0.05] px-3 py-1.5 text-xs text-amber-200">
                MOCKGEN
              </span>
              <span className="h-px w-12 bg-white/15" />
              <span className="font-code text-xs text-slate-500">
                DATA GENERATION & PERFORMANCE
              </span>
            </div>
          </Reveal>

          {/* Two clean lines; size scales with the screen */}
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="max-w-5xl text-balance text-[clamp(1.9rem,5vw,3.4rem)] font-semibold leading-[1.12] tracking-tight"
          >
            <span className="block text-white">
              <Words text="Mock data that stays realistic," />
            </span>
            <span className="block text-slate-400">
              <Words text="even at a million records." delay={0.4} />
            </span>
          </motion.h1>

          <Reveal delay={0.7}>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl md:leading-9">
              MockGen turns a JSON schema into large sets of realistic test
              data. At the same time, it provides a controlled environment for
              studying how different generation approaches behave as dataset
              size increases.
            </p>
          </Reveal>

          <Reveal delay={0.85}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/signup"
                className="rounded-xl bg-amber-300 px-5 py-3 font-semibold text-slate-950 shadow-lg shadow-amber-400/10 transition hover:bg-amber-200"
              >
                Start generating
              </Link>
              <span className="font-code text-xs text-slate-500">
                Schema → Mapping → Generation → Measurement
              </span>
            </div>
          </Reveal>
        </header>

        {/* ---------------------- DATA FLOW ---------------------- */}
        <motion.div
          ref={flowRef}
          className="relative mt-16"
          initial={reduce ? false : { opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={VIEW}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-white/15 via-white/5 to-transparent" />
          <div className="relative grid divide-y divide-white/10 overflow-hidden rounded-3xl border border-white/10 bg-[#0d1019]/95 backdrop-blur md:grid-cols-3 md:divide-x md:divide-y-0">
            <Code
              index={0}
              active={!reduce && stage === 0}
              label="01 / YOUR SCHEMA"
            >
              {`{
  "fullName": "string",
  "homeCity": "string",
  "userAge": {
    "type": "integer",
    "minimum": 18,
    "maximum": 60
  }
}`}
            </Code>
            <Code
              index={1}
              active={!reduce && stage === 1}
              label="02 / FIELD MAPPING"
            >
              {`{
  "fullName": "name",
  "homeCity": "city",
  "userAge": "age"
}`}
            </Code>
            <Code
              index={2}
              active={!reduce && stage === 2}
              label="03 / GENERATED RECORD"
            >
              {`{
  "id": 1,
  "fullName": "Isha Patel",
  "homeCity": "Surat",
  "userAge": 34
}`}
            </Code>
          </div>
        </motion.div>

        <p className="font-code mt-3 text-xs text-slate-500">
          Illustrative example of the generation pipeline.
        </p>

        {/* ------------------------ FACTS ------------------------ */}
        <dl className="mt-16 grid grid-cols-2 gap-x-8 gap-y-10 border-y border-white/10 py-10 md:grid-cols-4">
          {facts.map((fact, index) => (
            <Reveal key={fact.label} delay={index * 0.08}>
              <dt className="font-code text-2xl font-medium text-amber-200">
                {fact.prefix}
                {fact.text ?? <CountUp to={fact.to} />}
              </dt>
              <Line
                delay={0.3 + index * 0.08}
                className="mt-3 w-12 bg-amber-300/60"
              />
              <dd className="mt-3 text-sm leading-6 text-slate-400">
                {fact.label}
              </dd>
            </Reveal>
          ))}
        </dl>

        {/* ---------------------- HOW IT WORKS ---------------------- */}
        <Section
          eyebrow="01 / PIPELINE"
          title="How a schema becomes data"
          intro="MockGen separates schema interpretation from record generation so the generation process remains deterministic and measurable."
        >
          <Timeline />
        </Section>

        {/* ------------------------ FEATURES ------------------------ */}
        <Section
          eyebrow="02 / CAPABILITIES"
          title="What you get"
          intro="The platform combines flexible schema-driven generation with measurement and experiment tracking."
        >
          <ul className="border-t border-white/10">
            {features.map(([title, text], index) => (
              <FeatureRow key={title} title={title} text={text} index={index} />
            ))}
          </ul>
        </Section>

        {/* ------------------------ RESEARCH ------------------------ */}
        <Section
          eyebrow="03 / RESEARCH"
          title="The research behind it"
          intro="The experimental component compares four generation approaches using common schemas and controlled dataset sizes."
        >
          <Reveal>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1019]">
              <div className="border-b border-white/10 px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">
                      Generation approaches
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Same schema · controlled dataset size
                    </p>
                  </div>
                  <span className="font-code rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-400">
                    PERFORMANCE STUDY
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400">
                      <th className="px-5 py-4 font-medium">Approach</th>
                      <th className="px-5 py-4 font-medium">Execution model</th>
                      <th className="px-5 py-4 font-medium">Research role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {methods.map(([name, text], index) => (
                      <motion.tr
                        key={name}
                        className="group transition-colors hover:bg-white/[0.025]"
                        initial={reduce ? false : { opacity: 0, x: -15 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={VIEW}
                        transition={{
                          duration: 0.5,
                          delay: 0.12 + index * 0.08,
                          ease: EASE,
                        }}
                      >
                        <td className="font-code whitespace-nowrap px-5 py-5 text-amber-200">
                          {name}
                        </td>
                        <td className="px-5 py-5 leading-7 text-slate-200">
                          {text}
                        </td>
                        <td className="px-5 py-5 text-slate-400">
                          Compare performance
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {metrics.map(([number, title, text]) => (
                <div
                  key={number}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
                >
                  <span className="font-code text-xs text-amber-300/70">
                    {number}
                  </span>
                  <h3 className="mt-3 font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-6 rounded-2xl border border-amber-300/10 bg-amber-300/[0.025] p-5">
              <p className="font-code text-xs uppercase tracking-[0.15em] text-amber-300/70">
                Experimental setup
              </p>
              <p className="mt-3 max-w-3xl text-[16px] leading-7 text-slate-300">
                Each approach is evaluated using the same schema and dataset
                sizes. Measurements are repeated and reported using generation
                time, peak memory and records per second.
              </p>
            </div>
          </Reveal>
        </Section>

        {/* ------------------------ TECHNOLOGY ------------------------ */}
        <Section
          eyebrow="04 / TECHNOLOGY"
          title="Built with"
          intro="A JavaScript-based stack connects the schema editor, generation engine, database and performance dashboard."
        >
          <ul className="border-t border-white/10">
            {stack.map(([group, items], index) => (
              <motion.li
                key={group}
                className="grid gap-4 border-b border-white/10 py-7 md:grid-cols-[220px_1fr] md:gap-10"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEW}
                transition={{ duration: 0.55, delay: index * 0.08, ease: EASE }}
              >
                <div>
                  <span className="font-code text-xs text-slate-600">
                    0{index + 1}
                  </span>
                  <h3 className="mt-1 font-semibold text-white">{group}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {items.map((item, itemIndex) => (
                    <motion.span
                      key={item}
                      className="font-code rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-slate-300 transition-colors hover:border-amber-300/20 hover:text-amber-200"
                      initial={reduce ? false : { opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={VIEW}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                        delay: 0.15 + index * 0.07 + itemIndex * 0.035,
                      }}
                    >
                      {item}
                    </motion.span>
                  ))}
                </div>
              </motion.li>
            ))}
          </ul>
        </Section>

        {/* -------------------------- CTA -------------------------- */}
        <Reveal className="relative mt-28 overflow-hidden rounded-3xl p-px">
          {!reduce && (
            <motion.div
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 h-[220%] w-[220%] -translate-x-1/2 -translate-y-1/2"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0deg 300deg, #fcd34d 335deg, #7dd3fc 360deg)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
          )}

          <div className="relative rounded-[calc(1.5rem-1px)] border border-white/10 bg-[#0d1019] p-8 md:p-12">
            <div className="max-w-2xl">
              <span className="font-code text-xs uppercase tracking-[0.2em] text-amber-300/70">
                Ready to test?
              </span>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-4xl">
                Generate a dataset and inspect the numbers.
              </h2>
              <p className="mt-4 max-w-xl text-[17px] leading-8 text-slate-300">
                Create an account, define your schema and run your first
                generation experiment.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <motion.div {...tap}>
                <Link
                  to="/signup"
                  className="block rounded-xl bg-amber-300 px-6 py-3 font-semibold text-slate-950 shadow-lg shadow-amber-400/10 transition hover:bg-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-100 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1019]"
                >
                  Create account
                </Link>
              </motion.div>
              <motion.div {...tap}>
                <Link
                  to="/login"
                  className="block rounded-xl border border-white/15 px-6 py-3 font-medium text-slate-200 transition hover:border-white/30 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                >
                  Log in
                </Link>
              </motion.div>
            </div>
          </div>
        </Reveal>

        {/* ------------------------ FOOTER ------------------------ */}
        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-col justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-600 md:flex-row">
            <span className="font-code">
              MOCKGEN / LARGE-SCALE JSON DATA GENERATION
            </span>
            <span>Research-oriented mock data generation platform</span>
          </div>
        </Reveal>
      </main>
    </div>
  );
};

export default About;
