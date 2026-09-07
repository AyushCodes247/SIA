import { Schema, model } from "mongoose";

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
  messages: IMessage[];
}

const conversationSchema = new Schema<IConversation>(
  {
    conversationId: {},

    userPublicId: {},

    title: {},

    messages: [
      {
        messageId: {},

        role: {},

        content: {},

        attachments: {},

        sources: {},

        toolExecutions: {},

        model: {},

        latency: {},

        timestamp: {},
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const ConversationModel = model<IConversation>(
  "Conversation",
  conversationSchema,
);
