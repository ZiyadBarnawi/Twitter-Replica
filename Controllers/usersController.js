import { Users } from "./../Models/userModel.js";
import { Tweets } from "../Models/tweetModel.js";
import { mongoose } from "mongoose";
import { ApiFeatures } from "./../Utils/apiFeatures.js";
import { catchAsync } from "../Utils/catchAsync.js";
import { OperationalErrors } from "../Utils/operationalErrors.js";

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

export const addUser = catchAsync(async (req, res, next) => {
  let user = await Users.create(req.body);
  user.save();
  res.status(201).json({ status: "success", data: { user } });
});

export const patchUser = catchAsync(async (req, res, next) => {
  const user = await Users.findOneAndUpdate({ username: req.params.username }, req.body, {
    lean: true,
    returnDocument: "after",
    runValidators: true,
  });
  if (!user) return next(new OperationalErrors("No user found", 404));

  res.json({ status: "success", data: { user } });
});

export const deleteUser = catchAsync(async (req, res, next) => {
  await Users.findOneAndDelete({ username: req.params.username });
  res.status(204).json({ status: "success" });
});

//* Tweets /////////////////////////////////////////////////////////////////////////////////////////////

export const getTweets = catchAsync(async (req, res, next) => {
  let queryCopy = { ...req.query };
  const excludedParams = ["page", "sort", "limit", "fields"];
  excludedParams.forEach((el) => {
    delete queryCopy[el];
  });
  let query = Tweets.find().where("user.username").equals(req.params.username);
  if (queryCopy.words) {
    query = query
      .where("content")
      .equals({ $regex: new RegExp(String.raw`${queryCopy.words}`), $options: "i" });
  }
  if (req.query.sort) {
    query = ApiFeatures.sort(query, req.query);
  } else {
    query = query.sort("createdAt");
  }
  //TODO: only show the likes count in the request is not from the account owner
  const excludedFields = ["__v"];
  query = ApiFeatures.fields(query, req.query, excludedFields);

  if (req.query.page) {
    query = ApiFeatures.skip(query, req.query, { page: req.query.page, limit: req.query.limit });
  }
  const tweets = await query;

  res.status(200).json({ status: "success", results: tweets.length, data: { tweets } });
});

export const getTweet = catchAsync(async (req, res, next) => {
  let query = Tweets.find()
    .where("_id")
    .equals(req.params.id)
    .where("user.username")
    .equals(req.params.username);
  const excludedFields = ["__v"];
  ApiFeatures.fields(query, req.query, excludedFields);
  const tweet = await query;
  if (!tweet) return next(new OperationalErrors("No tweet found", 404));
  res.status(200).json({ status: "success", data: { tweet } });
});

export const addTweet = catchAsync(async (req, res, next) => {
  let tweet = await Tweets.create(req.body);
  tweet.save();
  res.status(201).json({ status: "success", data: { tweet } });
});

export const patchTweet = catchAsync(async (req, res, next) => {
  const tweet = await Tweets.findOneAndUpdate({ _id: req.body._id }, req.body, {
    lean: true,
    returnDocument: "after",
    runValidators: true,
  });
  if (!tweet) return next(new OperationalErrors("No tweet found", 404));

  res.json({ status: "success", data: { tweet } });
});

export const deleteTweet = catchAsync(async (req, res, next) => {
  await Tweets.findOneAndDelete({ _id: req.params._id });
  res.status(204).json({ status: "success" });
});

export const retweet = catchAsync(async (req, res, next) => {
  let tweet = await Tweets.findOne().where("_id").equals(req.params.id);

  if (tweet.retweets.userId.includes(req.body._id)) {
    return res.status(400).json({ status: "fail", message: "already retweeted" });
  }
  tweet.retweets.userId.push(req.body._id);
  tweet.$isNew = false;
  tweet.save();
  res.status(200).json({ status: "success", data: { tweet } });
});
export const like = catchAsync(async (req, res, next) => {
  let tweet = await Tweets.findOne().where("_id").equals(req.params.id);
  if (tweet.likes.userId.includes(req.body._id)) {
    return res.status(400).json({ status: "fail", message: "already liked" });
  }
  tweet.likes.userId.push(req.body._id);
  tweet.$isNew = false;
  tweet.save();
  res.status(200).json({ status: "success", data: { tweet } });
});
export const bookmark = catchAsync(async (req, res, next) => {
  let tweet = await Tweets.findOne().where("_id").equals(req.params.id);
  if (tweet.bookmarks.userId.includes(req.body._id)) {
    return res.status(400).json({ status: "fail", message: "already bookmarked" });
  }
  tweet.bookmarks.userId.push(req.body._id);
  tweet.$isNew = false;
  tweet.save();
  res.status(200).json({ status: "success", data: { tweet } });
});
