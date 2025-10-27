import { mongoose } from "mongoose";
const tweetSchema = mongoose.Schema(
  {
    user: { username: { type: String }, user: { type: mongoose.Schema.ObjectId, ref: "Users" } },
    repliesIds: [{ type: mongoose.Schema.ObjectId, ref: "Tweets" }],
    communityId: { type: mongoose.Schema.ObjectId, ref: "Communities" },
    content: {
      type: String,
      required: [true, "can't post an empty tweet"],
      trim: true,
      maxLength: [280, "max length exceeded"],
      minLength: [1, "min length not meet"],
    },
    tags: [String],
    retweets: [{ type: mongoose.Schema.ObjectId, ref: "Users" }],
    likes: [{ type: mongoose.Schema.ObjectId, ref: "Users" }],
    bookmarks: [{ type: mongoose.Schema.ObjectId, ref: "Users" }],
    assets: [String],
    createdAt: { type: Date, default: Date.now() },
    lastUpdatedAt: Date,
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
tweetSchema.virtual("retweetsCount").get(function () {
  return this?.retweets?.length || 0;
});
tweetSchema.virtual("likesCount").get(function () {
  return this?.likes?.length || 0;
});
tweetSchema.virtual("bookmarksCount").get(function () {
  return this?.bookmarks?.length || 0;
});

const Tweets = mongoose.model("Tweets", tweetSchema);

export { Tweets };
