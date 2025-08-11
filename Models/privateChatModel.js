import {mongoose} from "mongoose";

const privateChatSchema = mongoose.Schema({
  members: [{ userId: Number, username: String, accountName: String }],
  messageId: [{ messageId: Number }],
  createdAt: { type: Date, default: Date.now() },
});
const privateChat = mongoose.model("private_chat", privateChatSchema);
export { privateChat };
