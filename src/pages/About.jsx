import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="mx-auto max-w-6xl px-6 py-16">

        {/* Header */}
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-purple-400">
            About MockGen
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Large-Scale JSON Mock Data Generation
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-400">
            MockGen is a MERN-based platform designed to generate
            large-scale realistic JSON mock data and analyze the
            performance of different data generation approaches.
          </p>
        </div>

        {/* What is MockGen */}
        <section className="mt-16 grid gap-8 md:grid-cols-2">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
            <h2 className="text-2xl font-bold">
              What is MockGen?
            </h2>

            <p className="mt-4 leading-7 text-slate-400">
              MockGen allows developers and students to define a
              data schema and generate realistic mock records using
              predefined field types. The generated data can be
              used for application testing, API development and
              performance experiments.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
            <h2 className="text-2xl font-bold">
              Research Focus
            </h2>

            <p className="mt-4 leading-7 text-slate-400">
              The project focuses on performance analysis of
              large-scale JSON generation by comparing Batch,
              Streaming, Synchronous and Asynchronous approaches.
            </p>
          </div>

        </section>

        {/* Technologies */}
        <section className="mt-12">

          <h2 className="text-2xl font-bold">
            Technologies Used
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">

            {[
              "React",
              "Tailwind CSS",
              "Node.js",
              "Express.js",
              "MongoDB",
              "Faker.js",
            ].map((technology) => (
              <div
                key={technology}
                className="rounded-xl border border-slate-800 bg-slate-900 px-5 py-4 text-slate-300"
              >
                {technology}
              </div>
            ))}

          </div>

        </section>

        {/* Features */}
        <section className="mt-12">

          <h2 className="text-2xl font-bold">
            Key Features
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="font-semibold text-white">
                Custom Schema
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Define fields and supported data types for
                generating realistic records.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="font-semibold text-white">
                Large-Scale Generation
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Generate thousands of mock JSON records for
                testing and experimentation.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="font-semibold text-white">
                Performance Analysis
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Compare generation time, memory usage and
                throughput across different approaches.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="font-semibold text-white">
                Generation History
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                View previously generated datasets and their
                performance information.
              </p>
            </div>

          </div>

        </section>

        {/* CTA */}
        <section className="mt-16 rounded-2xl border border-purple-500/20 bg-purple-500/5 p-8 text-center">

          <h2 className="text-2xl font-bold">
            Ready to generate mock data?
          </h2>

          <p className="mt-3 text-slate-400">
            Create an account to access the data generation
            and performance analysis features.
          </p>

          <Link
            to="/signup"
            className="mt-6 inline-block rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-700"
          >
            Get Started
          </Link>

        </section>

      </div>
    </div>
  );
};

export default About;