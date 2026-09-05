# Chat APIs

Chat APIs are responsible for handling user interactions with SIA, including message processing, streaming responses, document attachments, conversation context, and AI-generated responses.

> **Base Endpoint:** `/api/v1/chat`

---

# Send Message

Sends a user message to SIA and receives an AI-generated response.

### Endpoint

```http
POST /chat
```

### Authentication

**Required**

### Headers

```http
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json
```

### Request Body

```json
{
  "conversationId": "conv_89ab31",
  "message": "Explain Retrieval-Augmented Generation.",
  "attachments": [],
  "stream": false
}
```

### Request Fields

| Field          | Type    | Required | Description               |
| -------------- | ------- | -------- | ------------------------- |
| conversationId | String  | Yes      | Conversation identifier   |
| message        | String  | Yes      | User query                |
| attachments    | Array   | No       | Uploaded files            |
| stream         | Boolean | No       | Enable streaming response |

---

### Success Response

**200 OK**

```json
{
  "success": true,
  "message": "Response generated successfully.",
  "data": {
    "messageId": "msg_101",
    "role": "assistant",
    "content": "Retrieval-Augmented Generation (RAG) combines vector retrieval with Large Language Models to generate context-aware responses.",
    "sources": [
      {
        "title": "LangChain Documentation",
        "url": "https://python.langchain.com"
      }
    ],
    "tokens": {
      "prompt": 152,
      "completion": 98,
      "total": 250
    },
    "model": "Gemini-2.5-Pro",
    "responseTime": "1.4s",
    "createdAt": "2026-09-05T15:41:10Z"
  }
}
```

---

# Streaming Chat

Streams AI responses token-by-token using Server-Sent Events (SSE).

### Endpoint

```http
POST /chat/stream
```

### Authentication

**Required**

### Headers

```http
Authorization: Bearer <ACCESS_TOKEN>
Accept: text/event-stream
```

### Request Body

```json
{
  "conversationId": "conv_89ab31",
  "message": "Explain transformers in detail."
}
```

### Stream Response

```
data: {
  "token":"Transformers"
}

data: {
  "token":" are"
}

data: {
  "token":" deep"
}

data: {
  "token":" learning"
}

data: {
  "done":true
}
```

---

# Regenerate Response

Regenerates the assistant's previous response.

### Endpoint

```http
POST /chat/regenerate
```

### Authentication

**Required**

### Request Body

```json
{
  "conversationId": "conv_89ab31",
  "messageId": "msg_101"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Response regenerated successfully.",
  "data": {
    "messageId": "msg_102",
    "content": "Retrieval-Augmented Generation (RAG) enhances LLMs by retrieving relevant knowledge before generating responses."
  }
}
```

---

# Stop Response Generation

Stops an active streaming response.

### Endpoint

```http
POST /chat/stop
```

### Authentication

**Required**

### Request Body

```json
{
  "conversationId": "conv_89ab31"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Generation stopped successfully."
}
```

---

# Upload Attachment

Uploads documents that can be referenced during chat.

### Endpoint

```http
POST /chat/upload
```

### Authentication

**Required**

### Content-Type

```http
multipart/form-data
```

### Request

```text
file=document.pdf
```

Supported Types

- PDF
- PNG
- JPG
- JPEG
- WEBP
- TXT
- MD

Maximum File Size

```
50 MB
```

### Success Response

```json
{
  "success": true,
  "message": "File uploaded successfully.",
  "data": {
    "attachmentId": "att_21fd8",
    "fileName": "document.pdf",
    "mimeType": "application/pdf",
    "size": "3.8 MB"
  }
}
```

---

# Send Message with Attachments

Uses uploaded files as context for the AI.

### Endpoint

```http
POST /chat
```

### Request

```json
{
  "conversationId": "conv_89ab31",
  "message": "Summarize this document.",
  "attachments": ["att_21fd8"]
}
```

---

### Success Response

```json
{
  "success": true,
  "message": "Summary generated successfully.",
  "data": {
    "summary": "This document explains...",
    "pagesProcessed": 15,
    "sources": ["document.pdf"]
  }
}
```

---

# Edit Previous User Message

Edits a previous user message and regenerates all subsequent responses.

### Endpoint

```http
PATCH /chat/messages/{messageId}
```

### Authentication

**Required**

### Request Body

```json
{
  "content": "Explain vector databases."
}
```

### Success Response

```json
{
  "success": true,
  "message": "Message updated successfully."
}
```

---

# Delete Message

Deletes a specific message from a conversation.

### Endpoint

```http
DELETE /chat/messages/{messageId}
```

### Authentication

**Required**

### Success Response

```json
{
  "success": true,
  "message": "Message deleted successfully."
}
```

---

# Message Feedback

Allows users to rate AI responses.

### Endpoint

```http
POST /chat/feedback
```

### Authentication

**Required**

### Request Body

```json
{
  "messageId": "msg_101",
  "rating": "upvote",
  "feedback": "Very helpful explanation."
}
```

Allowed Ratings

- upvote
- downvote

### Success Response

```json
{
  "success": true,
  "message": "Feedback submitted successfully."
}
```

---

# Retry Failed Message

Retries a failed AI generation request.

### Endpoint

```http
POST /chat/retry
```

### Request Body

```json
{
  "messageId": "msg_101"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Retry initiated successfully."
}
```

---

# Chat History Pagination

Returns conversation messages with pagination.

### Endpoint

```http
GET /chat/history/{conversationId}
```

### Authentication

**Required**

### Query Parameters

```http
?page=1&limit=50
```

### Success Response

```json
{
  "success": true,
  "message": "Chat history fetched successfully.",
  "data": {
    "page": 1,
    "limit": 50,
    "totalMessages": 245,
    "messages": [
      {
        "messageId": "msg_1",
        "role": "user",
        "content": "Hello"
      },
      {
        "messageId": "msg_2",
        "role": "assistant",
        "content": "Hi! How can I help you today?"
      }
    ]
  }
}
```

---

# Chat Status Codes

| Status | Description                       |
| ------ | --------------------------------- |
| 200    | Success                           |
| 201    | Resource Created                  |
| 400    | Bad Request                       |
| 401    | Unauthorized                      |
| 403    | Forbidden                         |
| 404    | Conversation or Message Not Found |
| 413    | Payload Too Large                 |
| 415    | Unsupported Media Type            |
| 422    | Validation Error                  |
| 429    | Rate Limit Exceeded               |
| 500    | Internal Server Error             |

---

# Notes

- Chat responses may be generated using either local or cloud LLMs depending on the Model Router.
- When `stream=true`, responses should be delivered using **Server-Sent Events (SSE)**.
- Uploaded attachments are automatically processed by the RAG pipeline before inference.
- AI responses may include citations, retrieved documents, tool outputs, or execution logs depending on the request.
- Tool execution requiring elevated privileges (e.g., terminal commands, file deletion, Git push) will trigger an explicit user approval workflow before execution.
