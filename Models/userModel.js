const mongoose = require("mongoose");

const usersSchema = mongoose.Schema({
  username: {
    type: String,
    required: [true, "username can't be null!"],
    unique: true,
  },
  accountName: String,
  email: String,
  phoneNumber: String,
  password: String,
  bio: String,
  birthDate: Date,
  gender: String,
  country: String,
  city: String,
  profilePic: String,
  headerPic: String,
  verified: Boolean,
  externalLinks: [String],

  private: { type: Boolean, default: false },

  retweets: {
    tweetsIds: [String],
    count: Number,
  },
  likes: {
    tweetsIds: [String],
    count: Number,
  },
  bookmarks: {
    tweetsIds: [String],
    count: Number,
  },

  followers: {
    users: [{ userId: String }],
    count: Number,
  },
  following: {
    users: [{ userId: String }],
    count: Number,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastUpdatedAt: Date,
});

const Users = mongoose.model("Users", usersSchema);
module.exports = Users;
