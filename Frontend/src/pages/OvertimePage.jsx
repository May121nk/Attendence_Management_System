import { useState } from "react";
import { useSelector } from "react-redux";
import Layout from "../components/common/Layout.jsx";
import {
  useGetMyAttendanceQuery,
  useRequestOvertimeMutation,
  useGetPendingOvertimeRequestsQuery,
  useApproveOvertimeMutation,
} from "../features/attendance/attendanceApi.js";

const OvertimePage = () => {
  const { user } = useSelector((state) => state.auth);
  const isEmployee = user?.role === "employee";

  if (isEmployee) {
    return <EmployeeOvertime />;
  }

  return <ManagerOvertime />;
};

const EmployeeOvertime = () => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [overtimeHours, setOvertimeHours] = useState(1);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [requestOvertime, { isLoading }] = useRequestOvertimeMutation();
  const { data } = useGetMyAttendanceQuery({ page: 1, limit: 20 });

  const completedRecords =
    data?.data?.filter((r) => r.punchOut && r.overtimeStatus !== "pending") ||
    [];

  const handleRequest = async () => {
    if (!selectedRecord) {
      setMessage("Please select an attendance record.");
      return;
    }
    if (!reason.trim()) {
      setMessage("Please provide a reason.");
      return;
    }
    try {
      await requestOvertime({
        id: selectedRecord._id,
        overtimeHours,
        reason,
      }).unwrap();
      setMessage("Overtime request submitted successfully!");
      setSelectedRecord(null);
      setReason("");
      setOvertimeHours(1);
    } catch (error) {
      setMessage(error?.data?.message || "Request failed.");
    }
  };

  return (
    <Layout title="Overtime">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold mb-4 dark:text-white">
          Request Overtime
        </h1>

        {message && (
          <p className="mb-4 p-3 rounded-lg bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-100 text-sm">
            {message}
          </p>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-semibold mb-3 dark:text-white">
              Completed Attendance
            </h2>
            {completedRecords.length === 0 ? (
              <p className="text-slate-500">No eligible records.</p>
            ) : (
              completedRecords.map((record) => (
                <button
                  key={record._id}
                  type="button"
                  onClick={() => setSelectedRecord(record)}
                  className={`w-full text-left p-3 mb-2 border rounded-lg ${
                    selectedRecord?._id === record._id
                      ? "bg-blue-600 text-white border-blue-600"
                      : "dark:bg-slate-700 dark:text-white dark:border-slate-600"
                  }`}>
                  {new Date(record.punchIn).toLocaleDateString()} —{" "}
                  {record.totalHours?.toFixed(2)} hrs
                  {record.overtimeStatus !== "none" && (
                    <span className="ml-2 text-xs capitalize">
                      ({record.overtimeStatus})
                    </span>
                  )}
                </button>
              ))
            )}
          </div>

          <div>
            {selectedRecord ? (
              <div className="space-y-4">
                <p className="dark:text-white">
                  <strong>Date:</strong>{" "}
                  {new Date(selectedRecord.punchIn).toLocaleDateString()}
                </p>
                <p className="dark:text-white">
                  <strong>Hours Worked:</strong>{" "}
                  {selectedRecord.totalHours?.toFixed(2)}
                </p>
                <div>
                  <label className="block text-sm font-semibold mb-1 dark:text-white">
                    Overtime Hours
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={overtimeHours}
                    onChange={(e) =>
                      setOvertimeHours(parseFloat(e.target.value))
                    }
                    className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:text-white dark:border-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 dark:text-white">
                    Reason
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:text-white dark:border-slate-600"
                    rows={4}
                  />
                </div>
                <button
                  onClick={handleRequest}
                  disabled={isLoading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50">
                  {isLoading ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            ) : (
              <p className="text-slate-500">
                Select a completed attendance record to request overtime.
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

const ManagerOvertime = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch } = useGetPendingOvertimeRequestsQuery({
    page,
    limit: 5,
  });
  const [approveOvertime, { isLoading: isApproving }] =
    useApproveOvertimeMutation();

  const handleAction = async (id, overtimeStatus) => {
    try {
      await approveOvertime({ id, overtimeStatus }).unwrap();
      refetch();
    } catch (error) {
      alert(error?.data?.message || "Action failed");
    }
  };

  if (isLoading) {
    return (
      <Layout title="Overtime">
        <p>Loading pending requests...</p>
      </Layout>
    );
  }

  const records = data?.data || [];

  return (
    <Layout title="Overtime">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold mb-4 dark:text-white">
          Pending Overtime Requests
        </h1>

        {records.length === 0 ? (
          <p className="text-slate-500">No pending overtime requests.</p>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div
                key={record._id}
                className="p-4 border rounded-xl dark:border-slate-600">
                <p className="font-semibold dark:text-white">
                  {record.user?.name}
                </p>
                <p className="text-sm text-slate-500">
                  {new Date(record.punchIn).toLocaleDateString()} —{" "}
                  {record.overtimeHours} OT hours requested
                </p>
                <p className="text-sm mt-1 dark:text-slate-300">
                  Reason: {record.overtimeRemarks}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleAction(record._id, "approved")}
                    disabled={isApproving}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50">
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(record._id, "rejected")}
                    disabled={isApproving}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {records.length > 0 && (
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
        )}
      </div>
    </Layout>
  );
};

export default OvertimePage;
