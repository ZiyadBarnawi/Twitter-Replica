const mongoose = require("mongoose");

const privateMessage = mongoose.Schema({
  senderId: Number,
  content: String,
  assets: String,
  referenceMessageId: String,
  createdAt: { type: Date, default: Date.now() },
});
const PrivateMessages = mongoose.model("privateMessages", privateMessage);
module.exports = PrivateMessages;
