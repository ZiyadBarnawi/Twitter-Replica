import { mongoose } from "mongoose";
import validator from "validator";
import crypto from "crypto";
import * as bcrypt from "bcryptjs";
import { OperationalErrors } from "../Utils/operationalErrors.js";

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
  role: { type: String, enum: ["admin", "user", "blueUser"], default: "user" },
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
  pinnedTweetId: { type: String, trim: true },
  source: { type: String }, // The device that posted the tweets. Android,IOS, etc. Just for laughs and giggles lol
  retweets: [String],
  likes: { type: [String], select: false },
  bookmarks: { type: [String], select: false },
  followers: { type: [String], select: false },
  friends: { type: [String], select: false },
  canBeDMed: { type: Boolean, default: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  passwordUpdatedAt: {
    type: Date,
    select: false,
  },
  passwordResetToken: { type: String, select: false },
  passwordResetTokenExpiresAt: { type: Date, select: false },
  lastUpdatedAt: Date,
  //TODO: search how get the location of current user IP and send a message if it's a new location
  // To use GeoJSON you need to have type and coordinate attributes. Here lat is first then long
  savedLoginLocations: [
    {
      type: { type: String, default: "Point", enum: ["Point"] },
      coordinates: [Number],
    },
  ],
  active: { type: Boolean, select: false, default: true },
});

usersSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

usersSchema.pre("save", async function (next) {
  //FIX: this hook is being accessed twice. Not a big issue but needs to be checked.
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordUpdatedAt = Date.now() - 2000;
  }

  if (this.isModified("email") || this.isModified("phoneNumber"))
    if (!this.email && !this.phoneNumber) {
      next(new OperationalErrors("Email and phone number can't both be null", 400));
    }
  next();
});

usersSchema.pre("findOneAndUpdate", async function (next, doc) {
  const update = this.getUpdate() || {};
  const set = update.$set ?? update;

  const docBefore = await this.model.findOne(this.getQuery()).lean();

  const email = set.email !== undefined ? set.email : docBefore.email;
  const phone = set.phoneNumber !== undefined ? set.phoneNumber : docBefore.phoneNumber;

  if (!email && !phone) {
    return next(new OperationalErrors("a user must have either an email or a phoneNumber.", 400));
  }

  next();
});

usersSchema.method("validatePassword", async function (sentPassword, actualPassword) {
  return await bcrypt.compare(sentPassword, actualPassword);
});
usersSchema.method("hasUpdatedPassword", function (JWTTimestamp) {
  if (this.passwordUpdatedAt) {
    const passwordUpdateTime = parseInt(this.passwordUpdatedAt.getTime() / 1000, 10);
    return passwordUpdateTime > JWTTimestamp;
  }
  return false;
});

usersSchema.method("createPasswordResetToken", async function () {
  const resetToken = crypto.randomUUID();
  this.passwordResetToken = await crypto.createHash("sha256").update(resetToken).digest("hex");
  this.passwordResetTokenExpiresAt = Date.now() + 10 * 60 * 1000;

  return resetToken;
});

const Users = mongoose.model("Users", usersSchema);

export { Users };
