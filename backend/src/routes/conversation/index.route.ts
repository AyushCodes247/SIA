import { Router } from "express";
import conversationController from "@controllers/conversation/conversation.controller.js";
import verifyUser from "@middlewares/user.middleware.js";

export const router = Router();

router.use(verifyUser);

router.post("/", conversationController.create);

router.get("/", conversationController.getAll);

router.get("/:conversationId", conversationController.getOne);

router.patch("/:conversationId", conversationController.update);

router.patch("/:conversationId/archive", conversationController.archive);

router.delete("/:conversationId", conversationController.remove);

router.patch("/:conversationId/restore", conversationController.restore);

router.post("/search", conversationController.search);

router.post("/:conversationId/export", conversationController.export);
