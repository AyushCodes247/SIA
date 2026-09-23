import type {
  IMessage,
  IAttachment,
  ISource,
  IToolExecution,
} from "@models/conversation.model.js";

export interface BrainInput {
  conversationId: string;

  userPublicId: string;

  message: string;
  messages: IMessage[];
  attachments?: IAttachment[];
}

export interface BrainContext {
  web?: unknown;
  rag?: unknown;
  memory?: unknown;
  tools?: unknown;
}

export interface BrainResult {
  content: string;
  sources?: ISource[];
  toolExecutions?: IToolExecution[];

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
  needs_clarification: boolean;
  clarification_reason?: string;
}
