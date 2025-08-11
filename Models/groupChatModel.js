import { mongoose } from "mongoose";

const groupChatSchema = mongoose.Schema({
  chatName: String,
  owner: { userId: Number, username: String, accountName: String },
  members: [{ userId: Number, username: String, accountName: String }],
  messageId: [{ messageId: Number }],
  createdAt: { type: Date, default: Date.now() },
});
const GroupChat = mongoose.model("group_chat", groupChatSchema);
export { GroupChat };
