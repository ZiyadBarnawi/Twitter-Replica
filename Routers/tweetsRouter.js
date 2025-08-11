import express from "express";
import {
  getTweets,
  addTweet,
  patchTweet,
  deleteTweet,
  retweet,
  like,
  bookmark,
} from "./../Controllers/usersController.js";

const router = express.Router();

router.route(`/:username`).get(getTweets).post(addTweet);

router.route(`/:id`).patch(patchTweet).delete(deleteTweet);
router.route("/retweet/:id").post(retweet);
router.route("/like/:id").post(like);
router.route("/bookmark/:id").post(bookmark);
export { router };
