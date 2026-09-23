import ChatService from "@services/chat/chat.service.js";
import { asyncHandler } from "@utils/essential.util.js";
import type { Request, Response } from "express";

interface ChatAttachmentInput {
  documentId: string;
}

interface ChatRequestBody {
  message: string;
  attachments?: ChatAttachmentInput[];
}

class ChatController {
  chat = asyncHandler(
    async (
      req: Request<{ conversationId: string }, unknown, ChatRequestBody>,
      res: Response,
    ) => {
      const { conversationId } = req.params;

      const userPublicId = req.user!.publicId;

      const { message, attachments = [] } = req.body;

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
        attachments,
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    },
  );

  upload = asyncHandler(
    async (req: Request<{ conversationId: string }>, res: Response) => {
      const { conversationId } = req.params;
      const userPublicId = req.user!.publicId;
      const file = req.file;

      if (!conversationId) {
        return res.status(400).json({
          success: false,
          message: "ConversationId is required.",
        });
      }

      if (!file) {
        return res.status(400).json({
          success: false,
          message: "File is required.",
        });
      }

      const result = await ChatService.uploadAttachment({
        userPublicId,
        conversationId,
        file,
      });

      return res.status(201).json({
        success: true,
        message: "File uploaded and processed successfully.",
        data: result,
      });
    },
  );
}

export default new ChatController();
