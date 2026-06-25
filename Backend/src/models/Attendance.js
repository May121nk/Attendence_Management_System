import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    punchIn: { type: Date, required: true },
    punchOut: Date,
    selfie: { type: String, required: true },
    selfieOut: String,
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: String,
    },
    locationOut: {
      lat: Number,
      lng: Number,
      address: String,
    },
    totalHours: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "completed", "incomplete"],
      default: "pending",
    },
    validationStatus: {
      type: String,
      enum: ["unverified", "valid", "invalid"],
      default: "unverified",
    },
    remarks: String,
    overtimeRequested: { type: Boolean, default: false },
    overtimeHours: { type: Number, default: 0 },
    overtimeStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
    overtimeRemarks: String,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvalDate: Date,
    punchInNote: String,
    punchOutNote: String,
  },
  { timestamps: true },
);

attendanceSchema.index({ user: 1, createdAt: -1 });
attendanceSchema.index({ validationStatus: 1 });

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
