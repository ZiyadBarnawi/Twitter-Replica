import { mongoose } from "mongoose";
import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";

const privateMessageSchema = mongoose.Schema({
  senderId: { type: mongoose.Schema.ObjectId, ref: "Users" },
  content: { type: String, trim: true },
  assets: { type: String, trim: true },
  referenceMessageId: { type: mongoose.Schema.ObjectId, ref: "_id" },
  privateChatId: { type: mongoose.Schema.ObjectId, ref: "PrivateChatId" },
  createdAt: { type: Date, default: Date.now() },
});
privateMessageSchema.pre("save", async function (next) {
  const window = new JSDOM("").window;
  const purify = DOMPurify(window);
  this.content = purify.sanitize(this.content);
  this.tags = this.content
    .split(" ")
    .filter((word) => word.startsWith("#"))
    .map((tag) => purify.sanitize(tag));

  //To follow twitter's way of how content is formatted
  this.content = `@${this.user.username} ${this.content}`;
  next();
});

const PrivateMessages = mongoose.model("private_messages", privateMessageSchema);
export { PrivateMessages };
