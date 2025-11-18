# API Reference

## Tools

### `codearchitect_help`

Get help about features.

**Usage**: `"use codearchitect"` or `"use codearchitect [feature_name]"`

**Response**: Lists available features with examples.

---

### `store_session`

Save a conversation.

**Usage**: `"use codearchitect store_session"` or `"use codearchitect store_session [topic]"`

**Parameters**:
- `conversation` (required) - Full conversation text
- `topic` (optional) - Session topic (auto-extracted if not provided)
- `projectDir` (optional) - Project directory path. If specified, saves to both main folder and project folder
- `format` (optional) - `"plain"` or `"messages"` (default: plain)

**Saves to**: Main `.codearchitect/` folder in home directory (`~/.codearchitect/sessions/`) by default. If `projectDir` specified, also saves to `project/.codearchitect/sessions/`

---

### `get_session`

Retrieve saved sessions.

**Usage**: 
- `"use codearchitect get_session"` - List all sessions
- `"use codearchitect get_session [filename]"` - Get specific session
- `"use codearchitect get_session [date]"` - List sessions from date (YYYY-MM-DD)

**Parameters**:
- `filename` (optional) - Session folder name
- `date` (optional) - Filter by date (YYYY-MM-DD)
- `format` (optional) - `"json"`, `"toon"`, or `"auto"` (default: auto)
- `limit` (optional) - Limit number of sessions returned when listing

**Returns**: Session content or list of sessions. Always retrieves from main `.codearchitect/` folder in home directory.

---

## Storage Location

**Default**: Main `.codearchitect/sessions/` folder in home directory (always reliable)
- Windows: `C:\Users\YourName\.codearchitect\sessions\`
- Linux/Mac: `~/.codearchitect/sessions/`

**Optional**: Project-specific save
- If `projectDir` specified, also saves to `project/.codearchitect/sessions/`
- Dual-save: Main folder (always) + project folder (optional)

**Structure**:
```
~/.codearchitect/sessions/
└── YYYY-MM-DD/
    └── topic-name/
        ├── summary.md
        └── full.md
```

---

## Examples

**Store conversation**:
```
use codearchitect store_session
```

**Store with topic**:
```
use codearchitect store_session "authentication implementation"
```

**Get specific session**:
```
use codearchitect get_session authentication-implementation
```

**List today's sessions**:
```
use codearchitect get_session 2025-11-18
```

