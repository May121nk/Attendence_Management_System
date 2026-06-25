import { useState, useRef, useEffect } from "react";
import {
  usePunchInMutation,
  usePunchOutMutation,
  useGetMyAttendanceQuery,
} from "../features/attendance/attendanceApi.js";
import Layout from "../components/common/Layout.jsx";

const AttendancePage = () => {
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [punchIn, { isLoading: isPunchIn }] = usePunchInMutation();
  const [punchOut, { isLoading: isPunchOut }] = usePunchOutMutation();
  const { data: attendanceData, refetch } = useGetMyAttendanceQuery({
    page: 1,
    limit: 10,
  });

  const attendance = attendanceData?.data || [];
  const openRecord = attendance.find((item) => item.punchIn && !item.punchOut);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setMessageType("success");
        setMessage("Camera started successfully.");
      }
    } catch {
      setMessageType("error");
      setMessage("Camera access denied. Please allow camera permissions.");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      setMessageType("error");
      setMessage("Camera not ready.");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    setCapturedPhoto(canvas.toDataURL("image/jpeg"));
    setMessageType("success");
    setMessage("Selfie captured successfully.");
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setMessageType("error");
      setMessage("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setMessageType("success");
        setMessage("Location captured successfully.");
      },
      (error) => {
        setMessageType("error");
        if (error.code === 1) {
          setMessage(
            "Location permission denied. Allow location access in browser settings.",
          );
        } else if (error.code === 2) {
          setMessage("Position unavailable.");
        } else {
          setMessage("Unable to obtain location.");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const handlePunchIn = async () => {
    if (!capturedPhoto || !location) {
      setMessageType("error");
      setMessage("Please capture selfie and location first.");
      return;
    }

    try {
      setMessage("");
      await punchIn({
        selfie: capturedPhoto,
        location,
        punchInNote: note,
      }).unwrap();
      setMessageType("success");
      setMessage("Punch in successful!");
      setCapturedPhoto(null);
      setLocation(null);
      setNote("");
      refetch();
    } catch (error) {
      setMessageType("error");
      setMessage(error?.data?.message || "Punch in failed.");
    }
  };

  const handlePunchOut = async () => {
    console.log("=== PUNCH OUT ===");
    console.log("capturedPhoto:", capturedPhoto);
    console.log("location:", location);
    if (!openRecord) {
      setMessageType("error");
      setMessage("No open attendance found.");
      return;
    }
    if (!capturedPhoto || !location) {
      setMessageType("error");
      setMessage("Please capture selfie and location first.");
      return;
    }

    try {
      setMessage("");
      await punchOut({
        selfie: capturedPhoto,
        location,
        punchOutNote: note,
      }).unwrap();

      const freshData = await refetch();

      console.log("AFTER REFETCH", freshData);
      setMessageType("success");
      setMessage("Punch out successful!");
      setCapturedPhoto(null);
      setLocation(null);
      setNote("");
      refetch();
    } catch (error) {
      setMessageType("error");
      setMessage(error?.data?.message || "Punch out failed.");
    }
  };

  const formatDate = (value) =>
    value ? new Date(value).toLocaleString() : "-";

  return (
    <Layout title="Attendance">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-sm">
        <h2 className="text-3xl font-semibold mb-4 text-slate-900 dark:text-white">
          Punch In / Punch Out
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Capture a live selfie and your location — file uploads are not
          allowed.
        </p>

        {openRecord && (
          <div className="mb-6 rounded-2xl border-2 border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900 p-4">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              CURRENTLY PUNCHED IN
            </p>
            <p className="text-blue-800 dark:text-blue-200">
              Punch In: {formatDate(openRecord.punchIn)}
            </p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <button
              onClick={startCamera}
              className="w-full py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-700 transition">
              Start Camera
            </button>
            <button
              onClick={capturePhoto}
              className="w-full py-3 bg-slate-700 dark:bg-slate-600 text-white rounded-xl font-semibold hover:bg-slate-800 transition">
              Capture Selfie
            </button>
            <button
              onClick={captureLocation}
              className="w-full py-3 bg-slate-700 dark:bg-slate-600 text-white rounded-xl font-semibold hover:bg-slate-800 transition">
              Get Location
            </button>

            <textarea
              className="w-full border border-slate-300 dark:border-slate-600 rounded-xl p-3 dark:bg-slate-700 dark:text-white"
              placeholder="Add any remarks or notes..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />

            {message && (
              <div
                className={`p-3 rounded-lg text-sm font-semibold ${
                  messageType === "success"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                }`}>
                {message}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handlePunchIn}
                disabled={isPunchIn || !!openRecord}
                className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:bg-slate-400 transition">
                {isPunchIn ? "Processing..." : "Punch In"}
              </button>
              <button
                onClick={handlePunchOut}
                disabled={isPunchOut || !openRecord}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:bg-slate-400 transition">
                {isPunchOut ? "Processing..." : "Punch Out"}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-700 h-64">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            <canvas ref={canvasRef} className="hidden" />

            {capturedPhoto && (
              <div className="rounded-2xl overflow-hidden border-2 border-green-300">
                <img
                  src={capturedPhoto}
                  alt="selfie"
                  className="w-full h-32 object-cover"
                />
              </div>
            )}

            {location && (
              <div className="rounded-xl border border-slate-300 dark:border-slate-600 p-3 bg-slate-50 dark:bg-slate-700">
                <p className="text-sm font-semibold dark:text-white">
                  Location Captured
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AttendancePage;
