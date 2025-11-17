# API Documentation

## Tool: codearchitect_help

Get help about CodeArchitect MCP features. Lists available features with descriptions, usage examples, and next steps.

### Request Schema

```typescript
{
  name: "codearchitect_help",
  arguments: {
    feature?: string  // Optional: Specific feature name (store_session, get_session)
  }
}
```

### Response Schema

#### Success Response (All Features)

```typescript
{
  success: true,
  message: "CodeArchitect MCP - Available Features",
  usage_pattern: "Say \"use codearchitect [feature_name]\" or just \"use codearchitect\" to see options",
  features: [
    {
      name: string,
      description: string,
      usage: string,
      examples: string[],
      next_step?: string
    }
  ]
}
```

#### Success Response (Specific Feature)

```typescript
{
  success: true,
  feature: {
    name: string,
    description: string,
    usage: string,
    examples: string[],
    when_to_use: string[],
    details: string
  }
}
```

### Example

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "codearchitect_help"
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
        "text": "{\"success\":true,\"message\":\"CodeArchitect MCP - Available Features\",\"usage_pattern\":\"Say \\\"use codearchitect [feature_name]\\\" or just \\\"use codearchitect\\\" to see options\",\"features\":[{\"name\":\"store_session\",\"description\":\"Save important conversations for future reference\",\"usage\":\"use codearchitect store_session [topic]\",\"examples\":[\"use codearchitect store_session\",\"use codearchitect store_session \\\"authentication implementation\\\"\"]}]}"
      }
    ]
  }
}
```

---

## Tool: store_session

Stores an AI conversation session in a topic-named folder with `summary.md` and `full.md` files in `.codearchitect/sessions/`.

### Request Schema

```typescript
{
  name: "store_session",
  arguments: {
    conversation: string | Message[],  // Required: FULL conversation with COMPLETE content (not summaries)
    topic?: string,                      // Optional: Auto-extracted if not provided
    format?: "plain" | "messages",       // Optional, default: "plain"
    sessionsDir?: string                // Optional: Custom directory for sessions
  }
}
```

**Important**: The `conversation` parameter must contain the FULL, COMPLETE content of all messages - not summaries or placeholders. Include all actual code, explanations, responses, and details. Do NOT use placeholders like "[I did X]" or "[I explained Y]".

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
  file: string,           // Deprecated: Full path to summary file (kept for backward compatibility)
  summaryFile: string,   // Full path to summary.md file
  fullFile: string,       // Full path to full.md file
  filename: string,       // Topic folder name (base filename)
  topic: string,          // Final topic used
  date: string,           // ISO date string
  message: string,        // Human-readable success message
  warning?: string        // Optional warning (e.g., "Conversation is empty")
}
```

**Storage Structure**:
- Sessions are stored in topic-named folders: `.codearchitect/sessions/YYYY-MM-DD/topic-folder/`
- Each folder contains:
  - `summary.md`: Short summary + detailed request/response pairs with key points
  - `full.md`: Complete conversation as JSON (TOON-optimized) + human-readable format

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
        "text": "{\"success\":true,\"summaryFile\":\"/path/to/project/.codearchitect/sessions/2025-01-15/authentication-implementation/summary.md\",\"fullFile\":\"/path/to/project/.codearchitect/sessions/2025-01-15/authentication-implementation/full.md\",\"filename\":\"authentication-implementation\",\"topic\":\"authentication-implementation\",\"date\":\"2025-01-15T14:30:22.123Z\",\"message\":\"Session saved in folder authentication-implementation: summary.md and full.md\"}"
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
        "text": "{\"success\":true,\"summaryFile\":\"/path/to/project/.codearchitect/sessions/2025-01-15/add-database-connection/summary.md\",\"fullFile\":\"/path/to/project/.codearchitect/sessions/2025-01-15/add-database-connection/full.md\",\"filename\":\"add-database-connection\",\"topic\":\"add-database-connection\",\"date\":\"2025-01-15T15:00:00.000Z\",\"message\":\"Session saved in folder add-database-connection: summary.md and full.md\"}"
      }
    ]
  }
}
```

#### Example 3: Custom Sessions Directory

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "store_session",
    "arguments": {
      "conversation": "User: Review code\nAI: I'll review your code...",
      "topic": "Code Review",
      "sessionsDir": "/custom/path/to/sessions"
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
        "text": "{\"success\":true,\"summaryFile\":\"/custom/path/to/sessions/2025-01-15/code-review/summary.md\",\"fullFile\":\"/custom/path/to/sessions/2025-01-15/code-review/full.md\",\"filename\":\"code-review\",\"topic\":\"code-review\",\"date\":\"2025-01-15T16:00:00.000Z\",\"message\":\"Session saved in folder code-review: summary.md and full.md\"}"
      }
    ]
  }
}
```

#### Example 4: Error Response

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

#### Folder Name Collision

If a folder with the same topic name exists, a counter is appended:

