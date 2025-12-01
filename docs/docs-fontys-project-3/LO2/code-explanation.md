# Code Explanation Document

**CodeArchitect MCP Ecosystem Project**

**Date**: November 17-19, 2025  
**Author**: Tair Kaldybayev  
**Links to**: S1-LO2 (Creating professional IT products), S1-LO3 (Professional standard)

---

## Introduction

This document provides a detailed explanation of the CodeArchitect MCP server implementation, including code structure, key functions, design patterns, and technical decisions. This documentation serves as a technical reference for understanding how the system works.

## Code Structure Overview

### Project Organization

The project follows a **feature-based architecture** where each major feature is organized in its own directory:

```
code-architect-mcp/
├── src/
│   ├── server.ts                 # MCP server entry point
│   ├── store-session/           # Store session feature
│   ├── get-session/             # Get session feature
│   ├── search-session/          # Search session feature
│   └── shared/                  # Shared utilities
├── tests/                       # Test suites
├── dist/                        # Compiled output
└── docs/                        # Documentation
```

### Feature-Based Architecture

**Design Decision**: Feature-based structure instead of layer-based (e.g., controllers, services, models)

**Rationale**:
- Clear separation of concerns
- Easy to add new features (just add new folder)
- Features are self-contained and independently testable
- Better scalability for future additions

## Core Components

### 1. MCP Server Core (`server.ts`)

**Purpose**: Entry point and orchestration layer for the MCP server.

**Key Responsibilities**:
- Initialize MCP server with protocol SDK
- Register all available tools
- Route tool calls to appropriate handlers
- Handle errors and format responses

**Key Code Sections**:

```typescript
// Server initialization
const server = new Server(
  {
    name: 'codearchitect-mcp',
    version: '0.1.8',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool registration
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      { /* store_session tool schema */ },
      { /* get_session tool schema */ },
      { /* search_session tool schema */ },
      { /* codearchitect_help tool schema */ },
    ],
  };
});
```

**Design Patterns**:
- **Request Handler Pattern**: Separate handlers for each request type
- **Error Handling Pattern**: Centralized error handling with custom error types
- **Tool Registration Pattern**: Declarative tool definitions

### 2. Session Storage Feature (`store-session/`)

#### SessionStoreManager.ts

**Purpose**: Core logic for storing AI conversation sessions.

**Key Methods**:

1. **`storeSession(params)`**: Main entry point for storage
   - Determines conversation source (provided, export file, or auto-detect)
   - Extracts topic
   - Creates directory structure
   - Formats and writes markdown files

**Key Implementation Details**:

```typescript
async storeSession(params: StoreSessionParams): Promise<StoreSessionResult> {
  // 1. Determine conversation source
  if (conversationProvided) {
    conversation = params.conversation;
  } else {
    // Auto-detect export file
    exportFile = await findLatestExportFile(exportsDir, 10);
    conversation = await parseExport(exportFile.path);
  }
  
  // 2. Extract topic
  const topic = params.topic || await extractTopic(conversation);
  
  // 3. Create directory structure
  const dateFolder = getLocalDateString();
  const topicFolder = generateTopicFolderName(topic);
  const fullPath = join(sessionsDir, dateFolder, topicFolder);
  
  // 4. Format and write files
  await writeFile(join(fullPath, 'summary.md'), summaryMarkdown);
  await writeFile(join(fullPath, 'full.md'), fullMarkdown);
}
```

**Design Decisions**:
- **Dual-file storage**: Summary for quick reference, full for complete context
- **Date-based organization**: Easy to find sessions chronologically
- **Topic folders**: Better organization than flat files
- **Export file auto-detection**: Improves user experience

#### Export Parser (`export-parser.ts`)

**Purpose**: Parse export files from different IDE formats.

**Supported Formats**:
1. **Cursor Format** (Markdown):
   - Pattern: `**User**` and `**Cursor**`/`**Assistant**` markers
   - Extracts messages between markers

2. **VS Code Format** (JSON):
   - Structure: `{requests: [{message: {...}, response: [...]}]}`
   - Extracts from nested structure
   - Filters out tool invocations

**Key Implementation**:

```typescript
export function parseExport(filePath: string): Promise<Message[]> {
  const ext = extname(filePath);
  if (ext === '.json') {
    return parseVSCodeExport(filePath);
  } else {
    return parseCursorExport(filePath);
  }
}
```

