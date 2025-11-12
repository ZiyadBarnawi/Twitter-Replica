import { mongoose } from "mongoose";

const groupChatSchema = mongoose.Schema({
  chatName: {
    type: String,
    trim: true,
    required: true,
    validate: {
      validator: function () {
        const chatName = this.get("chatName") || this.chatName;
        if (chatName.length > 30) return false;
        if (/[^A-Za-z0-9_]/.test(chatName)) return false;
        if (!/[A-Za-z]/.test(chatName)) return false;
      },
      message: "Invalid chat name",
    },
  },
  owner: { type: mongoose.Schema.ObjectId, ref: "Users" },
  members: [{ type: mongoose.Schema.ObjectId, ref: "Users" }],
  messageId: [{ type: mongoose.Schema.ObjectId, ref: "GroupChatMessages" }],
  createdAt: { type: Date, default: Date.now() },
});
const GroupChat = mongoose.model("group_chat", groupChatSchema);
export { GroupChat };
