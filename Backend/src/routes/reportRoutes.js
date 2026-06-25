const express = require("express");
const { dailyReport } = require("../controllers/reportController.js");
const authMiddleware = require("../middleware/authMiddleware.js");
const roleMiddleware = require("../middleware/roleMiddleware.js");

const router = express.Router();

router.use(authMiddleware);
router.get(
  "/daily",
  roleMiddleware(["employee", "manager", "admin"]),
  dailyReport,
);

module.exports = router;
