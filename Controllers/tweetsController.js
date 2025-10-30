import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";
import multer from "multer";
import sharp from "sharp";
import { Tweets } from "../Models/tweetModel.js";
import { ApiFeatures } from "./../Utils/apiFeatures.js";
import { catchAsync } from "../Utils/catchAsync.js";
import { OperationalErrors } from "../Utils/operationalErrors.js";
import { filterObj } from "../Utils/filterObj.js";
import * as factory from "./../Utils/handlerFactory.js";
import { deleteOldFiles } from "../Utils/deleteOldFiles.js";
import { ObjectId } from "mongodb";

const tweetsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${process.env.ROOT_PATH}\\Static\\Imgs\\Tweets`);
  },
  filename: (req, file, cb) => {
    const extension = file.mimetype.split("/")[1];
    cb(null, `tweet-${req.token.id}-${Date.now()}.${extension}`);
  },
});
//This checks if the uploaded file is an image of video
const tweetsFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image") || file.mimetype.startsWith("video")) {
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
export const uploadTweets = tweetsUpload.array("assets");

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

  // deleteOldFiles("Static/Imgs/Tweets", ...tweet.assets);
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
  if (!tweet) return next(new OperationalErrors("no tweet found", 404));
  const userId = ObjectId.createFromHexString(req.token.id);
  let userIdIndex = tweet.retweets.findIndex((id) => id.equals(userId));
  if (userIdIndex === -1) return next(new OperationalErrors("The tweet is not retweeted", 400));

  tweet.retweets.splice(userIdIndex, 1);
  tweet.save();
  res.status(204).json({ status: "success" });
});
export const deleteMyLike = catchAsync(async (req, res, next) => {
  const tweet = await Tweets.findOne({ _id: req.params.id }, { likes: req.token.id });
  if (!tweet) return next(new OperationalErrors("no tweet found", 404));
  const userId = ObjectId.createFromHexString(req.token.id);
  let userIdIndex = tweet.likes.findIndex((id) => id.equals(userId));
  if (userIdIndex === -1) return next(new OperationalErrors("The tweet is not liked", 400));

  tweet.likes.splice(userIdIndex, 1);
  tweet.save();
  res.status(204).json({ status: "success" });
});
export const deleteMyBookmark = catchAsync(async (req, res, next) => {
  const tweet = await Tweets.findOne({ _id: req.params.id }, { bookmarks: req.token.id });
  if (!tweet) return next(new OperationalErrors("no tweet found", 404));
  const userId = ObjectId.createFromHexString(req.token.id);
  let userIdIndex = tweet.bookmarks.findIndex((id) => id.equals(userId));

  if (userIdIndex === -1) return next(new OperationalErrors("The tweet is not bookmarked", 400));

  tweet.bookmarks.splice(userIdIndex, 1);
  tweet.save();
  res.status(204).json({ status: "success" });
});
