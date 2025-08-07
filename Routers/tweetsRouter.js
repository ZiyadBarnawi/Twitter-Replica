const express = require("express");
const usersController = require(`./../Controllers/usersController`);

const router = express.Router();

router.route(`/:username`).get(usersController.getTweets).post(usersController.addTweet);

router.route(`/:id`).patch(usersController.patchTweet).delete(usersController.deleteTweet);

module.exports = router;
