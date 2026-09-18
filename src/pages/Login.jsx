import { Link } from "react-router-dom";

const Login = () => {
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
              Welcome Back
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Login to your MockGen account
            </p>
          </div>

          {/* Login Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">

            <form className="space-y-5">

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
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-purple-500"
                />
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full rounded-lg bg-purple-600 px-5 py-3 font-semibold text-white transition hover:bg-purple-700"
              >
                Login
              </button>

            </form>

            {/* Signup Link */}
            <p className="mt-6 text-center text-sm text-slate-400">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-purple-400 hover:text-purple-300"
              >
                Create Account
              </Link>
            </p>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;