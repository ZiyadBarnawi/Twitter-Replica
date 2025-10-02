import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { router as usersRouter } from "./Routers/usersRouter.js";
import { router as tweetsRouter } from "./Routers/tweetsRouter.js";
import { OperationalErrors } from "./Utils/operationalErrors.js";
import { globalErrorHandler } from "./Controllers/errorsController.js";
dotenv.config({ path: "./config.env", quiet: true });

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json());

app.use(`/api/v1/users`, usersRouter);
app.use(`/api/v1/tweets`, tweetsRouter);

app.all("{*splat}", (req, res, next) => {
  next(new OperationalErrors(`The route ${req.originalUrl} was not found`, 404));
});

app.use(globalErrorHandler);
export { app };
