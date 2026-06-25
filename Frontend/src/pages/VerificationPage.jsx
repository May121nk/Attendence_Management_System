import { useState } from "react";
import Layout from "../components/common/Layout.jsx";
import {
  useGetUnverifiedRecordsQuery,
  useVerifyAttendanceMutation,
} from "../features/attendance/attendanceApi.js";

const VerificationPage = () => {
  const [page, setPage] = useState(1);
  const [remarks, setRemarks] = useState({});
  const { data, isLoading, refetch } = useGetUnverifiedRecordsQuery({
    page,
    limit: 5,
  });
  const [verifyAttendance, { isLoading: isVerifying }] =
    useVerifyAttendanceMutation();

  const handleVerify = async (id, validationStatus) => {
    try {
      await verifyAttendance({
        id,
        validationStatus,
        remarks: remarks[id] || "",
      }).unwrap();
      refetch();
    } catch (error) {
      alert(error?.data?.message || "Verification failed");
    }
  };

  if (isLoading) {
    return (
      <Layout title="Verification">
        <p>Loading records...</p>
      </Layout>
    );
  }

  const records = data?.data || [];

  return (
    <Layout title="Verification">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Attendance Verification
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Review employee selfies and mark attendance as valid or invalid.
        </p>

        {records.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center">
            <p className="text-slate-500">No unverified records.</p>
          </div>
        ) : (
          records.map((record) => (
            <div
              key={record._id}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg dark:text-white">
                    {record.user?.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {record.user?.email}
                  </p>
                  <div className="mt-3 space-y-1 text-sm dark:text-slate-300">
                    <p>
                      Punch In:{" "}
                      {record.punchIn
                        ? new Date(record.punchIn).toLocaleString()
                        : "—"}
                    </p>
                    <p>
                      Punch Out:{" "}
                      {record.punchOut
                        ? new Date(record.punchOut).toLocaleString()
                        : "—"}
                    </p>
                    <p>Hours: {record.totalHours?.toFixed(2) || "0.00"}</p>
                    <p>
                      Location:{" "}
                      {record.location
                        ? `${record.location.lat}, ${record.location.lng}`
                        : "N/A"}
                    </p>
                  </div>
                  <textarea
                    className="mt-4 w-full p-2 border rounded-lg dark:bg-slate-700 dark:text-white dark:border-slate-600"
                    placeholder="Add remarks or notes..."
                    value={remarks[record._id] || ""}
                    onChange={(e) =>
                      setRemarks({ ...remarks, [record._id]: e.target.value })
                    }
                    rows={2}
                  />
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleVerify(record._id, "valid")}
                      disabled={isVerifying}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                      Mark Valid
                    </button>
                    <button
                      onClick={() => handleVerify(record._id, "invalid")}
                      disabled={isVerifying}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                      Mark Invalid
                    </button>
                  </div>
                </div>
                <div className="flex gap-4">
                  {record.selfie && (
                    <div>
                      <p className="text-xs font-semibold mb-1 dark:text-white">
                        Punch In Selfie
                      </p>
                      <img
                        src={record.selfie}
                        alt="Punch in selfie"
                        className="w-40 h-40 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  {record.selfieOut && (
                    <div>
                      <p className="text-xs font-semibold mb-1 dark:text-white">
                        Punch Out Selfie
                      </p>
                      <img
                        src={record.selfieOut}
                        alt="Punch out selfie"
                        className="w-40 h-40 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {records.length > 0 && (
          <div className="flex justify-center items-center gap-4">
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

export default VerificationPage;
