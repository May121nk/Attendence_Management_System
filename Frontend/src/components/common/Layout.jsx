import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useContext } from "react";
import { logout } from "../../features/auth/authSlice.js";
import { ThemeContext } from "../../context/ThemeContext.jsx";

const Layout = ({ children, title }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const themeCtx = useContext(ThemeContext) || {
    theme: "light",
    toggleTheme: () => {},
  };
  const { theme, toggleTheme } = themeCtx;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 transition-colors duration-300">
      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              AttendanceMS
            </Link>

            {title && (
              <span className="hidden sm:block text-sm text-slate-500 dark:text-slate-400">
                / {title}
              </span>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {/* User Info */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>

              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white leading-none">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                  {user?.role}
                </p>
              </div>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              {theme === "light" ? "🌙 Dark" : "☀️ Light"}
            </button>

            {/* Dashboard */}
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              📊 Dashboard
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 dark:bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 dark:hover:bg-red-600">
              🚪 Logout
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
};

export default Layout;
