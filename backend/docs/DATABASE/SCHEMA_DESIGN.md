# Database Design

> **Version:** v1.0  
> **Project:** SIA – Smart Intelligent Assistant

---

# Overview

The SIA database architecture is designed around a **polyglot persistence** approach, where different databases are used for workloads they are best suited for. Instead of relying on a single database for every operation, SIA separates relational data, conversational data, and vector embeddings into dedicated storage systems.

This architecture provides:

- Scalable conversation management
- Efficient authentication and user management
- Fast semantic search
- Long-term memory support
- Optimized Retrieval-Augmented Generation (RAG)
- Future-ready multi-agent compatibility

---

# Database Selection

| Database                | Purpose                                                           |
| ----------------------- | ----------------------------------------------------------------- |
| **PostgreSQL**          | User management, authentication, conversation metadata            |
| **MongoDB**             | Conversation history, messages, AI responses, tool execution logs |
| **pgvector**            | Semantic memory, document embeddings, vector similarity search    |
| **Pinecone (Optional)** | Distributed vector database for large-scale deployments           |

---

# Architecture Overview

```text
                    ┌─────────────────────┐
                    │      PostgreSQL     │
                    │─────────────────────│
                    │ Users               │
                    │ Conversation Meta   │
                    │ Uploaded Documents  │
                    └──────────┬──────────┘
                               │
                               │ References
                               │
                ┌──────────────▼──────────────┐
                │          MongoDB            │
                │─────────────────────────────│
                │ Conversations               │
                │ Messages                    │
                │ Tool Executions             │
                └──────────────┬──────────────┘
                               │
                               │ Embeddings
                               │
                    ┌──────────▼──────────┐
                    │      pgvector       │
                    │─────────────────────│
                    │ Semantic Memory     │
                    │ Document Chunks     │
                    │ Vector Search       │
                    └─────────────────────┘
```

---

# Why Polyglot Persistence?

Different types of data have different access patterns.

For example:

- Authentication requires ACID transactions.
- Conversations contain deeply nested JSON.
- AI memory requires vector similarity search.

Using a dedicated database for each workload significantly improves scalability, maintainability, and performance.

---

# PostgreSQL

PostgreSQL stores all structured and relational data.

## Responsibilities

- User authentication
- User profile management
- Conversation metadata
- Uploaded document metadata
- Future billing and subscriptions
- Role management

---

## Users Table

Stores user identity and authentication information.

### Schema

```json
{
  "internal_id": "bigserial PRIMARY KEY",
  "public_id": "varchar(50) UNIQUE",
  "username": "varchar(50)",
  "email": "varchar(255) UNIQUE",
  "password_hash": "text",
  "profile_image_uri": "text",
  "is_verified": "boolean DEFAULT false",
  "last_login_at": "timestamp",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Indexes

- Primary Key → `internal_id`
- Unique → `public_id`
- Unique → `email`
- Index → `username`

---

## Conversation Metadata

Stores lightweight information about conversations.

### Schema

```json
{
  "internal_id": "bigserial PRIMARY KEY",
  "conversation_id": "varchar(50) UNIQUE",
  "user_public_id": "varchar(50)",
  "title": "varchar(255)",
  "summary": "text",
  "mongo_document_id": "varchar(50)",
  "message_count": "integer",
  "is_archived": "boolean DEFAULT false",
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "last_message_at": "timestamp"
}
```

### Relationships

```
Users (1)
      │
      │
      ▼
