import express from "express";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import {
  punchIn,
  punchOut,
  getMyAttendance,
  getTeamAttendance,
  getAllAttendance,
  requestOvertime,
  approveOvertime,
  getPendingOvertime,
  verifyAttendance,
  getPendingVerification,
} from "../controllers/attendanceController.js";
import {
  dailyReport,
  employeeReport,
} from "../controllers/reportController.js";

const router = express.Router();

router.post("/punch-in", protect, restrictTo("employee"), punchIn);
router.post("/punch-out", protect, restrictTo("employee"), punchOut);
router.get("/my-attendance", protect, getMyAttendance);

router.get(
  "/team-attendance",
  protect,
  restrictTo("manager", "admin"),
  getTeamAttendance,
);

router.get(
  "/all-attendance",
  protect,
  restrictTo("admin"),
  getAllAttendance,
);

router.post("/overtime", protect, restrictTo("employee"), requestOvertime);

router.get(
  "/pending-overtime",
  protect,
  restrictTo("manager", "admin"),
  getPendingOvertime,
);

router.post(
  "/:id/overtime",
  protect,
  restrictTo("manager", "admin"),
  approveOvertime,
);

router.get(
  "/unverified",
  protect,
  restrictTo("manager", "admin"),
  getPendingVerification,
);

router.post(
  "/:id/verify",
  protect,
  restrictTo("manager", "admin"),
  verifyAttendance,
);

router.get(
  "/report/daily",
  protect,
  restrictTo("manager", "admin"),
  dailyReport,
);

router.get("/report/employee", protect, employeeReport);

export default router;
