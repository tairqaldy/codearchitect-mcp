# System Architecture Flowchart

**CodeArchitect MCP Ecosystem Project**

**Date**: November 14, 2025  
**Author**: Tair Kaldybayev  
**Links to**: S1-LO2 (Creating professional IT products)

---

## Introduction

This document provides visual flowcharts representing the system architecture and key workflows of the CodeArchitect MCP server. These diagrams illustrate how different components interact and how data flows through the system.

## System Overview Flow

```mermaid
graph TD
    A[Developer using IDE] -->|MCP Protocol| B[CodeArchitect MCP Server]
    B -->|Tool Request| C{Which Tool?}
    C -->|store_session| D[SessionStoreManager]
    C -->|get_session| E[SessionRetrievalManager]
    C -->|search_session| F[SessionSearchManager]
    C -->|codearchitect_help| G[Help System]
    
    D -->|File Operations| H[File System]
    E -->|File Operations| H
    F -->|File Operations| H
    
    H -->|Storage| I[~/.codearchitect/sessions/]
    H -->|Exports| J[~/.codearchitect/exports/]
    
    D -->|Response| B
    E -->|Response| B
    F -->|Response| B
    G -->|Response| B
    
    B -->|MCP Protocol| A
```

## Session Storage Flow

```mermaid
sequenceDiagram
    participant IDE
    participant MCP Server
    participant StoreManager
    participant ExportParser
    participant TopicExtractor
    participant MarkdownFormatter
    participant FileSystem
    
    IDE->>MCP Server: store_session tool call
    MCP Server->>StoreManager: process request
    
    alt Conversation provided
        StoreManager->>StoreManager: Use provided conversation
    else Auto-detect export file
        StoreManager->>FileSystem: Find latest export file
        FileSystem-->>StoreManager: Export file path
        StoreManager->>ExportParser: Parse export file
        ExportParser->>ExportParser: Detect format (MD/JSON)
        ExportParser->>ExportParser: Extract messages
        ExportParser-->>StoreManager: Parsed conversation
    end
    
    StoreManager->>TopicExtractor: Extract topic
    TopicExtractor-->>StoreManager: Topic string
    
    StoreManager->>FileSystem: Create date folder (YYYY-MM-DD)
    StoreManager->>FileSystem: Create topic folder
    StoreManager->>FileSystem: Ensure directories exist
    
    StoreManager->>MarkdownFormatter: Format summary
    MarkdownFormatter-->>StoreManager: Summary markdown
    StoreManager->>FileSystem: Write summary.md
    
    StoreManager->>MarkdownFormatter: Format full context
    MarkdownFormatter-->>StoreManager: Full markdown with JSON
    StoreManager->>FileSystem: Write full.md
    
    FileSystem-->>StoreManager: Success
    StoreManager-->>MCP Server: Storage result
    MCP Server-->>IDE: Success response with location
```

## Session Retrieval Flow

```mermaid
sequenceDiagram
    participant IDE
    participant MCP Server
    participant RetrievalManager
    participant MarkdownParser
    participant TOONFormatter
    participant FileSystem
    
    IDE->>MCP Server: get_session tool call
    MCP Server->>RetrievalManager: process request
    
    alt No parameters (list all)
        RetrievalManager->>FileSystem: List all sessions
        FileSystem-->>RetrievalManager: Session list with metadata
        RetrievalManager-->>MCP Server: List of sessions
    else Filename or date provided
        RetrievalManager->>FileSystem: Find session(s)
        FileSystem-->>RetrievalManager: Session file(s)
        
        RetrievalManager->>MarkdownParser: Parse session file
        MarkdownParser->>MarkdownParser: Extract topic, date, content
        MarkdownParser->>MarkdownParser: Extract JSON messages (if available)
        MarkdownParser-->>RetrievalManager: Parsed session data
        
        alt Format requested: TOON
            RetrievalManager->>TOONFormatter: Encode to TOON
            TOONFormatter-->>RetrievalManager: TOON-encoded data
        else Format requested: JSON
            RetrievalManager->>RetrievalManager: Use JSON messages
        else Format: auto
            RetrievalManager->>RetrievalManager: Choose best format
        end
        
        RetrievalManager-->>MCP Server: Session content
    end
    
    MCP Server-->>IDE: Session data or list
```

