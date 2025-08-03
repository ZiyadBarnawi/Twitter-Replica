const express = require("express");
const tweetsController = require(`./../Controllers/tweetsController`);

const router = express.Router();

router.route(`/`).get(tweetsController.getTweets).post(tweetsController.addTweet);

router
  .route(`/:id`)
  .get(tweetsController.getTweet)
  .patch(tweetsController.patchTweet)
  .delete(tweetsController.deleteTweet);

module.exports = router;
