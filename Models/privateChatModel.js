const mongoose = require("mongoose");

const privateChatSchema = mongoose.Schema({
  chatName: String,
  members: [{ userId: Number, username: String, accountName: String }],
  messageId: [{ messageId: Number }],
});
const Users = mongoose.model("private_chat", privateChat);
module.exports = Users;
