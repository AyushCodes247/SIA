import verifyUser from "@/middlewares/user.middleware.js";
import { Router } from "express";
import upload from "@configs/multer.config.js";
import chat from "@/controllers/chat/chat.controller.js";

export const router: Router = Router();

router.post(
  "/",
  verifyUser,
  upload.fields([
    { name: "file", maxCount: 2 },
    { name: "image", maxCount: 2 },
  ]),
  chat,
);
