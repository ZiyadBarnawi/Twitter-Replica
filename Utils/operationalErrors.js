export class OperationalErrors extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode || 500;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);

    if (errors == 11000) {
      this.message = "Duplicate keys error: Can't insert duplicate keys";
    }
  }
}
