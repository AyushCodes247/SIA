import ChatService from "@services/chat/chat.service.js";
import { asyncHandler } from "@utils/essential.util.js";
import type { Request, Response } from "express";

class ChatController {
  chat = asyncHandler(
    async (req: Request<{ conversationId: string }>, res: Response) => {
      const { conversationId } = req.params;
      const userPublicId = req.user!.publicId;
      const { message } = req.body;

      if (!conversationId || !message) {
        return res.status(400).json({
          success: false,
          message: "ConversationId and message are required.",
        });
      }

      const result = await ChatService.chat(
        conversationId,
        userPublicId,
        message,
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    },
  );
}

export default new ChatController();
