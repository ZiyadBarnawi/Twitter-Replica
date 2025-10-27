import express from "express";
import * as usersController from "./../Controllers/usersController.js";
import { authenticate, authorize } from "../Controllers/authController.js";

const router = express.Router({ mergeParams: true });
router
  .route("/")
  .get(usersController.getTweet)
  .post(authenticate, usersController.uploadTweets, usersController.addTweet);

router.route("/deleteMyTweet/:id").delete(authenticate, usersController.deleteMyTweet);
router
  .route("/patchMyTweet/:id")
  .patch(
    authenticate,
    authorize("blueUser"),
    usersController.uploadTweets,
    usersController.patchMyTweets
  );

router.route("/:username").get(authenticate, usersController.getTweets);
router
  .route(`/:id`)
  .patch(authenticate, authorize("admin"), usersController.uploadTweets, usersController.patchTweet)
  .delete(authenticate, authorize("admin"), usersController.deleteTweet);
router
  .route("/retweets/:id")
  .post(authenticate, usersController.retweet)
  .delete(authenticate, usersController.deleteMyRetweet);

router
  .route("/likes/:id")
  .post(authenticate, usersController.like)
  .delete(authenticate, usersController.deleteMyLike);
router
  .route("/bookmarks/:id")
  .post(authenticate, usersController.bookmark)
  .delete(authenticate, usersController.deleteMyBookmark);

export { router };
