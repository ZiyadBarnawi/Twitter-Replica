import { mongoose } from "mongoose";
import validator from "validator";
const usersSchema = mongoose.Schema({
  username: {
    type: String,
    required: [true, "username can't be null"],
    unique: true,
    trim: true,
    validate: {
      validator: validator.isAlpha, //TODO: make your own function to refuse just these special characters: !@#%^&*`"'[] {} () <> ? ;:],.+-=| / ~\ "
      message: "The username can't have special characters",
    },
  },
  accountName: { type: String, trim: true },
  email: {
    type: String,
    trim: true,
    validate: { validator: validator.isEmail, message: "Not a valid email format" },
  },
  phoneNumber: {
    type: String,
    trim: true,
    select: false,
    maxLength: [13, "max length exceeded"],
    minLength: [13, "min length not meet"],
  },
  password: {
    type: String,
    required: [true, "password can't be null"],

    trim: true,
    select: false,
    maxLength: [16, "password max length exceeded"],
  },
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
//TODO: make a validator to check if either the phoneNumber or email are not null with every user creation or update
const Users = mongoose.model("Users", usersSchema);
export { Users };
