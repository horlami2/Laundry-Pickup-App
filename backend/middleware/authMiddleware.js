import jwt from "jsonwebtoken";
import User from "../models/user.js";
import AppError from "../utils/AppError.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return next(
        new AppError("You are not authenticated. Please log in.", 401),
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError("User no longer exists", 401));
    }

    if (!user.isActive) {
      return next(new AppError("Your account has been deactivated", 403));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError("You are not authorized to perform this action", 403),
      );
    }

    next();
  };
};
