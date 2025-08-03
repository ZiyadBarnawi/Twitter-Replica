const express = require("express");

const morgan = require("morgan");
const usersRouter = require("./Routers/usersRouter");
const tweetsRouter = require("./Routers/tweetsRouter");
const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json());
app.use((req, res, next) => {
  req.requestTime = new Date().toLocaleDateString("Eng", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  next();
});
app.use(`/api/v1/users`, usersRouter);
app.use(`/api/v1/tweets`, tweetsRouter);

module.exports = app;
