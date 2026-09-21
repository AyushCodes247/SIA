import { ConversationModel } from "@models/conversation.model.js";
import { conversationMetaTable } from "@schemas/conversation.schema.js";
import db from "@/index.js";

import BrainService from "@brain/brain.service.js";

import { AppError } from "@utils/essential.util.js";

import { eq, and } from "drizzle-orm";

import crypto from "crypto";

class ChatService {
  async chat(conversationId: string, userPublicId: string, message: string) {
    const [conversationMeta] = await db
      .select()
      .from(conversationMetaTable)
      .where(
        and(
          eq(conversationMetaTable.conversationId, conversationId),
          eq(conversationMetaTable.userPublicId, userPublicId),
        ),
      )
      .limit(1);

    if (!conversationMeta) {
      throw new AppError("Conversation not found.", 404);
    }

    let conversation;

    if (conversationMeta.mongoDocumentId) {
      conversation = await ConversationModel.findById(
        conversationMeta.mongoDocumentId,
      );

      if (!conversation) {
        throw new AppError("Conversation document not found.", 404);
      }
    } else {
      conversation = await ConversationModel.create({
        conversationId,
        userPublicId,
        title: conversationMeta.title,
        messages: [],
      });

      await db
        .update(conversationMetaTable)
        .set({
          mongoDocumentId: conversation._id.toString(),
        })
        .where(
          and(
            eq(conversationMetaTable.conversationId, conversationId),
            eq(conversationMetaTable.userPublicId, userPublicId),
          ),
        );
    }

    const messages = [...conversation.messages];

    messages.push({
      messageId: crypto.randomUUID(),
      role: "user",
      content: message,
      timestamp: new Date(),
    });

    const result = await BrainService.braining({
      conversationId,
      userPublicId,
      message,
      messages,
    });

    console.log("BRAIN RESULT:", result);
    console.log("BRAIN CONTENT:", result.content);

    if (
      typeof result.content !== "string" ||
      result.content.trim().length === 0
    ) {
      throw new AppError("Brain returned an invalid response.", 500);
    }

    messages.push({
      messageId: crypto.randomUUID(),
      role: "assistant",
      content: result.content,
      timestamp: new Date(),
      sources: result.sources,
      toolExecutions: result.toolExecutions,
      model: result.model,
    });

    conversation.messages = messages;

    await conversation.save();

    return {
      content: result.content,
      sources: result.sources,
      toolExecutions: result.toolExecutions,
      model: result.model,
    };
  }
}

export default new ChatService();
