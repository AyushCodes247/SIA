import type { IMessage } from "@models/conversation.model.js";

export interface BrainInput {
  conversationId: string;
  userPublicId: string;
  message: string;
  messages: IMessage[];
  attachments?: string[];
}

export interface BrainContext {
  web?: unknown;
  rag?: unknown;
  memory?: unknown;
  tools?: unknown;
}

export interface BrainResult {
  content: string;

  sources?: Array<{
    title: string;
    url?: string;
    type: "web" | "pdf" | "image" | "memory" | "tool";
  }>;

  toolExecutions?: Array<{
    tool: string;
    input: Record<string, unknown>;
    output: Record<string, unknown>;
    status: "SUCCESS" | "FAILED";
  }>;

  model?: string;
}

export interface Classification {
  intent: string;
  domain: string;
  realtime: boolean;
  general: boolean;
  requires_web: boolean;
  requires_tool: boolean;
  complexity: string;
  confidence: number;
}
