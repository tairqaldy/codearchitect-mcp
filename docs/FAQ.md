# FAQ

## What is CodeArchitect MCP?

Tool to save/retrieve AI conversations. Prevents losing context.

## Why use it?

- **Don't lose conversations** - Save important discussions
- **Don't repeat yourself** - Retrieve instead of re-explaining
- **Build knowledge base** - Iteratively save and grow your second brain
- **Organized** - Auto-organized by date and topic

## Where are sessions saved?

**Main**: `~/.codearchitect/sessions/` (always)
- Windows: `C:\Users\YourName\.codearchitect\sessions\`
- Linux/Mac: `~/.codearchitect/sessions/`

**Optional**: Also save to project folder (specify `projectDir`)

## How do I use it?

**Cursor Users**:
1. Export chat: Three dots (⋯) → Export Chat → Save to `~/.codearchitect/exports/`
2. `"use codearchitect store_session"` → Auto-detects `.md` export file
3. `"use codearchitect get_session [topic]"` → Retrieve

**VS Code Users**:
1. Export chat: `Ctrl+Shift+P` → Export Chat → Name file (e.g., `auth-implementation.json`) → Save to `~/.codearchitect/exports/`
2. `"use codearchitect store_session"` → Auto-detects `.json` export file
3. `"use codearchitect get_session [topic]"` → Retrieve

**Note**: Both formats are automatically detected and parsed correctly.

## What gets saved?

Two files per session:
- `summary.md` - Summary + key points
- `full.md` - Complete conversation

## Can I customize storage?

Main location is always `~/.codearchitect/sessions/`. Optionally also save to project folder.

## Does it work with git?

Yes. Sessions are markdown files. Commit `.codearchitect/sessions/` to share.

## Multiple projects?

All sessions save to one main folder (your "second brain"). Optionally also save to project folders.

## Need help?

- `"use codearchitect"` - Feature help
- [Troubleshooting](./TROUBLESHOOTING.md)
- [GitHub Issues](https://github.com/tairqaldy/codearchitect-mcp/issues)
