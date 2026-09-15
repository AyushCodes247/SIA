export const SOCKET_EVENTS = {
  FILE: {
    uploading: "file:uploading",
    processing: "file:processing",
    embedding: "file:embedding",
    ready: "file:ready",
    failed: "file:failed",
  },

  LLM: {
    start: "llm:start",
    token: "llm:token",
    end: "llm:end",
    error: "llm:error",
  },

  chat: {
    start: "chat:start",
    complete: "chat:complete",
    error: "chat:error",
  },
} as const;