**Design Pattern**: **Strategy Pattern** - Different parsing strategies for different formats.

#### Topic Extractor (`topic-extractor.ts`)

**Purpose**: Automatically extract topics from conversations.

**Algorithm**:
1. Analyze conversation beginning (first few messages)
2. Look for key phrases and patterns
3. Extract meaningful topic string
4. Normalize for folder naming

**Normalization Rules**:
- Convert to lowercase
- Replace spaces with hyphens
- Remove special characters
- Remove redundant suffixes (-session, -summary)
- Limit length

**Design Decision**: Automatic extraction improves user experience while allowing manual override.

#### Markdown Formatter (`markdown-formatter.ts`)

**Purpose**: Format conversations as markdown files.

**Output Formats**:
1. **Summary**: Human-readable summary with key conversation points
2. **Full Context**: Complete conversation with JSON messages section for TOON conversion

**Key Features**:
- Preserves code blocks and formatting
- Adds metadata (date, topic, stored timestamp)
- Includes JSON messages array for efficient retrieval

### 3. Session Retrieval Feature (`get-session/`)

#### SessionRetrievalManager.ts

**Purpose**: Retrieve and format stored sessions.

**Key Methods**:

1. **`getSession(params)`**: Get specific session
   - Finds session file
   - Parses markdown
   - Formats according to requested format (JSON/TOON/auto)

2. **`listSessions(params)`**: List all sessions
   - Scans date folders
   - Collects session metadata
   - Supports date filtering

**Format Selection Logic**:

```typescript
// Auto-format selection
if (format === 'auto') {
  // Use TOON for uniform arrays, JSON for others
  if (isUniformArray(messages) && messages.length > threshold) {
    return encodeMessagesToToon(messages);
  } else {
    return messages; // JSON
  }
}
```

**Design Decision**: Auto-format provides best performance without user decision-making.

#### TOON Formatter (`toon-formatter.ts`)

**Purpose**: Encode messages in TOON format for token optimization.

**Benefits**:
- ~40% token reduction for uniform data structures
- Optimized for LLM interactions
- Automatic format detection

**Implementation**: Uses `@toon-format/toon` library for encoding/decoding.

### 4. Search Feature (`search-session/`)

#### SessionSearchManager.ts

**Purpose**: Full-text search across all stored sessions.

**Search Algorithm**:

1. **Scan all sessions**: Iterate through date folders and topic folders
2. **Search in three areas**:
   - Topic name (weighted ×3)
   - Content/body (weighted ×2)
   - Messages (weighted ×1)
3. **Calculate relevance**: Weighted scoring based on match location
4. **Extract snippets**: ~150 characters before/after matches
5. **Sort results**: By relevance (highest first), then date (newest first)

**Key Implementation**:

```typescript
// Relevance scoring
const topicMatches = topic.toLowerCase().includes(query) ? 3 : 0;
const contentMatches = (content.match(new RegExp(query, 'gi')) || []).length * 2;
const messageMatches = messagesMatchCount * 1;

const relevance = (topicMatches + contentMatches + messageMatches) / maxPossibleScore;
```

**Design Decisions**:
- **Simple full-text search**: No complex indexing needed initially
- **Weighted scoring**: Topic matches are more important
- **Snippet extraction**: Provides context for search results
- **Result limiting**: Prevents overwhelming results

### 5. Shared Utilities (`shared/`)

#### File System Utilities (`filesystem.ts`)

**Purpose**: Centralized file system operations.

**Key Functions**:
- `getSessionsDirectory()`: Get main storage location
- `ensureDirectory()`: Create directory if not exists
- `validatePath()`: Security validation
- `findLatestExportFile()`: Auto-detect exports
- `listDirectories()` / `listFiles()`: Directory traversal

**Security Features**:
- Path validation to prevent directory traversal
- Input sanitization
- Permission checks

#### Error Handling (`errors.ts`)

**Purpose**: Centralized error handling.

**Custom Error Types**:
- `SessionError`: Base error with category and message
- Categories: `INVALID_INPUT`, `FILE_SYSTEM`, `NOT_FOUND`, etc.

**Error Format**:
```typescript
{
  success: false,
  error: 'Error message',
  category: 'ERROR_CATEGORY',
  details: 'Additional context'
}
```

**Design Pattern**: **Custom Error Types** for better error categorization and user feedback.

