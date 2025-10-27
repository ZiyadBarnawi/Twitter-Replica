import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp-clean";

import { expressMongoSanitize } from "@exortek/express-mongo-sanitize";
import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";

// import * as XssClean from "xss-clean";
import { router as usersRouter } from "./Routers/usersRouter.js";
import { router as tweetsRouter } from "./Routers/tweetsRouter.js";
import { OperationalErrors } from "./Utils/operationalErrors.js";
import { globalErrorHandler } from "./Controllers/errorsController.js";
import multer from "multer";
// dotenv.config({ path: "./config.env", quiet: true }); // Now I use node built-in --config-file flag

const app = express();
// Setting security HtTTP headers
app.use(helmet());
// app.set("trust proxy", true); // TODO: This wi ll be used once I deploy the app and solve the issue of rate limit bypassing
//TODO: use this to limit for DM message and fetching tweets once they are completely implemented
// This is a middleware function to limit the request received from one IP.

const limiter = rateLimit({
  limit: 200,
  windowMs: 60 * 60 * 100, // 1 hour
  message: "Too many request were received from this IP address. Please wait an hour.",
});

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json({ limit: "50kb" })); // to get req.body

// Sanitize user input from NoSQL Injection
app.use(expressMongoSanitize());

app.use(hpp({ whitelist: ["username", "accountName", "email", "tags", "assets"] }));

//Serves static files TODO: look for it in details later when uploading images
// app.use(express.static("./Static"));
app.use("/api", limiter); //to limit requests number
app.use(`/api/v1/users`, usersRouter);
app.use(`/api/v1/tweets`, tweetsRouter);

app.all("{*splat}", (req, res, next) => {
  next(new OperationalErrors(`The route ${req.originalUrl} was not found`, 404));
}); // Last safety net for unresolved routes

app.use(globalErrorHandler);
export { app };
