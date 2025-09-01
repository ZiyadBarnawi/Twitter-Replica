import { Users } from "./../Models/userModel.js";
import { catchAsync } from "../Utils/catchAsync.js";
import jwt from "jsonwebtoken";
import { OperationalErrors } from "../Utils/operationalErrors.js";

export const signup = catchAsync(async (req, res, next) => {
  const {
    username,
    accountName,
    phoneNUmber,
    email,
    password,
    bio,
    externalLinks,
    city,
    country,
    birthDate,
    gender,
    profilePic,
    headerPic,
  } = req.body;

  let user = await Users.create({
    username,
    accountName,
    phoneNUmber,
    email,
    password,
    bio,
    externalLinks,
    city,
    country,
    birthDate,
    gender,
    profilePic,
    headerPic,
  });
  user.save();
  const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: "60Days",
  });
  res.status(201).json({ status: "success", token, data: { user } });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, username, phoneNumber, password } = req.body;

  if (!email && !phoneNumber && !username)
    return next(new OperationalErrors("Please provide an email, username, or a phone number", 400));

  if (!password) return next(new OperationalErrors("Please provide a password", 400));

  let user;
  if (username) user = await Users.findOne({ username }).select("+password username");
  else if (email) user = await Users.findOne({ email }).select("+password username");
  else if (phoneNumber) user = await Users.findOne({ phoneNumber }).select("+password username");

  if (!user) next(new OperationalErrors("Invalid user credentials", 401));
  const valid = await user.validatePassword(password, user.password);
  if (!valid) next(new OperationalErrors("Invalid user credentials", 401));

  const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: "60Days",
  });
  res.status(200).json({ status: "success", token });
});
