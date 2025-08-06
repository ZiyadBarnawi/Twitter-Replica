const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: "./config.env" });
let app = require("./app");
try {
  mongoose.connect(process.env.LOCAL_DATABASE).then((con) => {
    if (con.connection.readyState == 1) {
      console.log("Connected to the database!🔗");
    } else {
    }
  });
} catch (err) {
  console.log("Check the database state!🚨");
}
app.listen(process.env.PORT, "127.0.0.1", () => {
  console.log("Listening on port 8080📞...");
});
