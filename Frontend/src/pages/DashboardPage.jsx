import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice.js";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext.jsx";

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const themeCtx = useContext(ThemeContext);

  const { theme, toggleTheme } = themeCtx || {
    theme: "light",
    toggleTheme: () => {},
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const roleBadge = {
    employee: "bg-blue-100 text-blue-800",
    manager: "bg-purple-100 text-purple-800",
    admin: "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-6xl mx-auto py-10 px-4">
        {/* Header */}
        <div className="mb-10 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Welcome back
              </p>
              <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
                {user?.name || "User"}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {user?.email}
              </p>
              <div className="mt-2">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                    roleBadge[user?.role] || "bg-slate-100 text-slate-800"
                  }`}>
                  {user?.role}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-700 dark:text-white transition hover:bg-slate-100 dark:hover:bg-slate-700">
                {theme === "light" ? "🌙 Dark" : "☀️ Light"}
              </button>

              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center rounded-xl bg-red-600 dark:bg-red-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 dark:hover:bg-red-600">
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Reports Card */}
          <Link
            to="/reports"
            className="group block rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-sm transition hover:-translate-y-1 hover:border-green-300 dark:hover:border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-green-600 dark:text-green-400">
                  Reports
                </p>
                <h2 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">
                  Attendance History
                </h2>
              </div>
              <div className="rounded-2xl bg-green-50 dark:bg-green-900 p-4 text-2xl text-green-600 dark:text-green-400">
                📊
              </div>
            </div>
            <p className="mt-6 text-slate-600 dark:text-slate-400">
              View your attendance history, working hours and status.
            </p>
          </Link>

          {/* Employee - Punch & Overtime */}
          {user?.role === "employee" && (
            <>
              <Link
                to="/attendance"
                className="group block rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-600 md:col-span-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                      Attendance
                    </p>
                    <h2 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">
                      Punch In / Out
                    </h2>
                  </div>
                </div>
              </Link>
              <Link
                to="/overtime"
                className="group block rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-sm transition hover:-translate-y-1 hover:border-purple-300 dark:hover:border-purple-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400">
                      Overtime
                    </p>
                    <h2 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">
                      {user?.role === "employee" ? "Request OT" : "Manage OT"}
                    </h2>
                  </div>
                  <div className="rounded-2xl bg-purple-50 dark:bg-purple-900 p-4 text-2xl text-purple-600 dark:text-purple-400">
                    ⏳
                  </div>
                </div>
                <p className="mt-6 text-slate-600 dark:text-slate-400">
                  {user?.role === "employee"
                    ? "Request overtime hours for additional work."
                    : "Manage team overtime requests."}
                </p>
              </Link>
            </>
          )}

          {/* Manager - Team Attendance */}
          {(user?.role === "manager" || user?.role === "admin") && (
            <Link
              to="/team-attendance"
              className="group block rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-sm transition hover:-translate-y-1 hover:border-orange-300 dark:hover:border-orange-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-orange-600 dark:text-orange-400">
                    Management
                  </p>
                  <h2 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">
                    Team Attendance
                  </h2>
                </div>
                <div className="rounded-2xl bg-orange-50 dark:bg-orange-900 p-4 text-2xl text-orange-600 dark:text-orange-400">
                  👥
                </div>
              </div>
              <p className="mt-6 text-slate-600 dark:text-slate-400">
                View and verify team attendance records.
              </p>
            </Link>
          )}

          {/* Manager/Admin - Overtime Approval */}
          {(user?.role === "manager" || user?.role === "admin") && (
            <Link
              to="/overtime-manage"
              className="group block rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-sm transition hover:-translate-y-1 hover:border-purple-300 dark:hover:border-purple-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400">
                    Overtime
                  </p>
                  <h2 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">
                    Approve / Reject OT
                  </h2>
                </div>
                <div className="rounded-2xl bg-purple-50 dark:bg-purple-900 p-4 text-2xl text-purple-600 dark:text-purple-400">
                  ⏳
                </div>
              </div>
              <p className="mt-6 text-slate-600 dark:text-slate-400">
                Review and manage pending overtime requests.
              </p>
            </Link>
          )}

          {/* Manager/Admin - Verification */}
          {(user?.role === "manager" || user?.role === "admin") && (
            <Link
              to="/verification"
              className="group block rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-sm transition hover:-translate-y-1 hover:border-red-300 dark:hover:border-red-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-red-600 dark:text-red-400">
                    Admin
                  </p>
                  <h2 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">
                    Verification
                  </h2>
                </div>
                <div className="rounded-2xl bg-red-50 dark:bg-red-900 p-4 text-2xl text-red-600 dark:text-red-400">
                  ✓
                </div>
              </div>
              <p className="mt-6 text-slate-600 dark:text-slate-400">
                Verify attendance authenticity and manage records.
              </p>
            </Link>
          )}

          {/* Admin - All Attendance */}
          {user?.role === "admin" && (
            <Link
              to="/all-attendance"
              className="group block rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-sm transition hover:-translate-y-1 hover:border-teal-300 dark:hover:border-teal-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
                    Admin
                  </p>
                  <h2 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">
                    All Attendance
                  </h2>
                </div>
                <div className="rounded-2xl bg-teal-50 dark:bg-teal-900 p-4 text-2xl text-teal-600 dark:text-teal-400">
                  📋
                </div>
              </div>
              <p className="mt-6 text-slate-600 dark:text-slate-400">
                Monitor system-wide attendance across all users.
              </p>
            </Link>
          )}

          {/* Admin - Users Management */}
          {user?.role === "admin" && (
            <Link
              to="/users"
              className="group block rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-sm transition hover:-translate-y-1 hover:border-indigo-300 dark:hover:border-indigo-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                    Admin
                  </p>
                  <h2 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">
                    Users
                  </h2>
                </div>
                <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-900 p-4 text-2xl text-indigo-600 dark:text-indigo-400">
                  👨‍💼
                </div>
              </div>
              <p className="mt-6 text-slate-600 dark:text-slate-400">
                Manage all system users and roles.
              </p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