## Search Flow

```mermaid
sequenceDiagram
    participant IDE
    participant MCP Server
    participant SearchManager
    participant FileSystem
    participant RelevanceScorer
    
    IDE->>MCP Server: search_session tool call
    MCP Server->>SearchManager: process search request
    
    SearchManager->>FileSystem: Scan sessions directory
    FileSystem-->>SearchManager: List of all session folders
    
    loop For each session
        SearchManager->>FileSystem: Read session files
        FileSystem-->>SearchManager: Session content
        
        SearchManager->>SearchManager: Search in topic
        SearchManager->>SearchManager: Search in content
        SearchManager->>SearchManager: Search in messages
        
        alt Match found
            SearchManager->>RelevanceScorer: Calculate relevance
            RelevanceScorer->>RelevanceScorer: Weighted scoring
            RelevanceScorer-->>SearchManager: Relevance score
            SearchManager->>SearchManager: Extract context snippets
        end
    end
    
    SearchManager->>SearchManager: Filter by date (if specified)
    SearchManager->>SearchManager: Sort by relevance
    SearchManager->>SearchManager: Limit results (if specified)
    SearchManager-->>MCP Server: Search results with scores
    MCP Server-->>IDE: Search results
```

## Export File Detection Flow

```mermaid
flowchart TD
    A[store_session called] -->|No conversation provided| B{exportFilename<br/>specified?}
    B -->|Yes| C[Find file by pattern]
    B -->|No| D[Find latest file]
    
    C -->|File found| E[Read file content]
    C -->|Not found| F[Error: File not found]
    
    D -->|File found<br/>modified < 10min| E
    D -->|No file found| G[Error: No export file]
    
    E -->|Check extension| H{.md or .json?}
    H -->|.md| I[Parse Cursor format]
    H -->|.json| J[Parse VS Code format]
    
    I -->|Extract| K[User/Assistant messages]
    J -->|Extract| K
    
    K --> L[Normalize messages]
    L --> M[Continue storage flow]
    
    F --> N[Show available files]
    G --> O[Show export instructions]
```

## MCP Protocol Interaction Flow

```mermaid
sequenceDiagram
    participant IDE as IDE Client
    participant MCP as MCP Server
    participant Tools as Tool Handlers
    
    Note over IDE,MCP: Initialization
    IDE->>MCP: Initialize (capabilities)
    MCP-->>IDE: Server info + capabilities
    
    Note over IDE,MCP: Tool Discovery
    IDE->>MCP: ListTools request
    MCP->>MCP: Get registered tools
    MCP-->>IDE: Tool list with schemas
    
    Note over IDE,MCP: Tool Execution
    IDE->>MCP: CallTool request (store_session)
    MCP->>MCP: Validate request
    MCP->>Tools: Route to handler
    Tools->>Tools: Execute tool logic
    Tools-->>MCP: Tool result
    MCP-->>IDE: Tool response
    
    Note over IDE,MCP: Error Handling
    alt Error occurs
        Tools->>MCP: Error details
        MCP->>MCP: Format error message
        MCP-->>IDE: Error response
    end
```

## File Storage Structure Flow

```mermaid
graph TD
    A[Session Storage Request] --> B[Get Sessions Directory]
    B --> C[~/.codearchitect/sessions/]
    
    C --> D[Create/Use Date Folder]
    D --> E[YYYY-MM-DD/]
    
    E --> F[Extract Topic]
    F --> G[Normalize Topic Name]
    
    G --> H[Create Topic Folder]
    H --> I[topic-name/]
    
    I --> J[Write summary.md]
    I --> K[Write full.md]
    
    J --> L[Storage Complete]
    K --> L
    
    style C fill:#e1f5ff
    style E fill:#fff4e1
    style I fill:#ffe1f5
    style L fill:#e1ffe1
```

