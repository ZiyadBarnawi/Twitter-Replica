import { Users } from "./../Models/userModel.js";
import { Tweets } from "../Models/tweetModel.js";
import { ApiFeatures } from "./../Utils/apiFeatures.js";
import { catchAsync } from "../Utils/catchAsync.js";
import { OperationalErrors } from "../Utils/operationalErrors.js";
import { filterObj } from "../Utils/filterObj.js";

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
  if (!req.user) return next(new OperationalErrors("No user was found", 404));

  const updatedUser = await Users.findOneAndUpdate({ _id: req.token.id }, req.body);
  res.json({ status: "success", data: { updatedUser } });
});

export const deleteUser = catchAsync(async (req, res, next) => {
  const user = await Users.findOneAndDelete({ username: req.params.username.toLowerCase() });
  console.log(req.params.username);

  if (!user) return next(new OperationalErrors("No user found", 404));
  res.status(204).json({ status: "success" });
});

export const updateCurrentUser = catchAsync(async (req, res, next) => {
  if (req.body.password)
    return next(
      new OperationalErrors(
        "You can't update your password in this endpoint. Please, use: users/updatePassword"
      )
    );
  //This filters out the object to only include certain fields
  let updateFields = filterObj(req.body, "username", "accountName", "externalLinks", "private");

  const user = await Users.findOneAndUpdate({ _id: req.token.id }, updateFields, {
    runValidators: true,
    lean: true,
    returnDocument: "after",
  });

  res.status(200).json({ status: "success", data: { user } });
});

export const deleteCurrentUser = catchAsync(async (req, res, next) => {
  if (!req?.user) {
    return next(new OperationalErrors(" it is not there", 404));
  }
  const user = await Users.findOneAndUpdate({ _id: req.token.id }, { active: false });

  res.status(200).json({ status: "success", data: null });
});

//* Tweets /////////////////////////////////////////////////////////////////////////////////////////////
//FIX: the tweets sections needs to adjusted according to the new tools and techniques in the user section

// TODO: use an xss protection package like DOMPurify or xss for user inputs
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
  const tweet = await Tweets.findOneAndUpdate({ _id: req.body.id }, req.body, {
    lean: true,
    returnDocument: "after",
    runValidators: true,
  });
  if (!tweet) return next(new OperationalErrors("No tweet found", 404));

  res.json({ status: "success", data: { tweet } });
});

export const deleteTweet = catchAsync(async (req, res, next) => {
  const tweet = await Tweets.findOneAndDelete(
    { _id: req.params.id },
    { includeResultMetadata: true }
  );

  if (!tweet.value) return next(new OperationalErrors("No Tweet were found", 404));

  res.status(204).json({ status: "success" });
});

export const retweet = catchAsync(async (req, res, next) => {
  let tweet = await Tweets.findOne().where("_id").equals(req.params.id);
  if (!tweet?.retweets) return next(new OperationalErrors("No tweet found with this ID", 400));
  if (tweet.retweets.userId.includes(req.body._id))
    return next(new OperationalErrors("Already retweeted this tweet", 400));

  tweet.retweets.userId.push(req.body._id);
  tweet.$isNew = false;
  tweet.save();
  res.status(200).json({ status: "success", data: { tweet } });
});

export const like = catchAsync(async (req, res, next) => {
  let tweet = await Tweets.findOne().where("_id").equals(req.params.id);

  if (!tweet?.likes) return next(new OperationalErrors("No tweet found with this ID", 400));

  if (tweet.likes.userId.includes(req.body._id))
    return next(new OperationalErrors("Already liked this tweets", 400));

  tweet.likes.userId.push(req.body._id);
  tweet.$isNew = false;
  tweet.save();
  res.status(200).json({ status: "success", data: { tweet } });
});

export const bookmark = catchAsync(async (req, res, next) => {
  let tweet = await Tweets.findOne().where("_id").equals(req.params.id);
  if (!tweet?.bookmarks) return next(new OperationalErrors("No tweet found with this ID", 400));
  if (tweet.bookmarks.userId.includes(req.body._id))
    return next(new OperationalErrors("Already bookmarked this tweet", 400));

  tweet.bookmarks.userId.push(req.body._id);
  tweet.$isNew = false;
  tweet.save();
  res.status(200).json({ status: "success", data: { tweet } });
});

export const deleteRetweet = catchAsync(async (req, res, next) => {
  const tweet = await Tweets.findById(req.params.id);
  if (!tweet) return next(new OperationalErrors("no tweet found", 404));
  let userIdIndex = tweet.retweets.userId.findIndex((el) => el === req.body._id);
  if (userIdIndex === -1) return next(new OperationalErrors("the tweet is not retweeted", 400));

  tweet.retweets.userId.splice(userIdIndex, 1);
  tweet.save();
  res.status(204).send();
});
