import {
  useGetMyAttendanceQuery,
  useRequestOvertimeMutation,
} from "../features/attendance/attendanceApi.js";
import { useState } from "react";

export default function OvertimeRequestPage() {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [overtimeHours, setOvertimeHours] = useState(1);
  const [reason, setReason] = useState("");
  const [requestOvertime] = useRequestOvertimeMutation();
  const { data } = useGetMyAttendanceQuery({ page: 1, limit: 10 });

  const handleRequestOvertime = async () => {
    if (!selectedRecord) return alert("Select a record");
    try {
      await requestOvertime({
        id: selectedRecord._id,
        overtimeHours,
        reason,
      }).unwrap();
      alert("Overtime requested!");
      setSelectedRecord(null);
      setReason("");
      setOvertimeHours(1);
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Request Overtime</h1>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-bold mb-4">My Attendance Records</h2>
          {data?.data?.map((record) => (
            <div
              key={record._id}
              onClick={() => setSelectedRecord(record)}
              className={`p-3 mb-2 border rounded cursor-pointer ${
                selectedRecord?._id === record._id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100"
              }`}>
              {new Date(record.punchIn).toLocaleDateString()} -{" "}
              {record.totalHours?.toFixed(2)} hrs
            </div>
          ))}
        </div>

        <div className="border-l pl-4">
          {selectedRecord ? (
            <div>
              <h3 className="text-lg font-bold mb-4">Request Details</h3>
              <p className="mb-2">
                <strong>Date:</strong>{" "}
                {new Date(selectedRecord.punchIn).toLocaleDateString()}
              </p>
              <p className="mb-4">
                <strong>Hours Worked:</strong>{" "}
                {selectedRecord.totalHours?.toFixed(2)}
              </p>

              <div className="mb-4">
                <label className="block mb-2">
                  <strong>Overtime Hours:</strong>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={overtimeHours}
                    onChange={(e) =>
                      setOvertimeHours(parseFloat(e.target.value))
                    }
                    className="w-full p-2 border rounded mt-1"
                  />
                </label>
              </div>

              <div className="mb-4">
                <label className="block mb-2">
                  <strong>Reason:</strong>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full p-2 border rounded mt-1"
                    rows="4"
                  />
                </label>
              </div>

              <button
                onClick={handleRequestOvertime}
                className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                Submit Request
              </button>
            </div>
          ) : (
            <p>Select a record to request overtime</p>
          )}
        </div>
      </div>
    </div>
  );
}
