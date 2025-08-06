const mongoose = require("mongoose");
const tweetSchema = mongoose.Schema({
  user: { userId: String, username: String },
  referencedTweetId: String,
  communityId: String,
  content: { type: String, trim: true },
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
  assets: [{ assetName: String }],
  createdAt: { type: Date, default: Date.now() },
  lastUpdatedAt: Date,
});

const Tweets = mongoose.model("Tweets", tweetSchema);

module.exports = Tweets;
