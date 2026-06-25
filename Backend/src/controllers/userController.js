import User from "../models/User.js";
import logger from "../utils/logger.js";

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const skip = (page - 1) * limit;
    const query = role ? { role } : {};

    const users = await User.find(query)
      .select("-password")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error(`Get all users error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch users",
    });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, department } = req.body;

    if (role && !["employee", "manager", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role.",
      });
    }

    const updates = {};
    if (role) updates.role = role;
    if (department !== undefined) updates.department = department;

    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    logger.info(`User ${id} updated by admin ${req.user._id}`);

    res.json({ success: true, data: user });
  } catch (error) {
    logger.error(`Update user error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update user",
    });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role = "employee", department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered.",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      department,
    });

    logger.info(`Admin created user: ${email} with role ${role}`);

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (error) {
    logger.error(`Create user error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create user",
    });
  }
};
