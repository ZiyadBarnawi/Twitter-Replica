export class OperationalErrors extends Error {
  constructor(message, statusCode, options = { kind: null }) {
    super(message);
    this.statusCode = statusCode || 500;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    switch (options.kind) {
      case "ObjectId":
        this.message = "Invalid ID";
        break;
      case "_id":
        this.message = "Invalid ID";
        break;
      case "minlength":
        this.message = "The minimum length was not meet";
        break;
      case "maxlength":
        this.message = "The maximum length was exceeded";
        break;
    }
    Error.captureStackTrace(this, this.constructor);
  }
}
