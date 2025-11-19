# API Reference

## Tools

### `codearchitect_help`

Get feature help and workflow guide.

**Usage**: `"use codearchitect"` or `"use codearchitect [feature]"`

**Parameters**:
- `feature` (optional) - `store_session` or `get_session`

---

### `store_session`

Save conversation to knowledge base.

**Usage**: `"use codearchitect store_session"`

**Parameters**:
- `conversation` (optional) - Direct conversation text/JSON
- `exportFilename` (optional) - Pattern to match export file (e.g., "resolve_mcp")
- `topic` (optional) - Session topic (auto-extracted)
- `projectDir` (optional) - Also save to project folder
- `format` (optional) - `"plain"` or `"messages"` (default: plain)

**Storage**:
- Main: `~/.codearchitect/sessions/` (always)
- Project: `project/.codearchitect/sessions/` (if `projectDir` specified)

**Export file detection**:
- Auto-detects from `~/.codearchitect/exports/`
- Supports both `.md` (Cursor) and `.json` (VS Code) formats
- Uses newest file modified in last 10 minutes
- Or match by `exportFilename` pattern

**Supported export formats**:
- **Cursor**: Markdown format with `**User**` and `**Cursor**`/`**Assistant**` markers
- **VS Code**: JSON format with nested `requests` array structure
  - User messages: `request.message.text` or `request.message.parts[].text`
  - Assistant messages: `request.response[]` (filters out tool invocations automatically)

---

### `get_session`

Retrieve saved sessions.

**Usage**: 
- `"use codearchitect get_session"` - List all
- `"use codearchitect get_session [filename]"` - Get specific
- `"use codearchitect get_session [date]"` - Filter by date (YYYY-MM-DD)

**Parameters**:
- `filename` (optional) - Session folder name
- `date` (optional) - Filter by date (YYYY-MM-DD)
- `format` (optional) - `"json"`, `"toon"`, or `"auto"` (default: auto)
- `limit` (optional) - Limit results when listing

**Returns**: Session content or list. Always from main `~/.codearchitect/sessions/`

---

## Storage Structure

```
~/.codearchitect/
├── exports/              # Export files (for auto-detection)
│   └── cursor_*.md
└── sessions/             # Saved sessions
    └── YYYY-MM-DD/
        └── topic-name/
            ├── summary.md
            └── full.md
```

---

## Examples

**Store from export file**:
```
use codearchitect store_session
```

**Store with topic**:
```
use codearchitect store_session topic: "auth implementation"
```

**Store to project**:
```
use codearchitect store_session projectDir: "/path/to/project"
```

**Get session**:
```
use codearchitect get_session authentication-implementation
```

**List today**:
```
use codearchitect get_session 2025-11-19
```
