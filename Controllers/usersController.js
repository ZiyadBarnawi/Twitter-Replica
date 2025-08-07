const Users = require("../Models/userModel");
const Tweets = require("../Models/tweetModel");
const mongoose = require("mongoose");
const ApiFeatures = require("./../Utils/apiFeatures");

exports.getUsers = async (req, res) => {
  try {
    let queryCopy = { ...req.query };
    excludedParams = ["page", "sort", "limit", "fields"];
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
  } catch (err) {
    res.status(404).json({ status: "fail", message: err });
  }
};

exports.getUser = async (req, res) => {
  let query = Users.findOne({ username: req.params.username });
  const excludedFields = ["__v", "password", "email", "phoneNumber"];
  query = ApiFeatures.fields(query, req.query, excludedFields);
  const user = await query;
  if (!user) res.status(404);
  res.json({ status: user === undefined ? "fail" : "success", data: { user: user ?? null } });
};

exports.addUser = async (req, res) => {
  try {
    let user = await Users.create(req.body);
    user.save();
    res.status(201).json({ status: "success", data: { user } });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err });
  }
};

exports.patchUser = async (req, res) => {
  try {
    const user = await Users.findOneAndUpdate({ username: req.params.username }, req.body, {
      lean: true,
      returnDocument: "after",
      runValidators: true,
    });

    res.json({ status: "success", data: { user } });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await Users.findOneAndDelete({ username: req.params.username });
    res.status(204).json({ status: "success" });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err });
  }
};

//* Tweets /////////////////////////////////////////////////////////////////////////////////////////////

exports.getTweets = async (req, res) => {
  try {
    let queryCopy = { ...req.query };
    excludedParams = ["page", "sort", "limit", "fields"];
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
    let excludedFields = ["__v"];
    query = ApiFeatures.fields(query, req.query, excludedFields);

    if (req.query.page) {
      query = ApiFeatures.skip(query, req.query, { page: req.query.page, limit: req.query.limit });
    }
    const tweets = await query;

    res.status(200).json({ status: "success", results: tweets.length, data: { tweets } });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err });
  }
};

exports.getTweet = async (req, res) => {
  let query = Tweets.find()
    .where("_id")
    .equals(req.params.id)
    .where("user.username")
    .equals(req.params.username);
  const tweet = await query;
  res.status(200).json({ status: "success", data: { tweet } });
};

exports.addTweet = async (req, res) => {
  try {
    let tweet = await Tweets.create(req.body);
    tweet.save();
    res.status(201).json({ status: "success", data: { tweet } });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err });
  }
};

exports.patchTweet = async (req, res) => {
  try {
    const tweet = await Tweets.findOneAndUpdate({ _id: req.body._id }, req.body, {
      lean: true,
      returnDocument: "after",
      runValidators: true,
    });
    res.json({ status: "success", data: { tweet } });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err });
  }
};

exports.deleteTweet = async (req, res) => {
  try {
    await Tweets.findOneAndDelete({ _id: req.params._id });
    res.status(204).json({ status: "success" });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err });
  }
};
