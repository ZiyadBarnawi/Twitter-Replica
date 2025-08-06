const mongoose = require("mongoose");

const usersSchema = mongoose.Schema({
  username: {
    type: String,
    required: [true, "username can't be null!"],
    unique: true,
    trim: true,
  },
  accountName: { type: String, trim: true },
  email: { type: String, trim: true },
  phoneNumber: { type: String, trim: true },
  password: { type: String, trim: true, select: false },
  bio: { type: String, trim: true },
  birthDate: Date,
  gender: { type: String, trim: true },
  country: { type: String, trim: true },
  city: { type: String, trim: true },
  profilePic: { type: String, trim: true },
  headerPic: { type: String, trim: true },
  verified: Boolean,
  externalLinks: [String],

  private: { type: Boolean, default: false },

  retweets: {
    tweetsIds: [String],
  },
  likes: {
    tweetsIds: [String],
  },
  bookmarks: {
    tweetsIds: [String],
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
