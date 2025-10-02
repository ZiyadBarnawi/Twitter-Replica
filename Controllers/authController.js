import { promisify } from "util";
import { Users } from "./../Models/userModel.js";
import { catchAsync } from "../Utils/catchAsync.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OperationalErrors } from "../Utils/operationalErrors.js";
import { sendEmail } from "./../Utils/emails.js";
import { generateJwt } from "../Utils/generateJwt.js";
export const signup = catchAsync(async (req, res, next) => {
  let {
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
  email = email?.toLowerCase();
  username = username?.toLowerCase();
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
  const token = generateJwt(user);
  user.password = undefined;
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

  const token = generateJwt(user);
  let cookieOptions = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 Days
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);

  res.status(200).json({ status: "success", token });
});

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email, username, phoneNumber } = req.body;

  if (!email && !phoneNumber && !username)
    return next(new OperationalErrors("Please provide an email, username, or a phone number", 400));

  let user;
  if (username) user = await Users.findOne({ username }).select(" username  email phoneNumber");
  else if (email) user = await Users.findOne({ email }).select(" username  email phoneNumber");
  else if (phoneNumber)
    user = await Users.findOne({ phoneNumber }).select(" username  email phoneNumber");

  if (!user) return next(new OperationalErrors("No user was found", 401));
  if (!user.email)
    return next(new OperationalErrors("This account doesn't have an email associated with it."));
  const resetToken = await user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });
  try {
    await sendEmail({
      to: user.email,
      subject: `Resetting your Twitter Replica Password (Valid for 10 mins)'`,
      message: `You have requested a password reset. please use this link  \n
    The URL: ${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken} \n
    If you have't request a reset, you can ignore this safely. 
    Have a happy day!✨
    `,
    });

    res.status(200).json({
      status: "success",
      message: `Your reset token was sent to your email. It's only valid for 10 minutes`,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiresAt = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new OperationalErrors("There was an error while sending the email.", 500));
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.resetToken).digest("hex");

  const user = await Users.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpiresAt: { $gt: Date.now() },
  });

  if (!user) return next(new OperationalErrors("The token is invalid of has expired", 400));
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiresAt = undefined;
  await user.save();

  const token = generateJwt(user);
  let cookieOptions = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 Days
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);

  res.status(200).json({ status: "success", token });
});

export const updatePassword = catchAsync(async (req, res, next) => {
  let user;
  if (req.token.username)
    user = await Users.findOne({ username: req.token.username }).select(
      "+password username role email phoneNumber"
    );

  if (!user) return next(new OperationalErrors("No user was found with these credentials", 404));

  const oldPassword = req.body.oldPassword;
  const valid = await user.validatePassword(oldPassword, user.password);
  if (!valid) return next(new OperationalErrors("The password is not correct", 401));

  user.password = req.body.newPassword;
  user.save();
  const token = generateJwt(user);
  let cookieOptions = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 Days
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);

  res.status(200).json({ status: "success", token });
});
export const authenticate = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) return next(new OperationalErrors("You are not logged in!", 401));

  const decodedToken = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const user = await Users.findOne({ _id: decodedToken.id }).select(
    "+passwordUpdatedAt role   email verified private"
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
  return catchAsync(async (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return next(new OperationalErrors("You're not authorized to perform this action", 403));
    }
    next();
  });
};
