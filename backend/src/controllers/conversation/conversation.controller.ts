import { asyncHandler } from "@utils/essential.util.js";
import conversationService from "@services/conversation/conversation.service.js";

class ConversationController {
  create = asyncHandler(async (req, res) => {
    const { title } = req.body;

    const conversation = await conversationService.create({
      userPublicId: String(req.user?.publicId),
      title,
    });

    return res.status(201).json({
      success: true,
      message: "Conversation created successfully.",
      data: conversation,
    });
  });

  getAll = asyncHandler(async (req, res) => {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;

    const conversations = await conversationService.getAll({
      userPublicId: String(req.user?.publicId),
      page,
      limit,
      search,
    });

    return res.status(200).json({
      success: true,
      message: "Conversations fetched successfully.",
      data: conversations,
    });
  });

  getOne = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;

    const conversation = await conversationService.getOne({
      userPublicId: String(req.user?.publicId),
      conversationId: String(conversationId),
    });

    return res.status(200).json({
      success: true,
      message: "Conversation fetched sucessfully.",
      data: conversation,
    });
  });

  update = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    const { title } = req.body;

    const conversation = await conversationService.update({
      userPublicId: String(req.user?.publicId),
      conversationId: String(conversationId),
      title,
    });

    return res.status(200).json({
      success: true,
      message: "Conversation updated successfully.",
      data: conversation,
    });
  });

  archive = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;

    await conversationService.archive({
      userPublicId: String(req.user?.publicId),
      conversationId: String(conversationId),
    });

    return res.status(200).json({
      sucess: true,
      message: "Conversation Archived Successfully.",
    });
  });

  restore = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;

    await conversationService.restore({
      userPublicId: String(req.user?.publicId),
      conversationId: String(conversationId),
    });

    return res.status(200).json({
      success: true,
      message: "Conversation restored successfully.",
    });
  });

  remove = asyncHandler(async (req, res) => {
    const { coversationId } = req.params;

    await conversationService.remove({
      userPublicId: String(req.user?.publicId),
      conversationId: String(coversationId),
    });

    return res.status(204).json({
      success: true,
      message: "conversation Removed successfully.",
    });
  });

  search = asyncHandler(async (req, res) => {
    const { query, limit } = req.body;

    const result = await conversationService.search({
      userPublicId: String(req.user?.publicId),
      query,
      limit,
    });

    return res.status(200).json({
      success: true,
      message: "Conversation Search completed successfully.",
      data: result,
    });
  });

  export = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    const { format } = req.body;

    const result = await conversationService.export({
      userPublicId: String(req.user?.publicId),
      conversationId: String(conversationId),
      format,
    });

    return res.status(200).json({
      success: true,
      message: "Conversation exported successfully.",
      data: result,
    });
  });
}

export default new ConversationController();
