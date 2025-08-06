const mongoose = require("mongoose");

const groupMessageSchema = mongoose.Schema({
  senderId: Number,
  content: { type: String, trim: true },
  assets: { type: String, trim: true },
  referenceMessageId: String,
  createdAt: { type: Date, default: Date.now() },
});
const GroupMessages = mongoose.model("group_message", groupMessageSchema);
module.exports = GroupMessages;
