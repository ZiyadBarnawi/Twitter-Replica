const express = require("express");
const usersController = require(`./../Controllers/usersController`);

const router = express.Router();

router.route(`/`).get(usersController.getUsers).post(usersController.addUser);

router
  .route(`/:username`)
  .get(usersController.getUser)
  .patch(usersController.patchUser)
  .delete(usersController.deleteUser);

router.route("/:username/:id").get(usersController.getTweet);

module.exports = router;
