const Users = require("../Models/userModel");
const Tweets = require("../Models/tweetModel");

exports.getUsers = async (req, res) => {
  let queryCopy = { ...req.query };
  excludedParams = ["page", "sort", "limit", "fields"];
  excludedParams.forEach((el) => {
    delete queryCopy[el];
  });

  const users = await Users.find(queryCopy);
  res.status(200).json({ status: "success", results: users.length, data: { users: users } });
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
  let query = Tweets.find().where("user.username").equals(req.params.username);
  if (req.query.words) {
    query = query
      .where("content")
      .equals({ $regex: new RegExp(String.raw`${req.query.words}`), $options: "i" });
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
