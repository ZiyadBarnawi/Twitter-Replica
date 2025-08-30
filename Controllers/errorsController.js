export const globalErrorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    res.status(err.statusCode || 500).json({
      status: err.status,
      message: err.message ?? "An unexpected error has occurred",
      stackTrace: err.stack,
      error: err,
    });
  } else if (process.env.NODE_ENV === "production") {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message ?? "An unexpected error has occurred",
      });
    } else {
      res.status(500).json({
        status: "error",
        message: "An unexpected internal error has occurred",
      });
    }
  }
};
