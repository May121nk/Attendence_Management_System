import { useState } from "react";
import { useSelector } from "react-redux";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import Layout from "../components/common/Layout.jsx";
import { useGetMyAttendanceQuery } from "../features/attendance/attendanceApi.js";
import { useDailyReportQuery } from "../features/report/reportApi.js";

const getHoursStatus = (hours) =>
  (hours || 0) >= 8 ? "Completed" : "Incomplete";

export default function ReportsPage() {
  const { user } = useSelector((state) => state.auth);
  const isManagerOrAdmin = user?.role === "manager" || user?.role === "admin";
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const employeeQuery = useGetMyAttendanceQuery(
    { page, limit: 10, startDate, endDate },
    { skip: isManagerOrAdmin },
  );

  const managerQuery = useDailyReportQuery(
    { startDate, endDate },
    { skip: !isManagerOrAdmin },
  );

  const { data, isLoading, error } = isManagerOrAdmin
    ? managerQuery
    : employeeQuery;

  const records = isManagerOrAdmin ? data?.data || [] : data?.data || [];

  const handleExportPDF = () => {
    if (!records.length) {
      alert("No data to export");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Attendance Report", 14, 15);

    const tableData = records.map((r) => [
      r.userName || r.user?.name || user?.name || "",
      r.punchIn ? new Date(r.punchIn).toLocaleDateString() : "",
      r.punchIn ? new Date(r.punchIn).toLocaleTimeString() : "",
      r.punchOut ? new Date(r.punchOut).toLocaleTimeString() : "-",
      typeof r.totalHours === "number" ? r.totalHours.toFixed(2) : "0.00",
      r.hoursStatus || getHoursStatus(r.totalHours),
      r.validationStatus || "—",
      r.location
        ? `${r.location.lat?.toFixed(4)}, ${r.location.lng?.toFixed(4)}`
        : "N/A",
    ]);

    autoTable(doc, {
      head: [
        [
          "Name",
          "Date",
          "Punch In",
          "Punch Out",
          "Hours",
          "Status",
          "Validation",
          "Location",
        ],
      ],
      body: tableData,
      startY: 25,
      styles: {
        fontSize: 8,
      },
      headStyles: {
        fillColor: [41, 128, 185],
      },
    });

    doc.save("attendance_report.pdf");
  };

  const handleExportExcel = () => {
    if (!records.length) {
      alert("No data to export");
      return;
    }

    const header = [
      "Name",
      "Date",
      "Punch In",
      "Punch Out",
      "Hours",
      "Status",
      "Validation",
      "Location",
      "OT Status",
    ];

    const rows = records.map((r) => [
      r.userName || r.user?.name || user?.name || "",
      r.punchIn ? new Date(r.punchIn).toLocaleDateString() : "",
      r.punchIn ? new Date(r.punchIn).toLocaleString() : "",
      r.punchOut ? new Date(r.punchOut).toLocaleString() : "",
      typeof r.totalHours === "number" ? r.totalHours.toFixed(2) : "0.00",
      r.hoursStatus || getHoursStatus(r.totalHours),
      r.validationStatus || "—",
      r.location ? `${r.location.lat}, ${r.location.lng}` : "N/A",
      r.overtimeStatus || "none",
    ]);

    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, "attendance_report.xlsx");
  };

  return (
    <Layout title="Reports">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
              {isManagerOrAdmin
                ? "Daily Attendance Report"
                : "My Attendance Report"}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Standard shift: 8 hours — Completed (≥8h) / Incomplete (&lt;8h)
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportPDF}
              className="
      inline-flex items-center gap-2
      rounded-xl
      bg-red-600
      px-5 py-3
      text-sm font-semibold text-white
      transition
      hover:bg-red-700
      shadow-sm
    ">
              📄 Export PDF
            </button>

            <button
              onClick={handleExportExcel}
              className="
      inline-flex items-center gap-2
      rounded-xl
      bg-green-600
      px-5 py-3
      text-sm font-semibold text-white
      transition
      hover:bg-green-700
      shadow-sm
    ">
              📊 Export Excel
            </button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="p-2 border rounded-lg dark:bg-slate-700 dark:text-white dark:border-slate-600"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="p-2 border rounded-lg dark:bg-slate-700 dark:text-white dark:border-slate-600"
          />
          <button
            onClick={() => {
              setStartDate("");
              setEndDate("");
              setPage(1);
            }}
            className="
    inline-flex items-center gap-2
    rounded-xl
    bg-red-600
    px-5 py-3
    text-sm font-semibold text-white
    transition
    hover:bg-red-700
    shadow-sm
  ">
            🗑️ Clear Filters
          </button>
        </div>

        {isLoading && <p>Loading reports...</p>}
        {error && (
          <p className="text-red-600">
            {error?.data?.message || "Error loading reports"}
          </p>
        )}

        {!isLoading && !error && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-700">
                    {isManagerOrAdmin && (
                      <th className="p-2 border dark:border-slate-600 text-left">
                        Name
                      </th>
                    )}
                    <th className="p-2 border dark:border-slate-600 text-left">
                      Date
                    </th>
                    <th className="p-2 border dark:border-slate-600 text-left">
                      Punch In
                    </th>
                    <th className="p-2 border dark:border-slate-600 text-left">
                      Punch Out
                    </th>
                    <th className="p-2 border dark:border-slate-600 text-left">
                      Hours
                    </th>
                    <th className="p-2 border dark:border-slate-600 text-left">
                      Status
                    </th>
                    <th className="p-2 border dark:border-slate-600 text-left">
                      Validation
                    </th>
                    <th className="p-2 border dark:border-slate-600 text-left">
                      Location
                    </th>
                    <th className="p-2 border dark:border-slate-600 text-left">
                      Selfie
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td
                        colSpan={isManagerOrAdmin ? 9 : 8}
                        className="p-4 text-center text-slate-500">
                        No attendance records found.
                      </td>
                    </tr>
                  ) : (
                    records.map((record) => (
                      <tr key={record._id}>
                        {isManagerOrAdmin && (
                          <td className="p-2 border dark:border-slate-600 dark:text-white">
                            {record.userName || record.user?.name}
                          </td>
                        )}
                        <td className="p-2 border dark:border-slate-600 dark:text-white">
                          {record.punchIn
                            ? new Date(record.punchIn).toLocaleDateString()
                            : ""}
                        </td>
                        <td className="p-2 border dark:border-slate-600 dark:text-white">
                          {record.punchIn
                            ? new Date(record.punchIn).toLocaleTimeString()
                            : ""}
                        </td>
                        <td className="p-2 border dark:border-slate-600 dark:text-white">
                          {record.punchOut
                            ? new Date(record.punchOut).toLocaleTimeString()
                            : "-"}
                        </td>
                        <td className="p-2 border dark:border-slate-600 dark:text-white">
                          {record.totalHours?.toFixed(2) || "0.00"}
                        </td>
                        <td className="p-2 border dark:border-slate-600">
                          <span
                            className={
                              (record.hoursStatus ||
                                getHoursStatus(record.totalHours)) ===
                              "Completed"
                                ? "text-green-600"
                                : "text-amber-600"
                            }>
                            {record.hoursStatus ||
                              getHoursStatus(record.totalHours)}
                          </span>
                        </td>
                        <td className="p-2 border dark:border-slate-600 dark:text-white capitalize">
                          {record.validationStatus || "—"}
                        </td>
                        <td className="p-2 border dark:border-slate-600 dark:text-white text-xs">
                          {record.location
                            ? `${record.location.lat?.toFixed(4)}, ${record.location.lng?.toFixed(4)}`
                            : "N/A"}
                        </td>
                        <td className="p-2 border dark:border-slate-600">
                          {record.selfie ? (
                            <img
                              src={record.selfie}
                              alt="selfie"
                              className="w-12 h-12 rounded object-cover"
                            />
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!isManagerOrAdmin && data?.pagination && (
              <div className="mt-4 flex justify-center items-center gap-4">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="
    inline-flex items-center gap-2
    rounded-xl
    bg-slate-800
    dark:bg-slate-700
    px-4 py-2
    text-white
    disabled:opacity-50
  ">
                  ← Prev
                </button>
                <span className="dark:text-white">
                  Page {page} / {data.pagination.pages || 1}
                </span>
                <button
                  onClick={() =>
                    setPage(Math.min(data.pagination.pages || 1, page + 1))
                  }
                  disabled={page >= (data.pagination.pages || 1)}
                  className="
    inline-flex items-center gap-2
    rounded-xl
    bg-slate-800
    dark:bg-slate-700
    px-4 py-2
    text-white
    disabled:opacity-50
  ">
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
