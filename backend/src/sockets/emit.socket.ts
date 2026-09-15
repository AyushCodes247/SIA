import { getIO } from "./server.socket.js";
import { SOCKET_EVENTS } from "./events.socket.js";

export function emitFileUploading(conversationId: string, payload: object) {
  getIO()
    .to(`conversation:${conversationId}`)
    .emit(SOCKET_EVENTS.FILE.uploading, payload);
}

export function emitFileProcessing(conversationId: string, payload: object) {
  getIO()
    .to(`conversation:${conversationId}`)
    .emit(SOCKET_EVENTS.FILE.uploading, payload);
}

export function emitFileEmbedding(conversationId: string, payload: object) {
  getIO()
    .to(`conversation:${conversationId}`)
    .emit(SOCKET_EVENTS.FILE.embedding, payload);
}

export function emitFileReady(conversationId: string, payload: object) {
  getIO()
    .to(`conversation:${conversationId}`)
    .emit(SOCKET_EVENTS.FILE.ready, payload);
}

export function emitFileError(conversationId: string, payload: object) {
  getIO()
    .to(`conversation:${conversationId}`)
    .emit(SOCKET_EVENTS.FILE.failed, payload);
}
