const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const authRoutes = require("./routes/authRoutes.js");
const attendanceRoutes = require("./routes/attendanceRoutes.js");
const reportRoutes = require("./routes/reportRoutes.js");
const errorHandler = require("./middleware/errorHandler.js");

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:5173", // frontend ka URL
    ],
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/reports", reportRoutes);

app.use(errorHandler);

module.exports = app;
