import multer from "multer";
import sharp from "sharp";
import { Users } from "./../Models/userModel.js";
import { ApiFeatures } from "./../Utils/apiFeatures.js";
import { catchAsync } from "../Utils/catchAsync.js";
import { OperationalErrors } from "../Utils/operationalErrors.js";
import { filterObj } from "../Utils/filterObj.js";
import * as factory from "./../Utils/handlerFactory.js";
import { deleteOldFiles } from "../Utils/deleteOldFiles.js";

//* Multer config ////////////////////////////////////////////

const userStorage = multer.memoryStorage();
//This test if the uploaded file is an image of video

const userFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new OperationalErrors("The upload file is not accepted.", 400), false);
  }
};

const userUpload = multer({
  storage: userStorage,
  fileFilter: userFilter,
  limits: { files: 2, fileSize: 25000000 },
});

export const uploadUserImages = userUpload.fields([
  { name: "profilePic", maxCount: 1 },
  { name: "headerPic", maxCount: 1 },
]);

export const resizeUserImage = (req, res, next) => {
  if (!req.files) return next();
  if (req.files.profilePic) {
    req.files.profilePic[0].filename = `user-${req.token.id}-${Date.now()}.jpeg`;
    sharp(req.files.profilePic[0].buffer)
      .resize(500, 500)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`${process.env.ROOT_PATH}/Static/Imgs/Users/${req.files.profilePic[0].filename}`);
  }

  if (req.files.headerPic) {
    req.files.headerPic[0].filename = `user-${req.token.id}-${Date.now()}.jpeg`;
    sharp(req.files.headerPic[0].buffer)
      .resize(1500, 500)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`${process.env.ROOT_PATH}/Static/Imgs/Users/${req.files.headerPic[0].filename}`);
  }

  next();
};

//* Users endpoints  ////////////////////////////////////////////

export const getUsers = catchAsync(async (req, res, next) => {
  let queryCopy = { ...req.query };

  const excludedParams = ["page", "sort", "limit", "fields"];
  excludedParams.forEach((el) => {
    delete queryCopy[el];
  });

  let query = Users.find(queryCopy);
  if (req.query.sort) {
    query = ApiFeatures.sort(query, req.query);
  } else {
    query = query.sort("createdAt");
  }
  const excludedFields = ["__v", "password", "email", "phoneNumber"];
  query = ApiFeatures.fields(query, req.query, excludedFields);

  query = ApiFeatures.skip(query, req.query, {
    page: req.query.page ?? 1,
    limit: req.query.limit ?? 10,
  });

  const users = await query;

  res.status(200).json({ status: "success", results: users.length, data: { users: users } });
});

export const getUser = catchAsync(async (req, res, next) => {
  let query = Users.findOne({ username: req.params.username });
  const excludedFields = ["__v", "password", "email", "phoneNumber"];
  query = ApiFeatures.fields(query, req.query, excludedFields);
  const user = await query;

  if (!user) return next(new OperationalErrors("No user found", 404));

  res.json({ status: "success", data: { user: user } });
});

export const addUser = factory.addOne(Users);

export const patchUser = catchAsync(async (req, res, next) => {
  if (!req.user) return next(new OperationalErrors("No user was found", 404));

  const updatedUser = await Users.findOneAndUpdate({ username: req.params.username }, req.body, {
    new: true,
  });
  res.json({ status: "success", data: { updatedUser } });
});

export const deleteUser = catchAsync(async (req, res, next) => {
  const user = await Users.findOneAndDelete({ username: req.params.username });

  if (!user) return next(new OperationalErrors("No user found", 404));
  res.status(204).json({ status: "success" });
});

export const updateMyUser = catchAsync(async (req, res, next) => {
  if (req.body?.password)
    return next(
      new OperationalErrors(
        "You can't update your password in this endpoint. Please, use: users/updatePassword"
      )
    );
  //This filters out the object to only include certain fields
  let updateFields = filterObj(req.body, "username", "accountName", "externalLinks", "private");

  if (req.files?.profilePic[0]?.buffer) updateFields.profilePic = req.files.profilePic[0].filename;
  if (req.files?.headerPic[0]?.buffer) updateFields.headerPic = req.files.headerPic[0].filename;

  const user = await Users.findOneAndUpdate({ _id: req.token.id }, updateFields, {
    runValidators: true,
    lean: true,
    returnDocument: "after",
  });

  res.status(200).json({ status: "success", data: { user } });
});

export const deleteMyUser = catchAsync(async (req, res, next) => {
  if (!req?.user) {
    return next(new OperationalErrors(" it is not there", 404));
  }
  const user = await Users.findOneAndUpdate({ _id: req.token.id }, { active: false });

  res.status(200).json({ status: "success", data: null });
});

export const getMe = (req, res, next) => {
  req.params.username = req.token.username;
  next();
};
//* Tweets /////////////////////////////////////////////////////////////////////////////////////////////
