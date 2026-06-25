import Attendance from "../models/Attendance.js";
import User from "../models/User.js";
import logger from "../utils/logger.js";
import { getHoursStatus } from "../constants.js";

const applyDateFilter = (query, startDate, endDate) => {
  if (!startDate && !endDate) return;

  query.punchIn = {};

  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    query.punchIn.$gte = start;
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    query.punchIn.$lte = end;
  }
};

export const dailyReport = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;
    const query = {};

    if (req.user.role === "manager") {
      const employeeIds = await User.find({ role: "employee" }).distinct("_id");
      query.user = { $in: employeeIds };
    }

    if (userId) query.user = userId;
    applyDateFilter(query, startDate, endDate);

    const records = await Attendance.find(query)
      .populate("user", "name email role department")
      .sort({ punchIn: -1 })
      .lean();

    const report = records.map((item) => ({
      _id: item._id,
      userName: item.user?.name,
      email: item.user?.email,
      role: item.user?.role,
      department: item.user?.department,
      punchIn: item.punchIn,
      punchOut: item.punchOut,
      totalHours: item.totalHours,
      hoursStatus: getHoursStatus(item.totalHours || 0),
      status: item.status,
      validationStatus: item.validationStatus,
      overtimeStatus: item.overtimeStatus,
      overtimeHours: item.overtimeHours,
      location: item.location,
      selfie: item.selfie,
      selfieOut: item.selfieOut,
      punchInNote: item.punchInNote,
      punchOutNote: item.punchOutNote,
      remarks: item.remarks,
    }));

    logger.info(`Daily report generated: ${records.length} records`);

    res.json({
      success: true,
      data: report,
      total: records.length,
    });
  } catch (error) {
    logger.error(`Daily report error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate report",
    });
  }
};

export const employeeReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;
    const query = { user: userId };

    applyDateFilter(query, startDate, endDate);
    const records = await Attendance.find(query)
      .populate("user", "name email")
      .sort({ punchIn: -1 })
      .lean();

    logger.info(`Employee report generated for user ${userId}`);

    res.json({
      success: true,
      data: records,
      total: records.length,
    });
  } catch (error) {
    logger.error(`Employee report error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate employee report",
    });
  }
};
