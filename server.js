import { mongoose } from "mongoose";
import { app } from "./app.js";
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("unhandled Rejection💥 shitting down");
  server.close(() => {
    process.exit(1);
  });
});
process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log(`unhandled Exception💥 shitting down`);
  process.exit(1);
});

mongoose.connect(process.env.HOSTED_DATABASE).then((con) => {
  if (con.connection.readyState == 1) {
    console.log("Connected to the database!🔗");
  } else {
    console.log("The database is not Connected!⛓️‍💥");
  }
});
const server = app.listen(process.env.PORT, "127.0.0.1", () => {
  console.log("Listening on port 8080📞...");
});
