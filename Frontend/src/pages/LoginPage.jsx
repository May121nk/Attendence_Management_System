import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../features/auth/authApi.js";
import { setAuth } from "../features/auth/authSlice.js";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const result = await login(form).unwrap();
      dispatch(setAuth({ user: result.user, token: result.token }));
      navigate("/dashboard");
    } catch (err) {
      setError(err?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-8">
          Login
        </h1>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 dark:bg-slate-700 dark:text-white"
          />
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            required
            className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 dark:bg-slate-700 dark:text-white"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 dark:bg-blue-700 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition">
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
          No account?{" "}
          <Link className="text-blue-600 font-semibold" to="/signup">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
