import dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import logger from "./utils/logger.js";
import authRoutes from "./routes/authRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Morgan logging
app.use(
  morgan((tokens, req, res) => {
    const log = `${tokens.method(req, res)} ${tokens.url(req, res)} ${tokens.status(
      req,
      res,
    )} - ${tokens.res(req, res, "content-length")} - ${tokens["response-time"](
      req,
      res,
    )}ms`;
    logger.info(log);
    return log;
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/users", userRoutes);

app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server error",
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;

mongoose
  .connect(MONGO_URL)
  .then(() => {
    logger.info("MongoDB connected");
    app.listen(PORT, () => {
      logger.info(`Server listening on ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error(`MongoDB connection failed: ${err.message}`);
    process.exit(1);
  });
