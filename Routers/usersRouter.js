import express from "express";
import {
  getUsers,
  addUser,
  getUser,
  patchUser,
  deleteUser,
  getTweet,
} from "./../Controllers/usersController.js";

const router = express.Router();

router.route(`/`).get(getUsers).post(addUser);

router.route(`/:username`).get(getUser).patch(patchUser).delete(deleteUser);

router.route("/:username/:id").get(getTweet);

export { router };
