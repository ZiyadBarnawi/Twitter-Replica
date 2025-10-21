import express from "express";
import * as userController from "./../Controllers/usersController.js";
import * as authController from "./../Controllers/authController.js";
import { router as tweetsRouter } from "./tweetsRouter.js";
const router = express.Router();
router
  .route(`/`)
  .get(userController.getUsers)
  .post(authController.authenticate, authController.authorize("admin"), userController.addUser);
router.use("/:username/tweets/:id", tweetsRouter); // Here the userRouter will redirect to the tweetsRouter

router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);
router.route("/forgotPassword").post(authController.forgotPassword);
router.route("/resetPassword/:resetToken").patch(authController.resetPassword);
router.route("/updatePassword").patch(authController.authenticate, authController.updatePassword);
router.route("/deleteMyUser").delete(authController.authenticate, userController.deleteMyUser);
router.route("/updateMyUser").patch(authController.authenticate, userController.updateMyUser);
router.route("/me").get(authController.authenticate, userController.getMe, userController.getUser);

router
  .route(`/:username`)
  .get(userController.getUser)
  .patch(authController.authenticate, authController.authorize("admin"), userController.patchUser)
  .delete(
    authController.authenticate,
    authController.authorize("admin"),
    userController.deleteUser
  );

export { router };
