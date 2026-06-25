import { useState } from "react";
import Layout from "../components/common/Layout.jsx";
import { useGetTeamAttendanceQuery } from "../features/attendance/attendanceApi.js";

const TeamAttendancePage = () => {
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data, isLoading, error } = useGetTeamAttendanceQuery({
    page,
    limit: 10,
    startDate,
    endDate,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[400px]">
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            Loading team attendance...
          </p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[400px]">
          <p className="text-red-500 text-lg">
            {error?.data?.message || "Failed to load team attendance"}
          </p>
        </div>
      </Layout>
    );
  }

  const records = data?.data || [];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Team Attendance
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              View employee attendance records, working hours and overtime
              status.
            </p>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-3 items-center">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="
                px-4 py-2 rounded-lg
                border border-slate-300
                bg-white
                text-slate-900
                focus:outline-none
                focus:ring-2 focus:ring-blue-500
                dark:bg-slate-800
                dark:border-slate-600
                dark:text-white
              "
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="
                px-4 py-2 rounded-lg
                border border-slate-300
                bg-white
                text-slate-900
                focus:outline-none
                focus:ring-2 focus:ring-blue-500
                dark:bg-slate-800
                dark:border-slate-600
                dark:text-white
              "
            />

            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setPage(1);
              }}
              className="
                px-4 py-2
                rounded-lg
                bg-red-500
                text-white
                hover:bg-red-600
                transition
              ">
              Clear
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800">
                  <th className="p-3 text-left font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                    Employee
                  </th>

                  <th className="p-3 text-left font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                    Punch In
                  </th>

                  <th className="p-3 text-left font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                    Punch Out
                  </th>

                  <th className="p-3 text-left font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                    Hours
                  </th>

                  <th className="p-3 text-left font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                    Status
                  </th>

                  <th className="p-3 text-left font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                    Validation
                  </th>

                  <th className="p-3 text-left font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                    OT
                  </th>
                </tr>
              </thead>

              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-6 text-center text-slate-500 dark:text-slate-400">
                      No team attendance records found.
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr
                      key={record._id}
                      className="
                        odd:bg-white
                        even:bg-slate-50
                        dark:odd:bg-slate-900
                        dark:even:bg-slate-800
                        hover:bg-slate-100
                        dark:hover:bg-slate-700
                        transition-colors
                      ">
                      <td className="p-3 text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                        {record.user?.name || "—"}
                      </td>

                      <td className="p-3 text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                        {record.punchIn
                          ? new Date(record.punchIn).toLocaleString()
                          : "—"}
                      </td>

                      <td className="p-3 text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                        {record.punchOut
                          ? new Date(record.punchOut).toLocaleString()
                          : "—"}
                      </td>

                      <td className="p-3 text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 font-medium">
                        {record.totalHours?.toFixed(2) || "0.00"}
                      </td>

                      <td className="p-3 border-b border-slate-200 dark:border-slate-700">
                        <span
                          className={
                            record.hoursStatus === "Completed"
                              ? "text-green-500 font-medium"
                              : "text-amber-500 font-medium"
                          }>
                          {record.hoursStatus ||
                            ((record.totalHours || 0) >= 8
                              ? "Completed"
                              : "Incomplete")}
                        </span>
                      </td>

                      <td className="p-3 border-b border-slate-200 dark:border-slate-700 capitalize">
                        <span
                          className={
                            record.validationStatus === "valid"
                              ? "text-green-500"
                              : record.validationStatus === "invalid"
                                ? "text-red-500"
                                : "text-yellow-500"
                          }>
                          {record.validationStatus || "Unverified"}
                        </span>
                      </td>

                      <td className="p-3 border-b border-slate-200 dark:border-slate-700 capitalize">
                        <span
                          className={
                            record.overtimeStatus === "approved"
                              ? "text-green-500"
                              : record.overtimeStatus === "pending"
                                ? "text-yellow-500"
                                : "text-slate-500 dark:text-slate-400"
                          }>
                          {record.overtimeStatus || "None"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex justify-center items-center gap-4">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="
                px-4 py-2
                rounded-lg
                border border-slate-300
                dark:border-slate-600
                text-slate-700
                dark:text-white
                hover:bg-slate-100
                dark:hover:bg-slate-800
                disabled:opacity-50
                disabled:cursor-not-allowed
              ">
              Prev
            </button>

            <span className="font-medium text-slate-700 dark:text-white">
              Page {page} of {data?.pagination?.pages || 1}
            </span>

            <button
              onClick={() =>
                setPage(Math.min(data?.pagination?.pages || 1, page + 1))
              }
              disabled={page >= (data?.pagination?.pages || 1)}
              className="
                px-4 py-2
                rounded-lg
                border border-slate-300
                dark:border-slate-600
                text-slate-700
                dark:text-white
                hover:bg-slate-100
                dark:hover:bg-slate-800
                disabled:opacity-50
                disabled:cursor-not-allowed
              ">
              Next
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TeamAttendancePage;
