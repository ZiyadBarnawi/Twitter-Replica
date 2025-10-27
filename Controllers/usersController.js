import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";
import { Users } from "./../Models/userModel.js";
import { Tweets } from "../Models/tweetModel.js";
import { ApiFeatures } from "./../Utils/apiFeatures.js";
import { catchAsync } from "../Utils/catchAsync.js";
import { OperationalErrors } from "../Utils/operationalErrors.js";
import { filterObj } from "../Utils/filterObj.js";
import * as factory from "./../Utils/handlerFactory.js";
import multer from "multer";
import { deleteOldFiles } from "../Utils/deleteOldFiles.js";

const tweetsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${process.env.ROOT_PATH}\\Static\\Imgs\\Tweets`);
  },
  filename: (req, file, cb) => {
    const extension = file.mimetype.split("/")[1];
    cb(null, `tweet-${req.token.id}-${Date.now()}.${extension}`);
  },
});
const userStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${process.env.ROOT_PATH}\\Static\\Imgs\\Users`);
  },
  filename: (req, file, cb) => {
    const extension = file.mimetype.split("/")[1];
    cb(null, `user-${req.token.id}-${Date.now()}.${extension}`);
  },
});
//This test if the uploaded file is an image of video
const tweetsFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image") || file.mimetype.startsWith("video")) {
    cb(null, true);
  } else {
    cb(new OperationalErrors("The upload file is now accepted.", 400), false);
  }
};
const userFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new OperationalErrors("The upload file is now accepted.", 400), false);
  }
};
const tweetsUpload = multer({
  storage: tweetsStorage,
  fileFilter: tweetsFilter,
  limits: { files: 4 },
});
const userUpload = multer({
  storage: userStorage,
  fileFilter: userFilter,
  limits: { files: 1, fileSize: 25000000 },
});

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

export const deleteMyUser = catchAsync(async (req, res, next) => {
  if (!req?.user) {
    return next(new OperationalErrors(" it is not there", 404));
  }
  const user = await Users.findOneAndUpdate({ _id: req.token.id }, { active: false });

  res.status(204).json({ status: "success", data: null });
});

export const getMe = (req, res, next) => {
  req.params.username = req.token.username;
  next();
};
//* Tweets /////////////////////////////////////////////////////////////////////////////////////////////

export const getTweets = catchAsync(async (req, res, next) => {
  let queryCopy = { ...req.query };
  const excludedParams = ["page", "sort", "limit", "fields", "populate"];
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

  const excludedFields = ["__v"];
  query = ApiFeatures.fields(query, req.query, excludedFields);

  if (req.query.page) {
    query = ApiFeatures.skip(query, req.query, { page: req.query.page, limit: req.query.limit });
  }
  let tweets;

  tweets = await ApiFeatures.populate(query, {
    path: "user.user",
    select: "username accountName _id",
  });

  let tweetsSnapshot = tweets?.map((tweet) => tweet.toObject({ virtuals: true })); // This allows me to change the virtual values without them automatically updating
  if (tweetsSnapshot) {
    if (tweetsSnapshot[0]?.user?.userId !== req.token.id) {
      tweetsSnapshot = tweetsSnapshot.map((tweet) => {
        if (req.token.username !== tweet.user.username) {
          tweet.likes = [];
          tweet.bookmarks = [];
        }
        return tweet;
      });
    }
  }
  res.status(200).json({
    status: "success",
    results: tweetsSnapshot.length,
    data: { tweets: tweetsSnapshot },
  });
});

export const getTweet = catchAsync(async (req, res, next) => {
  let query = Tweets.find().where("_id").equals(req.params.id);
  const excludedFields = ["__v"];
  ApiFeatures.fields(query, req.query, excludedFields);
  const tweet = await query;
  if (!tweet) return next(new OperationalErrors("No tweet found", 404));
  res.status(200).json({ status: "success", data: { tweet } });
});

export const addTweet = catchAsync(async (req, res, next) => {
  //1- purify the body.
  let { content, referencedTweetId, communityId } = req.body;

  const window = new JSDOM("").window;
  const purify = DOMPurify(window);
  content = purify.sanitize(content);
  const tags = content
    .split(" ")
    .filter((word) => word.startsWith("#"))
    .map((tag) => purify.sanitize(tag));

  //2- To follow twitter's way of how content is formatted
  content = `@${req.token.username} ${content}`;

  let assets = req.files.map((file) => {
    return file.filename;
  });

  let tweet = await Tweets.create({
    user: { username: req.token.username, user: req.token.id },
    content,
    assets,
    referencedTweetId,
    communityId,
    tags,
  });
  res.status(201).json({ status: "success", data: { tweet } });
});
export const uploadTweets = tweetsUpload.array("assets");
export const uploadUserImg = userUpload.single("assets");

