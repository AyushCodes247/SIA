import { and, desc, eq, ilike, sql } from "drizzle-orm";
import db from "@/index.js";
import { conversationMetaTable } from "@schemas/conversation.schema.js";
import { AppError } from "@utils/essential.util.js";

class ConversationService {
  async create({
    userPublicId,
    title,
  }: {
    userPublicId: string;
    title: string;
  }) {
    const [conversation] = await db
      .insert(conversationMetaTable)
      .values({
        userPublicId: userPublicId,
        title: title?.trim() || "New Conversation",
      })
      .returning({
        conversationId: conversationMetaTable.conversationId,
        title: conversationMetaTable.title,
        createdAt: conversationMetaTable.createdAt,
        updatedAt: conversationMetaTable.updatedAt,
      });

    if (!conversation) {
      throw new AppError("Failed to created conversation.", 500);
    }

    return conversation;
  }

  async getAll({
    userPublicId,
    page = 1,
    limit = 20,
    search,
  }: {
    userPublicId: string;
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 100);
    const offset = (safePage - 1) * safeLimit;

    const conditions = [eq(conversationMetaTable.userPublicId, userPublicId)];

    if (search?.trim()) {
      conditions.push(ilike(conversationMetaTable.title, `%${search.trim()}%`));
    }

    const conversations = await db
      .select({
        conversationId: conversationMetaTable.conversationId,
        title: conversationMetaTable.title,
        createdAt: conversationMetaTable.createdAt,
        updatedAt: conversationMetaTable.updatedAt,
      })
      .from(conversationMetaTable)
      .where(and(...conditions))
      .orderBy(desc(conversationMetaTable.updatedAt))
      .limit(safeLimit)
      .offset(offset);

    const [count] = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(conversationMetaTable)
      .where(and(...conditions));

    const total = Number(count?.count ?? 0);

    return {
      conversations,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async getOne({
    userPublicId,
    conversationId,
  }: {
    userPublicId: string;
    conversationId: string;
  }) {
    const [conversation] = await db
      .select({
        conversationId: conversationMetaTable.conversationId,
        title: conversationMetaTable.title,
        createdAt: conversationMetaTable.createdAt,
        updatedAt: conversationMetaTable.updatedAt,
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

    return conversation;
  }

  async update({
    userPublicId,
    conversationId,
    title,
  }: {
    userPublicId: string;
    conversationId: string;
    title: string;
  }) {
    const trimmedTitle = title?.trim();

    if (!trimmedTitle) {
      throw new AppError("Conversation title is required.", 400);
    }

    const [conversation] = await db
      .update(conversationMetaTable)
      .set({
        title: trimmedTitle,
      })
      .where(
        and(
          eq(conversationMetaTable.conversationId, conversationId),
          eq(conversationMetaTable.userPublicId, userPublicId),
        ),
      )
      .returning({
        conversationId: conversationMetaTable.conversationId,
        title: conversationMetaTable.title,
        createdAt: conversationMetaTable.createdAt,
        updatedAt: conversationMetaTable.updatedAt,
      });

    if (!conversation) {
      throw new AppError("Conversation not found.", 404);
    }

    return conversation;
  }

  async archive({
    userPublicId,
    conversationId,
  }: {
    userPublicId: string;
    conversationId: string;
  }) {
    const [conversation] = await db
      .update(conversationMetaTable)
      .set({
        archivedAt: new Date(),
      })
      .where(
        and(
          eq(conversationMetaTable.userPublicId, userPublicId),
          eq(conversationMetaTable.conversationId, conversationId),
        ),
      )
      .returning({
        conversationId: conversationMetaTable.conversationId,
        archivedAt: conversationMetaTable.archivedAt,
      });

    if (!conversation) {
      throw new AppError("Conversation not found.", 404);
    }

    return conversation;
  }

  async restore({
    userPublicId,
    conversationId,
  }: {
    userPublicId: string;
    conversationId: string;
  }) {
    const [conversation] = await db
      .update(conversationMetaTable)
      .set({
        archivedAt: null,
      })
      .where(
        and(
          eq(conversationMetaTable.userPublicId, userPublicId),
          eq(conversationMetaTable.conversationId, conversationId),
        ),
      )
      .returning({
        conversationId: conversationMetaTable.conversationId,
        archivedAt: conversationMetaTable.archivedAt,
      });

    if (!conversation) {
      throw new AppError("Conversation not found.", 404);
    }

    return conversation;
  }

  async remove({
    userPublicId,
    conversationId,
  }: {
    userPublicId: string;
    conversationId: string;
  }) {
    const [conversation] = await db
      .update(conversationMetaTable)
      .set({
        deletedAt: new Date(),
      })
      .where(
        and(
          eq(conversationMetaTable.conversationId, conversationId),
          eq(conversationMetaTable.userPublicId, userPublicId),
        ),
      )
      .returning({
        conversationId: conversationMetaTable.conversationId,
      });

    if (!conversation) {
      throw new AppError("Conversation not found.", 404);
    }

    return conversation;
  }

  async search({
    userPublicId,
    query,
    limit = 20,
  }: {
    userPublicId: string;
    query: string;
    limit?: number;
  }) {
    const trimmedQuery = query?.trim();

    if (!trimmedQuery) {
      throw new AppError("Search query is mandatory.", 400);
    }

    const safeLimit = Math.min(Math.max(1, limit), 100);

    const conversations = await db
      .select({
        conversationId: conversationMetaTable.conversationId,
        title: conversationMetaTable.title,
        createdAt: conversationMetaTable.createdAt,
        updatedAt: conversationMetaTable.updatedAt,
      })
      .from(conversationMetaTable)
      .where(
        and(
          eq(conversationMetaTable.userPublicId, userPublicId),
          ilike(conversationMetaTable.title, `%${trimmedQuery}%`),
        ),
      )
      .orderBy(desc(conversationMetaTable.updatedAt))
      .limit(safeLimit);

    if (!conversations) {
      throw new AppError("Conversations not found for the query.", 404);
    }

    return conversations;
  }

  async export({
    userPublicId,
    conversationId,
    format,
  }: {
    userPublicId: string;
    conversationId: string;
    format: "pdf" | "markdown" | "json" | "txt";
  }) {
    await this.getOne({
      userPublicId,
      conversationId,
    });

    /*
     * Export implementation will be added later.
     *
     * It will need:
     * PostgreSQL → conversation metadata
     * MongoDB → conversation messages
     * Export generator → PDF / Markdown / JSON / TXT
     * Storage → generated file
     */

    throw new AppError(
      `Conversation export in ${format} format is not implemented yet.`,
      501,
    );
  }
}

export default new ConversationService();
