# Conversation APIs

Conversation APIs are responsible for creating, managing, retrieving, updating, and deleting user conversations.

> **Base Endpoint:** `/api/v1/conversations`

---

# Create Conversation

Creates a new conversation and initializes its metadata.

### Endpoint

```http
POST /conversations
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
  "title": "What is RAM?"
}
```

> If no title is provided, SIA automatically generates one based on the first user message.

### Success Response

**201 Created**

```json
{
  "success": true,
  "message": "Conversation created successfully.",
  "data": {
    "conversationId": "conv_89ab31",
    "title": "What is RAM?",
    "createdAt": "2026-09-05T11:20:10Z",
    "updatedAt": "2026-09-05T11:20:10Z"
  }
}
```

### Error Responses

| Status | Code                  |
| ------ | --------------------- |
| 400    | INVALID_REQUEST       |
| 401    | UNAUTHORIZED          |
| 422    | VALIDATION_ERROR      |
| 500    | INTERNAL_SERVER_ERROR |

---

# Get All Conversations

Returns all conversations belonging to the authenticated user.

### Endpoint

```http
GET /conversations
```

### Authentication

**Required**

### Headers

```http
Authorization: Bearer <ACCESS_TOKEN>
```

### Query Parameters

| Parameter | Type   | Description                      |
| --------- | ------ | -------------------------------- |
| page      | number | Page number                      |
| limit     | number | Number of conversations per page |
| search    | string | Search by title                  |

Example

```http
GET /conversations?page=1&limit=20&search=memory
```

---

### Success Response

```json
{
  "success": true,
  "message": "Conversations fetched successfully.",
  "data": {
    "page": 1,
    "limit": 20,
    "total": 54,
    "conversations": [
      {
        "conversationId": "conv_89ab31",
        "title": "What is RAM?",
        "lastMessage": "RAM is temporary memory...",
        "createdAt": "2026-09-05T11:20:10Z",
        "updatedAt": "2026-09-05T11:25:14Z"
      },
      {
        "conversationId": "conv_72kd93",
        "title": "React Hooks",
        "lastMessage": "useEffect is used...",
        "createdAt": "2026-09-04T10:12:18Z",
        "updatedAt": "2026-09-04T10:45:51Z"
      }
    ]
  }
}
```

---

# Get Conversation

Returns a complete conversation along with all messages.

### Endpoint

```http
GET /conversations/{conversationId}
```

### Authentication

**Required**

### Path Parameters

| Parameter      | Description             |
| -------------- | ----------------------- |
| conversationId | Conversation Identifier |

---

### Success Response

```json
{
  "success": true,
  "message": "Conversation fetched successfully.",
  "data": {
    "conversationId": "conv_89ab31",
    "title": "What is RAM?",
    "messages": [
      {
        "messageId": "msg_1",
        "role": "user",
        "content": "What is RAM?",
        "createdAt": "2026-09-05T11:20:10Z"
      },
      {
        "messageId": "msg_2",
        "role": "assistant",
        "content": "RAM (Random Access Memory) is temporary memory...",
        "sources": ["Wikipedia", "Intel Documentation"],
        "createdAt": "2026-09-05T11:20:13Z"
      }
    ]
  }
}
```

### Error Responses

| Status | Code                   |
| ------ | ---------------------- |
| 401    | UNAUTHORIZED           |
| 404    | CONVERSATION_NOT_FOUND |
| 500    | INTERNAL_SERVER_ERROR  |

---

# Rename Conversation

Updates the conversation title.

### Endpoint

```http
PATCH /conversations/{conversationId}
```

### Authentication

**Required**

### Request Body

```json
{
  "title": "Computer Memory"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Conversation updated successfully.",
  "data": {
    "conversationId": "conv_89ab31",
    "title": "Computer Memory"
  }
}
```

---

# Archive Conversation

Archives a conversation without deleting it.

### Endpoint

```http
PATCH /conversations/{conversationId}/archive
```

### Authentication

**Required**

### Success Response

```json
{
  "success": true,
  "message": "Conversation archived successfully."
}
```

---

# Restore Conversation

Restores an archived conversation.

### Endpoint

```http
PATCH /conversations/{conversationId}/restore
```

### Authentication

**Required**

### Success Response

```json
{
  "success": true,
  "message": "Conversation restored successfully."
}
```

---

# Delete Conversation

Permanently deletes an entire conversation.

### Endpoint

```http
DELETE /conversations/{conversationId}
```

### Authentication

**Required**

### Success Response

**204 No Content**

```json
{
  "success": true,
  "message": "Conversation deleted successfully."
}
```

### Error Responses

| Status | Code                   |
| ------ | ---------------------- |
| 401    | UNAUTHORIZED           |
| 404    | CONVERSATION_NOT_FOUND |
| 500    | INTERNAL_SERVER_ERROR  |

---

# Delete a Message

Deletes a specific message from a conversation.

### Endpoint

```http
DELETE /conversations/{conversationId}/messages/{messageId}
```

### Authentication

**Required**

### Path Parameters

| Parameter      | Description             |
| -------------- | ----------------------- |
| conversationId | Conversation Identifier |
| messageId      | Message Identifier      |

### Success Response

```json
{
  "success": true,
  "message": "Message deleted successfully."
}
```

---

# Search Conversations

Performs semantic or keyword search across user conversations.

### Endpoint

```http
POST /conversations/search
```

### Authentication

**Required**

### Request Body

```json
{
  "query": "memory optimization",
  "limit": 10
}
```

### Success Response

```json
{
  "success": true,
  "message": "Search completed successfully.",
  "data": {
    "results": [
      {
        "conversationId": "conv_89ab31",
        "title": "Memory Management",
        "matchedText": "Vector embeddings improve semantic memory retrieval...",
        "score": 0.96
      }
    ]
  }
}
```

---

# Export Conversation

Exports a conversation in a supported format.

### Endpoint

```http
POST /conversations/{conversationId}/export
```

### Authentication

**Required**

### Request Body

```json
{
  "format": "pdf"
}
```

Supported formats:

- pdf
- markdown
- json
- txt

### Success Response

```json
{
  "success": true,
  "message": "Conversation exported successfully.",
  "data": {
    "downloadUrl": "https://storage.sia.dev/exports/conv_89ab31.pdf"
  }
}
```

---

# Conversation Status Codes

| Status | Description            |
| ------ | ---------------------- |
| 200    | Success                |
| 201    | Conversation Created   |
| 204    | Conversation Deleted   |
| 400    | Bad Request            |
| 401    | Unauthorized           |
| 403    | Forbidden              |
| 404    | Conversation Not Found |
| 409    | Conflict               |
| 422    | Validation Error       |
| 429    | Rate Limited           |
| 500    | Internal Server Error  |