- `topic-folder/`
- `topic-folder-1/`
- `topic-folder-2/`
- etc.

**Folder Name Cleanup**: Redundant suffixes like "-summary", "-session", "-conversation", "-chat" are automatically removed from folder names for better readability.

### Sessions Directory Configuration

The sessions directory is determined by the following priority order:

1. **Tool parameter** (`sessionsDir`): If provided in the tool call, this takes highest priority
2. **Environment variable** (`CODEARCHITECT_SESSIONS_DIR`): Set in MCP configuration's `env` section
3. **Default**: `.codearchitect/sessions/` in the detected project root

**Examples:**

- **Per-project storage** (default): Sessions saved in each project's `.codearchitect/sessions/` folder
- **Global storage**: Set `CODEARCHITECT_SESSIONS_DIR` to a single folder to store all sessions in one place
- **Custom per-call**: Pass `sessionsDir` parameter to override for specific calls

See the [README](../README.md) for detailed configuration examples.

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

---

## Tool: get_session

Retrieves stored AI conversation session(s). Supports both old format (single files) and new format (folder-based with summary.md and full.md). Automatically prefers full context when available.

### Request Schema

```typescript
{
  name: "get_session",
  arguments: {
    filename?: string,      // Optional: Topic folder name or specific filename
    date?: string,          // Optional: Filter by date (YYYY-MM-DD format)
    format?: "json" | "toon" | "auto",  // Optional, default: "auto"
    limit?: number,         // Optional: Limit number of sessions when listing
    sessionsDir?: string    // Optional: Custom directory for sessions
  }
}
```

### Response Schema

#### Success Response (Get Specific Session)

```typescript
{
  success: true,
  session: {
    filename: string,       // Topic folder name or filename
    topic: string,          // Session topic
    date: string,          // ISO date string
    file: string,           // Full path to retrieved file (prefers full.md)
    content: string,       // Session content (TOON or JSON format)
    messages?: Message[],  // Parsed messages array (if available)
    format: "json" | "toon"  // Format used
  },
  message: string
}
```

#### Success Response (List Sessions)

```typescript
{
  success: true,
  sessions: [
    {
      filename: string,     // Topic folder name (base filename)
      topic: string,        // Session topic
      date: string,         // Date folder (YYYY-MM-DD)
      file: string,        // Full path to file (prefers full.md)
      size: number         // File size in bytes
    }
  ],
  count: number,
  message: string
}
```

### File Detection Logic

When retrieving by base filename (without suffix):
1. Checks for `topic-folder-name-full.md` (preferred)
2. Falls back to `topic-folder-name-summary.md`
3. Falls back to old format `topic-folder-name.md`

When listing sessions:
- Groups dual-file sessions (summary.md + full.md) by base folder name
- Shows base filename (without suffix) in listings
- Prefers full.md for metadata extraction

### Examples

#### Example 1: Get Specific Session

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_session",
    "arguments": {
      "filename": "authentication-implementation"
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
        "text": "{\"success\":true,\"session\":{\"filename\":\"authentication-implementation\",\"topic\":\"authentication-implementation\",\"date\":\"2025-01-15T14:30:22.123Z\",\"file\":\"/path/to/project/.codearchitect/sessions/2025-01-15/authentication-implementation/full.md\",\"content\":\"messages[5\\t]{role\\tcontent}:...\",\"messages\":[{\"role\":\"user\",\"content\":\"...\"}],\"format\":\"toon\"},\"message\":\"Session retrieved: authentication-implementation\"}"
      }
    ]
  }
}
```

#### Example 2: List All Sessions

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "get_session"
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
        "text": "{\"success\":true,\"sessions\":[{\"filename\":\"authentication-implementation\",\"topic\":\"authentication-implementation\",\"date\":\"2025-01-15\",\"file\":\"/path/to/project/.codearchitect/sessions/2025-01-15/authentication-implementation/full.md\",\"size\":2048}],\"count\":1,\"message\":\"Found 1 session(s)\"}"
      }
    ]
  }
}
```

#### Example 3: List Sessions by Date

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "get_session",
    "arguments": {
      "date": "2025-01-15",
      "limit": 10
    }
  }
}
```

### Format Options

- **`auto`** (default): Automatically chooses TOON format if beneficial (~40% token reduction), otherwise uses JSON
- **`toon`**: Forces TOON format (may fallback to JSON if encoding fails)
- **`json`**: Always returns JSON format

**TOON Format**: Optimized for uniform data structures (message arrays). Automatically reduces token usage by ~40% when retrieving sessions. Falls back to JSON for non-uniform data.

### Backward Compatibility

The tool handles both old and new storage formats:
- **Old format**: Single `.md` files (e.g., `session-20250115-143022-topic.md`)
- **New format**: Folder-based with `summary.md` and `full.md` files

When listing, old format files are shown as-is, while new format sessions are grouped by folder name.

