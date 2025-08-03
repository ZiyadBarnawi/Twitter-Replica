const mongoose = require("mongoose");

const privateChat = mongoose.Schema({
  chatName: String,
  members: [{ userId: Number, username: String, accountName: String }],
  messageId: [{ messageId: Number }],
});
const Users = mongoose.model("Users", privateChat);
module.exports = Users;
