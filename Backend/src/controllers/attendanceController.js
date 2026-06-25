import Attendance from "../models/Attendance.js";
import User from "../models/User.js";
import logger from "../utils/logger.js";
import { STANDARD_SHIFT_HOURS, getHoursStatus } from "../constants.js";

const enrichRecord = (record) => {
  const obj = record.toObject ? record.toObject() : record;
  return {
    ...obj,
    hoursStatus: getHoursStatus(obj.totalHours || 0),
  };
};

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

export const punchIn = async (req, res) => {
  try {
    const { selfie, location, punchInNote, note } = req.body;
    const userId = req.user._id;

    if (!selfie) {
      return res.status(400).json({
        success: false,
        message: "Selfie is required for punch in.",
      });
    }

    if (!location?.lat || !location?.lng) {
      return res.status(400).json({
        success: false,
        message: "Location (latitude and longitude) is required.",
      });
    }

    const openRecord = await Attendance.findOne({
      user: userId,
      punchOut: null,
    });

    if (openRecord) {
      return res.status(400).json({
        success: false,
        message:
          "You already have an open attendance session. Punch out first.",
      });
    }

    const attendance = await Attendance.create({
      user: userId,
      punchIn: new Date(),
      selfie,
      location,
      punchInNote: punchInNote || note,
      status: "pending",
    });

    logger.info(`User ${userId} punched in`);

    res.status(201).json({
      success: true,
      message: "Punch in successful",
      data: enrichRecord(attendance),
    });
  } catch (error) {
    logger.error(`Punch in error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message || "Punch in failed",
    });
  }
};

export const punchOut = async (req, res) => {
  console.log("BODY RECEIVED:", req.body);
  try {
    const { selfie, location, punchOutNote, note } = req.body;
    const userId = req.user._id;
    console.log("BODY RECEIVED:", req.body);

    if (!selfie) {
      return res.status(400).json({
        success: false,
        message: "Selfie is required for punch out.",
      });
    }

    if (!location?.lat || !location?.lng) {
      return res.status(400).json({
        success: false,
        message: "Location (latitude and longitude) is required.",
      });
    }

    const attendance = await Attendance.findOne({
      user: userId,
      punchOut: null,
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "No open attendance record found",
      });
    }

    attendance.punchOut = new Date();
    attendance.selfieOut = selfie;
    attendance.locationOut = location;
    attendance.punchOutNote = punchOutNote || note;
    attendance.totalHours =
      (attendance.punchOut - attendance.punchIn) / (1000 * 60 * 60);
    attendance.status =
      attendance.totalHours >= STANDARD_SHIFT_HOURS
        ? "completed"
        : "incomplete";
    await attendance.save();

    logger.info(
      `User ${userId} punched out - ${attendance.totalHours.toFixed(2)}h`,
    );

    res.json({
      success: true,
      message: "Punch out successful",
      data: enrichRecord(attendance),
    });
  } catch (error) {
    logger.error(`Punch out error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message || "Punch out failed",
    });
  }
};

export const getMyAttendance = async (req, res) => {
  try {
    const userId = req.user._id;
    const query = { user: userId };
    const { page = 1, limit = 5, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    applyDateFilter(query, startDate, endDate);

    const records = await Attendance.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ punchIn: -1 });

    const total = await Attendance.countDocuments(query);

    res.json({
      success: true,
      data: records.map(enrichRecord),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error(`Get my attendance error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch attendance",
    });
  }
};

export const getTeamAttendance = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, userId } = req.query;
    const skip = (page - 1) * limit;

    const employeeIds = await User.find({ role: "employee" }).distinct("_id");

    const query = { user: { $in: employeeIds } };
    if (userId) query.user = userId;
    applyDateFilter(query, startDate, endDate);

    const records = await Attendance.find(query)
      .populate("user", "name email department")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ punchIn: -1 });

    const total = await Attendance.countDocuments(query);

    res.json({
      success: true,
      data: records.map(enrichRecord),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error(`Get team attendance error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch team attendance",
    });
  }
};

export const getAllAttendance = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      status,
      userId,
    } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (userId) query.user = userId;
    if (status) query.validationStatus = status;

    applyDateFilter(query, startDate, endDate);

    const records = await Attendance.find(query)
      .populate("user", "name email role department")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ punchIn: -1 });

    const total = await Attendance.countDocuments(query);

    res.json({
      success: true,
      data: records.map(enrichRecord),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error(`Get all attendance error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch all attendance",
    });
  }
};

export const requestOvertime = async (req, res) => {
  try {
    const { id, overtimeHours, reason } = req.body;

    if (!id || !overtimeHours || !reason) {
      return res.status(400).json({
        success: false,
        message: "Attendance record, overtime hours, and reason are required.",
      });
    }

    const attendance = await Attendance.findOne({
      _id: id,
      user: req.user._id,
      punchOut: { $ne: null },
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Completed attendance record not found.",
      });
    }

    if (attendance.overtimeStatus === "pending") {
      return res.status(400).json({
        success: false,
        message: "Overtime request already pending for this record.",
      });
    }

    attendance.overtimeRequested = true;
    attendance.overtimeHours = overtimeHours;
    attendance.overtimeStatus = "pending";
    attendance.overtimeRemarks = reason;
    await attendance.save();

    logger.info(`Overtime requested by ${req.user._id} for record ${id}`);

    res.json({ success: true, data: enrichRecord(attendance) });
  } catch (error) {
    logger.error(`Request overtime error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveOvertime = async (req, res) => {
  try {
    const { id } = req.params;
    const { overtimeStatus } = req.body;

    if (!["approved", "rejected"].includes(overtimeStatus)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected.",
      });
    }

    const attendance = await Attendance.findById(id);

    if (!attendance || attendance.overtimeStatus !== "pending") {
      return res.status(404).json({
        success: false,
        message: "Pending overtime request not found.",
      });
    }

    attendance.overtimeStatus = overtimeStatus;
    attendance.approvedBy = req.user._id;
    attendance.approvalDate = new Date();
    await attendance.save();

    logger.info(
      `Overtime ${overtimeStatus} by ${req.user._id} for record ${id}`,
    );

    res.json({ success: true, data: enrichRecord(attendance) });
  } catch (error) {
    logger.error(`Approve overtime error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingOvertime = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const records = await Attendance.find({ overtimeStatus: "pending" })
      .populate("user", "name email department")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ punchIn: -1 });

    const total = await Attendance.countDocuments({
      overtimeStatus: "pending",
    });

    res.json({
      success: true,
      data: records.map(enrichRecord),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error(`Get pending overtime error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { validationStatus, remarks } = req.body;

    if (!["valid", "invalid"].includes(validationStatus)) {
      return res.status(400).json({
        success: false,
        message: "Validation status must be valid or invalid.",
      });
    }

    const attendance = await Attendance.findByIdAndUpdate(
      id,
      {
        validationStatus,
        remarks,
        approvedBy: req.user._id,
        approvalDate: new Date(),
      },
      { new: true },
    ).populate("user", "name email");

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found.",
      });
    }

    logger.info(
      `Attendance ${id} marked ${validationStatus} by ${req.user._id}`,
    );

    res.json({ success: true, data: enrichRecord(attendance) });
  } catch (error) {
    logger.error(`Verify attendance error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingVerification = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const records = await Attendance.find({ validationStatus: "unverified" })
      .populate("user", "name email department")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ punchIn: -1 });

    const total = await Attendance.countDocuments({
      validationStatus: "unverified",
    });

    res.json({
      success: true,
      data: records.map(enrichRecord),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error(`Get pending verification error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};