## Design Patterns Used

### 1. Feature-Based Organization
- Each feature is self-contained
- Clear boundaries between features
- Easy to test and maintain

### 2. Manager Pattern
- `SessionStoreManager`, `SessionRetrievalManager`, `SessionSearchManager`
- Encapsulate feature-specific logic
- Provide clean interfaces

### 3. Strategy Pattern
- Export parsing strategies (Cursor vs VS Code)
- Format selection strategies (JSON vs TOON)

### 4. Error Handling Pattern
- Custom error types
- Centralized error handling
- User-friendly error messages

### 5. Factory Pattern
- Tool schema creation
- Format formatter creation

## Key Technical Decisions

### 1. File-Based Storage vs Database

**Decision**: File-based storage (markdown files)

**Rationale**:
- Simpler for MVP (no database setup required)
- Version control friendly (git can track markdown)
- Human-readable (users can browse files directly)
- Sufficient for individual developer use case

**Future**: Database option planned for Coarc platform (team/collaboration features)

### 2. Feature-Based Architecture

**Decision**: Organize by feature, not by layer

**Rationale**:
- Better scalability (easy to add features)
- Clearer code organization
- Independent feature development
- Easier testing

### 3. Dual-File Storage (summary.md + full.md)

**Decision**: Store both summary and full context

**Rationale**:
- Summary for quick browsing
- Full context for complete retrieval
- JSON section in full.md enables TOON conversion

### 4. Date-Based Organization

**Decision**: Organize sessions by date folders

**Rationale**:
- Natural organization (chronological)
- Easy to find recent sessions
- Supports date filtering
- Scalable (one folder per day)

### 5. TOON Format Integration

**Decision**: Use TOON format for token optimization

**Rationale**:
- Significant token reduction (~40%)
- Automatic format selection
- Backward compatible (JSON still supported)

## Code Quality Practices

### TypeScript Strict Mode

- All code uses TypeScript strict mode
- Strong typing throughout
- Compile-time error checking

### Error Handling

- Comprehensive error handling
- User-friendly error messages
- Error categorization
- Recovery strategies where possible

### Testing

- Unit tests for core functionality
- Integration tests for MCP tools
- Test coverage target: 80%+
- Mock file system for tests

### Code Organization

- Clear naming conventions
- Modular design
- Separation of concerns
- Documentation comments

## Performance Considerations

### File I/O Optimization

- Efficient directory traversal
- Async file operations
- Batch operations where possible

### Search Optimization

- Case-insensitive search (single pass)
- Early termination for date filtering
- Result limiting to prevent large outputs

### Memory Management

- Streaming for large files (if needed)
- Efficient data structures
- Garbage collection friendly

## Security Considerations

### Path Validation

- All file paths validated before use
- Directory traversal prevention
- Whitelist-based directory access

### Input Sanitization

- User inputs validated and sanitized
- Type checking
- Length limits

### File System Security

- Permission checks
- Error handling for permission issues
- Safe file operations

## Future Extensibility

### Adding New Features

To add a new feature (e.g., `delete-session`):

1. Create feature folder: `src/delete-session/`
2. Implement manager class
3. Add tool registration in `server.ts`
4. Add tests
5. Update documentation

### Architecture Support

The current architecture supports:
- Easy feature addition
- Independent feature testing
- Clear interfaces
- Shared utilities

---

## Code Examples

### Example 1: Storing a Session

```typescript
// User calls: "use codearchitect store_session"
const result = await sessionStoreManager.storeSession({
  topic: 'authentication-implementation',
  // conversation auto-detected from export file
});
// Result: Session stored at ~/.codearchitect/sessions/2025-11-19/authentication-implementation/
```

### Example 2: Retrieving a Session

```typescript
// User calls: "use codearchitect get_session authentication-implementation"
const result = await sessionRetrievalManager.getSession({
  filename: 'authentication-implementation',
  format: 'auto', // Automatically chooses TOON or JSON
});
// Result: Session content in optimal format
```

### Example 3: Searching Sessions

```typescript
// User calls: "use codearchitect search_session authentication"
const result = await sessionSearchManager.searchSessions({
  query: 'authentication',
  limit: 10,
});
// Result: Top 10 matching sessions with relevance scores
```

---

**Document Status**: Completed during Week 3 implementation phase  
**Next Document**: Validation Plan Document (Week 4)

