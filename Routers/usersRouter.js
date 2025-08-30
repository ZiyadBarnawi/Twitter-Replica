import express from "express";
import * as userController from "./../Controllers/usersController.js";
import * as authController from "./../Controllers/authController.js";

const router = express.Router();

router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);
router.route(`/`).get(userController.getUsers).post(userController.addUser);

router
  .route(`/:username`)
  .get(userController.getUser)
  .patch(userController.patchUser)
  .delete(userController.deleteUser);

router.route("/:username/:id").get(userController.getTweet);

export { router };
