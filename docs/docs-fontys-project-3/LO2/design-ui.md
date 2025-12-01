# Design & UI Document

**CodeArchitect MCP Ecosystem Project**

**Date**: November 12-13, 2025  
**Author**: Tair Kaldybayev  
**Links to**: S1-LO2 (Creating professional IT products)

---

## Introduction

This document describes the system design, architecture, and user interface considerations for the CodeArchitect MCP ecosystem. The design focuses on creating a robust, user-friendly solution for storing and retrieving AI conversation sessions.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    IDE (Cursor / VS Code)                    │
│                    with MCP Client Support                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ MCP Protocol (JSON-RPC)
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              CodeArchitect MCP Server                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  MCP Server Core (server.ts)                         │  │
│  │  - Tool Registration                                  │  │
│  │  - Request Routing                                    │  │
│  │  - Error Handling                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ store_session│  │ get_session  │  │search_session│    │
│  │    Feature   │  │   Feature    │  │   Feature    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Shared Utilities                                     │  │
│  │  - File System Operations                             │  │
│  │  - Error Handling                                     │  │
│  │  - Type Definitions                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ File System Operations
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              File System Storage                             │
│  ~/.codearchitect/                                          │
│  ├── exports/          (for export file detection)          │
│  └── sessions/         (main storage location)              │
│      └── YYYY-MM-DD/                                        │
│          └── topic-name/                                    │
│              ├── summary.md                                 │
│              └── full.md                                    │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

#### 1. MCP Server Core (`server.ts`)

**Responsibilities**:
- Initialize MCP server with protocol SDK
- Register all available tools
- Route tool calls to appropriate feature managers
- Handle errors and provide user-friendly messages
- Implement help system

**Key Components**:
- Server initialization with capabilities
- Tool registration for each feature
- Request handling (ListTools, CallTool)
- Error handling and user feedback

#### 2. Feature Modules

**Feature-Based Architecture**:
```
src/
├── store-session/           # Store session feature
│   ├── SessionStoreManager.ts
│   ├── export-parser.ts
│   ├── markdown-formatter.ts
│   ├── topic-extractor.ts
│   ├── input-validator.ts
│   └── types.ts
├── get-session/             # Get session feature
│   ├── SessionRetrievalManager.ts
│   ├── markdown-parser.ts
│   ├── toon-formatter.ts
│   └── types.ts
├── search-session/          # Search session feature
│   ├── SessionSearchManager.ts
│   └── types.ts
└── shared/                  # Shared utilities
    ├── filesystem.ts
    ├── errors.ts
    └── types.ts
```

**Design Benefits**:
- Clear separation of concerns
- Easy to add new features
- Independent testing of each feature
- Better maintainability

#### 3. Shared Utilities

**File System Operations** (`shared/filesystem.ts`):
- Directory management (create, ensure exists)
- File operations (read, write, list)
- Path validation and sanitization
- Export file detection and parsing
- Project root detection (if needed)

**Error Handling** (`shared/errors.ts`):
- Custom error types (`SessionError`)
- Error categorization
- User-friendly error messages
- Error recovery strategies

## File Storage Structure

### Directory Organization

```
~/.codearchitect/
├── exports/                    # Export files (auto-detection)
│   ├── cursor_*.md            # Cursor export files
│   └── *.json                 # VS Code export files
└── sessions/                   # Stored sessions
    └── YYYY-MM-DD/            # Organized by date
        └── topic-name/        # Topic-based folders
            ├── summary.md     # Human-readable summary
            └── full.md        # Complete context with JSON
```

### File Format Design

**Summary File** (`summary.md`):
```markdown
# Topic Name

**Date**: YYYY-MM-DD
**Stored**: YYYY-MM-DD HH:MM:SS

## Summary
Brief summary of conversation...

## Conversation

### User
[User message]

### Assistant
[Assistant response]

...
```

**Full Context File** (`full.md`):
```markdown
# Topic Name

**Date**: YYYY-MM-DD
**Stored**: YYYY-MM-DD HH:MM:SS

## Summary
[Summary content]

## Conversation

[Human-readable conversation]

---

## JSON Messages (for TOON conversion)

```json
[
  {"role": "user", "content": "..."},
  {"role": "assistant", "content": "..."}
]
```
```

## MCP Protocol Integration

### Tool Registration

Each tool is registered with the MCP server:

```typescript
// Tool schema definition
{
  name: 'store_session',
  description: '...',
  inputSchema: {
    type: 'object',
    properties: {
      conversation: { type: 'string' },
      topic: { type: 'string' },
      // ...
    }
  }
}
```

