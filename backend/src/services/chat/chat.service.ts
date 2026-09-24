import { ConversationModel } from "@models/conversation.model.js";

import { conversationMetaTable } from "@schemas/conversation.schema.js";

import { docMetaTable } from "@schemas/document.schema.js";

import db from "@/index.js";

import BrainService from "@brain/brain.service.js";

import { ingestDocument } from "@pipes/ingest.pipe.js";

import { AppError } from "@utils/essential.util.js";

import { eq, and, isNull, inArray } from "drizzle-orm";

import crypto from "node:crypto";

interface UploadAttachmentInput {
  userPublicId: string;

  conversationId: string;

  file: Express.Multer.File;
}

interface ChatAttachmentInput {
  documentId: string;
}

class ChatService {
  async chat(
    conversationId: string,
    userPublicId: string,
    message: string,
    attachmentInputs: ChatAttachmentInput[] = [],
  ) {
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

    const attachments = await this.resolveAttachments(
      userPublicId,
      conversationId,
      attachmentInputs,
    );

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
      attachments,
      sources: [],
      toolExecutions: [],
      timestamp: new Date(),
    });

    const result = await BrainService.braining({
      conversationId,
      userPublicId,
      message,
      messages,
      attachments,
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
      attachments: [],
      sources: result.sources ?? [],
      toolExecutions: result.toolExecutions ?? [],
      model: result.model,
      timestamp: new Date(),
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

  async uploadAttachment({
    userPublicId,
    conversationId,
    file,
  }: UploadAttachmentInput) {
    const [conversation] = await db
      .select({
        conversationId: conversationMetaTable.conversationId,
      })
      .from(conversationMetaTable)
      .where(
        and(
          eq(conversationMetaTable.conversationId, conversationId),
          eq(conversationMetaTable.userPublicId, userPublicId),
        ),
      )
      .limit(1);

    if (!conversation) {
      throw new AppError("Conversation not found.", 404);
    }

    const [document] = await db
      .insert(docMetaTable)
      .values({
        userPublicId,
        conversationId,
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        storageUri: file.path,
        status: "UPLOADED",
      })
      .returning({
        documentId: docMetaTable.documentId,
        fileName: docMetaTable.fileName,
        mimeType: docMetaTable.mimeType,
        fileSize: docMetaTable.fileSize,
        storageUri: docMetaTable.storageUri,
      });

    if (!document) {
      throw new AppError("Failed to create document metadata.", 500);
    }

    try {
      await db
        .update(docMetaTable)
        .set({
          status: "PROCESSING",
        })
        .where(eq(docMetaTable.documentId, document.documentId));

      await ingestDocument(
        file.path,
        document.fileName,
        document.documentId,
        document.mimeType,
      );

      await db
        .update(docMetaTable)
        .set({
          status: "READY",
        })
        .where(eq(docMetaTable.documentId, document.documentId));
    } catch (error) {
      await db
        .update(docMetaTable)
        .set({
          status: "FAILED",
        })
        .where(eq(docMetaTable.documentId, document.documentId));

      console.error(`RAG ingestion failed for ${document.documentId}:`, error);

      throw new AppError("Failed to process uploaded document.", 500);
    }

    return {
      documentId: document.documentId,
      fileName: document.fileName,
      mimeType: document.mimeType,
      fileSize: document.fileSize,
    };
  }

  private async resolveAttachments(
    userPublicId: string,
    conversationId: string,
    attachmentInputs: ChatAttachmentInput[],
  ) {
    if (attachmentInputs.length === 0) {
      return [];
    }

    const documentIds = [
      ...new Set(attachmentInputs.map((attachment) => attachment.documentId)),
    ];

    const documents = await db
      .select({
        documentId: docMetaTable.documentId,
        fileName: docMetaTable.fileName,
        mimeType: docMetaTable.mimeType,
        storageUri: docMetaTable.storageUri,
      })
      .from(docMetaTable)
      .where(
        and(
          eq(docMetaTable.userPublicId, userPublicId),
          eq(docMetaTable.conversationId, conversationId),
          eq(docMetaTable.status, "READY"),
          isNull(docMetaTable.deletedAt),
          inArray(docMetaTable.documentId, documentIds),
        ),
      );

    console.log("ATTACHMENT INPUTS:", attachmentInputs);
    console.log("DOCUMENT IDS:", documentIds);
    console.log("USER PUBLIC ID:", userPublicId);
    console.log("CONVERSATION ID:", conversationId);
    console.log("RESOLVED DOCUMENTS:", documents);
    console.log("EXPECTED:", documentIds.length, "FOUND:", documents.length);

    if (documents.length !== documentIds.length) {
      throw new AppError(
        "One or more attachments are invalid or not ready.",
        400,
      );
    }

    return documents;
  }
}

export default new ChatService();
