import { useState } from "react";
import Layout from "../components/common/Layout.jsx";
import { useGetAllAttendanceQuery } from "../features/attendance/attendanceApi.js";

const AdminAttendancePage = () => {
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { data, isLoading, error } = useGetAllAttendanceQuery({
    page,
    limit: 10,
    startDate,
    endDate,
  });

  if (isLoading) {
    return (
      <Layout title="All Attendance">
        <p>Loading...</p>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="All Attendance">
        <p className="text-red-600">
          {error?.data?.message || "Failed to load attendance"}
        </p>
      </Layout>
    );
  }

  const records = data?.data || [];

  return (
    <Layout title="All Attendance">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
          System-Wide Attendance
        </h1>

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
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-700">
                <th className="p-2 border dark:border-slate-600 text-left">Name</th>
                <th className="p-2 border dark:border-slate-600 text-left">Role</th>
                <th className="p-2 border dark:border-slate-600 text-left">Punch In</th>
                <th className="p-2 border dark:border-slate-600 text-left">Punch Out</th>
                <th className="p-2 border dark:border-slate-600 text-left">Hours</th>
                <th className="p-2 border dark:border-slate-600 text-left">Status</th>
                <th className="p-2 border dark:border-slate-600 text-left">Validation</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record._id}>
                  <td className="p-2 border dark:border-slate-600 dark:text-white">
                    {record.user?.name}
                  </td>
                  <td className="p-2 border dark:border-slate-600 dark:text-white capitalize">
                    {record.user?.role}
                  </td>
                  <td className="p-2 border dark:border-slate-600 dark:text-white">
                    {record.punchIn
                      ? new Date(record.punchIn).toLocaleString()
                      : "—"}
                  </td>
                  <td className="p-2 border dark:border-slate-600 dark:text-white">
                    {record.punchOut
                      ? new Date(record.punchOut).toLocaleString()
                      : "—"}
                  </td>
                  <td className="p-2 border dark:border-slate-600 dark:text-white">
                    {record.totalHours?.toFixed(2) || "0.00"}
                  </td>
                  <td className="p-2 border dark:border-slate-600">
                    <span
                      className={
                        record.hoursStatus === "Completed"
                          ? "text-green-600"
                          : "text-amber-600"
                      }>
                      {record.hoursStatus ||
                        ((record.totalHours || 0) >= 8
                          ? "Completed"
                          : "Incomplete")}
                    </span>
                  </td>
                  <td className="p-2 border dark:border-slate-600 dark:text-white capitalize">
                    {record.validationStatus}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-center items-center gap-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="px-3 py-1 border rounded-lg disabled:opacity-50 dark:text-white">
            Prev
          </button>
          <span className="dark:text-white">
            Page {page} / {data?.pagination?.pages || 1}
          </span>
          <button
            onClick={() =>
              setPage(Math.min(data?.pagination?.pages || 1, page + 1))
            }
            disabled={page >= (data?.pagination?.pages || 1)}
            className="px-3 py-1 border rounded-lg disabled:opacity-50 dark:text-white">
            Next
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default AdminAttendancePage;