### Request Flow

1. **IDE** sends tool call request via MCP protocol
2. **MCP Server** receives and validates request
3. **Feature Manager** processes the request
4. **File System** performs operations
5. **Response** returned to IDE with results

### Error Handling

- Custom error types for different scenarios
- User-friendly error messages
- Actionable guidance for resolution
- Fallback strategies where applicable

## Export File Detection Design

### Detection Strategy

1. **Primary**: Auto-detect newest file (modified in last 10 minutes)
2. **Secondary**: Pattern matching via `exportFilename` parameter
3. **Tertiary**: Manual file selection (if implemented)

### Format Support

**Cursor Format** (Markdown):
```markdown
**User**

[Message content]

**Cursor**

[Response content]
```

**VS Code Format** (JSON):
```json
{
  "requests": [
    {
      "message": {
        "text": "user message"
      },
      "response": [
        {
          "value": "assistant response"
        }
      ]
    }
  ]
}
```

### Parser Design

- Format auto-detection (by file extension)
- Robust parsing with error handling
- Message extraction and normalization
- Filtering of non-conversation content (tool invocations, etc.)

## Topic Extraction Design

### Extraction Strategy

1. **Manual**: User provides explicit topic via parameter
2. **Automatic**: Extract from conversation content:
   - Analyze conversation beginning
   - Extract key phrases
   - Normalize and sanitize for folder naming
   - Remove redundant suffixes

### Normalization Rules

- Convert to lowercase
- Replace spaces with hyphens
- Remove special characters
- Limit length for readability
- Remove common suffixes (-session, -summary)

## TOON Format Integration

### Purpose

Reduce token usage when retrieving sessions for LLM interactions (~40% reduction).

### Implementation

- TOON format encoding for uniform data structures
- Automatic format selection (`auto` mode)
- Fallback to JSON for non-uniform data
- Benchmark scripts for performance validation

## User Interface Considerations

### IDE Integration

**Setup Process**:
1. Install package via npm
2. Configure MCP server in IDE settings
3. Reload IDE
4. Verify connection (green indicator)

**Usage Flow**:
1. Export chat from IDE
2. Save to exports folder
3. Use MCP tool: `"use codearchitect store_session"`
4. Confirm storage location

### Error Messages

Design principles:
- Clear and actionable
- Platform-specific instructions
- Step-by-step guidance
- Links to documentation

### Help System

- Built-in help tool (`codearchitect_help`)
- Feature discovery
- Usage examples
- Workflow guidance
- Iterative knowledge base building process

## Landing Page Design

### Key Sections

1. **Hero Section**: Clear value proposition
2. **Features**: Core capabilities overview
3. **Quick Start**: Installation and setup
4. **Documentation Links**: API, FAQ, Troubleshooting
5. **Stats**: Real-time NPM download statistics

### Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Features**: Interactive animations, responsive design

## Documentation Site Design

### Structure

- **Home**: Project overview
- **Getting Started**: Installation and setup
- **API Reference**: Tool documentation with examples
- **Guides**: Usage workflows and best practices
- **Troubleshooting**: Common issues and solutions

### Technology Stack

- **Platform**: Mintlify
- **Features**: Interactive API reference, search functionality

## Performance Considerations

### File I/O Optimization

- Efficient directory traversal
- Batch operations where possible
- Caching of frequently accessed data
- Lazy loading of large files

### Search Performance

- Indexed search (if implemented)
- Relevance scoring optimization
- Result limiting
- Date filtering for efficiency

## Security Design

### Path Validation

- Prevent directory traversal attacks
- Sanitize user inputs
- Validate all file paths
- Restrict access to allowed directories only

### Input Validation

- Type checking
- Length limits
- Character sanitization
- Format validation

## Testing Strategy

### Unit Tests

- Feature-specific test suites
- Mock file system operations
- Test edge cases
- Test error scenarios

### Integration Tests

- End-to-end tool workflows
- Real file system operations (in test directories)
- MCP protocol integration testing
- Cross-platform testing

### Performance Tests

- TOON format benchmarks
- File I/O performance
- Search performance (if implemented)

## Future Extensibility

### Design for Growth

- Feature-based architecture allows easy addition
- Shared utilities reduce duplication
- Clear interfaces between components
- Modular design supports independent development

### Potential Extensions

- Additional MCP tools
- CLI interface
- Cloud synchronization (Coarc platform)
- Advanced search features
- Analytics and insights

---

**Document Status**: Completed during Week 2 design phase  
**Next Document**: System Architecture Flowchart

