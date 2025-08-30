import express from "express";
import * as usersController from "./../Controllers/usersController.js";

const router = express.Router();

router.route(`/:username`).get(usersController.getTweets).post(usersController.addTweet);

router.route(`/:id`).patch(usersController.patchTweet).delete(usersController.deleteTweet);
router.route("/retweet/:id").post(usersController.retweet).delete(usersController.deleteRetweet);
router.route("/like/:id").post(usersController.like);
router.route("/bookmark/:id").post(usersController.bookmark);
export { router };
