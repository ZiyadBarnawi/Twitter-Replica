import { mongoose } from "mongoose";
import validator from "validator";

import * as bcrypt from "bcryptjs";

const usersSchema = mongoose.Schema({
  username: {
    type: String,
    required: [true, "username can't be null"],
    unique: true,
    trim: true,
    validate: {
      validator: function () {
        let username = this.get("username") || this.username;
        if (username.length < 3) return false;
        if (/[^A-Za-z0-9_]/.test(username)) return false;
        if (!/[A-Za-z]/.test(username)) return false;
      },
      message:
        "The username must be longer than 3 characters with an English letters. NOTE: numbers and underscores are optional ",
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
    maxLength: [15, "max length exceeded"],
    minLength: [10, "min length not meet"],
    validate: { validator: validator.isNumeric, message: "The phone number can't contain letters" },
  },
  password: {
    type: String,
    required: [true, "password can't be null"],
    trim: true,
    select: false,
    minLength: [8, "password min length not meet"],
    validate: {
      validator: function () {
        let password = this.get("password") || this.password;
        if (password.length < 6) {
          return false;
        }
        const checks = [
          /[a-z]/, // Lowercase
          /[A-Z]/, // Uppercase
          /\d/, // Digit
        ];
        let score = checks.reduce((acc, rgx) => acc + rgx.test(password), 0);
        if (score < 3) return false;
      },
      message:
        "Password condition not meet! It must be longer than 6 characters, with one uppercase,lowercase letter and a digit",
    },
  },
  bio: { type: String, trim: true },
  birthDate: Date,
  gender: { type: String, trim: true },
  country: { type: String, trim: true },
  city: { type: String, trim: true },
  profilePic: { type: String, trim: true },
  headerPic: { type: String, trim: true },
  verified: { type: Boolean, default: false },
  externalLinks: { type: [String], maxLength: 3 },

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
usersSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
usersSchema.pre("updateOne", function (next) {
  if (this.isModified("email") || this.isModified("phoneNumber")) {
    if (!(this.email && this.phoneNumber))
      return next(new OperationalErrors("phone number and email can't together be nulls"));
  }

  next();
});
usersSchema.method("validatePassword", async function (sentPassword, actualPassword) {
  return await bcrypt.compare(sentPassword, actualPassword);
});
const Users = mongoose.model("Users", usersSchema);

export { Users };
