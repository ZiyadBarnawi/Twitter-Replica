const Users = require("../Models/userModel");

exports.getUsers = async (req, res) => {
  const users = await Users.find();
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
    console.log(user);
    user.save();
    res.status(201).json({ status: "success", data: { user } });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err });
  }
};

exports.patchUser = async (req, res) => {
  try {
    const user = await Users.findOneAndUpdate({ username: req.body.username }, req.body, {
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
