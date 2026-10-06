const errorHandler = (err, req, res, next) => {
  console.error(err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  if (err.name === "MulterError") {
    statusCode = 400;
    message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Image must be no larger than 5 MB"
        : "Invalid image upload";
  } else if (message === "Only JPEG, PNG and WebP images are allowed") {
    statusCode = 400;
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    message = "A user with this email already exists";
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;

    const messages = Object.values(err.errors).map(
      (error) => error.message
    );

    message = messages.join(", ");
  }

  // Invalid MongoDB ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID";
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token has expired";
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

export default errorHandler;