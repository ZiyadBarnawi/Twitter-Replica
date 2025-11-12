import { PrivateChat } from "../Models/privateChatModel.js";
import { PrivateMessages } from "../Models/privateMessageModel.js";
import { Users } from "../Models/userModel.js";
import { ApiFeatures } from "../Utils/apiFeatures.js";
import { catchAsync } from "../Utils/catchAsync.js";
import { filterObj } from "../Utils/filterObj.js";
import * as factory from "../Utils/handlerFactory.js";
import { OperationalErrors } from "../Utils/operationalErrors.js";
import multer from "multer";

const chatsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${process.env.ROOT_PATH}\\Static\\Imgs\\groupChats`);
  },
  filename: (req, file, cb) => {
    const extension = file.mimetype.split("/")[1];
    cb(null, `group-chat-${Date.now()}.${extension}`);
  },
});

const chatsFilter = (req, file, cb) => {
  if (file.startsWith("image") || file.startsWith("video")) cb(null, true);
  else cb(new OperationalErrors("THe uploaded file is not accepted", 400), false);
};

export const fileUpload = multer({ storage: chatsStorage, fileFilter: chatsFilter, limits: 1 });

export const createDM = catchAsync(async (req, res, next) => {
  // 1- check if their follow each other
  const users = await Users.find({ _id: { $in: req.body.members } }).select("+friends");
  firstCondition = users[0]?.friends.findIndex((id) =>
    id.equals(ObjectId.createFromHexString(req.params.id))
  );
  console.log({ ...users }, req.body.members);
  res.json({ users });
  // 2- if not, check if DMs are open from the recipient side
});
// export const createDM = factory.addOne(PrivateChat);

export const deletePrivateChat = catchAsync(async (req, res, next) => {
  const dm = await PrivateChat.findOneById(req.params.id);
  dm.deleted = true;
  await dm.save();
  res.status(204).json({ status: "success" });
});

export const getPrivateChat = catchAsync(async (req, res, next) => {
  const usersIds = req.params.ids.split("-");
  const chat = await PrivateChat.find({ members: usersIds });
  if (!chat) return next(new OperationalErrors("No chat was found", 404));
  res.status(200).json({ status: "success", data: chat });
});

export const createPrivateMessage = catchAsync((req, res, next) => {
  if (req.files) {
    let assets = req.files.map((file) => {
      return file.filename;
    });
  }

  const filteredBody = filterObj(req, body, [
    "content",
    "assets",
    "referenceMessageId",
    "privateChatId",
  ]);
  filteredBody.senderId = req.token.id;
  PrivateMessages.create(filteredBody);
});
