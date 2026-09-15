export interface FileEventPayload {
  conversationId: string;
  documentId: string;
  filename: string;
  status?: string;
  progress?: number;
}

export interface LLMTokenPayload {
  conversationId: string;
  messageId: string;
  token: string;
}

export interface ChatPayload {
  messageId: string;
  conversationId: string;
  message: string;
}
