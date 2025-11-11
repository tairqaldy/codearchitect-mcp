# API Documentation

## Tool: store_session

Stores an AI conversation session as a markdown file in `.codearchitect/sessions/`.

### Request Schema

```typescript
{
  name: "store_session",
  arguments: {
    conversation: string | Message[],  // Required
    topic?: string,                      // Optional
    format?: "plain" | "messages"        // Optional, default: "plain"
  }
}
```

### Message Format

When `format` is `"messages"`, `conversation` should be an array:

```typescript
interface Message {
  role: string;           // e.g., "user", "assistant", "system"
  content: string | any;  // Message content
}
```

### Response Schema

#### Success Response

```typescript
{
  success: true,
  file: string,        // Full path to saved file
  filename: string,    // Just the filename
  topic: string,       // Final topic used
  date: string,        // ISO date string
  message: string,     // Human-readable success message
  warning?: string     // Optional warning (e.g., "Conversation is empty")
}
```

#### Error Response

```typescript
{
  success: false,
  error: string,       // Error code
  message: string,     // Human-readable error message
  details?: string     // Optional additional details
}
```

### Error Codes

| Code | Description | HTTP Equivalent |
|------|-------------|-----------------|
| `INVALID_INPUT` | Missing or invalid conversation parameter | 400 |
| `PROJECT_ROOT_NOT_FOUND` | Cannot detect project root (non-fatal) | 200 (with warning) |
| `FILE_WRITE_ERROR` | Cannot write file (permissions, disk full) | 500 |
| `FILENAME_GENERATION_ERROR` | Cannot generate unique filename | 500 |
| `TOPIC_EXTRACTION_ERROR` | Error extracting topic (non-fatal) | 200 (with fallback) |
| `DIRECTORY_CREATION_ERROR` | Cannot create directory | 500 |
| `UNKNOWN_ERROR` | Unexpected error | 500 |

### Examples

#### Example 1: Plain Text Conversation

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "store_session",
    "arguments": {
      "conversation": "User: Implement authentication\nAI: Let's use JWT tokens...",
      "topic": "Authentication Implementation",
      "format": "plain"
    }
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\"success\":true,\"file\":\"/path/to/project/.codearchitect/sessions/2025-01-15/session-20250115-143022-authentication-implementation.md\",\"filename\":\"session-20250115-143022-authentication-implementation.md\",\"topic\":\"authentication-implementation\",\"date\":\"2025-01-15T14:30:22.123Z\",\"message\":\"Session saved to session-20250115-143022-authentication-implementation.md\"}"
      }
    ]
  }
}
```

#### Example 2: Messages Array

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "store_session",
    "arguments": {
      "conversation": [
        {
          "role": "user",
          "content": "Add database connection"
        },
        {
          "role": "assistant",
          "content": "I'll help you set up a database connection..."
        }
      ],
      "format": "messages"
    }
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\"success\":true,\"file\":\"/path/to/project/.codearchitect/sessions/2025-01-15/session-20250115-150000-add-database-connection.md\",\"filename\":\"session-20250115-150000-add-database-connection.md\",\"topic\":\"add-database-connection\",\"date\":\"2025-01-15T15:00:00.000Z\",\"message\":\"Session saved to session-20250115-150000-add-database-connection.md\"}"
      }
    ]
  }
}
```

#### Example 3: Error Response

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "store_session",
    "arguments": {
      "conversation": ""
    }
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\"success\":false,\"error\":\"INVALID_INPUT\",\"message\":\"Conversation cannot be empty\",\"details\":null}"
      }
    ]
  }
}
```

### Edge Cases

#### Empty Conversation

If conversation is empty, the session is still saved but with a warning:

```json
{
  "success": true,
  "warning": "Conversation is empty",
  ...
}
```

#### Very Long Conversation

Conversations larger than 1MB are truncated with a warning:

```json
{
  "success": true,
  "warning": "Conversation truncated to 1MB",
  ...
}
```

#### Project Root Not Found

If project root cannot be detected, current directory is used with a warning:

```json
{
  "success": true,
  "warning": "Using current directory as project root",
  ...
}
```

#### Filename Collision

If a file with the same name exists, a counter is appended:

- `session-20250115-143022-topic.md`
- `session-20250115-143022-topic-1.md`
- `session-20250115-143022-topic-2.md`
- etc.

### Limits

- **Conversation size**: Maximum 10MB (validated before processing)
- **Topic length**: Maximum 100 characters (truncated to 50 in filename)
- **Filename collisions**: Up to 1000 attempts before error
- **File size**: Conversations > 1MB are truncated to 1MB

### Security

- All file paths are validated to prevent directory traversal attacks
- Paths must be within the detected project root
- Special characters in topics are sanitized
- File operations are wrapped in try-catch for error handling

