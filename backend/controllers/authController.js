import bcrypt from "bcryptjs";
import User from "../models/user.js";
import AppError from "../utils/AppError.js";
import generateToken from "../utils/generateToken.js";

// REGISTER
export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    //const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return next(new AppError("A user with this email already exists", 409));
    }
    // Hash password before saving
    const hashPassword = await bcrypt.hash(password, 12);
    // IMPORTANT:
    // We do NOT accept role from req.body.
    const user = await User.create({
      name,
      email,
      phone,
      password: hashPassword,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// LOGIN
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //const normalizedEmail = email.toLowerCase().trim();

    // Password is select:false, so explicitly include it
    const user = await User.findOne({
      email,
    }).select("+password");

    if (!user) {
      return next(new AppError("Invalid email or password", 401));
    }

    if (!user.isActive) {
      return next(new AppError("Your account has been deactivated", 403));
    }

    const passwordIsCorrect = await bcrypt.compare(password, user.password);

    if (!passwordIsCorrect) {
      return next(new AppError("Invalid email or password", 401));
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET CURRENT USER
export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};
