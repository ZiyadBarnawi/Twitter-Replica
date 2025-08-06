const Users = require("../Models/userModel");
const Tweets = require("../Models/tweetModel");

exports.getUsers = async (req, res) => {
  try {
    let queryCopy = { ...req.query };
    excludedParams = ["page", "sort", "limit", "fields"];
    excludedParams.forEach((el) => {
      delete queryCopy[el];
    });
    let query = Users.find(queryCopy);
    if (req.query.sort) {
      query = query.sort(req.query.sort.split(",").join(" "));
    } else {
      query = query.sort("createdAt");
    }
    if (req.query.fields) {
      let fields = req.query.fields
        .split(",")
        .join(" ")
        .replaceAll("password", "")
        .replaceAll("email", "")
        .replaceAll("phoneNumber", "")
        .replaceAll("__v", "");

      query = query.select(fields);
    } else {
      query = query.select("-__v -password -email -phoneNumber");
    }

    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 2;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    const users = await query;
    res.status(200).json({ status: "success", results: users.length, data: { users: users } });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err });
  }
};

exports.getUser = async (req, res) => {
  const user = await Users.findOne({ username: req.params.username });
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
    query = query.sort(req.query.sort);
  }
  const tweets = await query;
  res.status(200).json({ status: "success", results: tweets.length, data: { tweets } });
};

exports.getTweet = async (req, res) => {
  const tweet = await Tweets.findById(req.params.id);
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