## Topic Extraction Flow

```mermaid
flowchart TD
    A[Conversation Data] -->|Check| B{Topic provided<br/>explicitly?}
    B -->|Yes| C[Use provided topic]
    B -->|No| D[Extract from conversation]
    
    D --> E[Analyze conversation start]
    E --> F[Find key phrases]
    F --> G[Extract topic string]
    
    C --> H[Normalize topic]
    G --> H
    
    H --> I[Convert to lowercase]
    I --> J[Replace spaces with hyphens]
    J --> K[Remove special characters]
    K --> L[Remove redundant suffixes]
    L --> M[Limit length]
    M --> N[Final topic name]
    
    N --> O[Use for folder name]
```

## TOON Format Conversion Flow

```mermaid
flowchart TD
    A[Retrieve Session Request] --> B{Format<br/>requested?}
    B -->|json| C[Return JSON]
    B -->|toon| D[Convert to TOON]
    B -->|auto| E{Check data<br/>structure}
    
    E -->|Uniform array| D
    E -->|Non-uniform| C
    E -->|Small dataset| C
    
    D --> F[TOON encoding]
    F --> G[~40% token reduction]
    G --> H[Return TOON format]
    
    C --> I[Return JSON format]
    
    style G fill:#e1ffe1
    style H fill:#ffe1f5
    style I fill:#fff4e1
```

## Error Handling Flow

```mermaid
flowchart TD
    A[Operation Request] --> B[Validate Input]
    B -->|Invalid| C[Input Validation Error]
    B -->|Valid| D[Execute Operation]
    
    D -->|Success| E[Return Success Result]
    D -->|Error| F{Error Type?}
    
    F -->|File System| G[File System Error]
    F -->|Permission| H[Permission Error]
    F -->|Not Found| I[Not Found Error]
    F -->|Other| J[Generic Error]
    
    G --> K[Format Error Message]
    H --> K
    I --> K
    J --> K
    C --> K
    
    K --> L[Add Context & Guidance]
    L --> M[Return Error Response]
    
    style E fill:#e1ffe1
    style M fill:#ffe1e1
```

## Help System Flow

```mermaid
flowchart TD
    A[Help Request] --> B{Feature<br/>specified?}
    B -->|No| C[Show All Features]
    B -->|Yes| D[Show Feature Details]
    
    C --> E[List Features]
    E --> F[store_session]
    E --> G[get_session]
    E --> H[search_session]
    
    F --> I[Feature Info]
    G --> I
    H --> I
    
    I --> J[Usage Examples]
    J --> K[Workflow Guide]
    
    D --> L[Feature-Specific Info]
    L --> J
    
    K --> M[Return Help Content]
    I --> M
    
    style M fill:#e1f5ff
```

---

## Summary

These flowcharts illustrate the key workflows and architecture of the CodeArchitect MCP server:

1. **System Overview**: Shows how different components interact
2. **Session Storage**: Complete flow from request to file storage
3. **Session Retrieval**: How sessions are retrieved and formatted
4. **Search Flow**: How full-text search works across sessions
5. **Export Detection**: Auto-detection of export files
6. **MCP Protocol**: Interaction with IDE via MCP protocol
7. **File Structure**: How files are organized on disk
8. **Topic Extraction**: How topics are extracted and normalized
9. **TOON Format**: Token optimization conversion
10. **Error Handling**: Error processing and user feedback
11. **Help System**: Feature discovery and guidance

These diagrams help understand the system architecture and serve as documentation for development and maintenance.

---

**Document Status**: Completed during Week 2 design phase  
**Next Document**: Code Explanation Document (Week 3)

