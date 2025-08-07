const mongoose = require("mongoose");
const tweetSchema = mongoose.Schema({
  user: { userId: String, username: String },
  referencedTweetId: String,
  communityId: String,
  content: { type: String, trim: true },
  tags: [String],
  retweets: {
    count: Number,
    userId: [String],
  },
  likes: {
    count: Number,
    userId: [String],
  },
  bookmarks: {
    count: Number,
    userId: [String],
  },
  assets: [{ assetName: String }],
  createdAt: { type: Date, default: Date.now() },
  lastUpdatedAt: Date,
});

const Tweets = mongoose.model("Tweets", tweetSchema);

module.exports = Tweets;
