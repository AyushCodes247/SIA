import { Schema, model } from "mongoose";
import crypto from "node:crypto";

export type MessageRole = "system" | "user" | "assistant" | "tool";

export interface IAttachment {
  documentId: string;
  fileName: string;
  mimeType: string;
  storageUri: string;
}

export interface ISource {
  title: string;
  url?: string;
  type: "web" | "pdf" | "image" | "memory" | "tool";
}

export interface IToolExecution {
  tool: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  status: "SUCCESS" | "FAILED";
}

export interface IMessage {
  messageId: string;
  role: MessageRole;
  content: string;

  attachments?: IAttachment[];
  sources?: ISource[];
  toolExecutions?: IToolExecution[];

  model?: string;
  latency?: number;

  timestamp: Date;
}

export interface IConversation {
  conversationId: string;
  userPublicId: string;
  title: string;
  status: "ACTIVE" | "ARCHIVED";

  messages: IMessage[];

  deletedAt?: Date;
}

const attachmentSchema = new Schema<IAttachment>(
  {
    documentId: {
      type: String,
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    storageUri: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const sourceSchema = new Schema<ISource>(
  {
    title: {
      type: String,
      required: true,
    },

    url: String,

    type: {
      type: String,
      enum: ["web", "pdf", "image", "memory", "tool"],
      required: true,
    },
  },
  { _id: false },
);

const toolExecutionSchema = new Schema<IToolExecution>(
  {
    tool: {
      type: String,
      required: true,
    },

    input: {
      type: Schema.Types.Mixed,
      required: true,
    },

    output: {
      type: Schema.Types.Mixed,
      required: true,
    },

    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      required: true,
    },
  },
  { _id: false },
);

const messageSchema = new Schema<IMessage>(
  {
    messageId: {
      type: String,
      default: () => crypto.randomUUID(),
      required: true,
    },

    role: {
      type: String,
      enum: ["system", "user", "assistant", "tool"],
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    attachments: {
      type: [attachmentSchema],
      default: [],
    },

    sources: {
      type: [sourceSchema],
      default: [],
    },

    toolExecutions: {
      type: [toolExecutionSchema],
      default: [],
    },

    model: {
      type: String,
    },

    latency: {
      type: Number,
      min: 0,
    },

    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { _id: false },
);

const conversationSchema = new Schema<IConversation>(
  {
    conversationId: {
      type: String,
      required: true,
      unique: true,
    },

    userPublicId: {
      type: String,
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 100,
      trim: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "ARCHIVED"],
      default: "ACTIVE",
    },

    messages: {
      type: [messageSchema],
      default: [],
    },

    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

conversationSchema.index({
  userPublicId: 1,
  updatedAt: -1,
});

conversationSchema.index({
  userPublicId: 1,
  status: 1,
});

conversationSchema.index({
  title: "text",
});

export const ConversationModel = model<IConversation>(
  "Conversation",
  conversationSchema,
);
