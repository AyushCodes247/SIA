import verifyUser from "@/middlewares/user.middleware.js";
import { Router } from "express";
import upload from "@configs/multer.config.js";
import ChatController from "@controllers/chat/chat.controller.js";

export const router: Router = Router();

router.use(verifyUser);

router.post("/:conversationId", ChatController.chat);

router.post("/:conversationId/uploads", upload.single("file"), ChatController.upload);