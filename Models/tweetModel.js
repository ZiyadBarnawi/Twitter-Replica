import { mongoose } from "mongoose";
const tweetSchema = mongoose.Schema(
  {
    user: { userId: String, username: String },
    referencedTweetId: String,
    communityId: String,
    content: {
      type: String,
      trim: true,
      maxLength: [280, "max length exceeded"],
      minLength: [1, "min length not meet"],
    },
    tags: [String],
    retweets: {
      userId: [String],
    },
    likes: {
      userId: [String],
    },
    bookmarks: {
      userId: [String],
    },
    assets: [String],
    createdAt: { type: Date, default: Date.now() },
    lastUpdatedAt: Date,
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
tweetSchema.virtual("retweetsCount").get(function () {
  return this?.retweets?.userId?.length || 0;
});
tweetSchema.virtual("likesCount").get(function () {
  return this?.likes?.userId?.length || 0;
});
tweetSchema.virtual("bookmarksCount").get(function () {
  return this?.bookmarks?.userId?.length || 0;
});

tweetSchema.pre("find", function (next) {
  this.find().where("username").equals();
  next();
});

const Tweets = mongoose.model("Tweets", tweetSchema);

export { Tweets };
