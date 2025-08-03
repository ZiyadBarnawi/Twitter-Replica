const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: "./config.env" });
let app = require("./app");

mongoose.connect(process.env.LOCAL_DATABASE).then((con) => {
  console.log("Connected to the database!🔗");
});
app.listen(process.env.PORT, "127.0.0.1", () => {
  console.log("Listening on port 8080📞...");
});
