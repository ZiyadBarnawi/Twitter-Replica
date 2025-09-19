import { promisify } from "util";
import { Users } from "./../Models/userModel.js";
import { catchAsync } from "../Utils/catchAsync.js";
import jwt from "jsonwebtoken";
import { OperationalErrors } from "../Utils/operationalErrors.js";

export const signup = catchAsync(async (req, res, next) => {
  const {
    username,
    accountName,
    phoneNumber,
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
    phoneNumber,
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
  const token = jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "60Days",
    }
  );
  res.status(201).json({ status: "success", token, data: { user } });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, username, phoneNumber, password } = req.body;

  if (!email && !phoneNumber && !username)
    return next(new OperationalErrors("Please provide an email, username, or a phone number", 400));

  if (!password) return next(new OperationalErrors("Please provide a password", 400));

  let user;
  if (username)
    user = await Users.findOne({ username }).select("+password username role email phoneNumber");
  else if (email)
    user = await Users.findOne({ email }).select("+password username role email phoneNumber");
  else if (phoneNumber)
    user = await Users.findOne({ phoneNumber }).select("+password username role email phoneNumber");

  if (!user) return next(new OperationalErrors("Invalid user credentials", 401));

  const valid = await user.validatePassword(password, user.password);
  if (!valid) return next(new OperationalErrors("Invalid user credentials", 401));

  const token = jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "90DAYS",
    }
  );
  res.status(200).json({ status: "success", token });
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { email, username, phoneNumber } = req.body;

  if (!email && !phoneNumber && !username)
    return next(new OperationalErrors("Please provide an email, username, or a phone number", 400));

  let user;
  if (username) user = await Users.findOne({ username }).select(" username  email phoneNumber");
  else if (email) user = await Users.findOne({ email }).select(" username  email phoneNumber");
  else if (phoneNumber)
    user = await Users.findOne({ phoneNumber }).select(" username  email phoneNumber");

  if (!user) return next(new OperationalErrors("No user was found", 401));

  const resetToken = await user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  res.status(200).json({ status: "success", resetToken });
});

export const authenticate = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) return next(new OperationalErrors("You are not logged in!", 401));

  const decodedToken = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const user = await Users.findOne({ _id: decodedToken.id }).select(
    "+passwordUpdatedAt email role verified private"
  );

  if (!user) return next(new OperationalErrors("The user account is no longer available.", 400));

  const hasUpdatedPassword = user.hasUpdatedPassword(decodedToken.iat);
  if (hasUpdatedPassword)
    return next(
      new OperationalErrors("The user has recently updated his password. Login again!", 401)
    );

  req.token = decodedToken;
  req.user = user;
  next();
});

export const authorize = (...roles) => {
  return catchAsync((req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return next(new OperationalErrors("You're not authorized to perform this action", 403));
    }
    next();
  });
};
