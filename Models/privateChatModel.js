import { mongoose } from "mongoose";

const privateChatSchema = mongoose.Schema({
  members: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Users",
      required: true,
      validate: {
        validator: function () {
          if (this.members.length !== 2) return false;
        },
        message: "A private chat must only have 2 members",
      },
    },
  ],
  deleted: { type: Boolean, default: false, select: false }, // The user can delete the data from his side, but the chat will still exists if he requests his data
  createdAt: { type: Date, default: Date.now() },
});
const PrivateChat = mongoose.model("Private_Chats", privateChatSchema);
export { PrivateChat as PrivateChat };
