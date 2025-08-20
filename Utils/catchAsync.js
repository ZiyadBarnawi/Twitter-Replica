import { OperationalErrors } from "../Utils/operationalErrors.js";
export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      next(new OperationalErrors(err.message, err.statusCode || 500, err?.errors || err?.code));
    });
  };
};
