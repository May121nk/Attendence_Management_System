import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import AttendancePage from "./pages/AttendancePage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";
import OvertimePage from "./pages/OvertimePage.jsx";
import TeamAttendancePage from "./pages/TeamAttendancePage.jsx";
import VerificationPage from "./pages/VerificationPage.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import AdminAttendancePage from "./pages/AdminAttendancePage.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";

function App() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Route>

        <Route element={<ProtectedRoute roles={["employee"]} />}>
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/overtime" element={<OvertimePage />} />
        </Route>

        <Route element={<ProtectedRoute roles={["manager", "admin"]} />}>
          <Route path="/team-attendance" element={<TeamAttendancePage />} />
          <Route path="/verification" element={<VerificationPage />} />
          <Route path="/overtime-manage" element={<OvertimePage />} />
        </Route>

        <Route element={<ProtectedRoute roles={["admin"]} />}>
          <Route path="/users" element={<UsersPage />} />
          <Route path="/all-attendance" element={<AdminAttendancePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default App;
