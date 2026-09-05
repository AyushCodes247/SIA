# SIA API Documentation

> Version: v1
>
> Base URL: `https://api.sia.dev/api/v1`

---

# Introduction

The SIA API provides secure REST endpoints for authentication, conversation management, Retrieval-Augmented Generation (RAG), memory, developer tools, and AI agent execution.

All endpoints return JSON responses.

---

# API Conventions

## Base URL

```
https://api.sia.dev/api/v1
```

---

## Content Type

Every request should include

```http
Content-Type: application/json
```

---

## Authentication

Protected routes require a JWT access token.

```http
Authorization: Bearer <ACCESS_TOKEN>
```

---

## Standard Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {}
}
```

---

## Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message."
  }
}
```

---

# Authentication API

Authentication endpoints are responsible for user registration, login, verification, token refresh, and logout.

---

# Register User

Creates a new user account.

### Endpoint

```http
POST /auth/register
```

### Authentication

Not Required

### Request Body

```json
{
  "username": "ayush",
  "email": "ayush@example.com",
  "password": "StrongPassword@123"
}
```

### Success Response

**201 Created**

```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 3600,
    "user": {
      "publicId": "usr_29ak31",
      "username": "ayush",
      "email": "ayush@example.com",
      "isVerified": false
    }
  }
}
```

### Possible Errors

| Status | Code                  |
| ------ | --------------------- |
| 400    | INVALID_REQUEST       |
| 409    | EMAIL_ALREADY_EXISTS  |
| 422    | VALIDATION_ERROR      |
| 500    | INTERNAL_SERVER_ERROR |

---

# Login

Authenticates an existing user.

### Endpoint

```http
POST /auth/login
```

### Authentication

Not Required

### Request

```json
{
  "email": "ayush@example.com",
  "password": "StrongPassword@123"
}
```

### Success Response

**200 OK**

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 3600,
    "user": {
      "publicId": "usr_29ak31",
      "username": "ayush",
      "email": "ayush@example.com",
      "isVerified": true
    }
  }
}
```

### Possible Errors

| Status | Code                  |
| ------ | --------------------- |
| 400    | INVALID_CREDENTIALS   |
| 401    | UNAUTHORIZED          |
| 500    | INTERNAL_SERVER_ERROR |

---

# Get Current User

Returns the authenticated user's profile.

### Endpoint

```http
GET /users/me
```

### Authentication

Required

### Headers

```http
Authorization: Bearer <ACCESS_TOKEN>
```

### Success Response

```json
{
  "success": true,
  "message": "Profile fetched successfully.",
  "data": {
    "publicId": "usr_29ak31",
    "username": "ayush",
    "email": "ayush@example.com",
    "isVerified": true,
    "createdAt": "2026-09-05T12:10:45Z"
  }
}
```

---

# Send Verification OTP

Generates and sends an OTP to the registered email.

### Endpoint

```http
POST /auth/otp
```

### Authentication

Required

### Request

```json
{}
```

### Success Response

```json
{
  "success": true,
  "message": "OTP sent successfully."
}
```

> **Note:** The OTP is never returned in the API response. It is delivered only through the configured email service.

---

# Verify OTP

Verifies the user's email using the OTP.

### Endpoint

```http
POST /auth/verify
```

### Authentication

Required

### Request

```json
{
  "otp": "834921"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Email verified successfully.",
  "data": {
    "isVerified": true
  }
}
```

---

# Refresh Access Token

Issues a new access token using a valid refresh token.

### Endpoint

```http
POST /auth/refresh
```

### Authentication

Refresh Token

### Headers

```http
Cookie: refreshToken=<TOKEN>
```

or

```http
Authorization: Bearer <REFRESH_TOKEN>
```

### Success Response

```json
{
  "success": true,
  "message": "Access token refreshed successfully.",
  "data": {
    "accessToken": "eyJhbGc...",
    "expiresIn": 3600
  }
}
```

---

# Logout

Invalidates the current refresh token and logs the user out.

### Endpoint

```http
POST /auth/logout
```

### Authentication

Required

### Success Response

```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

---

# Authentication Status Codes

| Status | Description           |
| ------ | --------------------- |
| 200    | Success               |
| 201    | Resource Created      |
| 400    | Bad Request           |
| 401    | Unauthorized          |
| 403    | Forbidden             |
| 409    | Conflict              |
| 422    | Validation Error      |
| 429    | Rate Limited          |
| 500    | Internal Server Error |
