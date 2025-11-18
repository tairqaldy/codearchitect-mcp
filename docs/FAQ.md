# FAQ

## What is CodeArchitect MCP?

Tool to save and retrieve AI conversations. Prevents losing important discussions.

## Why use it?

- **Don't lose conversations** - Save important AI discussions
- **Don't repeat yourself** - Retrieve past context instead of re-explaining
- **Organized** - Auto-organized by date and topic
- **Searchable** - Markdown files you can search with grep/IDE

## Where are sessions saved?

**Default**: Main `.codearchitect/` folder in your home directory (always reliable)
- Windows: `C:\Users\YourName\.codearchitect\sessions\`
- Linux/Mac: `~/.codearchitect/sessions/`

**Project-specific**: AI will ask if you want to also save to a project folder. If yes, saves to both main folder and project folder.

## How do I use it?

Just ask your AI:
- `"use codearchitect"` - See features
- `"use codearchitect store_session"` - Save conversation
- `"use codearchitect get_session"` - Get saved sessions

## What gets saved?

Two files per session:
- `summary.md` - Short summary + key points
- `full.md` - Complete conversation (JSON + readable format)

## Can I customize storage location?

Sessions always save to main `.codearchitect/` folder in your home directory. You can optionally save to a project folder too by specifying `projectDir` when storing a session.

## Does it work with git?

Yes! Sessions are markdown files. Commit `.codearchitect/sessions/` to share with your team.

## What if I have multiple projects?

All sessions save to one main `.codearchitect/` folder in your home directory (your "second brain"). You can optionally save sessions to specific project folders too - the AI will ask if you want to save to a project folder when storing a session.

## Need more help?

- Ask AI: `"use codearchitect"` for feature help
- [Troubleshooting](./TROUBLESHOOTING.md)
- [GitHub Issues](https://github.com/tairqaldy/codearchitect-mcp/issues)

