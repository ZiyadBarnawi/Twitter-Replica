import express from "express";
import * as tweetsController from "./../Controllers/tweetsController.js";
import { authenticate, authorize } from "../Controllers/authController.js";

const router = express.Router({ mergeParams: true });
router
  .route("/")
  .get(tweetsController.getTweet)
  .post(authenticate, tweetsController.uploadTweets, tweetsController.addTweet);

router.route("/deleteMyTweet/:id").delete(authenticate, tweetsController.deleteMyTweet);
router
  .route("/patchMyTweet/:id")
  .patch(
    authenticate,
    authorize("blueUser"),
    tweetsController.uploadTweets,
    tweetsController.patchMyTweets
  );

router.route("/:username").get(authenticate, tweetsController.getTweets);
router
  .route(`/:id`)
  .patch(
    authenticate,
    authorize("admin"),
    tweetsController.uploadTweets,
    tweetsController.patchTweet
  )
  .delete(authenticate, authorize("admin"), tweetsController.deleteTweet);
router
  .route("/retweets/:id")
  .post(authenticate, tweetsController.retweet)
  .delete(authenticate, tweetsController.deleteMyRetweet);

router
  .route("/likes/:id")
  .post(authenticate, tweetsController.like)
  .delete(authenticate, tweetsController.deleteMyLike);
router
  .route("/bookmarks/:id")
  .post(authenticate, tweetsController.bookmark)
  .delete(authenticate, tweetsController.deleteMyBookmark);

export { router };