export const patchTweet = factory.patchOne(Tweets, { isTweet: true });

export const patchMyTweets = catchAsync(async (req, res, next) => {
  let { content } = req.body;

  let assets = req.files.map((file) => {
    return file.filename;
  });
  let tweet = await Tweets.findById(req.params.id);
  if (!tweet) return next(new OperationalErrors("No tweet was found", 404));

  const window = new JSDOM("").window;
  const purify = DOMPurify(window);
  content = purify.sanitize(content);
  const tags = content
    .split(" ")
    .filter((word) => word.startsWith("#"))
    .map((tag) => purify.sanitize(tag));

  deleteOldFiles("Static/Imgs/Tweets", ...tweet.assets);
  tweet.content = content;
  tweet.tags = tags;
  tweet.assets = assets;
  tweet.save();
  res.tweets = tweet;

  res.status(200).json({ status: "success", data: { tweet } });
});

export const deleteTweet = factory.deleteOne(Tweets);
export const deleteMyTweet = catchAsync(async (req, res, next) => {
  const tweet = await Tweets.findOneAndDelete({ "user.userId": req.token.id, _id: req.params.id });
  if (!tweet)
    return next(new OperationalErrors("No Tweet was found or you don't own this tweets", 404));
  res.status(204).json({ status: "success" });
});
export const retweet = catchAsync(async (req, res, next) => {
  let tweet = await Tweets.findOne().where("_id").equals(req.params.id);
  if (!tweet) return next(new OperationalErrors("No tweet found with this ID", 404));
  if (tweet.retweets.includes(req.token.id))
    return next(new OperationalErrors("Already retweeted this tweet", 400));

  tweet.retweets.push(req.token.id);
  tweet.save();
  res.status(200).json({ status: "success", data: { tweet } });
});
export const like = catchAsync(async (req, res, next) => {
  let tweet = await Tweets.findOne().where("_id").equals(req.params.id);

  if (!tweet) return next(new OperationalErrors("No tweet found with this ID", 404));

  if (tweet.likes?.includes(req.token.id))
    return next(new OperationalErrors("Already liked this tweets", 400));

  tweet.likes.push(req.token.id);
  tweet.save();
  res.status(200).json({ status: "success", data: { tweet } });
});
export const bookmark = catchAsync(async (req, res, next) => {
  let tweet = await Tweets.findOne().where("_id").equals(req.params.id);
  if (!tweet) return next(new OperationalErrors("No tweet found with this ID", 404));
  if (tweet.bookmarks.includes(req.token.id))
    return next(new OperationalErrors("Already bookmarked this tweet", 400));

  tweet.bookmarks.push(req.token.id);
  tweet.save();
  res.status(200).json({ status: "success", data: { tweet } });
});
export const deleteMyRetweet = catchAsync(async (req, res, next) => {
  const tweet = await Tweets.findOne({ _id: req.params.id }, { retweets: req.token.id });
  if (!tweet)
    return next(new OperationalErrors("no tweet found or you haven't retweeted this tweet", 404));
  let userIdIndex = tweet.retweets.findIndex((el) => el === req.token.id);
  if (userIdIndex === -1) return next(new OperationalErrors("The tweet is not retweeted", 400));

  tweet.retweets.splice(userIdIndex, 1);
  tweet.save();
  res.status(204).json({ status: "success" });
});
export const deleteMyLike = catchAsync(async (req, res, next) => {
  const tweet = await Tweets.findOne({ _id: req.params.id }, { likes: req.token.id });
  if (!tweet) return next(new OperationalErrors("no tweet found", 404));
  let userIdIndex = tweet.likes.findIndex((el) => el === req.token.id);
  if (userIdIndex === -1) return next(new OperationalErrors("The tweet is not likes", 400));

  tweet.retweets.splice(userIdIndex, 1);
  tweet.save();
  res.status(204).json({ status: "success" });
});
export const deleteMyBookmark = catchAsync(async (req, res, next) => {
  const tweet = await Tweets.findOne({ _id: req.params.id }, { bookmarks: req.token.id });
  if (!tweet) return next(new OperationalErrors("no tweet found", 404));
  let userIdIndex = tweet.retweets.findIndex((el) => el === req.token.id);
  if (userIdIndex === -1) return next(new OperationalErrors("The tweet is not bookmarked", 400));

  tweet.retweets.splice(userIdIndex, 1);
  tweet.save();
  res.status(204).json({ status: "success" });
});
