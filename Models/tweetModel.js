const mongoose = require("mongoose");
const tweetSchema = mongoose.Schema({
  userId: String,
  referencedTweetId: String,
  communityId: String,
  content: String,
  tags: [String],
  retweets: {
    userId: [String],
    count: Number,
  },
  likes: {
    userId: [String],
    count: Number,
  },
  bookmarks: {
    userId: [String],
    count: Number,
  },
  assets: [{ assetId: Number }],
  createdAt: { type: Date, default: Date.now() },
  lastUpdatedAt: Date,
});

const Tweets = mongoose.model("Tweets", tweetSchema);

module.exports = Tweets;
