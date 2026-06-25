import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import logger from "../utils/logger.js";

const createToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

export const signup = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    if (!name || !email || !password) {
      logger.warn(`Signup attempt with missing fields: ${email}`);
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn(`Signup attempt with existing email: ${email}`);
      return res.status(400).json({
        success: false,
        message: "Email already registered.",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "employee",
      department,
    });

    const token = createToken(user._id);
    logger.info(`User signed up: ${email} with role employee`);

    return res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    logger.error(`Signup error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create account.",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      logger.warn(`Login attempt with missing credentials`);
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Login attempt with non-existent email: ${email}`);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      logger.warn(`Login attempt with wrong password: ${email}`);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    const token = createToken(user._id);
    logger.info(`User logged in: ${email}`);

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
      token,
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message || "Login failed.",
    });
  }
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user?._id).select("-password");
    if (!user) {
      logger.warn(`Me endpoint called with invalid user`);
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    logger.info(`User profile fetched: ${user.email}`);
    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    logger.error(`Me error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user.",
    });
  }
};
