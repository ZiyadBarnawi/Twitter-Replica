import { mongoose } from "mongoose";
import { OperationalErrors } from "../Utils/operationalErrors";

const groupMessageSchema = mongoose.Schema({
  senderId: { type: mongoose.Schema.ObjectId, ref: "Users" },
  content: { type: String, trim: true },
  assets: { type: String, trim: true },
  referenceMessageId: { type: mongoose.Schema.ObjectId, ref: "Private_Messages" },
  createdAt: { type: Date, default: Date.now() },
});
groupMessageSchema.pre("save", function (next) {
  if (!this.assets && !this.content)
    return next(new OperationalErrors("The message must have an asset or some content", 400));
  next();
});
const GroupMessages = mongoose.model("Group_Messages", groupMessageSchema);
export { GroupMessages };
