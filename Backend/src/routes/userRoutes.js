import express from "express";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import {
  getAllUsers,
  updateUserRole,
  createUser,
} from "../controllers/userController.js";

const router = express.Router();

router.use(protect, restrictTo("admin"));

router.get("/", getAllUsers);
router.post("/", createUser);
router.put("/:id", updateUserRole);

export default router;
