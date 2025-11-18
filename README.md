# CodeArchitect MCP

**Your AI conversations shouldn't disappear.** CodeArchitect MCP automatically saves and retrieves your discussions with AI assistants, solving context continuity for developers. Never re-explain architecture decisions or code solutions. Built on Model Context Protocol (MCP) - works seamlessly with Cursor and VS Code. Expanding into comprehensive system design and architecture assistance.

## 🚀 Quick Start (2 minutes)

### 1. Install Node.js
Download from [nodejs.org](https://nodejs.org/) (v18+). Open terminal → type `node --version` to verify.

### 2. Install Package
```bash
npm install -g codearchitect-mcp
```

### 3. Configure IDE

<details>
<summary><b>VS Code</b></summary>

1. `Ctrl+Shift+P` → `MCP: Add Server...`
2. Choose `Download with npm package`
3. Enter: `codearchitect-mcp`
4. **That's it!** No need to configure anything else.

Sessions auto-save to main `.codearchitect/` folder. Works automatically!

</details>

<details>
<summary><b>Cursor</b></summary>

Create `.cursor/mcp.json` in your project root:

   ```json
   {
     "mcpServers": {
       "codearchitect": {
      "command": "npx",
      "args": ["-y", "codearchitect-mcp"]
    }
  }
}
```

Restart Cursor. Sessions auto-save to main `.codearchitect/` folder. Works automatically!

</details>

### 4. Start Using

Ask your AI:
- `"use codearchitect"` - See available features
- `"use codearchitect store_session"` - Save this conversation
- `"use codearchitect get_session"` - List saved sessions

## 💡 How It Works

- **Auto-saves** conversations to main `.codearchitect/` folder in your home directory
- **Works automatically** - no configuration needed
- **Retrieve** past conversations instead of re-explaining
- **Default location**: `~/.codearchitect/sessions/` (main "second brain" location)
- **Project-specific**: Optionally save to project folder too (AI will ask)

## 📚 More Info

- [API Reference](./docs/API.md) - Tool details
- [FAQ](./docs/FAQ.md) - Common questions
- [Troubleshooting](./docs/TROUBLESHOOTING.md) - Fix issues

## 🔗 Links

- **Docs**: [codearchitect.mintlify.app](https://codearchitect.mintlify.app/)
- **npm**: [codearchitect-mcp](https://www.npmjs.com/package/codearchitect-mcp)
- **GitHub**: [tairqaldy/codearchitect-mcp](https://github.com/tairqaldy/codearchitect-mcp)

---

**Made with ❤️ by [Tair Kaldybayev](https://tairkaldybayev.link/)**
