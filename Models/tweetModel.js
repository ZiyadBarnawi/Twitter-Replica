import { mongoose } from "mongoose";
const tweetSchema = mongoose.Schema(
  {
    user: { userId: { type: String, required: true }, username: { type: String, required: true } },
    referencedTweetId: String,
    repliesIds: [String],
    communityId: String,
    content: {
      type: String,
      required: [true, "can't post an empty tweet"],
      trim: true,
      maxLength: [280, "max length exceeded"],
      minLength: [1, "min length not meet"],
    },
    tags: [String],
    retweets: [String],
    likes: [String],
    bookmarks: [String],
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
