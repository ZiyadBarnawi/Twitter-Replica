import express from "express";
import * as userController from "./../Controllers/usersController.js";
import * as authController from "./../Controllers/authController.js";

const router = express.Router();

router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);
router.route("/forgotPassword").post(authController.forgotPassword);
router.route("/resetPassword/:resetToken").patch(authController.resetPassword);
router.route("/updatePassword").patch(authController.authenticate, authController.updatePassword);
router
  .route("/deleteCurrentUser")
  .delete(authController.authenticate, userController.deleteCurrentUser);

router
  .route("/updateCurrentUser")
  .patch(authController.authenticate, userController.updateCurrentUser);
router
  .route(`/`)
  .get(authController.authenticate, userController.getUsers)
  .post(authController.authenticate, authController.authorize("admin"), userController.addUser);

router
  .route(`/:username`)
  .get(userController.getUser)
  .patch(authController.authenticate, authController.authorize("admin"), userController.patchUser)
  .delete(
    authController.authenticate,
    authController.authorize("admin"),
    userController.deleteUser
  );

router.route("/:username/:id").get(userController.getTweet);

export { router };
