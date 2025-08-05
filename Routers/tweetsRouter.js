const express = require("express");
const usersController = require(`./../Controllers/usersController`);

const router = express.Router();

router.route(`/:username`).get(usersController.getTweets).post(usersController.addTweet);

router
  .route(`/:id`)
  // .get(usersController.getTweet) TODO: might make this end point require the username
  // and tweet id the same way Twitter does it from the client prospective
  .patch(usersController.patchTweet)
  .delete(usersController.deleteTweet);

module.exports = router;
