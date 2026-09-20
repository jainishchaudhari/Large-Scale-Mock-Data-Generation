import { useNavigate } from "react-router-dom";
import heroImage from "../assets/hero.png";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Hero Section */}
      <section className="mx-auto flex min-h-[75vh] max-w-7xl items-center px-6 py-16">

        <div className="grid w-full items-center gap-12 md:grid-cols-2">

          {/* Left Content */}
          <div>

            <div className="mb-6 inline-flex rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm text-purple-300">
              MERN Stack • Faker.js • Performance Analysis
            </div>

            <h2 className="text-5xl font-bold leading-tight lg:text-6xl">
              Generate
              <span className="text-purple-500"> Large-Scale </span>
              JSON Mock Data
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
              Create realistic mock datasets using customizable schemas
              and analyze the performance of different data generation
              techniques.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">

              {/* Start Generating */}
              <button
                onClick={() => navigate("/generate")}
                className="rounded-lg bg-purple-600 px-7 py-3 font-semibold transition hover:bg-purple-700"
              >
                Start Generating
              </button>

              {/* View Performance */}
              <button
                onClick={() => navigate("/performance")}
                className="rounded-lg border border-slate-700 px-7 py-3 font-semibold text-slate-300 transition hover:border-slate-500 hover:bg-slate-900"
              >
                View Performance
              </button>

            </div>

          </div>

          {/* Right Image */}
          <div className="flex justify-center md:justify-end">

            <div className="relative">

              <div className="absolute inset-0 rounded-full bg-purple-600/20 blur-3xl"></div>

              <img
                src={heroImage}
                alt="Large scale mock data generation"
                className="relative w-full max-w-md drop-shadow-2xl"
              />

            </div>

          </div>

        </div>

      </section>

      {/* Features */}
      <section className="border-t border-slate-800 px-6 py-20">

        <div className="mx-auto max-w-7xl">

          <div className="text-center">

            <p className="text-sm font-semibold uppercase tracking-widest text-purple-400">
              Features
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Built for Large-Scale Data Generation
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-slate-400">
              Everything you need to generate, manage and analyze
              realistic mock data.
            </p>

          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">

            {/* Feature 1 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-7 transition hover:border-purple-500/50">

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-2xl">
                ⚡
              </div>

              <h3 className="text-xl font-semibold">
                Fast Generation
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                Generate thousands or millions of realistic records
                efficiently using Faker.js.
              </p>

            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-7 transition hover:border-purple-500/50">

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-2xl">
                🧩
              </div>

              <h3 className="text-xl font-semibold">
                Flexible Schemas
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                Define custom JSON schemas with different field types
                and constraints.
              </p>

            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-7 transition hover:border-purple-500/50">

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-2xl">
                📊
              </div>

              <h3 className="text-xl font-semibold">
                Performance Analysis
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                Compare execution time, memory usage and throughput
                across generation techniques.
              </p>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
};

export default Home;