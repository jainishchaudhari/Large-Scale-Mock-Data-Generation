import { Link } from "react-router-dom";

const Signup = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen items-center justify-center px-6 py-12">

        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="mb-8 text-center">
            <Link to="/" className="text-3xl font-bold">
              Mock<span className="text-purple-500">Gen</span>
            </Link>

            <h1 className="mt-6 text-3xl font-bold">
              Create Account
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Create your MockGen account
            </p>
          </div>

          {/* Signup Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">

            <form className="space-y-5">

              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="Enter your name"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-purple-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-purple-500"
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Create a password"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-purple-500"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Confirm Password
                </label>

                <input
                  type="password"
                  placeholder="Confirm your password"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-purple-500"
                />
              </div>

              {/* Button */}
              <button
                type="submit"
                className="w-full rounded-lg bg-purple-600 px-5 py-3 font-semibold text-white transition hover:bg-purple-700"
              >
                Create Account
              </button>

            </form>

            {/* Login Link */}
            <p className="mt-6 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-purple-400 hover:text-purple-300"
              >
                Login
              </Link>
            </p>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Signup;