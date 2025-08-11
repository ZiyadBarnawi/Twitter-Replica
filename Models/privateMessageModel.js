import {mongoose} from "mongoose";

const privateMessageSchema = mongoose.Schema({
  senderId: Number,
  content: { type: String, trim: true },
  assets: { type: String, trim: true },
  referenceMessageId: String,
  createdAt: { type: Date, default: Date.now() },
});
const PrivateMessages = mongoose.model("private_message", privateMessageSchema);
export { PrivateMessages };
