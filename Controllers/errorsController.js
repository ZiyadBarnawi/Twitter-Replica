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
    }
    // Mongo Duplicate key error
    else {
      if (err?.code == 11000) {
        return res
          .status(400)
          .json({ status: "error", message: "Duplicate keys error: Can't insert duplicate keys" });
      }

      //Mongoose validation errors
      else if (err.errors) {
        let message = "Validation Error! ";
        for (let propName in err.errors) {
          message += `💥 ${propName}: ${err.errors[propName].message}. `;
        }

        return res.status(400).json({
          status: "error",
          message: message,
        });
      }
      // JWT error
      else if (err?.name === "JsonWebTokenError") {
        return res.status(400).json({ status: "error", message: "Invalid web token" });
      }
      res.status(500).json({
        status: "error",
        message: "An unexpected internal error has occurred",
      });
    }
  }
};