Conversation Metadata (N)
```

---

## Uploaded Documents

Stores metadata for uploaded files.

### Schema

```json
{
  "internal_id": "bigserial",
  "document_id": "varchar(50)",
  "user_public_id": "varchar(50)",
  "conversation_id": "varchar(50)",
  "file_name": "text",
  "mime_type": "text",
  "file_size": "bigint",
  "storage_uri": "text",
  "status": "UPLOADED | PROCESSING | READY",
  "created_at": "timestamp"
}
```

---

# MongoDB

MongoDB stores complete conversations and AI-generated content.

Each conversation is represented as a single document.

---

## Responsibilities

- Conversation history
- Messages
- AI responses
- Tool execution history
- Attachments
- Sources
- Model information

---

## Conversation Document

```json
{
  "_id": "ObjectId",

  "conversationId": "conv_xxxxx",

  "userPublicId": "usr_xxxxx",

  "title": "Learning RAG",

  "messages": [
    {
      "messageId": "msg_001",
      "role": "user",
      "content": "Explain Retrieval-Augmented Generation.",
      "attachments": [],
      "timestamp": "ISODate"
    },

    {
      "messageId": "msg_002",
      "role": "assistant",
      "content": "Retrieval-Augmented Generation combines...",
      "sources": [],
      "toolExecutions": [],
      "model": "Gemini",
      "latency": 1.34,
      "timestamp": "ISODate"
    }
  ],

  "createdAt": "ISODate",

  "updatedAt": "ISODate"
}
```

---

## Why Store Messages Separately?

Instead of storing conversations as:

```text
User Query
↓

Assistant Response
```

SIA stores every interaction as an individual message.

Benefits:

- Streaming support
- Message editing
- Response regeneration
- Better compatibility with modern LLM APIs
- Easier pagination

---

## Tool Execution Logs

```json
{
  "_id": "ObjectId",
  "executionId": "tool_xxx",
  "conversationId": "conv_xxx",
  "tool": "terminal",
  "input": {},
  "output": {},
  "status": "SUCCESS",
  "startedAt": "ISODate",
  "completedAt": "ISODate"
}
```

---

# pgvector

pgvector powers semantic search and long-term memory.

---

## Responsibilities

- Vector embeddings
- Long-term memory
- Semantic retrieval
- Document search
- RAG context retrieval

---

## Semantic Memory

```json
{
  "memory_id": "mem_xxx",
  "user_public_id": "usr_xxx",
  "conversation_id": "conv_xxx",
  "source": "conversation",
  "content": "User prefers TypeScript over JavaScript.",
  "embedding": "vector(768)",
  "importance": 0.92,
  "created_at": "timestamp"
}
```

---

## Document Chunks

```json
{
  "chunk_id": "chunk_xxx",
  "document_id": "doc_xxx",
  "chunk_index": 14,
  "content": "Large Language Models require...",
  "embedding": "vector(768)"
}
```

---

# Pinecone (Optional)

Pinecone is reserved for future enterprise deployments where:

- Millions of embeddings exist
- Horizontal scaling is required
- Multi-region deployments are needed
- Low-latency vector retrieval becomes critical

For SIA v1, **pgvector** is sufficient.

---

# Database Relationships

```text
Users
 │
 │ 1:N
 ▼
Conversation Metadata
 │
 │
 ▼
Mongo Conversation Document
 │
 ├──────────────┐
 ▼              ▼
Messages    Tool Executions
 │
 ▼
Semantic Memory
 │
 ▼
Document Chunks
```

---

# Design Principles

The database architecture follows these principles:

- **Normalization** for relational data
- **Document-oriented storage** for conversations
- **Vector-native retrieval** for AI memory
- **Separation of concerns**
- **Scalability**
- **Extensibility**
- **High-performance querying**

---

# Future Enhancements

The current database design is prepared for future capabilities, including:

- Multi-agent collaboration
- Shared workspaces
- Team conversations
- Memory ranking
- Conversation branching
- Versioned messages
- Cross-device synchronization
- Distributed vector databases
- Analytics and telemetry
- Plugin-specific storage

---

# Summary

SIA adopts a polyglot persistence architecture to leverage the strengths of multiple databases. PostgreSQL manages structured relational data, MongoDB efficiently stores conversational documents, and pgvector enables semantic search and long-term AI memory. This design provides a scalable, maintainable, and future-ready foundation for an intelligent agent capable of handling complex conversations, Retrieval-Augmented Generation (RAG), and advanced agentic workflows.
