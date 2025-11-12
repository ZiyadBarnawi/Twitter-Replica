import express from "express";
import * as chatsController from "../Controllers/chatsController.js";
import { authenticate, authorize } from "../Controllers/authController.js";

const router = express.Router();

router.route("/").post(authenticate, chatsController.createDM); // e.g: /dms/ID1245-ID9876
router.route("/dms/:id").delete(authenticate, chatsController.deletePrivateChat);
router.route("/dms").post(authenticate, chatsController.createPrivateMessage);
export { router as chatsRouter };
