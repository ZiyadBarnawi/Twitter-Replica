const Tweets = require("../Models/tweetModel");

exports.getTweets = async (req, res) => {
  const tweets = await Tweets.find();
  res.status(200).json({ status: "success", results: tweets.length, data: { tweets: tweets } });
};

exports.getTweet = async (req, res) => {
  const tweet = await Tweets.findById(req.params.id);
  if (!tweet) res.status(404);
  res.json({ status: tweet === undefined ? "fail" : "success", data: { tweet: tweet ?? null } });
};

exports.addTweet = async (req, res) => {
  try {
    let tweet = await Tweets.create(req.body);
    console.log(tweet);
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
