import { OperationalErrors } from "../Utils/operationalErrors.js";
export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      next(
        new OperationalErrors(err.message, 500, { kind: err?.errors?.content?.kind || err?.kind })
      );
    });
  };
};
